"use client";

import * as React from "react";
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

export function UserMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="rounded-full focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)] focus:ring-offset-1"
          aria-label="Menu do usuário"
        >
          <Avatar fallback="JP" size="sm" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>
          <div className="flex flex-col gap-0.5">
            <span className="font-medium text-foreground">João Paulo</span>
            <span className="text-xs font-normal text-muted-foreground">
              admin@juntai.com
            </span>
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
        <DropdownMenuItem destructive>
          <LogOut size={14} className="mr-2" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
