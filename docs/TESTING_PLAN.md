# Worldwide Job Search Platform - Testing Plan

To ensure enterprise-grade reliability, data integrity, and bug-free releases, our testing strategy incorporates a disciplined four-layer test pyramid combining fast unit validation with realistic browser automation.

---

## 1. Unit Testing (Vitest & Jest)
Focuses on pure functions, data validation schemas, and structural transformers without external network calls or database dependencies.

### Key Targets:
- **Zod Schema Validators:** Testing input search criteria against invalid or malicious query parameters (e.g., SQL injection strings, negative page numbers).
- **Data Normalizers:** Ensuring raw external JSON payloads from Adzuna, USAJOBS, and RemoteOK are correctly mapped into our unified `NormalizedJob` domain models.
- **Salary Formatters:** Verifying accurate multi-currency symbols, annual/monthly/hourly conversion formulas, and "Not Specified" fallback formatting.
- **Deduplication Utility:** Verifying that identical job offers appearing across multiple providers are correctly merged by title, company, and location hash.

---

## 2. API & Service Integration Testing (Mocked Network & Local DB)
Focuses on verifying Server Actions, Route Handlers, and cache fallback resilience.

### Key Targets:
- **Mocking External APIs (MSW / Nock):** Intercepting third-party HTTP requests to simulate normal JSON responses, malformed payloads, and 429 Rate-Limit error states.
- **Circuit Breaker & Fallback Flow:** Probing `/api/search?keyword=React` when primary Adzuna mock returns HTTP 429 to verify seamless switch to fallback RemoteOK or Postgres cached records.
- **Database Caching Persistence (Prisma In-Memory / Test DB):** Validating that fresh third-party results are properly inserted with accurate TTL expiration timestamps and indexed correctly.

---

## 3. Component Testing (React Testing Library)
Focuses on isolated React components and interactive state behaviors without rendering entire pages.

### Key Targets:
- **JobCard & Badges:** Verifying accurate rendering of source provider logos, salary badges, remote status tags, and correct external target attribution (`target="_blank"` with `rel="noopener noreferrer"`).
- **SearchBar & FilterPanel:** Verifying correct debounced trigger firing (500ms delay) upon input change and correct checkbox state manipulation for Employment Type, Experience Level, and Remote modes.
- **Loading Skeletons:** Ensuring layout shift-free (CLS) skeleton placeholders render reliably during asynchronous search resolution.

---

## 4. End-to-End (E2E) Testing with Playwright
Focuses on validating high-priority user journeys across automated headless Chrome, Firefox, and Safari viewports.

### Critical Flows to Automate:
1. **Core Search & Discovery Flow:**
   - Navigate to Homepage (`/`).
   - Enter keyword `"Frontend Developer"` into search input and `"Remote"` in location input.
   - Verify automatic debounced list update or redirection to `/search?keyword=Frontend+Developer&location=Remote`.
   - Ensure rendered `JobCard` elements contain valid company names, job titles, and provider source badges.

2. **Advanced Filtering Flow:**
   - On search results page, open filter drawer/panel.
   - Select `"Senior"` experience level and `"Contract"` employment type.
   - Ensure URL query parameters accurately sync (e.g., `&experience=senior&type=contract`) and result list filters appropriately without triggering full browser reloads.

3. **Job Details & External Apply Redirect Flow:**
   - Click "View Details" on any specific job card in the search feed.
   - Confirm navigation to job detail page (`/jobs/[id]`) or dynamic preview sheet.
   - Verify existence of meta title tags, structured schema JSON-LD block (`JobPosting` schema), and formatted responsibilities text.
   - Click "Apply Now" button; intercept browser new tab event to verify destination URL exactly matches the authentic external employer application link.

4. **Error & Zero-Results Handling Flow:**
   - Search for nonsensical gibberish keyword (e.g., `"Xyzqvwerty999"`).
   - Verify friendly empty state message ("No jobs found matching your criteria") along with automated alternative suggestions or clear filter resets.
   - Simulate backend network disruption to confirm graceful error notification toasts appear without breaking the interactive UI.

---

## Execution Pipeline
```bash
# Executed in CI/CD before every production merge:
npm run test:unit       # Vitest execution for schemas & normalizers
npm run test:components # RTL automated component checks
npm run test:e2e        # Playwright headless browser suite
```
