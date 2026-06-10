import { NextResponse } from "next/server";

import { getGenerationRun } from "@/lib/generation/run-store";

type GenerationRunRouteProps = {
  params: Promise<{ runId: string }>;
};

export async function GET(_request: Request, { params }: GenerationRunRouteProps) {
  const { runId } = await params;
  const run = getGenerationRun(runId);

  if (!run) {
    return NextResponse.json(
      {
        error: "Generation run not found."
      },
      { status: 404 }
    );
  }

  return NextResponse.json(run);
}
