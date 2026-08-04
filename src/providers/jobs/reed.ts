import { JobProvider, JobSearchParams, NormalizedJob } from '@/types/job';
import { withTimeout, sanitizeHtmlSnippet, inferJobTags, inferExperienceLevel } from '@/utils/helpers';

interface ReedItem {
  jobId?: number | string;
  jobTitle?: string;
  employerName?: string;
  jobDescription?: string;
  locationName?: string;
  minimumSalary?: number;
  maximumSalary?: number;
  currency?: string;
  jobUrl?: string;
  date?: string;
}

export class ReedProvider implements JobProvider {
  readonly name = 'reed';

  async searchJobs(params: JobSearchParams): Promise<NormalizedJob[]> {
    const apiKey = process.env.REED_API_KEY;
    if (!apiKey || apiKey.trim() === '' || apiKey === 'your_reed_api_key_here') {
      return [];
    }

    try {
      const query = new URLSearchParams({
        keywords: params.keyword || (params.remote ? 'remote engineer' : 'software engineer'),
        resultsToTake: (params.limit || 15).toString()
      });
      if (params.location && !params.remote) {
        query.set('locationName', params.location);
      } else {
        query.set('locationName', 'London'); // Reed works best with UK target markets or Remote flags
      }

      // Reed requires HTTP Basic Authentication with username = API_KEY and password = empty
      const authHeader = `Basic ${Buffer.from(apiKey.trim() + ':').toString('base64')}`;

      const response = await withTimeout(
        fetch(`https://www.reed.co.uk/api/1.0/search?${query.toString()}`, {
          method: 'GET',
          headers: {
            'Authorization': authHeader,
            'Accept': 'application/json'
          },
          next: { revalidate: 300 }
        }),
        4500,
        this.name
      );

      if (!response.ok) {
        throw new Error(`Reed API HTTP Error: ${response.status} - ${response.statusText}`);
      }

      const json = await response.json();
      const rawJobs: ReedItem[] = Array.isArray(json.results) ? json.results : [];

      return rawJobs.map((job, idx) => {
        const title = job.jobTitle || 'UK Opportunity';
        const company = job.employerName || 'UK Employer';
        const location = job.locationName || 'United Kingdom';
        const isRemote = location.toLowerCase().includes('remote') || title.toLowerCase().includes('remote') || params.remote || false;
        const snippet = sanitizeHtmlSnippet(job.jobDescription || '');
        const externalId = job.jobId ? job.jobId.toString() : `reed-${idx}`;

        let salaryObj: NormalizedJob['salary'];
        if (typeof job.minimumSalary === 'number' && job.minimumSalary > 0) {
          salaryObj = {
            min: job.minimumSalary,
            max: job.maximumSalary || undefined,
            currency: job.currency || 'GBP',
            period: 'yearly',
            text: `£${job.minimumSalary.toLocaleString()}${job.maximumSalary ? ' - £' + job.maximumSalary.toLocaleString() : ''}`
          };
        }

        return {
          id: `reed-${externalId}`,
          externalId,
          provider: this.name,
          title,
          company,
          location,
          country: 'United Kingdom',
          remote: isRemote,
          employmentType: 'Full-time',
          experienceLevel: inferExperienceLevel(title, snippet),
          salary: salaryObj,
          description: snippet,
          applyUrl: job.jobUrl || 'https://www.reed.co.uk',
          postedAt: job.date ? new Date(job.date).toISOString() : new Date().toISOString(),
          tags: inferJobTags(title, snippet)
        } as NormalizedJob;
      });
    } catch (error) {
      console.warn(`[${this.name} Feed Offline]:`, (error as Error)?.message?.slice(0, 100));
      return [];
    }
  }
}
