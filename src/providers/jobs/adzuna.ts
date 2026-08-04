import { JobProvider, JobSearchParams, NormalizedJob } from '@/types/job';
import { withTimeout, inferJobTags, sanitizeHtmlSnippet } from '@/utils/helpers';

interface AdzunaItem {
  id: string | number;
  title: string;
  company: { display_name: string };
  location: { display_name: string; area?: string[] };
  description: string;
  redirect_url: string;
  created: string;
  salary_min?: number;
  salary_max?: number;
  contract_type?: string;
  contract_time?: string;
}

interface AdzunaResponse {
  results?: AdzunaItem[];
  count?: number;
}

export class AdzunaProvider implements JobProvider {
  readonly name = 'adzuna';
  private appId: string | undefined;
  private appKey: string | undefined;

  constructor() {
    this.appId = process.env.ADZUNA_APP_ID;
    this.appKey = process.env.ADZUNA_APP_KEY;
  }

  async searchJobs(params: JobSearchParams): Promise<NormalizedJob[]> {
    if (!this.appId || !this.appKey || this.appId === 'your_adzuna_app_id') {
      // Graceful degraded mode if API keys are unconfigured in user's .env
      return [];
    }

    try {
      const country = params.country ? params.country.toLowerCase().slice(0, 2) : 'us'; // Default US/Global
      const page = params.page && params.page > 0 ? params.page : 1;
      const resultsPerPage = params.limit ? params.limit : 20;

      const queryParams = new URLSearchParams({
        app_id: this.appId,
        app_key: this.appKey,
        results_per_page: resultsPerPage.toString(),
        'content-type': 'application/json'
      });

      if (params.keyword) queryParams.set('what', params.keyword);
      if (params.location) queryParams.set('where', params.location);
      if (params.employmentType === 'full_time') queryParams.set('full_time', '1');
      if (params.employmentType === 'contract') queryParams.set('contract', '1');

      const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/${page}?${queryParams.toString()}`;

      const response = await withTimeout(
        fetch(url, {
          headers: { 'Accept': 'application/json' },
          next: { revalidate: 3600 }
        }),
        4500,
        'AdzunaProvider'
      );

      if (!response.ok) {
        console.warn(`[AdzunaProvider] HTTP status ${response.status}`);
        return [];
      }

      const json: AdzunaResponse = await response.json();
      if (!json || !Array.isArray(json.results)) return [];

      return json.results.map(item => {
        const extId = item.id ? item.id.toString() : Math.random().toString(36).slice(2);
        const title = item.title || 'Job Opportunity';
        const description = sanitizeHtmlSnippet(item.description || '');
        const postedAt = item.created ? new Date(item.created).toISOString() : new Date().toISOString();
        const isRemote = title.toLowerCase().includes('remote') || description.toLowerCase().includes('remote working');

        let salary;
        if (item.salary_min && item.salary_max) {
          const curr = country === 'uk' || country === 'gb' ? 'GBP' : (country === 'de' || country === 'fr' ? 'EUR' : 'USD');
          salary = {
            min: Math.round(item.salary_min),
            max: Math.round(item.salary_max),
            currency: curr,
            period: 'yearly' as const,
            text: `${curr} ${Math.round(item.salary_min).toLocaleString()} - ${Math.round(item.salary_max).toLocaleString()} / yr`
          };
        }

        return {
          id: `${this.name}-${extId}`,
          externalId: extId,
          provider: this.name,
          title,
          company: item.company?.display_name || 'Confidential Employer',
          location: item.location?.display_name || 'Multiple Locations',
          country: country.toUpperCase(),
          remote: isRemote || params.remote === true,
          employmentType: item.contract_time === 'full_time' ? 'Full-time' : (item.contract_type === 'contract' ? 'Contract' : 'Full-time'),
          salary,
          description,
          applyUrl: item.redirect_url || 'https://adzuna.com',
          postedAt,
          tags: inferJobTags(title, description)
        };
      });

    } catch (error) {
      console.warn('[AdzunaProvider] Execution failed or timed out:', (error as Error)?.message);
      return [];
    }
  }
}
