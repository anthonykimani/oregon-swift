const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

interface ApiResponse<T = any> {
  status: number;
  message: string;
  data: T;
  errors: string[];
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("oc_token");
}

export function setToken(token: string) {
  localStorage.setItem("oc_token", token);
}

export function clearToken() {
  localStorage.removeItem("oc_token");
}

export async function api<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getToken();

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const json: ApiResponse<T> = await res.json();
  return json;
}
