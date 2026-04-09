"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { LogOut, Settings, User } from "lucide-react";
import { Avatar } from "@/components/shared/avatar/Avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/shared/dropdown-menu/DropdownMenu";
import { useAuth } from "@/contexts/auth/AuthProvider";

export function UserMenu() {
  const { user, logout } = useAuth();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push("/auth/login");
  }

  const displayName = user?.name ?? user?.email ?? "Usuário";
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="rounded-full focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)] focus:ring-offset-1"
          aria-label="Menu do usuário"
        >
          <Avatar fallback={initials} size="sm" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>
          <div className="flex flex-col gap-0.5">
            <span className="font-medium text-foreground">{displayName}</span>
            {user?.email && (
              <span className="text-xs font-normal text-muted-foreground">
                {user.email}
              </span>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <User size={14} className="mr-2" />
          Perfil
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings size={14} className="mr-2" />
          Configurações
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem destructive onClick={handleLogout}>
          <LogOut size={14} className="mr-2" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
