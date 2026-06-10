import type { AiProviderId } from "./types";

export class AiGatewayError extends Error {
  code: string;
  provider?: AiProviderId;
  status?: number;
  cause?: unknown;

  constructor({
    message,
    code,
    provider,
    status,
    cause
  }: {
    message: string;
    code: string;
    provider?: AiProviderId;
    status?: number;
    cause?: unknown;
  }) {
    super(message);
    this.name = "AiGatewayError";
    this.code = code;
    this.provider = provider;
    this.status = status;
    this.cause = cause;
  }
}

export function createProviderHttpError({
  provider,
  status,
  body
}: {
  provider: AiProviderId;
  status: number;
  body: string;
}) {
  return new AiGatewayError({
    code: "provider_http_error",
    provider,
    status,
    message: `${provider} returned HTTP ${status}: ${body.slice(0, 240)}`
  });
}

export function createProviderResponseError({
  provider,
  message,
  cause
}: {
  provider: AiProviderId;
  message: string;
  cause?: unknown;
}) {
  return new AiGatewayError({
    code: "provider_response_error",
    provider,
    message,
    cause
  });
}
