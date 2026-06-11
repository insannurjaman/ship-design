import { NextResponse } from "next/server";

import {
  regenerateArtifact,
  RegenerateArtifactError
} from "@/lib/generation/regenerate-artifact";
import { generationArtifactSpecs } from "@/lib/generation/artifact-renderer";
import type { GenerationArtifact, GenerationArtifactId } from "@/lib/generation/progress";

type RegenerateRouteProps = {
  params: Promise<{ runId: string }>;
};

type FieldErrors = Record<string, string>;

const supportedArtifactIds = new Set<GenerationArtifactId>(generationArtifactSpecs.map((spec) => spec.id));

export async function POST(request: Request, { params }: RegenerateRouteProps) {
  const { runId } = await params;
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      {
        error: "Request body must be valid JSON."
      },
      { status: 400 }
    );
  }

  const validation = validateRegenerateRequest(payload);

  if (!validation.ok) {
    return NextResponse.json(
      {
        error: "Invalid artifact regeneration request.",
        fieldErrors: validation.fieldErrors
      },
      { status: 400 }
    );
  }

  try {
    const result = await regenerateArtifact(runId, validation.input);

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof RegenerateArtifactError) {
      return NextResponse.json(
        {
          error: error.message,
          fieldErrors: error.fieldErrors
        },
        { status: error.status }
      );
    }

    console.error("Failed to regenerate artifact", error);

    return NextResponse.json(
      {
        error: "Ship Design could not regenerate this artifact. The active version was not changed."
      },
      { status: 500 }
    );
  }
}

function validateRegenerateRequest(payload: unknown):
  | {
      ok: true;
      input: {
        artifactId: GenerationArtifact["id"];
        feedback?: string;
      };
    }
  | { ok: false; fieldErrors: FieldErrors } {
  if (!payload || typeof payload !== "object") {
    return {
      ok: false,
      fieldErrors: {
        body: "Request body must be an object."
      }
    };
  }

  const value = payload as Record<string, unknown>;
  const fieldErrors: FieldErrors = {};

  if (!isSupportedArtifactId(value.artifactId)) {
    fieldErrors.artifactId = "Choose one of the 8 generated artifacts.";
  }

  if (value.feedback !== undefined && typeof value.feedback !== "string") {
    fieldErrors.feedback = "Feedback must be text.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      fieldErrors
    };
  }

  const artifactId = value.artifactId as GenerationArtifactId;

  return {
    ok: true,
    input: {
      artifactId,
      feedback: typeof value.feedback === "string" ? value.feedback.trim() : undefined
    }
  };
}

function isSupportedArtifactId(value: unknown): value is GenerationArtifactId {
  return typeof value === "string" && supportedArtifactIds.has(value as GenerationArtifactId);
}
