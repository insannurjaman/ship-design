import { NextResponse } from "next/server";

import {
  regenerateArtifact,
  RegenerateArtifactError
} from "@/lib/generation/regenerate-artifact";
import type { GenerationArtifact } from "@/lib/generation/progress";

type RegenerateRouteProps = {
  params: Promise<{ runId: string }>;
};

type FieldErrors = Record<string, string>;

const supportedArtifactIds = new Set(["product-brief", "ux-docs", "user-flows"]);

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

  if (typeof value.artifactId !== "string" || !supportedArtifactIds.has(value.artifactId)) {
    fieldErrors.artifactId = "Choose Product Brief, UX Docs, or User Flows.";
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

  return {
    ok: true,
    input: {
      artifactId: value.artifactId as GenerationArtifact["id"],
      feedback: typeof value.feedback === "string" ? value.feedback.trim() : undefined
    }
  };
}
