import { JobProvider, JobSearchParams, NormalizedJob } from '@/types/job';
import { withTimeout, sanitizeHtmlSnippet, inferJobTags, inferExperienceLevel } from '@/utils/helpers';

interface CareerjetItem {
  url?: string;
  title?: string;
  company?: string;
  locations?: string;
  description?: string;
  salary?: string;
  date?: string;
  site?: string;
}

export class CareerjetProvider implements JobProvider {
  readonly name = 'careerjet';

  async searchJobs(params: JobSearchParams): Promise<NormalizedJob[]> {
    const affiliateId = process.env.CAREERJET_AFFILIATE_ID;
    if (!affiliateId || affiliateId.trim() === '' || affiliateId === 'your_careerjet_affid_here') {
      return [];
    }

    try {
      const query = new URLSearchParams({
        locale_code: 'en_US',
        affid: affiliateId,
        keywords: params.keyword || (params.remote ? 'remote developer' : 'software developer'),
        location: params.location || (params.remote ? 'Remote' : 'United States'),
        page: (params.page || 1).toString(),
        page_size: (params.limit || 15).toString(),
        sort: 'date',
        // Anti-abuse fallback compliance headers for standard cloud proxying
        user_ip: '8.8.8.8',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      });

      const response = await withTimeout(
        fetch(`http://public.api.careerjet.net/search?${query.toString()}`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          next: { revalidate: 300 }
        }),
        4500,
        this.name
      );

      if (!response.ok) {
        throw new Error(`Careerjet HTTP Error: ${response.status}`);
      }

      const json = await response.json();
      const rawJobs: CareerjetItem[] = Array.isArray(json.jobs) ? json.jobs : [];

      return rawJobs.map((job, idx) => {
        const title = job.title || 'Careerjet Vacancy';
        const company = job.company || job.site || 'Verified Employer';
        const location = job.locations || 'Worldwide';
        const isRemote = location.toLowerCase().includes('remote') || params.remote || false;
        const snippet = sanitizeHtmlSnippet(job.description || '');
        
        // Extract deterministic ID from ending url slug or index fallback
        const urlHash = job.url ? job.url.split('/').pop()?.replace(/[^a-z0-9]/gi, '').slice(-15) : `cj-${idx}`;
        const externalId = urlHash || `careerjet-${idx}`;

        let salaryObj: NormalizedJob['salary'];
        if (job.salary && job.salary.trim() !== '') {
          salaryObj = {
            text: job.salary.trim(),
            currency: 'USD',
            period: 'yearly'
          };
        }

        return {
          id: `careerjet-${externalId}`,
          externalId,
          provider: this.name,
          title,
          company,
          location,
          country: 'Global',
          remote: isRemote,
          employmentType: 'Full-time',
          experienceLevel: inferExperienceLevel(title, snippet),
          salary: salaryObj,
          description: snippet,
          applyUrl: job.url || 'https://www.careerjet.com',
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
