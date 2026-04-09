import * as React from "react";
import { AppShell } from "@/components/compositions/app-shell/AppShell";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
