"use client";

import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/auth/AuthProvider";
import { ActiveContextProvider } from "@/contexts/active-context/ActiveContextProvider";
import { ToastProvider } from "@/contexts/toast/ToastProvider";
import { Toaster } from "@/components/primitives/toast/Toast";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            retry: 1,
          },
        },
      }),
  );

  return (
    <AuthProvider>
      <ActiveContextProvider>
        <QueryClientProvider client={queryClient}>
          <ToastProvider>
            {children}
            <Toaster />
          </ToastProvider>
        </QueryClientProvider>
      </ActiveContextProvider>
    </AuthProvider>
  );
}
