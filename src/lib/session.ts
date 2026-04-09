import type { AuthState } from "@/types/auth";

const STORAGE_KEY = "juntai_auth";
const SESSION_COOKIE = "juntai_session";

const EMPTY_STATE: AuthState = {
  user: null,
  sessionToken: null,
  memberships: [],
};

export function saveAuthState(state: AuthState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    if (state.sessionToken) {
      // Set session cookie so middleware can read it
      document.cookie = `${SESSION_COOKIE}=${state.sessionToken}; path=/; SameSite=Lax`;
    }
  } catch {
    // localStorage unavailable — swallow silently
  }
}

export function loadAuthState(): AuthState {
  if (typeof window === "undefined") return { ...EMPTY_STATE };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as AuthState;
  } catch {
    // corrupted data — fall through to empty
  }
  return { ...EMPTY_STATE };
}

export function clearAuthState(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0`;
  } catch {
    // swallow
  }
}
