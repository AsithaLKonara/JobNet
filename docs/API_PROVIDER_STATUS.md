# Worldwide Job Search Platform - API Provider Status & Integration Registry

This document tracks the verified external job API providers integrated into our Job Service Layer. The platform never calls external APIs directly from the client UI; all requests are proxied, validated, and normalized through server-side providers implementing the standard `JobProvider` TypeScript interface.

## Provider Feature & Status Matrix

| Provider Name | Purpose & Coverage | Endpoint URL | Auth Method | Rate Limits & Quotas | Current Status | Fallback Strategy |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Adzuna** | Broad Global coverage (US, UK, EU, AU, CA, etc.) with estimated salaries. | `https://api.adzuna.com/v1/api/jobs/{country}/search/{page}` | `app_id` & `app_key` query parameters | **Free Tier:** 25 calls/min, 250 calls/day, 2,500/month | 🟡 **Ready / Tier Limited** | If rate limit reached (HTTP 429), fall back to Careerjet / RemoteOK. |
| **USAJOBS** | Authoritative US federal government & civilian opportunities. | `https://data.usajobs.gov/api/Search` | HTTP Headers: `Authorization-Key`, `Host`, `User-Agent` | **Generous:** 500 records/page up to 10,000 max/query. High stability. | 🟢 **Ready / Verified** | If service unavailable, fall back to Adzuna US country endpoint. |
| **RemoteOK** | Massive global feed of remote tech, developer, and executive roles. | `https://remoteok.com/api?tags={keyword}` | None required (Open public JSON feed) | **Open / Fair Use:** Must credit RemoteOK and provide backlink. | 🟢 **Ready / Verified** | If JSON feed times out, fall back to Arbeitnow / WorkingNomads. |
| **Arbeitnow** | Europe-focused & global remote startup job board. | `https://www.arbeitnow.com/api/job-board-api` | None required (Open public JSON endpoint) | **Open / Fair Use:** Returns full JSON listings (~17k postings). | 🟢 **Ready / Verified** | Used as secondary remote booster & EU fallback for RemoteOK. |
| **Careerjet** | Extended global reach (~90 countries) across multiple languages. | `https://search.api.careerjet.net/v4/query` | HTTP Basic Auth (username = API key, blank password) | **Partner Tier:** ~1,000 requests/hour. Requires client IP & User-Agent. | 🔵 **Standby / Fallback** | Activated automatically when primary aggregators hit daily quotas. |
| **Demo / Mock Provider** | High-fidelity local fallback test suite & resilience provider. | `internal://mock-provider` | None (Local deterministic generator) | **Unlimited** | 🟢 **Ready / Resilience** | Triggered instantly in local development if offline or API keys are absent. |

---

## Standardized Provider Interface

Every provider module under `src/providers/jobs/` must implement the strict `JobProvider` contract to ensure interchangeable runtime execution:

```typescript
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
```

---

## Resilience & Circuit Breaker Workflow

1. **Parallel Execution:** When a user submits a query (e.g., "Remote React Developer"), the Job Service Layer concurrently triggers `searchJobs()` on all active primary providers (Adzuna, USAJOBS, RemoteOK).
2. **Timeout Handling:** Each external HTTP request is wrapped in an `AbortController` timeout (e.g., 4,500ms). If a provider hangs, it is cleanly caught and excluded without failing the entire user response.
3. **Deduplication Engine:** All returning lists are consolidated and ran through an in-memory hash de-duplicator matching on normalized `(title + company + location)` fingerprints.
4. **Fallback Activation:** If all primary APIs fail or return rate-limit errors, the engine seamlessly invokes the standby fallback providers or yields cached Postgres historical hits.
