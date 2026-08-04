import { JobSearchParams, NormalizedJob, SearchResultPayload, ProviderHealth } from '@/types/job';
import { LIVE_PROVIDERS, FALLBACK_PROVIDER } from '@/providers/jobs';
import { deduplicateJobs, inferJobTags } from '@/utils/helpers';
import { withDbFallback } from '@/lib/prisma';

export class JobService {
  /**
   * Main entrypoint for worldwide job search aggregation, deduplication, and database caching.
   */
  static async searchJobs(params: JobSearchParams): Promise<SearchResultPayload> {
    const page = params.page && params.page > 0 ? params.page : 1;
    const limit = params.limit && params.limit > 0 ? params.limit : 12;

    // 1. Record search keyword into PostgreSQL analytics asynchronously (fire & forget with fallback)
    if (params.keyword || params.location) {
      this.trackSearchAnalytics(params.keyword || 'all', params.location || 'worldwide');
    }

    // 2. Try fetching from active Live Providers in parallel with fault tolerance
    const providerPromises = LIVE_PROVIDERS.map(async (provider) => {
      try {
        const results = await provider.searchJobs(params);
        return { provider: provider.name, results, error: null };
      } catch (err) {
        console.warn(`[JobService] Provider ${provider.name} error:`, (err as Error)?.message);
        return { provider: provider.name, results: [] as NormalizedJob[], error: (err as Error)?.message };
      }
    });

    const settledResults = await Promise.allSettled(providerPromises);
    const allJobs: NormalizedJob[] = [];
    const providersUsed: string[] = [];

    for (const result of settledResults) {
      if (result.status === 'fulfilled' && result.value.results.length > 0) {
        allJobs.push(...result.value.results);
        providersUsed.push(result.value.provider);
      }
    }

    // 3. Check Database Cache for additional matching unexpired jobs
    const cachedJobs = await this.fetchCachedJobs(params);
    if (cachedJobs.length > 0) {
      allJobs.push(...cachedJobs);
      if (!providersUsed.includes('postgres-cache')) providersUsed.push('postgres-cache');
    }

    // 4. Deduplicate aggregated jobs
    let uniqueJobs = deduplicateJobs(allJobs);

    // 5. Fallback Resilience: If zero listings returned (e.g. offline dev or rate limiting), invoke fallback catalog
    if (uniqueJobs.length === 0) {
      const fallbackJobs = await FALLBACK_PROVIDER.searchJobs(params);
      uniqueJobs = deduplicateJobs(fallbackJobs);
      providersUsed.push('mock-resilience-catalog');
    }

    // 6. Asynchronously save new fetched listings into PostgreSQL cache without slowing down user response
    if (uniqueJobs.length > 0 && !providersUsed.includes('mock-resilience-catalog')) {
      this.cacheJobsToDatabase(uniqueJobs);
    }

    // 7. Paginate results in memory before returning to UI
    const total = uniqueJobs.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginatedJobs = uniqueJobs.slice(startIndex, startIndex + limit);

    return {
      jobs: paginatedJobs,
      total,
      page,
      limit,
      totalPages,
      providersUsed,
      fromCacheCount: cachedJobs.length
    };
  }

  /**
   * Retrieves an individual job listing by ID from memory, live feeds, or Postgres cache.
   */
  static async getJobById(jobId: string): Promise<NormalizedJob | null> {
    // Check fallback/mock catalog first for immediate matching
    if (jobId.startsWith('mock') || jobId.includes('mock')) {
      return FALLBACK_PROVIDER.getJob ? await FALLBACK_PROVIDER.getJob(jobId) : null;
    }

    // Check PostgreSQL database cache
    const cached = await withDbFallback(async (db) => {
      return await db.job.findFirst({
        where: { OR: [{ id: jobId }, { externalId: jobId }] }
      });
    }, null);

    if (cached) {
      return {
        id: cached.id,
        externalId: cached.externalId,
        provider: cached.provider,
        title: cached.title,
        company: cached.company,
        companyLogo: cached.companyLogo || undefined,
        location: cached.location,
        country: cached.country || 'Worldwide',
        remote: cached.remote,
        employmentType: cached.employmentType || 'Full-time',
        salary: cached.salaryMin ? {
          min: cached.salaryMin,
          max: cached.salaryMax || undefined,
          currency: cached.salaryCurrency || 'USD',
          period: (cached.salaryPeriod as 'yearly' | 'monthly' | 'hourly') || 'yearly',
          text: `${cached.salaryCurrency || '$'} ${cached.salaryMin.toLocaleString()}${cached.salaryMax ? ' - ' + cached.salaryMax.toLocaleString() : ''}`
        } : undefined,
        description: cached.description,
        applyUrl: cached.applyUrl,
        postedAt: cached.postedAt.toISOString(),
        tags: inferJobTags(cached.title, cached.description)
      };
    }

    // Fallback to searching providers if not found in db
    const searchRes = await this.searchJobs({ limit: 50 });
    return searchRes.jobs.find(j => j.id === jobId || j.externalId === jobId) || null;
  }

