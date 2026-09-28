const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL!

let refreshPromise: Promise<boolean> | null = null

async function refreshAccessToken(): Promise<boolean> {
  try {
    const response = await fetch(`${BACKEND_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    })

    return response.ok
  } catch {
    return false
  }
}

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {},
  retry = true
): Promise<Response> {
  const response = await fetch(`${BACKEND_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  })

  if (response.status !== 401) {
    return response
  }

  if (!retry) {
    return response
  }

  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null
    })
  }

  const refreshed = await refreshPromise

  if (!refreshed) {
    return response
  }

  return apiFetch(endpoint, options, false)
}
