import { JobProvider, JobSearchParams, NormalizedJob } from '@/types/job';
import { withTimeout, sanitizeHtmlSnippet, inferJobTags, inferExperienceLevel } from '@/utils/helpers';

interface JoobleJobItem {
  id?: number | string;
  title?: string;
  location?: string;
  snippet?: string;
  salary?: string;
  source?: string;
  type?: string;
  link?: string;
  company?: string;
  updated?: string;
}

export class JoobleProvider implements JobProvider {
  readonly name = 'jooble';

  async searchJobs(params: JobSearchParams): Promise<NormalizedJob[]> {
    const apiKey = process.env.JOOBLE_API_KEY;
    if (!apiKey || apiKey.trim() === '' || apiKey === 'your_jooble_api_key_here') {
      // Return silent empty array if API key is unassigned; multi-provider aggregator continues cleanly
      return [];
    }

    try {
      const payload = {
        keywords: params.keyword || (params.remote ? 'remote engineer' : 'software developer'),
        location: params.location || (params.remote ? 'Remote' : ''),
        page: (params.page || 1).toString()
      };

      const response = await withTimeout(
        fetch(`https://jooble.org/api/${apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload),
          next: { revalidate: 300 }
        }),
        4500,
        this.name
      );

      if (!response.ok) {
        throw new Error(`Jooble HTTP Error: ${response.status} - ${response.statusText}`);
      }

      const json = await response.json();
      const rawJobs: JoobleJobItem[] = Array.isArray(json.jobs) ? json.jobs : [];

      return rawJobs.map((job, idx) => {
        const title = job.title || 'Global Opportunity';
        const company = job.company || job.source || 'Verified Partner';
        const location = job.location || 'Worldwide';
        const isRemote = location.toLowerCase().includes('remote') || params.remote || false;
        const snippet = sanitizeHtmlSnippet(job.snippet || '');
        const externalId = job.id ? job.id.toString() : `jooble-${idx}-${Math.random().toString(36).substring(7)}`;

        let salaryObj: NormalizedJob['salary'];
        if (job.salary && job.salary.trim() !== '' && !job.salary.toLowerCase().includes('unspecified')) {
          salaryObj = {
            text: job.salary.trim(),
            currency: 'USD',
            period: 'yearly'
          };
        }

        return {
          id: `jooble-${externalId}`,
          externalId,
          provider: this.name,
          title,
          company,
          location,
          country: 'Global',
          remote: isRemote,
          employmentType: job.type ? job.type.replace('_', ' ') : 'Full-time',
          experienceLevel: inferExperienceLevel(title, snippet),
          salary: salaryObj,
          description: snippet,
          applyUrl: job.link || 'https://jooble.org',
          postedAt: job.updated ? new Date(job.updated).toISOString() : new Date().toISOString(),
          tags: inferJobTags(title, snippet)
        } as NormalizedJob;
      });
    } catch (error) {
      console.warn(`[${this.name} Feed Offline]:`, (error as Error)?.message?.slice(0, 100));
      return [];
    }
  }
}
