export function safeJsonResponse(data: any, status = 200) {
  const serialized = JSON.stringify(data, (key, value) =>
    typeof value === "bigint" ? value.toString() : value
  );
  return new Response(serialized, {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