  /**
   * Retrieves live diagnostic health metrics across all integrated providers.
   */
  static async checkProviderHealth(): Promise<ProviderHealth[]> {
    const health: ProviderHealth[] = [];
    
    for (const provider of LIVE_PROVIDERS) {
      const start = Date.now();
      try {
        const jobs = await provider.searchJobs({ limit: 1 });
        const latencyMs = Date.now() - start;
        health.push({
          provider: provider.name,
          status: jobs.length > 0 || latencyMs < 4000 ? 'online' : 'degraded',
          latencyMs,
          lastUpdated: new Date().toISOString()
        });
      } catch {
        health.push({
          provider: provider.name,
          status: 'offline',
          latencyMs: Date.now() - start,
          lastUpdated: new Date().toISOString()
        });
      }
    }

    // Include fallback resilience catalog status
    health.push({
      provider: FALLBACK_PROVIDER.name,
      status: 'online',
      latencyMs: 10,
      lastUpdated: new Date().toISOString()
    });

    return health;
  }

  // --- Private Async Database Helpers ---

  private static async fetchCachedJobs(params: JobSearchParams): Promise<NormalizedJob[]> {
    return withDbFallback(async (db) => {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      const records = await db.job.findMany({
        where: {
          postedAt: { gte: twentyFourHoursAgo },
          ...(params.keyword ? {
            OR: [
              { title: { contains: params.keyword, mode: 'insensitive' } },
              { company: { contains: params.keyword, mode: 'insensitive' } },
              { description: { contains: params.keyword, mode: 'insensitive' } }
            ]
          } : {}),
          ...(params.location ? {
            location: { contains: params.location, mode: 'insensitive' }
          } : {}),
          ...(params.remote === true ? { remote: true } : {})
        },
        take: 20
      });

      return records.map(r => ({
        id: r.id,
        externalId: r.externalId,
        provider: 'postgres-cache',
        title: r.title,
        company: r.company,
        companyLogo: r.companyLogo || undefined,
        location: r.location,
        country: r.country || 'Worldwide',
        remote: r.remote,
        employmentType: r.employmentType || 'Full-time',
        salary: r.salaryMin ? {
          min: r.salaryMin,
          max: r.salaryMax || undefined,
          currency: r.salaryCurrency || 'USD',
          period: (r.salaryPeriod as 'yearly' | 'monthly' | 'hourly') || 'yearly',
          text: `${r.salaryCurrency || '$'} ${r.salaryMin.toLocaleString()}`
        } : undefined,
        description: r.description,
        applyUrl: r.applyUrl,
        postedAt: r.postedAt.toISOString(),
        tags: inferJobTags(r.title, r.description)
      }));
    }, [] as NormalizedJob[]);
  }

  private static async cacheJobsToDatabase(jobs: NormalizedJob[]): Promise<void> {
    await withDbFallback(async (db) => {
      const toInsert = jobs.slice(0, 30).map(j => ({
        id: j.id,
        externalId: j.externalId || j.id,
        provider: j.provider,
        title: j.title.slice(0, 150),
        company: j.company.slice(0, 100),
        companyLogo: j.companyLogo || null,
        description: (j.description || '').slice(0, 4500),
        location: (j.location || 'Worldwide').slice(0, 100),
        country: j.country || 'Worldwide',
        remote: j.remote || false,
        employmentType: (j.employmentType || 'Full-time').slice(0, 50),
        salaryMin: j.salary?.min ? Math.min(j.salary.min, 2147483647) : null,
        salaryMax: j.salary?.max ? Math.min(j.salary.max, 2147483647) : null,
        salaryCurrency: j.salary?.currency || null,
        salaryPeriod: j.salary?.period || null,
        applyUrl: j.applyUrl.slice(0, 500)
      }));

      await db.job.createMany({
        data: toInsert,
        skipDuplicates: true
      });
    }, undefined);
  }

  private static async trackSearchAnalytics(keyword: string, location: string): Promise<void> {
    await withDbFallback(async (db) => {
      const cleanKeyword = keyword.toLowerCase().trim().slice(0, 50);
      const cleanLocation = location.toLowerCase().trim().slice(0, 50);
      
      const existing = await db.searchHistory.findFirst({
        where: { keyword: cleanKeyword, location: cleanLocation }
      });

      if (existing) {
        await db.searchHistory.update({
          where: { id: existing.id },
          data: { hitsCount: { increment: 1 } }
        });
      } else {
        await db.searchHistory.create({
          data: { keyword: cleanKeyword, location: cleanLocation, hitsCount: 1 }
        });
      }
    }, undefined);
  }
}
