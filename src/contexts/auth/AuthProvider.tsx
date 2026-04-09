"use client";

import * as React from "react";
import type {
  AuthState,
  AuthUser,
  Membership,
  MembershipRole,
  EntityType,
} from "@/types/auth";
import { loadAuthState, saveAuthState, clearAuthState } from "@/lib/session";
import { apiClient } from "@/lib/api";

// ── Context value contract ──────────────────────────────────────────────────
interface AuthContextValue extends AuthState {
  /** True when there is an active session */
  isAuthenticated: boolean;
  /**
   * Request a magic link for the given email.
   * Calls POST /auth/magic-link on the BE — the link is sent by e-mail (console in dev).
   */
  requestMagicLink: (email: string) => Promise<void>;
  /**
   * Validate a magic link — receives the code + email from the callback URL,
   * calls POST /auth/verify and hydrates the session.
   * Returns true on success.
   */
  loginWithToken: (email: string, code: string) => Promise<boolean>;
  logout: () => void;
  /** Check if the current user has a specific role in an entity */
  hasRole: (
    entityType: EntityType,
    entityId: string,
    role: MembershipRole,
  ) => boolean;
  /** True if user has the platform admin role */
  isPlatformAdmin: boolean;
}

const AuthCtx = React.createContext<AuthContextValue | null>(null);

// ── Provider ────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<AuthState>(() => loadAuthState());

  // Re-hydrate session on mount: re-fetch /auth/me to get fresh user + memberships.
  // This handles stale localStorage (e.g. missing memberships from an older session).
  // If the token is expired/invalid the BE returns 401 and we clear the session.
  React.useEffect(() => {
    const { sessionToken } = loadAuthState();
    if (!sessionToken) return;

    apiClient(sessionToken)
      .get<{ user: AuthUser; memberships: Membership[] }>("/auth/me")
      .then(({ user, memberships }) => {
        const fresh: AuthState = { user, sessionToken, memberships };
        setState(fresh);
        saveAuthState(fresh);
      })
      .catch(() => {
        // Token invalid or expired — clear session
        clearAuthState();
        setState({ user: null, sessionToken: null, memberships: [] });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isAuthenticated = state.user !== null;
  const isPlatformAdmin =
    isAuthenticated &&
    state.memberships.some(
      (m) => m.entityType === "platform" && m.role === "admin",
    );

  async function requestMagicLink(email: string): Promise<void> {
    await apiClient().post("/auth/magic-link", { email });
  }

  async function loginWithToken(email: string, code: string): Promise<boolean> {
    try {
      const { token } = await apiClient().post<{
        token: string;
        user: AuthUser;
      }>("/auth/verify", { email, code });
      const { user, memberships } = await apiClient(token).get<{
        user: AuthUser;
        memberships: Membership[];
      }>("/auth/me");

      const newState: AuthState = { user, sessionToken: token, memberships };
      setState(newState);
      saveAuthState(newState);
      return true;
    } catch {
      return false;
    }
  }

  function logout(): void {
    const token = state.sessionToken;
    clearAuthState();
    setState({ user: null, sessionToken: null, memberships: [] });
    if (token) {
      apiClient(token)
        .delete("/auth/session")
        .catch(() => undefined);
    }
  }

  function hasRole(
    entityType: EntityType,
    entityId: string,
    role: MembershipRole,
  ): boolean {
    return state.memberships.some(
      (m) =>
        m.entityType === entityType &&
        m.entityId === entityId &&
        m.role === role,
    );
  }

  return (
    <AuthCtx.Provider
      value={{
        ...state,
        isAuthenticated,
        isPlatformAdmin,
        requestMagicLink,
        loginWithToken,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthCtx.Provider>
  );
}

// ── Hook ────────────────────────────────────────────────────────────────────
export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
