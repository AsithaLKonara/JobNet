export type ExperienceLevel = 'junior' | 'mid' | 'senior' | 'executive' | 'any';

export interface JobSearchParams {
  keyword?: string;
  location?: string;
  country?: string;
  remote?: boolean;
  employmentType?: 'full_time' | 'part_time' | 'contract' | 'internship' | string;
  experience?: ExperienceLevel | string;
  minSalary?: number;
  datePosted?: '24h' | '7d' | '30d' | 'any' | string;
  provider?: string;
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
  experienceLevel?: string;// Inferred classification: junior, mid, senior, executive
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

  // Groq AI RAG & Semantic Match Engine Enrichment
  aiScore?: number;        // 0 to 100 compatibility rating
  aiRationale?: string;    // Personalized diagnostic matching rationale
  aiKeyStrength?: string;  // Short highlight tag (e.g., "Perfect Tech Stack")
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
  isRagPowered?: boolean;
  ragExecutionMs?: number;
}
