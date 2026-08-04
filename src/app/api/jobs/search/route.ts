import { NextRequest, NextResponse } from 'next/server';
import { JobService } from '@/services/job-service';
import { JobSearchParams } from '@/types/job';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const params: JobSearchParams = {
      keyword: searchParams.get('keyword') || undefined,
      location: searchParams.get('location') || undefined,
      country: searchParams.get('country') || undefined,
      remote: searchParams.get('remote') === 'true',
      employmentType: searchParams.get('employmentType') as JobSearchParams['employmentType'] || undefined,
      page: searchParams.has('page') ? parseInt(searchParams.get('page')!, 10) : 1,
      limit: searchParams.has('limit') ? parseInt(searchParams.get('limit')!, 10) : 12
    };

    const payload = await JobService.searchJobs(params);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      data: payload
    });

  } catch (error) {
    console.error('[API /api/jobs/search GET Error]', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error while searching jobs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const params: JobSearchParams = {
      keyword: body.keyword,
      location: body.location,
      country: body.country,
      remote: Boolean(body.remote),
      employmentType: body.employmentType,
      page: Number(body.page) || 1,
      limit: Number(body.limit) || 12
    };

    const payload = await JobService.searchJobs(params);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      data: payload
    });
  } catch (error) {
    console.error('[API /api/jobs/search POST Error]', error);
    return NextResponse.json(
      { success: false, error: 'Invalid payload or internal processing failure' },
      { status: 400 }
    );
  }
}
