import { apiFetch } from "./api"

export interface User {
  _id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
}

interface LoginResponse {
  message: string
  user: User
}

export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  const response = await apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || "Login failed")
  }

  return data
}

export async function getCurrentUser(): Promise<User> {
  const response = await apiFetch("/auth/me")

  if (!response.ok) {
    throw new Error("Not authenticated")
  }

  return response.json()
}

export async function logout() {
  const response = await apiFetch("/auth/logout", {
    method: "POST",
  })

  if (!response.ok) {
    const data = await response.json().catch(() => null)
    throw new Error(data?.message || "Logout failed")
  }

  return response.json()
}
