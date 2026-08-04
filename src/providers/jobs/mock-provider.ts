import { JobProvider, JobSearchParams, NormalizedJob } from '@/types/job';
import { inferJobTags } from '@/utils/helpers';

export const MOCK_JOBS_CATALOG: Omit<NormalizedJob, 'id'>[] = [
  {
    externalId: 'mock-101',
    provider: 'MockProvider',
    title: 'Senior Staff Full Stack Engineer (Next.js & AI)',
    company: 'Antigravity Labs',
    companyLogo: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=128&h=128&fit=crop&crop=faces&auto=format&q=80',
    location: 'San Francisco, CA',
    country: 'United States',
    remote: true,
    employmentType: 'Full-time',
    salary: { min: 185000, max: 245000, currency: 'USD', period: 'yearly', text: '$185k - $245k / yr' },
    description: 'We are seeking an elite Senior Staff Engineer to lead architecture and development of autonomous agentic workflow engines and Next.js 15 platforms. Experience with modern React, Server Actions, PostgreSQL, and LLM integrations required.',
    applyUrl: 'https://github.com/google',
    postedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    tags: ['React', 'Next.js', 'TypeScript', 'Postgres', 'AI', 'Remote']
  },
  {
    externalId: 'mock-102',
    provider: 'MockProvider',
    title: 'Lead Frontend Systems Architect (React & Tailwind)',
    company: 'HyperVenture Corp',
    companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&h=128&fit=crop&auto=format&q=80',
    location: 'Berlin',
    country: 'Germany',
    remote: true,
    employmentType: 'Full-time',
    salary: { min: 95000, max: 130000, currency: 'EUR', period: 'yearly', text: '€95k - €130k / yr' },
    description: 'Join our European product core design team to develop high-performance Design Systems, fluid glassmorphic animations, and enterprise dashboards with React 19 and Vanilla Tailwind CSS v4.',
    applyUrl: 'https://remoteok.com',
    postedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    tags: ['React', 'Tailwind', 'TypeScript', 'UI/UX', 'Remote']
  },
  {
    externalId: 'mock-103',
    provider: 'MockProvider',
    title: 'Principal Distributed Cloud Infrastructure Engineer',
    company: 'Nebula Stream Cloud',
    companyLogo: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=128&h=128&fit=crop&auto=format&q=80',
    location: 'London',
    country: 'United Kingdom',
    remote: false,
    employmentType: 'Full-time',
    salary: { min: 110000, max: 155000, currency: 'GBP', period: 'yearly', text: '£110k - £155k / yr' },
    description: 'Design and manage ultra-reliable distributed database orchestration layers, Kubernetes clusters, and multi-region fault-tolerant message queues for worldwide SaaS platforms.',
    applyUrl: 'https://adzuna.com',
    postedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    tags: ['Go', 'Kubernetes', 'Docker', 'AWS', 'DevOps']
  },
  {
    externalId: 'mock-104',
    provider: 'MockProvider',
    title: 'Director of Artificial Intelligence & NLP Solutions',
    company: 'Syntony Machine Intelligence',
    companyLogo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&h=128&fit=crop&auto=format&q=80',
    location: 'Tokyo',
    country: 'Japan',
    remote: true,
    employmentType: 'Full-time',
    salary: { min: 16000000, max: 22000000, currency: 'JPY', period: 'yearly', text: '¥16M - ¥22M / yr' },
    description: 'Oversee multi-lingual natural language inference research, model distillation, and production AI embedding pipelines across global translation endpoints.',
    applyUrl: 'https://www.arbeitnow.com',
    postedAt: new Date(Date.now() - 3600000 * 36).toISOString(),
    tags: ['Python', 'Machine Learning', 'AI', 'PyTorch', 'Remote']
  },
  {
    externalId: 'mock-105',
    provider: 'MockProvider',
    title: 'Senior Product Manager (Global Growth & Mobile SDKs)',
    company: 'FinPulse Worldwide',
    companyLogo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&h=128&fit=crop&auto=format&q=80',
    location: 'Sydney, NSW',
    country: 'Australia',
    remote: true,
    employmentType: 'Full-time',
    salary: { min: 165000, max: 210000, currency: 'AUD', period: 'yearly', text: '$165k - $210k AUD / yr' },
    description: 'Lead global checkout conversions and developer API SDK growth across APAC and EMEA markets. Collaborate closely with engineering architects and fintech product analysts.',
    applyUrl: 'https://usajobs.gov',
    postedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    tags: ['Product Manager', 'Agile', 'Growth', 'Fintech', 'Remote']
  },
  {
    externalId: 'mock-106',
    provider: 'MockProvider',
    title: 'Senior Backend Go / PostgreSQL Developer',
    company: 'Quantum Ledger Protocol',
    companyLogo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=128&h=128&fit=crop&auto=format&q=80',
    location: 'New York, NY',
    country: 'United States',
    remote: true,
    employmentType: 'Contract',
    salary: { min: 110, max: 145, currency: 'USD', period: 'hourly', text: '$110 - $145 / hr' },
    description: 'Looking for an experienced Go specialist to build ultra-fast transaction settlement APIs and optimize heavy PostgreSQL indexing and read-replica routing.',
    applyUrl: 'https://github.com',
    postedAt: new Date(Date.now() - 3600000 * 60).toISOString(),
    tags: ['Go', 'Postgres', 'Backend', 'SQL', 'Remote']
  }
];

export class MockJobProvider implements JobProvider {
  readonly name = 'MockProvider';

  async searchJobs(params: JobSearchParams): Promise<NormalizedJob[]> {
    // Artificial slight micro-delay for realistic local async simulation
    await new Promise(resolve => setTimeout(resolve, 60));

    const allJobs: NormalizedJob[] = MOCK_JOBS_CATALOG.map(item => ({
      ...item,
      id: `${item.provider.toLowerCase()}-${item.externalId}`,
      tags: item.tags?.length ? item.tags : inferJobTags(item.title, item.description)
    }));

    return allJobs.filter(job => {
      let match = true;
      if (params.keyword) {
        const kw = params.keyword.toLowerCase();
        const text = `${job.title} ${job.company} ${job.description} ${job.tags.join(' ')}`.toLowerCase();
        match = match && text.includes(kw);
      }
      if (params.location) {
        const loc = params.location.toLowerCase();
        const matchesLoc = job.location.toLowerCase().includes(loc) || (job.country?.toLowerCase().includes(loc) ?? false);
        match = match && matchesLoc;
      }
      if (params.remote === true) {
        match = match && job.remote === true;
      }
      if (params.employmentType) {
        const emp = params.employmentType.replace('_', '-').toLowerCase();
        match = match && job.employmentType.toLowerCase().includes(emp);
      }
      return match;
    });
  }

  async getJob(id: string): Promise<NormalizedJob | null> {
    const allJobs = await this.searchJobs({});
    return allJobs.find(j => j.id === id || j.externalId === id) || null;
  }
}
