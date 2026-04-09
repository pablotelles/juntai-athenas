const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export class ApiError extends Error {
  constructor(
    public readonly code: string,
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.ok) {
    if (res.status === 204) return undefined as T;
    return res.json() as Promise<T>;
  }
  const err = await res.json().catch(() => ({
    code: "UNKNOWN_ERROR",
    message: `HTTP ${res.status}`,
  }));
  throw new ApiError(
    err.code ?? "UNKNOWN_ERROR",
    res.status,
    err.message ?? `HTTP ${res.status}`,
  );
}

function buildHeaders(
  token?: string | null,
  extra?: Record<string, string>,
): Record<string, string> {
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

export function apiClient(token?: string | null) {
  return {
    get<T>(path: string, headers?: Record<string, string>): Promise<T> {
      return fetch(`${BASE_URL}${path}`, {
        headers: buildHeaders(token, headers),
      }).then((r) => handleResponse<T>(r));
    },

    post<T>(
      path: string,
      body: unknown,
      headers?: Record<string, string>,
    ): Promise<T> {
      return fetch(`${BASE_URL}${path}`, {
        method: "POST",
        headers: buildHeaders(token, headers),
        body: JSON.stringify(body),
      }).then((r) => handleResponse<T>(r));
    },

    delete<T>(path: string, headers?: Record<string, string>): Promise<T> {
      return fetch(`${BASE_URL}${path}`, {
        method: "DELETE",
        headers: buildHeaders(token, headers),
      }).then((r) => handleResponse<T>(r));
    },
  };
}
