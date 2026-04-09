"use client";

import { Header } from "@/components/compositions/header/Header";
import { UsersView } from "@/features/users/components/UsersView";

export default function UsersPage() {
  return (
    <>
      <Header
        title="Usuários"
        description="Gerencie os usuários cadastrados na plataforma"
      />
      <div className="p-6">
        <UsersView />
      </div>
    </>
  );
}
