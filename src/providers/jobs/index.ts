import { JobProvider } from '@/types/job';
import { MockJobProvider } from './mock-provider';
import { RemoteOKProvider } from './remote-ok';
import { ArbeitnowProvider } from './arbeitnow';
import { AdzunaProvider } from './adzuna';
import { USAJOBSProvider } from './usajobs';

// Instantiate all active job provider services
export const mockJobProvider = new MockJobProvider();
export const remoteOKProvider = new RemoteOKProvider();
export const arbeitnowProvider = new ArbeitnowProvider();
export const adzunaProvider = new AdzunaProvider();
export const usajobsProvider = new USAJOBSProvider();

/**
 * List of active external live providers to fan out concurrent job searches to.
 */
export const LIVE_PROVIDERS: JobProvider[] = [
  remoteOKProvider,
  arbeitnowProvider,
  adzunaProvider,
  usajobsProvider
];

/**
 * Fallback local resilience provider when all live providers timeout or offline dev is active.
 */
export const FALLBACK_PROVIDER: JobProvider = mockJobProvider;

export { MockJobProvider, RemoteOKProvider, ArbeitnowProvider, AdzunaProvider, USAJOBSProvider };
