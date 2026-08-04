# 🌐 JobNet Worldwide Platform

[![Next.js 15](https://img.shields.io/badge/Next.js%2015-App%20Router-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma 7](https://img.shields.io/badge/Prisma%207-Adapter%20PG-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind%20v4-Dark%20Mode%20Glassmorphism-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![pnpm](https://img.shields.io/badge/pnpm-10.x-F69220?style=for-the-badge&logo=pnpm&logoColor=white)](https://pnpm.io/)

**JobNet Worldwide** is an AI-powered global and remote career discovery engine architected for maximum speed, resilience, and user engagement. Engineered by a senior engineering paradigm, the platform consolidates live vacancies across world-class tech leaders, startups, public sector institutions, and distributed remote hubs into a unified, glassmorphic UI.

---

## 🌟 Key Engineering Architectural Highlights

### 1. ✨ Hybrid Groq AI Llama-3 RAG & Semantic Matching Engine
- **CV & Prompt Ingestion:** Users can paste their complete resume/CV text or describe career objectives in natural language (e.g. *"Senior Full Stack Engineer in Next.js seeking remote $140k+ opportunity"*).
- **Lightning-Fast LLM Inference:** Integrates the official `@groq/groq-sdk` with `llama-3.3-70b-versatile` structured JSON completion to assign an explicit **0-100% Compatibility Score**, generate personalized alignment rationales, and extract positional seniority levels.
- **Resilient Fallback Vector Engine:** Features automatic failover to an algorithmic TF-IDF vector similarity matcher if API credentials are unassigned or offline—guaranteeing zero downtime during development or cloud network interruptions.

### 2. ⚡ Multi-Provider Concurrent Aggregation Engine (8 Global Networks)
Instead of relying on a single vulnerability-prone data feed, JobNet features an extensible 8-network provider architecture (`src/providers/`):
- **Integrated Feeds:** Concurrently interrogates **RemoteOK** (Remote Tech), **USAJOBS** (U.S. Federal Platform), **Arbeitnow** (EU/Visa Sponsorship), **Adzuna** (16+ Nations), **Jooble** (Worldwide Aggregates), **Careerjet** (Global Affiliate Engine), **Reed.co.uk** (UK & Europe), **Findwork.dev** (Global Dev & Startups), and resilient fallback datasets.
- **Asynchronous Isolation:** Evaluated via strict `Promise.allSettled()` execution vectors. Single-provider network latencies, rate limits, or regional outages never degrade search latency for the end user.
- **Real-Time Deduplication:** Implements cryptographic MD5-equivalent hashing (`src/utils/helpers.ts`) over normalized company names, vacancy roles, and coordinate strings to purge cross-board duplicates in milliseconds.

### 2. 🛡️ Graceful Circuit Breakers & Postgres Caching
- **Prisma 7 with `@prisma/adapter-pg`:** Utilizes standard pooling configurations with modern root `prisma.config.ts` deployment models.
- **Query Analytics & Intelligent Caching:** Valid external API listing payloads are cached directly in PostgreSQL (`Job` and `SearchHistory` tables) to provide near-zero latency retrieval for repeated regional or keyword queries.
- **Zero-Downtime Fallback Protection:** Wrapped entirely in a defensive circuit breaker pattern (`withDbFallback()` in `src/lib/prisma.ts`). If local database instances disconnect or cloud DB compute scales down, the system transparently degrades to purely active memory and API evaluation without UI interruption or crash logs.

### 3. 🎨 High-End Dark Mode & Glassmorphic Design System
- **Curated Spectrum:** Designed with a sleek `#0e0918` cosmic backdrop accented by violet and indigo gradients (`#8b5cf6`, `#4f46e5`).
- **Interactive Primitives:** Customized UI components utilizing `clsx` and Class Variance Authority (CVA) to achieve smooth hover elevations, reactive state transformations, and accessible focus outlines without reliance on external bloated UI frameworks.
- **Micro-Animations & Skeletons:** Animated hero search bars, live health latency radars, and customized shimmer loading skeletons (`src/components/ui/skeleton.tsx`).

---

## 🏗️ Repository Hierarchy & Module Overview

```text
├── docs/                     # System architecture decisons, plans, and historical testing reports
│   ├── DATABASE_DECISION.md  # Detailed trade-off analysis between PostgreSQL cache vs Ephemeral storage
│   ├── API_PROVIDER_STATUS.md# Evaluation metrics across international career board REST endpoints
│   └── TESTING_PLAN.md       # Quality assurance pipeline and verification protocols
├── prisma/
│   └── schema.prisma         # Prisma data modeling (Job, SearchHistory, ProviderStatus)
├── src/
│   ├── app/                  # Next.js 15 App Router endpoints and page architectures
│   │   ├── api/
│   │   │   ├── health/       # GET /api/health - Distributed provider ping & database health matrix
│   │   │   └── jobs/
│   │   │       ├── [id]/     # GET /api/jobs/:id - Individual vacancy inspection endpoints
│   │   │       └── search/   # GET /api/jobs/search - Unified query aggregation proxy
│   │   ├── globals.css       # Design System tokens, scrollbars, and radial blur styling
│   │   ├── layout.tsx        # SEO Meta injections and font configurations (Geist / Geist Mono)
│   │   └── page.tsx          # Master client-side discovery dashboard
│   ├── components/           # Reusable structural layout and UI elements
│   │   ├── layout/           # Sticky Navbar with health telemetry and Footer attributions
│   │   └── ui/               # Tailored interactive buttons, status badges, and loading skeletons
│   ├── features/search/      # Specialized UX modules for career discovery
│   │   ├── SearchHero.tsx    # Multi-input query bar with quick-tag location triggers
│   │   ├── FilterSidebar.tsx # Interactive remote toggles, employment type filtering & listing counters
│   │   ├── JobCard.tsx       # Elevated vacancy presentation cards with salary tag formatters
│   │   ├── JobDetailModal.tsx# Role requirement modal drawer with official direct application links
│   │   └── ProviderHealthModal.tsx # Live API ping monitor diagnostic window
│   ├── lib/
│   │   └── prisma.ts         # Prisma Postgres adapter singleton with offline fallback protection
│   ├── providers/            # Third-party job feed network layer
│   │   ├── adzuna.ts         # Adzuna REST integration
│   │   ├── arbeitnow.ts      # Arbeitnow open job API parser
│   │   ├── mock-provider.ts  # Determinist offline development dataset
│   │   ├── remote-ok.ts      # RemoteOK JSON feed integration
│   │   └── usajobs.ts        # USAJOBS Authorization & OPM grading conversion
│   ├── services/
│   │   └── job-service.ts    # Central orchestrator combining deduplication, provider routing & caching
│   ├── types/
│   │   └── job.ts            # Core TypeScript contracts (JobProvider, NormalizedJob, ProviderHealth)
│   └── utils/
│       └── helpers.ts        # MD5 hashing, string normalizers, and exponential timeout utilities
├── prisma.config.ts          # Modern Prisma 7 datasource connection mapping
└── package.json              # Managed via pnpm package workspace
```

---

## 🚀 Getting Started Locally

### 1. Prerequisites
- **Node.js**: Version `20.x` or higher.
- **Package Manager**: **`pnpm`** is recommended (v10+ required for strict lockfile adherence).
- **PostgreSQL**: Local Postgres instance or cloud provider (Vercel Postgres, Neon, Supabase, Docker).

### 2. Installation & Environment Configuration
Clone the repository and install workspace dependencies:
```bash
git clone https://github.com/AsithaLKonara/JobNet.git
cd JobNet
pnpm install
```

Copy the example environment configuration file:
```bash
cp .env.example .env
```

Configure your local or cloud PostgreSQL database connection string inside `.env`:
```env
# Local or cloud Postgres URI (Required for caching; app automatically falls back if offline)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/jobnet?schema=public"

# Optional API keys for full live production network access
ADZUNA_APP_ID="your_adzuna_app_id_here"
ADZUNA_APP_KEY="your_adzuna_app_key_here"
USAJOBS_API_KEY="your_usajobs_api_key_here"
USAJOBS_USER_AGENT="YourAppName (your_email@domain.com)"
```
*(Note: Even if third-party keys are excluded, the engine automatically leverages Open APIs and internal fallback simulation providers so development never halts).*

### 3. Generate Prisma Database Artifacts
Generate the typed Prisma 7 client:
```bash
pnpm exec prisma generate
```
*(Optional)* Push schema modifications to your active PostgreSQL instance:
```bash
pnpm exec prisma db push
```

### 4. Launch Development Server
```bash
pnpm run dev
```
Open [http://localhost:3000](http://localhost:3000) (or port `3001` if `3000` is currently utilized) in your web browser to access the worldwide discovery interface!

---

## 📡 Core API Endpoints Reference

All frontend requests route safely through local Next.js server APIs to prevent client-side exposure of third-party API keys.

| Endpoint | Method | Query / Body Parameters | Description |
| :--- | :--- | :--- | :--- |
| `/api/jobs/rag-search` | `POST` | Body: `{ prompt: string, filters?: object }` | Executes Hybrid TF-IDF vector pre-filtering and Groq AI Llama-3 structured JSON inference to evaluate CV synergy and compatibility scores. |
| `/api/jobs/search` | `GET` | `keyword`, `location`, `remote`, `employmentType`, `experience`, `minSalary`, `datePosted`, `provider`, `page`, `limit` | Executes multi-provider aggregation, applies advanced multi-dimensional screening, deduplicates results, and records query analytics. |
| `/api/jobs/[id]` | `GET` | *None (Dynamic Route)* | Retrieves extended specifications and application metadata for a targeted vacancy ID. |
| `/api/health` | `GET` | *None* | Runs asynchronous ping tests across all configured API network endpoints and verifies PostgreSQL pool state. |

---

## 🧪 Verification & Production Bundling

The project maintains zero tolerance for TypeScript compilation errors or ESLint structural violations. Before committing modifications, run our comprehensive validation script:

```bash
# Execute strict TypeScript validation followed by an optimized Next.js production build
pnpm exec tsc --noEmit && pnpm exec next build
```
When validation passes, static routes and dynamic runtime assets will be synthesized cleanly into `.next` for immediate Vercel, Docker, or AWS container deployment!

---

## 🛡️ Security & Terms Compliance
- **Zero Exposure**: Third-party headers, authorization signatures, and database credentials never escape server route execution contexts.
- **TOS Adherence**: Vacancy links direct candidates to the official, verified employer application portals without capturing intermediary personal candidate data.
- **Sanitization**: External descriptions are parsed safely to protect against third-party cross-site scripting (XSS) in vacancy descriptions.

---

### 📝 License
Built with engineering discipline and modern frontend best practices. Licensed under MIT.
