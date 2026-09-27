type ApiError = { error?: string };

/** Parse the common JSON response shape and surface non-2xx responses to callers. */
export async function fetchJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);
  const body: unknown = await response.json();

  if (!response.ok) {
    const message = typeof body === "object" && body !== null && "error" in body
      ? (body as ApiError).error
      : undefined;
    throw new Error(message || "Permintaan gagal. Silakan coba lagi.");
  }

  return body as T;
}
