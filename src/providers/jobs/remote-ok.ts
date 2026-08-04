import { JobProvider, JobSearchParams, NormalizedJob } from '@/types/job';
import { withTimeout, inferJobTags, sanitizeHtmlSnippet } from '@/utils/helpers';

interface RemoteOKItem {
  id?: string;
  slug?: string;
  epoch?: number;
  date?: string;
  company?: string;
  company_logo?: string;
  position?: string;
  tags?: string[];
  location?: string;
  description?: string;
  url?: string;
  apply_url?: string;
  salary_min?: number;
  salary_max?: number;
}

export class RemoteOKProvider implements JobProvider {
  readonly name = 'remoteok';

  async searchJobs(params: JobSearchParams): Promise<NormalizedJob[]> {
    try {
      const tagParam = params.keyword ? encodeURIComponent(params.keyword.toLowerCase().trim().split(/\s+/)[0]) : '';
      const url = tagParam ? `https://remoteok.com/api?tags=${tagParam}` : `https://remoteok.com/api`;

      const response = await withTimeout(
        fetch(url, {
          headers: {
            'User-Agent': 'JobNet-Worldwide Platform (https://jobnet.world)'
          },
          next: { revalidate: 3600 } // cache at HTTP edge for 1 hour
        }),
        4500,
        'RemoteOKProvider'
      );

      if (!response.ok) {
        console.warn(`[RemoteOK] HTTP error ${response.status}: ${response.statusText}`);
        return [];
      }

      const data: RemoteOKItem[] = await response.json();
      if (!Array.isArray(data) || data.length === 0) return [];

      // The first item in RemoteOK JSON is usually metadata/legal terms, so filter items with an ID or position
      const listings = data.filter(item => item.position && item.company);

      const jobs: NormalizedJob[] = listings.map(item => {
        const extId = item.id ? item.id.toString() : (item.slug || Math.random().toString(36).slice(2));
        const title = item.position || 'Untitled Remote Role';
        const description = sanitizeHtmlSnippet(item.description || '');
        const postedAt = item.date ? new Date(item.date).toISOString() : new Date().toISOString();
        const tags = Array.isArray(item.tags) ? item.tags : inferJobTags(title, description);

        let salary;
        if (item.salary_min && item.salary_max) {
          salary = {
            min: Number(item.salary_min),
            max: Number(item.salary_max),
            currency: 'USD',
            period: 'yearly' as const,
            text: `$${Math.round(item.salary_min / 1000)}k - $${Math.round(item.salary_max / 1000)}k / yr`
          };
        }

        return {
          id: `${this.name}-${extId}`,
          externalId: extId,
          provider: this.name,
          title,
          company: item.company || 'Confidential',
          companyLogo: item.company_logo || undefined,
          location: item.location || 'Worldwide Remote',
          country: 'Worldwide',
          remote: true,
          employmentType: 'Full-time',
          salary,
          description,
          applyUrl: item.apply_url || item.url || `https://remoteok.com/remote-jobs/${item.slug}`,
          postedAt,
          tags
        };
      });

      // Apply filtering if location or specific keywords weren't fully covered by url query
      return jobs.filter(job => {
        if (params.keyword && !job.title.toLowerCase().includes(params.keyword.toLowerCase()) && !job.tags.some(t => t.toLowerCase().includes(params.keyword!.toLowerCase()))) {
          return false;
        }
        return true;
      });

    } catch (error) {
      console.warn('[RemoteOKProvider] Failed to fetch or timed out:', (error as Error)?.message);
      return [];
    }
  }
}
