"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, ArrowRight, Loader2, CheckCircle2, ExternalLink } from "lucide-react";
import { useAuth } from "@/contexts/auth/AuthProvider";
import { Button } from "@/components/primitives/button/Button";
import { Input } from "@/components/primitives/input/Input";
import { Label } from "@/components/primitives/label/Label";

type FormState = "idle" | "loading" | "sent" | "error";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { requestMagicLink } = useAuth();

  const [email, setEmail] = React.useState("");
  const [formState, setFormState] = React.useState<FormState>("idle");
  const [mockUrl, setMockUrl] = React.useState<string | null>(null);
  const [errorMsg, setErrorMsg] = React.useState("");

  const nextPath = searchParams.get("next") ?? "/dashboard";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setFormState("loading");
    setErrorMsg("");

    try {
      const url = await requestMagicLink(email.trim().toLowerCase());
      setMockUrl(url);
      setFormState("sent");
    } catch {
      setErrorMsg("Ocorreu um erro. Tente novamente.");
      setFormState("error");
    }
  }

  function handleReset() {
    setFormState("idle");
    setMockUrl(null);
    setEmail("");
  }

  // In dev mode: allow clicking the generated link directly
  function handleMockLinkClick() {
    if (!mockUrl) return;
    const url = new URL(mockUrl);
    router.push(url.pathname + url.search);
  }

  return (
    <div className="w-full max-w-sm space-y-8">
      {/* Brand */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-primary-foreground font-bold text-xl mb-2 shadow-md">
          J
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Juntai Console
        </h1>
        <p className="text-sm text-muted-foreground">
          Plataforma de gestão de restaurantes
        </p>
      </div>

      {/* Card */}
      <div className="rounded-xl border border-border bg-surface shadow-sm p-6 space-y-6">
        {formState !== "sent" ? (
          <>
            <div className="space-y-1">
              <h2 className="text-base font-semibold text-foreground">
                Acesse sua conta
              </h2>
              <p className="text-sm text-muted-foreground">
                Insira seu e-mail para receber o link de acesso.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="voce@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  autoFocus
                  required
                  error={formState === "error"}
                />
                {formState === "error" && (
                  <p className="text-xs text-destructive">{errorMsg}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                loading={formState === "loading"}
                size="lg"
              >
                {formState === "loading" ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Enviando…
                  </>
                ) : (
                  <>
                    Enviar link de acesso
                    <ArrowRight size={16} />
                  </>
                )}
              </Button>
            </form>

            {/* Mock hint */}
            <div className="rounded-md border border-border bg-secondary/50 px-3 py-2">
              <p className="text-[11px] text-muted-foreground">
                <span className="font-medium">Contas de teste:</span>{" "}
                admin@juntai.com · staff@juntai.com · owner@juntai.com
              </p>
            </div>
          </>
        ) : (
          /* Sent state */
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-2 py-2 text-center">
              <CheckCircle2 size={40} className="text-primary" />
              <h2 className="text-base font-semibold text-foreground">
                Link enviado!
              </h2>
              <p className="text-sm text-muted-foreground">
                Verifique seu e-mail em{" "}
                <span className="font-medium text-foreground">{email}</span>{" "}
                e clique no link para entrar.
              </p>
            </div>

            {/* DEV MODE — show mock link directly */}
            {mockUrl && (
              <div className="rounded-md border border-primary/30 bg-primary/5 p-3 space-y-2">
                <p className="text-[11px] font-medium text-primary uppercase tracking-wide">
                  DEV MODE — Link gerado
                </p>
                <p className="text-[11px] text-muted-foreground break-all">
                  {mockUrl}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  onClick={handleMockLinkClick}
                >
                  <ExternalLink size={12} />
                  Acessar agora
                </Button>
              </div>
            )}

            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full text-muted-foreground text-xs"
              onClick={handleReset}
            >
              Usar outro e-mail
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
