import { JobSearchParams, NormalizedJob, SearchResultPayload, ProviderHealth } from '@/types/job';
import { LIVE_PROVIDERS } from '@/providers/jobs';
import { deduplicateJobs, inferJobTags, inferExperienceLevel, validateAndCleanJob } from '@/utils/helpers';
import { withDbFallback } from '@/lib/prisma';

export class JobService {
  /**
   * Main entrypoint for worldwide job search aggregation, deduplication, advanced filtering, and caching.
   */
  static async searchJobs(params: JobSearchParams): Promise<SearchResultPayload> {
    const page = params.page && params.page > 0 ? params.page : 1;
    const limit = params.limit && params.limit > 0 ? params.limit : 12;
    const searchKeyword = (params.keyword || 'all').trim();

    // 1. Attempt Postgres database query if simple keyword/location search exists in cache
    const cachedPayload = await withDbFallback(async (db) => {
      if (!db) return null;
      const history = await db.searchHistory.findFirst({
        where: { keyword: searchKeyword },
        orderBy: { createdAt: 'desc' }
      });

      if (history && (Date.now() - history.createdAt.getTime()) < 15 * 60 * 1000) {
        const cachedJobs = await db.job.findMany({
          take: 40,
          orderBy: { postedAt: 'desc' }
        });
        if (cachedJobs.length > 0) {
          return cachedJobs.map(cached => ({
            id: `postgres-cache-${cached.id}`,
            externalId: cached.externalId,
            provider: 'postgres-cache',
            title: cached.title,
            company: cached.company,
            companyLogo: cached.companyLogo || undefined,
            location: cached.location,
            country: cached.country || undefined,
            remote: cached.remote,
            employmentType: cached.employmentType || 'Full-time',
            experienceLevel: inferExperienceLevel(cached.title, cached.description),
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
          } as NormalizedJob));
        }
      }
      return null;
    }, null);

    let baseJobs: NormalizedJob[] = [];
    let fromCacheCount = 0;
    const providersUsed: string[] = [];

    if (cachedPayload && cachedPayload.length > 0) {
      baseJobs = cachedPayload;
      fromCacheCount = cachedPayload.length;
      providersUsed.push('postgres-cache');
    } else {
      // 2. Concurrently fetch across all live worldwide provider integrations via Promise.allSettled
      const providerPromises = LIVE_PROVIDERS.map(provider => {
        return provider.searchJobs(params).then(results => ({ provider: provider.name, results }));
      });

      const settledResults = await Promise.allSettled(providerPromises);

      for (const result of settledResults) {
        if (result.status === 'fulfilled' && result.value.results.length > 0) {
          const enriched = result.value.results.map(j => ({
            ...j,
            experienceLevel: j.experienceLevel || inferExperienceLevel(j.title, j.description)
          }));
          baseJobs = baseJobs.concat(enriched);
          providersUsed.push(result.value.provider);
        }
      }

      // Pass through Data Sanctity verification filter to drop anomalous physical roles and spam tags
      baseJobs = baseJobs
        .map(job => validateAndCleanJob(job))
        .filter((job): job is NormalizedJob => job !== null);

      // Deduplicate results
      baseJobs = deduplicateJobs(baseJobs);

      // Asynchronously store search metrics into Postgres cache without slowing down user response
      if (baseJobs.length > 0 && !providersUsed.includes('postgres-cache')) {
        withDbFallback(async (db) => {
          if (!db) return null;
          await db.searchHistory.create({
            data: { keyword: searchKeyword, location: params.location || null, hitsCount: baseJobs.length }
          });
        }, null).catch(() => {});
      }
    }

    // 4. Apply Advanced Multi-Dimensional Filtering (Experience, Min Salary, Provider, Date Posted)
    let filteredJobs = baseJobs.map(j => ({
      ...j,
      experienceLevel: j.experienceLevel || inferExperienceLevel(j.title, j.description)
    }));

    if (params.experience && params.experience !== 'any' && params.experience !== '') {
      filteredJobs = filteredJobs.filter(j => j.experienceLevel === params.experience);
    }

    if (params.provider && params.provider !== 'all' && params.provider !== '') {
      filteredJobs = filteredJobs.filter(j => j.provider.toLowerCase().includes(params.provider!.toLowerCase()));
    }

    if (params.minSalary && params.minSalary > 0) {
      filteredJobs = filteredJobs.filter(j => {
        if (!j.salary?.min) return false;
        const annualized = j.salary.period === 'hourly' ? j.salary.min * 2000 : j.salary.min;
        return annualized >= params.minSalary!;
      });
    }

    if (params.datePosted && params.datePosted !== 'any' && params.datePosted !== '') {
      const now = Date.now();
      const thresholds: Record<string, number> = {
        '24h': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000,
      };
      const maxAgeMs = thresholds[params.datePosted] || 0;
      if (maxAgeMs > 0) {
        filteredJobs = filteredJobs.filter(j => {
          const ts = new Date(j.postedAt).getTime();
          return !isNaN(ts) && (now - ts) <= maxAgeMs;
        });
      }
    }

    // 5. Paginate final filtered results
    const total = filteredJobs.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const startIndex = (page - 1) * limit;
    const paginatedJobs = filteredJobs.slice(startIndex, startIndex + limit);

    return {
      jobs: paginatedJobs,
      total,
      page,
      limit,
      totalPages,
      providersUsed: Array.from(new Set(providersUsed)),
      fromCacheCount
    };
  }

