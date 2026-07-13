export function safeJsonResponse(data: any, status = 200) {
  const serialized = JSON.stringify(data, (key, value) =>
    typeof value === "bigint" ? value.toString() : value
  );
  return new Response(serialized, {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Client-side fetch wrapper — otomatis set Content-Type header
 * dan serialize body ke JSON (termasuk BigInt → string).
 *
 * Kalau tidak ada body, header & body tidak diset (aman untuk GET/DELETE).
 */
export function safeJsonFetch(
  url: string,
  method: string,
  body?: any
): Promise<Response> {
  return fetch(url, {
    method,
    headers:
      body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body:
      body !== undefined
        ? JSON.stringify(body, (key, value) =>
            typeof value === "bigint" ? value.toString() : value
          )
        : undefined,
  });
}
