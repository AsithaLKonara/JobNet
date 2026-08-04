import { NextRequest, NextResponse } from 'next/server';
import { JobService } from '@/services/job-service';
import { JobSearchParams } from '@/types/job';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    
    const params: JobSearchParams = {
      keyword: searchParams.get('keyword') || undefined,
      location: searchParams.get('location') || undefined,
      country: searchParams.get('country') || undefined,
      remote: searchParams.get('remote') === 'true',
      employmentType: searchParams.get('employmentType') || undefined,
      experience: searchParams.get('experience') || undefined,
      minSalary: searchParams.has('minSalary') ? parseInt(searchParams.get('minSalary')!, 10) : undefined,
      datePosted: searchParams.get('datePosted') || undefined,
      provider: searchParams.get('provider') || undefined,
      page: searchParams.has('page') ? parseInt(searchParams.get('page')!, 10) : 1,
      limit: searchParams.has('limit') ? parseInt(searchParams.get('limit')!, 10) : 12
    };

    const payload = await JobService.searchJobs(params);

    return NextResponse.json({
      success: true,
      data: payload,
      meta: {
        timestamp: new Date().toISOString(),
        engine: 'JobNet Worldwide Multi-Provider Aggregator'
      }
    }, {
      status: 200,
      headers: {
        'Cache-Control': 's-maxage=60, stale-while-revalidate=120'
      }
    });
  } catch (error) {
    console.error('[GET /api/jobs/search Error]:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve worldwide job listings.'
    }, { status: 500 });
  }
}
