"use client";

import * as React from "react";
import { ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/auth/AuthProvider";
import { Button } from "@/components/primitives/button/Button";
import { Input } from "@/components/primitives/input/Input";
import { Label } from "@/components/primitives/label/Label";

type FormState = "idle" | "loading" | "sent" | "error";

export default function LoginPage() {
  const { requestMagicLink } = useAuth();

  const [email, setEmail] = React.useState("");
  const [formState, setFormState] = React.useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = React.useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setFormState("loading");
    setErrorMsg("");

    try {
      await requestMagicLink(email.trim().toLowerCase());
      setFormState("sent");
    } catch {
      setErrorMsg("Ocorreu um erro. Verifique o e-mail e tente novamente.");
      setFormState("error");
    }
  }

  function handleReset() {
    setFormState("idle");
    setEmail("");
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
          Plataforma de gestÃ£o de restaurantes
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
                    Enviandoâ€¦
                  </>
                ) : (
                  <>
                    Enviar link de acesso
                    <ArrowRight size={16} />
                  </>
                )}
              </Button>
            </form>
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
                <span className="font-medium text-foreground">{email}</span> e
                clique no link para entrar.
              </p>
              <p className="text-xs text-muted-foreground">
                Em ambiente de desenvolvimento, o link aparece no terminal do
                servidor.
              </p>
            </div>

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
