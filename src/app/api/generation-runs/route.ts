import { NextResponse } from "next/server";

import { createGenerationRun } from "@/lib/generation/create-run";
import type { CreateGenerationRunRequest } from "@/lib/generation/progress";

type FieldErrors = Record<string, string>;

export async function POST(request: Request) {
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

  const validation = validateCreateGenerationRunRequest(payload);

  if (!validation.ok) {
    return NextResponse.json(
      {
        error: "Missing required generation run fields.",
        fieldErrors: validation.fieldErrors
      },
      { status: 400 }
    );
  }

  try {
    const run = await createGenerationRun(validation.input);

    return NextResponse.json(run);
  } catch (error) {
    console.error("Failed to create generation run", error);

    return NextResponse.json(
      {
        error: "Ship Design could not create the generation run. Please try again."
      },
      { status: 500 }
    );
  }
}

function validateCreateGenerationRunRequest(payload: unknown):
  | { ok: true; input: CreateGenerationRunRequest }
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
  const requiredFields = [
    "productName",
    "productType",
    "targetUsers",
    "mainProblem",
    "productGoal",
    "platform"
  ] as const;

  for (const field of requiredFields) {
    if (!isNonEmptyString(value[field])) {
      fieldErrors[field] = "This field is required.";
    }
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
      productName: normalizeText(value.productName),
      productType: normalizeText(value.productType),
      targetUsers: normalizeText(value.targetUsers),
      mainProblem: normalizeText(value.mainProblem),
      productGoal: normalizeText(value.productGoal),
      platform: normalizeText(value.platform),
      outputTypes: normalizeStringArray(value.outputTypes),
      preferredStyle: isNonEmptyString(value.preferredStyle) ? normalizeText(value.preferredStyle) : undefined
    }
  };
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeStringArray(value: unknown) {
  if (!Array.isArray(value)) return undefined;

  const items = value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);

  return items.length > 0 ? items : undefined;
}
