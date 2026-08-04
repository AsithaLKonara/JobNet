import { JobProvider, JobSearchParams, NormalizedJob } from '@/types/job';
import { withTimeout, sanitizeHtmlSnippet, inferJobTags, inferExperienceLevel } from '@/utils/helpers';

interface FindworkItem {
  id?: string | number;
  role?: string;
  company_name?: string;
  company_logo?: string;
  location?: string;
  remote?: boolean;
  keywords?: string[];
  text?: string;
  url?: string;
  date_posted?: string;
}

export class FindworkProvider implements JobProvider {
  readonly name = 'findwork';

  async searchJobs(params: JobSearchParams): Promise<NormalizedJob[]> {
    const token = process.env.FINDWORK_API_KEY;
    if (!token || token.trim() === '' || token === 'your_findwork_token_here') {
      return [];
    }

    try {
      const query = new URLSearchParams({
        search: params.keyword || 'software engineer'
      });
      if (params.location) query.set('location', params.location);

      const response = await withTimeout(
        fetch(`https://findwork.dev/api/jobs/?${query.toString()}`, {
          method: 'GET',
          headers: {
            'Authorization': `Token ${token.trim()}`,
            'Accept': 'application/json'
          },
          next: { revalidate: 300 }
        }),
        4500,
        this.name
      );

      if (!response.ok) {
        throw new Error(`Findwork API HTTP Error: ${response.status} - ${response.statusText}`);
      }

      const json = await response.json();
      const rawJobs: FindworkItem[] = Array.isArray(json.results) ? json.results : [];

      return rawJobs.map((job, idx) => {
        const title = job.role || 'Software Developer';
        const company = job.company_name || 'Tech Startup';
        const location = job.location || 'Worldwide';
        const isRemote = job.remote || location.toLowerCase().includes('remote') || params.remote || false;
        const snippet = sanitizeHtmlSnippet(job.text || '');
        const externalId = job.id ? job.id.toString() : `fw-${idx}`;

        const tags = Array.isArray(job.keywords) && job.keywords.length > 0 
          ? job.keywords.map(k => k.toLowerCase()).slice(0, 6)
          : inferJobTags(title, snippet);

        return {
          id: `findwork-${externalId}`,
          externalId,
          provider: this.name,
          title,
          company,
          companyLogo: job.company_logo || undefined,
          location,
          country: 'Global',
          remote: isRemote,
          employmentType: 'Full-time',
          experienceLevel: inferExperienceLevel(title, snippet),
          salary: undefined, // Findwork omits standard salary ranges in basic feed
          description: snippet,
          applyUrl: job.url || 'https://findwork.dev',
          postedAt: job.date_posted ? new Date(job.date_posted).toISOString() : new Date().toISOString(),
          tags
        } as NormalizedJob;
      });
    } catch (error) {
      console.warn(`[${this.name} Feed Offline]:`, (error as Error)?.message?.slice(0, 100));
      return [];
    }
  }
}
