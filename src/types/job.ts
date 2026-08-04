export interface JobSearchParams {
  keyword?: string;
  location?: string;
  country?: string;
  remote?: boolean;
  employmentType?: 'full_time' | 'part_time' | 'contract' | 'internship';
  experience?: 'junior' | 'mid' | 'senior';
  page?: number;
  limit?: number;
}

export interface NormalizedJob {
  id: string;              // Composite hash: "${provider}-${externalId}"
  externalId: string;      // Original ID from remote source
  provider: string;        // Provider identifier (e.g., 'adzuna', 'remoteok')
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  country?: string;
  remote: boolean;
  employmentType: string;  // Normalised string: Full-time, Contract, etc.
  salary?: {
    min?: number;
    max?: number;
    currency?: string;
    period?: 'yearly' | 'monthly' | 'hourly';
    text?: string;         // Formatted salary string if exact numbers unavailable
  };
  description: string;     // Cleaned HTML or text snippet
  applyUrl: string;        // External employer redirection URL
  postedAt: string;        // ISO 8601 timestamp
  tags: string[];
}

export interface JobProvider {
  readonly name: string;
  searchJobs(params: JobSearchParams): Promise<NormalizedJob[]>;
  getJob?(id: string): Promise<NormalizedJob | null>;
}

export interface ProviderHealth {
  provider: string;
  status: 'online' | 'degraded' | 'offline';
  latencyMs: number;
  lastUpdated: string;
}

export interface SearchResultPayload {
  jobs: NormalizedJob[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  providersUsed: string[];
  fromCacheCount?: number;
}
