"use client";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
  }
}

/** Fired when any request comes back 401 so the lock screen can take over. */
export const LOCKED_EVENT = "ops:locked";

async function request<T>(
  method: string,
  url: string,
  body?: unknown
): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  if (res.status === 401) {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(LOCKED_EVENT));
    }
    throw new ApiError(401, "Locked");
  }

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    throw new ApiError(res.status, data?.error ?? `Request failed (${res.status})`);
  }
  return data as T;
}

export const api = {
  get: <T>(url: string) => request<T>("GET", url),
  post: <T>(url: string, body?: unknown) => request<T>("POST", url, body ?? {}),
  patch: <T>(url: string, body?: unknown) => request<T>("PATCH", url, body ?? {}),
  del: <T>(url: string, body?: unknown) => request<T>("DELETE", url, body),
};
