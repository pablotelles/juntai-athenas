"use client";

import * as React from "react";
import type { AuthState, UserRole, EntityType } from "@/types/auth";
import { loadAuthState, saveAuthState, clearAuthState } from "@/lib/session";
import {
  requestMagicLink as mockRequestMagicLink,
  validateMagicToken,
  MOCK_MEMBERSHIPS,
} from "@/lib/mock-auth";

// ── Context value contract ──────────────────────────────────────────────────
interface AuthContextValue extends AuthState {
  /** True when there is an active session */
  isAuthenticated: boolean;
  /**
   * Request a magic link for the given email.
   * In mock mode, logs the link to the console and returns the URL.
   */
  requestMagicLink: (email: string) => Promise<string>;
  /**
   * Validate a magic link token and create a session.
   * Returns true on success.
   */
  loginWithToken: (token: string) => Promise<boolean>;
  logout: () => void;
  /** Check if the current user has a specific role in an entity */
  hasRole: (entityType: EntityType, entityId: string, role: UserRole) => boolean;
  /** True if user has the platform admin role */
  isPlatformAdmin: boolean;
}

const AuthCtx = React.createContext<AuthContextValue | null>(null);

// ── Provider ────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<AuthState>(() => loadAuthState());

  const isAuthenticated = state.user !== null;
  const isPlatformAdmin =
    isAuthenticated &&
    state.memberships.some(
      (m) => m.entityType === "platform" && m.role === "admin",
    );

  async function requestMagicLink(email: string): Promise<string> {
    return mockRequestMagicLink(email);
  }

  async function loginWithToken(token: string): Promise<boolean> {
    const result = validateMagicToken(token);
    if (!result) return false;

    const { user, sessionToken } = result;
    const newState: AuthState = {
      user,
      sessionToken,
      memberships: MOCK_MEMBERSHIPS[user.id] ?? [],
    };
    setState(newState);
    saveAuthState(newState);
    return true;
  }

  function logout(): void {
    clearAuthState();
    setState({ user: null, sessionToken: null, memberships: [] });
  }

  function hasRole(
    entityType: EntityType,
    entityId: string,
    role: UserRole,
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
