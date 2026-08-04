import { NormalizedJob } from '@/types/job';

/**
 * Generates a deterministically standardized hash/key for job deduplication
 * based on lowercase alphanumeric title, company, and approximate location.
 */
export function generateJobFingerprint(job: Pick<NormalizedJob, 'title' | 'company' | 'location'>): string {
  const clean = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
  const titlePart = clean(job.title).slice(0, 25);
  const companyPart = clean(job.company).slice(0, 20);
  const locPart = clean(job.location).slice(0, 15);
  return `${titlePart}_${companyPart}_${locPart}`;
}

/**
 * Deduplication Engine: Consolidates listings from multiple providers,
 * removing duplicate jobs with identical title/company/location fingerprints.
 */
export function deduplicateJobs(jobs: NormalizedJob[]): NormalizedJob[] {
  const seen = new Set<string>();
  const uniqueJobs: NormalizedJob[] = [];

  for (const job of jobs) {
    const fingerprint = generateJobFingerprint(job);
    if (!seen.has(fingerprint)) {
      seen.add(fingerprint);
      uniqueJobs.push(job);
    }
  }
  return uniqueJobs;
}

/**
 * Wraps any promise/fetch operation with a hard AbortSignal timeout to prevent hanging providers.
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 4500,
  providerName: string = 'Provider'
): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(`[Timeout] ${providerName} exceeded ${timeoutMs}ms execution limit.`));
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timer!);
    return result;
  } catch (err) {
    clearTimeout(timer!);
    throw err;
  }
}

/**
 * Strips dangerous script tags and excessive formatting while preserving clean snippet readability.
 */
export function sanitizeHtmlSnippet(text: string = ''): string {
  if (!text) return 'No detailed job description provided.';
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<\/?[^>]+(>|$)/g, ' ') // strip remaining HTML tags to clean readable plain text
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 2500);
}

/**
 * Extracts clean tag list from title and description keywords for badge formatting.
 */
export function inferJobTags(title: string, description: string = ''): string[] {
  const combined = `${title} ${description}`.toLowerCase();
  const candidates = [
    'react', 'next.js', 'typescript', 'javascript', 'node', 'python', 'java', 'go', 'golang', 'rust',
    'c++', 'c#', '.net', 'ruby', 'rails', 'php', 'laravel', 'vue', 'angular', 'svelte',
    'aws', 'gcp', 'azure', 'docker', 'kubernetes', 'terraform', 'sql', 'postgres', 'mongodb',
    'graphql', 'rest api', 'tailwind', 'ui/ux', 'design', 'figma', 'product manager', 'devops',
    'machine learning', 'ai', 'data engineer', 'backend', 'frontend', 'full stack', 'remote'
  ];
  
  const matches = candidates.filter(tag => combined.includes(tag.toLowerCase()));
  return Array.from(new Set(matches)).slice(0, 6); // Up to 6 most relevant tags
}
