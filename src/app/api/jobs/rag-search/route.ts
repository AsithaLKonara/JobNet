import { NextRequest, NextResponse } from 'next/server';
import { JobService } from '@/services/job-service';
import { RagService } from '@/services/rag-service';
import { JobSearchParams } from '@/types/job';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const startMs = Date.now();
    const body = await request.json();
    const prompt = body.prompt || '';
    const filters: JobSearchParams = body.filters || {};

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Candidate resume or natural language prompt is required for RAG evaluation.'
      }, { status: 400 });
    }

    // Fetch deep candidate listings from multi-provider aggregation pipeline
    const baseResults = await JobService.searchJobs({
      ...filters,
      limit: 60, // Retrieve wide candidate pool for LLM & semantic evaluation
      page: 1
    });

    // Execute Hybrid Groq AI Llama-3 / TF-IDF Vector matching
    const aiEnrichedJobs = await RagService.evaluateCandidateMatches(prompt, baseResults.jobs);

    return NextResponse.json({
      success: true,
      data: {
        jobs: aiEnrichedJobs,
        total: aiEnrichedJobs.length,
        page: 1,
        limit: aiEnrichedJobs.length,
        totalPages: 1,
        providersUsed: baseResults.providersUsed,
        isRagPowered: true,
        ragExecutionMs: Date.now() - startMs
      },
      meta: {
        engine: process.env.GROQ_API_KEY ? 'Groq AI Llama-3.3-70B' : 'Statistical Vector RAG Engine',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('[POST /api/jobs/rag-search Error]:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to process AI RAG smart match analysis.'
    }, { status: 500 });
  }
}
