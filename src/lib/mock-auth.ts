import type { AuthUser, Membership } from "@/types/auth";

// ── Mock user database ──────────────────────────────────────────────────────
const MOCK_USERS: Record<string, AuthUser> = {
  "admin@juntai.com": {
    id: "u1",
    name: "João Paulo",
    email: "admin@juntai.com",
  },
  "staff@juntai.com": {
    id: "u2",
    name: "Ana Lima",
    email: "staff@juntai.com",
  },
  "owner@juntai.com": {
    id: "u3",
    name: "Carlos Mendes",
    email: "owner@juntai.com",
  },
};

// ── Mock memberships: userId → list of memberships ──────────────────────────
export const MOCK_MEMBERSHIPS: Record<string, Membership[]> = {
  // u1: platform admin — full access
  u1: [{ entityType: "platform", entityId: "platform", role: "admin" }],
  // u2: staff at restaurant r1
  u2: [
    { entityType: "group", entityId: "g1", role: "staff" },
    { entityType: "restaurant", entityId: "r1", role: "staff" },
  ],
  // u3: owner of group g2
  u3: [
    { entityType: "group", entityId: "g2", role: "owner" },
    { entityType: "restaurant", entityId: "r3", role: "owner" },
    { entityType: "restaurant", entityId: "r4", role: "owner" },
  ],
};

// ── Magic link request ──────────────────────────────────────────────────────
/**
 * Simulates sending a magic link.
 * Returns the mock callback URL so the UI can display it in dev mode.
 */
export function requestMagicLink(email: string): string {
  const payload = JSON.stringify({ email, exp: Date.now() + 15 * 60 * 1000 });
  const token = btoa(payload)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

  const url = `http://localhost:3000/auth/callback?token=${token}`;

  // Log to console for dev convenience
  console.log(
    "%c[AUTH MOCK] Magic link gerado:",
    "color: #6366f1; font-weight: bold; font-size: 12px;",
  );
  console.log("%c" + url, "color: #818cf8; text-decoration: underline;");

  return url;
}

// ── Magic link validation ───────────────────────────────────────────────────
export function validateMagicToken(
  token: string,
): { user: AuthUser; sessionToken: string } | null {
  try {
    // Restore base64 standard padding and chars
    const padded =
      token.replace(/-/g, "+").replace(/_/g, "/") +
      "=".repeat((4 - (token.length % 4)) % 4);

    const decoded = atob(padded);
    const payload = JSON.parse(decoded) as { email: string; exp: number };

    if (Date.now() > payload.exp) return null; // expired

    const user = MOCK_USERS[payload.email];
    if (!user) return null;

    const sessionToken = `sess-${user.id}-${Date.now()}`;
    return { user, sessionToken };
  } catch {
    return null;
  }
}
