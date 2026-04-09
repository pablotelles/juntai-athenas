"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, XCircle } from "lucide-react";
import { useAuth } from "@/contexts/auth/AuthProvider";
import { Button } from "@/components/primitives/button/Button";

type CallbackState = "validating" | "success" | "error";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { loginWithToken } = useAuth();

  const [state, setState] = React.useState<CallbackState>("validating");

  React.useEffect(() => {
    // Read token from window.location to avoid useSearchParams() Suspense issues
    const token = new URLSearchParams(window.location.search).get("token");

    if (!token) {
      setState("error");
      return;
    }

    loginWithToken(token).then((ok) => {
      if (ok) {
        setState("success");
        setTimeout(() => router.replace("/dashboard"), 800);
      } else {
        setState("error");
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full max-w-sm">
      <div className="rounded-xl border border-border bg-surface shadow-sm p-8 text-center space-y-4">
        {state === "validating" && (
          <>
            <Loader2 size={40} className="animate-spin text-primary mx-auto" />
            <p className="text-sm text-muted-foreground">
              Validando seu link de acesso…
            </p>
          </>
        )}

        {state === "success" && (
          <>
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mx-auto">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div className="space-y-1">
              <p className="text-base font-semibold text-foreground">
                Autenticado!
              </p>
              <p className="text-sm text-muted-foreground">
                Redirecionando para o dashboard…
              </p>
            </div>
          </>
        )}

        {state === "error" && (
          <>
            <XCircle size={40} className="text-destructive mx-auto" />
            <div className="space-y-1">
              <p className="text-base font-semibold text-foreground">
                Link inválido ou expirado
              </p>
              <p className="text-sm text-muted-foreground">
                Este link de acesso não é mais válido. Solicite um novo.
              </p>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.replace("/auth/login")}
            >
              Voltar ao login
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
