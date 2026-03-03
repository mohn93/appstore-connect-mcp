import { generateToken } from "../auth/jwt.js";

const BASE_URL = "https://api.appstoreconnect.apple.com/v1";

interface ASCErrorResponse {
  errors: Array<{
    status: string;
    code: string;
    title: string;
    detail: string;
  }>;
}

export interface PaginatedResponse<T> {
  data: T[];
  links: {
    self: string;
    next?: string;
  };
  meta?: {
    paging: {
      total: number;
      limit: number;
    };
  };
}

export interface SingleResponse<T> {
  data: T;
  included?: unknown[];
}

export class APIError extends Error {
  constructor(
    public status: number,
    public code: string,
    public detail: string
  ) {
    super(`ASC API Error [${status}] ${code}: ${detail}`);
    this.name = "APIError";
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}`;
    try {
      const errorBody = (await response.json()) as ASCErrorResponse;
      if (errorBody.errors?.length > 0) {
        const err = errorBody.errors[0];
        throw new APIError(
          response.status,
          err.code,
          err.detail || err.title
        );
      }
    } catch (e) {
      if (e instanceof APIError) throw e;
    }

    if (response.status === 401) {
      throw new APIError(401, "UNAUTHORIZED", "JWT token expired or invalid. Check your API key credentials.");
    }
    if (response.status === 403) {
      throw new APIError(403, "FORBIDDEN", "Insufficient permissions. Check your API key role.");
    }
    if (response.status === 429) {
      throw new APIError(429, "RATE_LIMITED", "Rate limited by Apple. Try again in a moment.");
    }

    throw new APIError(response.status, "UNKNOWN", errorMessage);
  }

  return response.json() as Promise<T>;
}

export async function ascGet<T>(
  path: string,
  params?: Record<string, string>
): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
  }

  const token = generateToken();
  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  return handleResponse<T>(response);
}

export async function ascPost<T>(
  path: string,
  body: unknown
): Promise<T> {
  const token = generateToken();
  const response = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  return handleResponse<T>(response);
}

export async function ascPatch<T>(
  path: string,
  body: unknown
): Promise<T> {
  const token = generateToken();
  const response = await fetch(`${BASE_URL}${path}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  return handleResponse<T>(response);
}

export async function ascDelete(path: string): Promise<void> {
  const token = generateToken();
  const response = await fetch(`${BASE_URL}${path}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    await handleResponse(response);
  }
}

// Helper to fetch all pages of a paginated response
export async function ascGetAll<T>(
  path: string,
  params?: Record<string, string>
): Promise<T[]> {
  const allData: T[] = [];
  let nextUrl: string | undefined;

  // First request
  const firstPage = await ascGet<PaginatedResponse<T>>(path, params);
  allData.push(...firstPage.data);
  nextUrl = firstPage.links.next;

  // Follow pagination
  while (nextUrl) {
    const token = generateToken();
    const response = await fetch(nextUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const page = await handleResponse<PaginatedResponse<T>>(response);
    allData.push(...page.data);
    nextUrl = page.links.next;
  }

  return allData;
}
