// Backend API base URL - defaults to localhost:8000, can be overridden with env variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

// Storage preference key
const REMEMBER_ME_KEY = "auth_remember_me";
const REMEMBERED_EMAIL_KEY = "auth_remembered_email";

// Helper functions for token storage based on "Remember Me" preference
function getStorage(): Storage {
  // Check if user previously chose to be remembered
  const rememberMe = localStorage.getItem(REMEMBER_ME_KEY) === "true";
  return rememberMe ? localStorage : sessionStorage;
}

function setRememberMePreference(remember: boolean): void {
  if (remember) {
    localStorage.setItem(REMEMBER_ME_KEY, "true");
  } else {
    localStorage.removeItem(REMEMBER_ME_KEY);
    // Clear remembered email when "remember me" is unchecked
    localStorage.removeItem(REMEMBERED_EMAIL_KEY);
  }
}

/**
 * Store email when "remember me" is checked (never store password!)
 */
export function storeRememberedEmail(email: string, remember: boolean): void {
  if (remember) {
    localStorage.setItem(REMEMBERED_EMAIL_KEY, email);
  } else {
    localStorage.removeItem(REMEMBERED_EMAIL_KEY);
  }
}

/**
 * Get remembered email if it exists
 */
export function getRememberedEmail(): string | null {
  return localStorage.getItem(REMEMBERED_EMAIL_KEY);
}

/**
 * Check if "remember me" was previously enabled
 */
export function wasRememberMeEnabled(): boolean {
  return localStorage.getItem(REMEMBER_ME_KEY) === "true";
}

export function storeTokens(accessToken: string, refreshToken: string, remember: boolean = true): void {
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem("access_token", accessToken);
  storage.setItem("refresh_token", refreshToken);
  setRememberMePreference(remember);
}

function getAccessToken(): string | null {
  const storage = getStorage();
  return storage.getItem("access_token");
}

export function isAuthenticated(): boolean {
  return getAccessToken() !== null;
}

// function getRefreshToken(): string | null {
//   const storage = getStorage();
//   return storage.getItem("refresh_token");
// }

function clearTokens(): void {
  // Clear from both storages to be safe
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  sessionStorage.removeItem("access_token");
  sessionStorage.removeItem("refresh_token");
  localStorage.removeItem(REMEMBER_ME_KEY);
  // Note: We keep REMEMBERED_EMAIL_KEY on logout so email can be pre-filled next time
  // User can clear it by unchecking "remember me" and logging out
}

// Auth API types
export interface LoginRequest {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  user_metadata?: Record<string, any>;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in?: number;
}

export interface UserResponse {
  id: string;
  email: string | null;
  phone: string | null;
  email_confirmed_at: string | null;
  phone_confirmed_at: string | null;
  confirmed_at: string | null;
  last_sign_in_at: string | null;
  app_metadata: Record<string, any> | null;
  user_metadata: Record<string, any> | null;
  identities: any[] | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface AuthResponse {
  user: UserResponse;
  tokens: TokenResponse;
}

export interface GoogleAuthRequest {
  code?: string;
  redirect_to?: string;
}

export interface PasswordResetRequest {
  email: string;
  redirect_to?: string;
}

export interface UpdatePasswordRequest {
  password: string;
  access_token: string;
}

// Helper function to get auth headers
export function getAuthHeaders(): HeadersInit {
  const token = getAccessToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

// Auth API functions
export async function login(credentials: LoginRequest): Promise<AuthResponse> {
  const { remember = true, ...loginData } = credentials;
  
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(loginData),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Login failed" }));
    throw new Error(error.detail || "Login failed");
  }

  const data: AuthResponse = await response.json();
  
  // Store tokens using the appropriate storage based on "Remember Me" preference
  if (data.tokens.access_token) {
    storeTokens(data.tokens.access_token, data.tokens.refresh_token, remember);
    // Store email for convenience (but NEVER the password!)
    storeRememberedEmail(credentials.email, remember);
  }

  return data;
}

export async function register(userData: RegisterRequest): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Registration failed" }));
    throw new Error(error.detail || "Registration failed");
  }

  const data: AuthResponse = await response.json();
  
  // Store tokens if available (default to remembering for registration)
  if (data.tokens.access_token) {
    storeTokens(data.tokens.access_token, data.tokens.refresh_token, true);
  }

  return data;
}

export async function refreshToken(refreshToken: string): Promise<TokenResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Token refresh failed" }));
    throw new Error(error.detail || "Token refresh failed");
  }

  const data: TokenResponse = await response.json();
  
  // Update stored tokens using the same storage preference
  const rememberMe = localStorage.getItem(REMEMBER_ME_KEY) === "true";
  storeTokens(data.access_token, data.refresh_token, rememberMe);

  return data;
}

export async function getCurrentUser(): Promise<UserResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Failed to get user" }));
    throw new Error(error.detail || "Failed to get user");
  }

  return response.json();
}

export async function logout(): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
  } finally {
    // Clear tokens regardless of API response
    clearTokens();
  }
}

export async function getGoogleAuthUrl(redirectTo?: string): Promise<{ authorization_url: string; redirect_to: string }> {
  const params = new URLSearchParams();
  if (redirectTo) {
    params.append("redirect_to", redirectTo);
  }
  
  const response = await fetch(`${API_BASE_URL}/auth/google/authorize?${params.toString()}`);
  
  if (!response.ok) {
    throw new Error("Failed to get Google auth URL");
  }

  return response.json();
}

export async function handleGoogleCallback(code: string, redirectTo?: string): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/google/callback`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ code, redirect_to: redirectTo }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Google authentication failed" }));
    throw new Error(error.detail || "Google authentication failed");
  }

  const data: AuthResponse = await response.json();
  
  // Store tokens (default to remembering for Google OAuth)
  if (data.tokens.access_token) {
    storeTokens(data.tokens.access_token, data.tokens.refresh_token, true);
  }

  return data;
}

export async function resetPassword(request: PasswordResetRequest): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Password reset failed" }));
    throw new Error(error.detail || "Password reset failed");
  }

  return response.json();
}

export async function updatePassword(request: UpdatePasswordRequest): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/auth/update-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Password update failed" }));
    throw new Error(error.detail || "Password update failed");
  }

  return response.json();
}