  /**
   * Retrieves an individual job listing by ID from DB cache or live provider networks.
   */
  static async getJobById(id: string): Promise<NormalizedJob | null> {
    const rawId = id.startsWith('postgres-cache-') ? id.replace('postgres-cache-', '') : id;

    const cachedJob = await withDbFallback(async (db) => {
      if (!db) return null;
      return await db.job.findUnique({ where: { id: rawId } }).catch(() => null);
    }, null);

    if (cachedJob) {
      return {
        id: `postgres-cache-${cachedJob.id}`,
        externalId: cachedJob.externalId,
        provider: 'postgres-cache',
        title: cachedJob.title,
        company: cachedJob.company,
        companyLogo: cachedJob.companyLogo || undefined,
        location: cachedJob.location,
        country: cachedJob.country || undefined,
        remote: cachedJob.remote,
        employmentType: cachedJob.employmentType || 'Full-time',
        experienceLevel: inferExperienceLevel(cachedJob.title, cachedJob.description),
        salary: cachedJob.salaryMin ? {
          min: cachedJob.salaryMin,
          max: cachedJob.salaryMax || undefined,
          currency: cachedJob.salaryCurrency || 'USD',
          period: (cachedJob.salaryPeriod as 'yearly' | 'monthly' | 'hourly') || 'yearly',
          text: `${cachedJob.salaryCurrency || '$'} ${cachedJob.salaryMin.toLocaleString()}${cachedJob.salaryMax ? ' - ' + cachedJob.salaryMax.toLocaleString() : ''}`
        } : undefined,
        description: cachedJob.description,
        applyUrl: cachedJob.applyUrl,
        postedAt: cachedJob.postedAt.toISOString(),
        tags: inferJobTags(cachedJob.title, cachedJob.description)
      } as NormalizedJob;
    }

    // Search across integrated live feeds
    for (const p of LIVE_PROVIDERS) {
      if (p.getJob) {
        try {
          const res = await p.getJob(id);
          if (res) {
            return {
              ...res,
              experienceLevel: res.experienceLevel || inferExperienceLevel(res.title, res.description)
            };
          }
        } catch {}
      }
    }
    return null;
  }

  /**
   * Diagnostic telemetry check across integrated feeds.
   */
  static async checkProviderHealth(): Promise<ProviderHealth[]> {
    const health: ProviderHealth[] = [];
    const testParams: JobSearchParams = { limit: 1 };

    for (const provider of LIVE_PROVIDERS) {
      const start = Date.now();
      try {
        await provider.searchJobs(testParams);
        const latencyMs = Date.now() - start;
        health.push({
          provider: provider.name,
          status: latencyMs < 2500 ? 'online' : 'degraded',
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

    const dbStart = Date.now();
    const dbHealthy = await withDbFallback(async (db) => {
      if (!db) return false;
      await db.$queryRaw`SELECT 1`;
      return true;
    }, false);

    health.push({
      provider: 'postgres-cache',
      status: dbHealthy ? 'online' : 'offline',
      latencyMs: Date.now() - dbStart,
      lastUpdated: new Date().toISOString()
    });

    return health;
  }

  static async getProvidersHealth(): Promise<ProviderHealth[]> {
    return this.checkProviderHealth();
  }
}
