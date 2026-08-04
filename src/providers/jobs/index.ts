import { AdzunaProvider } from './adzuna';
import { USAJOBSProvider } from './usajobs';
import { ArbeitnowProvider } from './arbeitnow';
import { RemoteOKProvider } from './remote-ok';
import { JoobleProvider } from './jooble';
import { CareerjetProvider } from './careerjet';
import { ReedProvider } from './reed';
import { FindworkProvider } from './findwork';
import { MockJobProvider } from './mock-provider';
import { JobProvider } from '@/types/job';

// Concurrently interrogated across 8 worldwide networks via Promise.allSettled
export const LIVE_PROVIDERS: JobProvider[] = [
  new RemoteOKProvider(),
  new ArbeitnowProvider(),
  new USAJOBSProvider(),
  new AdzunaProvider(),
  new JoobleProvider(),
  new CareerjetProvider(),
  new ReedProvider(),
  new FindworkProvider()
];

// Resilient zero-downtime offline circuit breaker dataset
export const FALLBACK_PROVIDER: JobProvider = new MockJobProvider();

export * from './adzuna';
export * from './usajobs';
export * from './arbeitnow';
export * from './remote-ok';
export * from './jooble';
export * from './careerjet';
export * from './reed';
export * from './findwork';
export * from './mock-provider';
