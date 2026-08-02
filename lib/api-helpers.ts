import { NextRequest, NextResponse } from "next/server";
import { isUnlocked } from "./auth";

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
  }
}

export const badRequest = (message: string) => new HttpError(400, message);
export const notFound = (message = "Not found") => new HttpError(404, message);

type Ctx = { params: Promise<Record<string, string>> };

/**
 * Wraps a route handler: enforces the PIN lock, serialises the return value to
 * JSON and turns thrown HttpErrors into proper status codes.
 *
 * The returned function takes `ctx: any` so it stays assignable to the route
 * signature Next generates for both static and dynamic segments.
 *
 * Auth routes deliberately do NOT use this.
 */
export function route<T>(
  handler: (req: NextRequest, ctx: Ctx) => Promise<T>
): // eslint-disable-next-line @typescript-eslint/no-explicit-any
(req: NextRequest, ctx: any) => Promise<Response> {
  return async (req, ctx) => {
    try {
      if (!(await isUnlocked())) {
        return NextResponse.json({ error: "locked" }, { status: 401 });
      }
      const result = await handler(req, ctx);
      if (result instanceof Response) return result;
      return NextResponse.json(result ?? { ok: true });
    } catch (err) {
      const status = err instanceof HttpError ? err.status : 500;
      const message = err instanceof Error ? err.message : "Server error";
      if (status >= 500) console.error("[api]", message, err);
      return NextResponse.json({ error: message }, { status });
    }
  };
}

export async function readJson(req: NextRequest): Promise<Record<string, unknown>> {
  try {
    const body = await req.json();
    return body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

export async function paramId(ctx: Ctx): Promise<number> {
  const { id } = await ctx.params;
  const parsed = Number(id);
  if (!Number.isInteger(parsed)) throw badRequest("Invalid id");
  return parsed;
}

/** `?commissionId=universal` → null, `?commissionId=3` → 3, absent → undefined. */
export function commissionIdParam(
  req: NextRequest,
  key = "commissionId"
): number | null | undefined {
  const raw = req.nextUrl.searchParams.get(key);
  if (raw === null) return undefined;
  if (raw === "universal" || raw === "null" || raw === "") return null;
  const parsed = Number(raw);
  if (!Number.isInteger(parsed)) throw badRequest(`Invalid ${key}`);
  return parsed;
}

export function requireString(
  body: Record<string, unknown>,
  key: string
): string {
  const value = body[key];
  if (typeof value !== "string" || !value.trim()) {
    throw badRequest(`"${key}" is required`);
  }
  return value.trim();
}

export function optionalString(
  body: Record<string, unknown>,
  key: string
): string | null | undefined {
  if (!(key in body)) return undefined;
  const value = body[key];
  if (value === null) return null;
  if (typeof value !== "string") throw badRequest(`"${key}" must be a string`);
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

export function optionalBoolean(
  body: Record<string, unknown>,
  key: string
): boolean | undefined {
  if (!(key in body)) return undefined;
  if (typeof body[key] !== "boolean") throw badRequest(`"${key}" must be a boolean`);
  return body[key] as boolean;
}
