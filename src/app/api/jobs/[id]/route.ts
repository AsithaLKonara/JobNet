import { NextRequest, NextResponse } from 'next/server';
import { JobService } from '@/services/job-service';

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Job ID is required' }, { status: 400 });
    }

    const job = await JobService.getJobById(id);
    if (!job) {
      return NextResponse.json({ success: false, error: 'Job listing not found or expired' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      data: job
    });

  } catch (error) {
    console.error('[API /api/jobs/[id] GET Error]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve job details' },
      { status: 500 }
    );
  }
}
