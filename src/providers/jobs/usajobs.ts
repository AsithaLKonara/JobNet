import { JobProvider, JobSearchParams, NormalizedJob } from '@/types/job';
import { withTimeout, inferJobTags, sanitizeHtmlSnippet } from '@/utils/helpers';

interface USAJobsItem {
  MatchedObjectId: string;
  MatchedObjectDescriptor: {
    PositionTitle: string;
    OrganizationName: string;
    PositionLocation: { LocationName: string }[];
    UserArea?: { Details?: { JobSummary?: string } };
    PositionURI: string;
    PublicationStartDate: string;
    PositionRemuneration?: { MinimumRange?: string; MaximumRange?: string; RateIntervalCode?: string }[];
    PositionSchedule?: { Name?: string }[];
  };
}

export class USAJOBSProvider implements JobProvider {
  readonly name = 'usajobs';
  private apiKey: string | undefined;
  private userAgent: string | undefined;

  constructor() {
    this.apiKey = process.env.USAJOBS_API_KEY;
    this.userAgent = process.env.USAJOBS_USER_AGENT || 'JobNet-Worldwide (dev@jobnet.internal)';
  }

  async searchJobs(params: JobSearchParams): Promise<NormalizedJob[]> {
    if (!this.apiKey || this.apiKey === 'your_usajobs_api_key_here') {
      // Skip gracefully if API key is not supplied
      return [];
    }

    try {
      const queryParams = new URLSearchParams({
        ResultsPerPage: (params.limit || 20).toString(),
        Page: (params.page || 1).toString()
      });

      if (params.keyword) queryParams.set('Keyword', params.keyword);
      if (params.location) queryParams.set('LocationName', params.location);
      if (params.remote === true) queryParams.set('RemoteIndicator', 'True');

      const url = `https://data.usajobs.gov/api/Search?${queryParams.toString()}`;

      const response = await withTimeout(
        fetch(url, {
          headers: {
            'Host': 'data.usajobs.gov',
            'User-Agent': this.userAgent!,
            'Authorization-Key': this.apiKey
          },
          next: { revalidate: 3600 }
        }),
        4500,
        'USAJOBSProvider'
      );

      if (!response.ok) {
        console.warn(`[USAJOBSProvider] HTTP status ${response.status}`);
        return [];
      }

      const json = await response.json();
      const items: USAJobsItem[] = json?.SearchResult?.SearchResultItems || [];

      return items.map(wrapper => {
        const item = wrapper.MatchedObjectDescriptor;
        const extId = wrapper.MatchedObjectId || Math.random().toString(36).slice(2);
        const title = item.PositionTitle || 'Federal Government Opportunity';
        const description = sanitizeHtmlSnippet(item.UserArea?.Details?.JobSummary || 'View official posting for complete qualification details and grade schedule.');
        const loc = item.PositionLocation && item.PositionLocation.length > 0 ? item.PositionLocation[0].LocationName : 'United States';
        
        let salary;
        if (item.PositionRemuneration && item.PositionRemuneration.length > 0) {
          const rem = item.PositionRemuneration[0];
          const min = rem.MinimumRange ? parseFloat(rem.MinimumRange) : undefined;
          const max = rem.MaximumRange ? parseFloat(rem.MaximumRange) : undefined;
          const period = rem.RateIntervalCode === 'Per Year' ? 'yearly' : 'hourly';
          if (min && max) {
            salary = {
              min: Math.round(min),
              max: Math.round(max),
              currency: 'USD',
              period: period as 'yearly' | 'hourly',
              text: `$${Math.round(min).toLocaleString()} - $${Math.round(max).toLocaleString()} (${rem.RateIntervalCode || 'Yearly'})`
            };
          }
        }

        return {
          id: `${this.name}-${extId}`,
          externalId: extId,
          provider: this.name,
          title,
          company: item.OrganizationName || 'U.S. Federal Government',
          location: loc,
          country: 'United States',
          remote: title.toLowerCase().includes('remote') || params.remote === true,
          employmentType: item.PositionSchedule?.[0]?.Name || 'Full-time',
          salary,
          description,
          applyUrl: item.PositionURI || 'https://www.usajobs.gov',
          postedAt: item.PublicationStartDate ? new Date(item.PublicationStartDate).toISOString() : new Date().toISOString(),
          tags: inferJobTags(title, description).concat(['Gov', 'Public Sector'])
        };
      });

    } catch (error) {
      console.warn('[USAJOBSProvider] Execution failed or timed out:', (error as Error)?.message);
      return [];
    }
  }
}
