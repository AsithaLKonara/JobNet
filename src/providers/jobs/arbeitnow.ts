import { JobProvider, JobSearchParams, NormalizedJob } from '@/types/job';
import { withTimeout, inferJobTags, sanitizeHtmlSnippet } from '@/utils/helpers';

interface ArbeitnowItem {
  slug: string;
  company_name: string;
  title: string;
  description: string;
  remote: boolean;
  url: string;
  tags?: string[];
  job_types?: string[];
  location: string;
  created_at: number; // Unix epoch in seconds
}

interface ArbeitnowResponse {
  data: ArbeitnowItem[];
  links?: { next?: string };
}

export class ArbeitnowProvider implements JobProvider {
  readonly name = 'arbeitnow';

  async searchJobs(params: JobSearchParams): Promise<NormalizedJob[]> {
    try {
      const page = params.page && params.page > 0 ? params.page : 1;
      const url = `https://www.arbeitnow.com/api/job-board-api?page=${page}`;

      const response = await withTimeout(
        fetch(url, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'JobNet-Worldwide Platform (https://jobnet.world)'
          },
          next: { revalidate: 3600 }
        }),
        4500,
        'ArbeitnowProvider'
      );

      if (!response.ok) {
        console.warn(`[Arbeitnow] HTTP error ${response.status}`);
        return [];
      }

      const json: ArbeitnowResponse = await response.json();
      if (!json || !Array.isArray(json.data)) return [];

      const jobs: NormalizedJob[] = json.data.map(item => {
        const extId = item.slug || Math.random().toString(36).slice(2);
        const title = item.title || 'Untitled Role';
        const description = sanitizeHtmlSnippet(item.description || '');
        const tags = Array.isArray(item.tags) && item.tags.length > 0 ? item.tags : inferJobTags(title, description);
        const postedAt = item.created_at ? new Date(item.created_at * 1000).toISOString() : new Date().toISOString();

        return {
          id: `${this.name}-${extId}`,
          externalId: extId,
          provider: this.name,
          title,
          company: item.company_name || 'Hiring Employer',
          location: item.location || 'Europe & Global',
          country: item.location?.includes('Germany') ? 'Germany' : 'Europe / Worldwide',
          remote: item.remote || false,
          employmentType: (item.job_types && item.job_types[0]) ? item.job_types[0] : 'Full-time',
          description,
          applyUrl: item.url || 'https://www.arbeitnow.com',
          postedAt,
          tags
        };
      });

      // Local parameter filter matching against keyword, location, and remote criteria
      return jobs.filter(job => {
        let match = true;
        if (params.keyword) {
          const kw = params.keyword.toLowerCase();
          const text = `${job.title} ${job.company} ${job.tags.join(' ')}`.toLowerCase();
          match = match && text.includes(kw);
        }
        if (params.location) {
          const loc = params.location.toLowerCase();
          match = match && job.location.toLowerCase().includes(loc);
        }
        if (params.remote === true) {
          match = match && job.remote === true;
        }
        return match;
      });

    } catch (error) {
      console.warn('[ArbeitnowProvider] Failed to fetch or timed out:', (error as Error)?.message);
      return [];
    }
  }
}
