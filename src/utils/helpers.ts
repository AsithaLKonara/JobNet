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
 * Predicts positional seniority level from job title and description text.
 */
export function inferExperienceLevel(title: string, description: string = ''): 'junior' | 'mid' | 'senior' | 'executive' {
  const combined = `${title} ${description.slice(0, 350)}`.toLowerCase();
  
  if (/\b(chief|cto|cfo|ceo|vp|vice president|director|executive|head of)\b/.test(title.toLowerCase())) {
    return 'executive';
  }
  if (/\b(staff|senior|snr|sr|principal|lead|mgr|manager|arch|architect)\b/.test(title.toLowerCase()) || /\b(5\+ years|6\+ years|7\+ years|8\+ years|10\+ years)\b/.test(combined)) {
    return 'senior';
  }
  if (/\b(junior|juniors|jnr|jr|intern|internship|entry level|graduate|fresh|0-1 years|1-2 years)\b/.test(combined)) {
    return 'junior';
  }
  return 'mid';
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
 * Strips dangerous script tags and automated spam watermarks while preserving clean markdown line spacing.
 */
export function sanitizeHtmlSnippet(text: string = ''): string {
  if (!text) return 'No detailed job description provided.';
  
  // 1. Convert HTML block elements to clean markdown line breaks before stripping tags
  let processed = text
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/li>/gi, '\n• ')
    .replace(/<li>/gi, '• ')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  // 2. Strip all remaining HTML syntax tags
  processed = processed.replace(/<\/?[^>]+(>|$)/g, '');

  // 3. Purge automated recruiter anti-spam tracking watermarks and instruction spam
  processed = processed.replace(/Please mention the word \*\*.+?\*\* and tag .+? to show you read the job post completely.+?see they're human\./gi, '');
  processed = processed.replace(/Please mention the word .+? when applying to show you read the job post completely\./gi, '');
  processed = processed.replace(/This is a beta feature to avoid spam applicants\./gi, '');
  processed = processed.replace(/\(#([A-Za-z0-9+/=]{10,})\)/g, '');

  // 4. Normalize spacing while preserving intentional newlines
  processed = processed
    .split('\n')
    .map(line => line.replace(/\s+/g, ' ').trim())
    .filter((line, index, arr) => line.length > 0 || (index > 0 && arr[index - 1].length > 0))
    .join('\n')
    .trim();

  return processed.slice(0, 3000);
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
    'machine learning', 'ai', 'data engineer', 'backend', 'frontend', 'full stack', 'remote',
    'cloud', 'cybersecurity', 'qa', 'mobile', 'react native', 'flutter', 'swift', 'kotlin'
  ];
  
  const matches = candidates.filter(tag => combined.includes(tag.toLowerCase()));
  if (matches.length === 0) {
    return ['engineering', 'global talent', 'verified tech'];
  }
  return Array.from(new Set(matches)).slice(0, 6);
}

/**
 * Senior Architect Data Sanctity & Accuracy Guardrail:
 * Intercepts third-party listings to eliminate non-occupational spam, promotional blog ads,
 * anomalies, and enforces professional vacancy standards.
 */
export function validateAndCleanJob(job: NormalizedJob): NormalizedJob | null {
  const titleLower = job.title.trim().toLowerCase();
  const descLower = job.description.toLowerCase();

  // 1. Block promotional blog articles, recruitment ads, and generic talent pools
  const promotionalSpamRegex = /\b(expression of interest|general interest|open roles|meet us|team member|join the|future remote|we hire|things on your cv|your job is|put the effort|studio|burger|hiring fast|why you are not|top 10|how to|reasons why|newsletter|podcast|webinar)\b/i;
  if (promotionalSpamRegex.test(titleLower) || titleLower.split(/\s+/).length > 10 || titleLower.includes('?')) {
    console.warn(`[Data Sanctity Filter] Rejected promotional/spam vacancy from ${job.provider}: "${job.title}" at "${job.company}"`);
    return null;
  }

  // 2. Block anomalous on-site manual trades from polluting worldwide remote technical feeds
  const physicalManualTrades = /\b(fireman|firefighter|security guard|janitor|custodian|plumber|forklift|cashier|warehouse worker|electrician|mechanic|chef|cook|bartender|waiter|waitress|housekeeper|truck driver|taxi driver|delivery driver)\b/i;
  if (physicalManualTrades.test(titleLower) && !/\b(software|engineer|developer|it|tech|programmer|analyst|manager|sales|marketing|support|designer)\b/i.test(titleLower)) {
    console.warn(`[Data Sanctity Filter] Rejected anomalous physical trade from ${job.provider}: "${job.title}" at "${job.company}"`);
    return null;
  }

  // 3. Mandatory Professional Role Verification (must contain a real occupational discipline or domain)
  const validRoleKeywords = /\b(engineer|developer|dev|programming|programmer|architect|designer|design|manager|management|director|executive|lead|leader|analyst|analytics|scientist|science|admin|administrator|specialist|consultant|advisor|counselor|coordinator|recruiter|recruiting|hr|human resources|talent|marketing|marketer|sales|account executive|customer|support|service|operations|ops|qa|tester|testing|quality|devops|sre|cloud|infrastructure|security|cyber|data|ai|ml|llm|machine learning|full stack|frontend|backend|ui|ux|product|project|scrum|agile|finance|financial|accountant|accounting|legal|counsel|lawyer|writer|editor|content|copywriter|medical|health|pharmacist|research|researcher|teacher|educator|trainer|intern|internship|fellow|technician|representative|agent|buyer|purchasing|procurement|logistics)\b/i;
  if (!validRoleKeywords.test(titleLower)) {
    console.warn(`[Data Sanctity Filter] Rejected non-occupational title from ${job.provider}: "${job.title}" at "${job.company}"`);
    return null;
  }

  // 4. Validate tags to strip hallucinated spam keywords from third-party boards
  let cleanTags = job.tags.filter(tag => {
    const t = tag.toLowerCase();
    if (['web dev', 'dev', 'ecommerce', 'amazon', 'digital nomad', 'blockchain', 'crypto'].includes(t)) {
      return titleLower.includes(t) || descLower.includes(t) || /\b(code|software|programming|web|developer|engineer|tech)\b/i.test(titleLower);
    }
    return true;
  });

  if (cleanTags.length === 0) {
    cleanTags = inferJobTags(job.title, job.description);
  }

  return {
    ...job,
    tags: Array.from(new Set(cleanTags)).slice(0, 6),
    description: sanitizeHtmlSnippet(job.description)
  };
}
