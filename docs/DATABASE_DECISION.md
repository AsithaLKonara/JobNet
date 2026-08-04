# Worldwide Job Search Platform - Database Decision Analysis

This document evaluates the architectural necessity and tradeoffs of database integration for our Worldwide Job Search Platform MVP, contrasting three distinct operating paradigms.

---

## Option A: No Database (Direct API Aggregation)

### Concept
The Next.js app operates as a stateless backend-for-frontend (BFF). When a search request hits `/api/search`, Server Route Handlers fan out HTTP calls directly to third-party providers (Adzuna, RemoteOK, USAJOBS) in real time, aggregate and deduplicate results in memory, and immediately return the JSON payload to the user.

### Pros
- **Zero Infrastructure Cost:** No database maintenance, pooling, or hosting expenses.
- **Infinite Real-Time Freshness:** Listings reflect the exact millisecond status of remote API feeds without stale data synchronization issues.
- **Simplicity:** No migrations, ORM schemas, or ETL background routines required.

### Cons
- **Vulnerability to API Quota Limits:** Free tiers (such as Adzuna's 250 requests/day) will be exhausted within minutes under moderate user traffic.
- **High User Latency:** Every user search query must pay the full latency penalty of the slowest external API call (often 2–5 seconds).
- **No Analytical Footprint:** Cannot track popular searches, user query trends, or provide rapid auto-complete keyword hints based on search volume.
- **Zero Resilience:** If external job feeds suffer outages or rate limiting, the UI fails immediately.

---

## Option B: Database Caching & Analytics Layer (Selected MVP Approach)

### Concept
We implement a lightweight **PostgreSQL** layer orchestrated by **Prisma ORM** that serves as a high-speed proxy cache, query analytics tracker, and resilience buffer between end users and external APIs.

### Pros
- **Dramatic Quota Conservation:** When User A searches for "Python Developer", results are fetched from external APIs and persisted into PostgreSQL with a 24-hour Time-To-Live (TTL). When User B performs the same or similar search hours later, results are served instantly from Postgres without burning external API credits.
- **Blazing Fast Latency:** Serving cached jobs from indexed database tables occurs in under 20ms, bypassing multi-second third-party HTTP round-trips.
- **Rich UI Analytics:** Enables tracking of high-frequency keywords in a `SearchHistory` table to populate dynamic "Popular Searches" UI elements on the homepage.
- **Graceful Fallback & Resilience:** If external API providers go offline or hit HTTP 429 Rate Limits, the application falls back to serving unexpired historical listings from the database.

### Cons
- **Moderate Complexity:** Requires managing database connections (via Vercel Postgres / Neon / Supabase), Prisma schema migrations, and TTL expiration logic.
- **Data Freshness Tradeoff:** Cached listings may remain visible for up to 24 hours even if the employer fills or unpublishes the vacancy on the source portal (mitigated by displaying explicit posted timestamps and checking external redirect validity).

---

## Option C: Full Job Indexing System (Scrapers & Ingestion Engine)

### Concept
The application runs standalone background daemons, scheduled cron workers, and web scrapers that systematically ingest millions of jobs across global boards into a proprietary Elasticsearch/PostgreSQL database cluster regardless of user traffic, transforming our platform into a standalone primary repository.

### Pros
- **Total Independence:** Never reliant on external search APIs during active user sessions; all queries hit internal search indexes.
- **Advanced Full-Text & Vector Search:** Allows implementation of custom AI-driven embedding search, skill taxonomy matching, and hyper-customized filtering.

### Cons
- **Prohibitive MVP Cost & Engineering Overhead:** Requires extensive crawling infrastructure, proxy rotation to prevent scraper bans, petabit database scaling, and deduplication ETL pipelines.
- **Legal & Copyright Hazards:** Aggressive scraping and republishing of entire job descriptions without publisher API authorization violates many job board Terms of Service (e.g., LinkedIn, Indeed) and poses severe copyright risk.
- **Over-Engineering for MVP:** Far exceeds the scope needed to validate product fit and deliver a fast, modern worldwide discovery platform.

---

## Final Decision & Architecture Implementation

**We select Option B (Database Caching & Analytics Layer).**
Option B achieves the goldilocks balance between cost, performance, developer velocity, and platform resilience. By leveraging PostgreSQL via Prisma ORM, we insulate user UX from slow third-party APIs while staying cleanly within free API limits and remaining 100% compliant with provider terms of service.

### Target Prisma Schema
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Job {
  id             String    @id @default(uuid())
  externalId     String
  provider       String
  title          String
  company        String
  companyLogo    String?
  description    String    @db.Text
  location       String
  country        String?
  remote         Boolean   @default(false)
  employmentType String?
  salaryMin      Int?
  salaryMax      Int?
  salaryCurrency String?
  salaryPeriod   String?
  applyUrl       String
  postedAt       DateTime  @default(now())
  expiresAt      DateTime? 
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  @@unique([provider, externalId])
  @@index([title, location])
  @@index([remote])
}

model SearchHistory {
  id        String   @id @default(uuid())
  keyword   String
  location  String?
  hitsCount Int      @default(1)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([keyword])
}

model ProviderStatus {
  id             String   @id @default(uuid())
  providerName   String   @unique
  isAvailable    Boolean  @default(true)
  rateLimitTotal Int?
  rateLimitUsed  Int      @default(0)
  lastCheckedAt  DateTime @default(now())
}
```
