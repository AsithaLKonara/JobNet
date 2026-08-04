import { NextResponse } from 'next/server';
import { JobService } from '@/services/job-service';
import { withDbFallback } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const start = Date.now();
    
    // Check Database accessibility
    const dbStatus = await withDbFallback(async (db) => {
      await db.$queryRaw`SELECT 1`;
      return 'connected';
    }, 'offline-degraded');

    // Check External Job Providers Health
    const providers = await JobService.checkProviderHealth();

    const totalLatency = Date.now() - start;

    return NextResponse.json({
      status: dbStatus === 'connected' ? 'healthy' : 'degraded (offline resilience fallback active)',
      timestamp: new Date().toISOString(),
      latencyMs: totalLatency,
      database: {
        provider: 'postgresql + prisma',
        status: dbStatus
      },
      providers
    });
  } catch (error) {
    return NextResponse.json(
      { status: 'unhealthy', error: (error as Error)?.message },
      { status: 503 }
    );
  }
}
