import { Header } from "@/components/compositions/header/Header";
import { SessionTestPanel } from "@/features/session-test/components/SessionTestPanel";

export default function SessionTestPage() {
  return (
    <>
      <Header
        title="Mesa de Testes"
        description="Simule abertura de mesa, entrada de clientes e encerramento de sessão."
      />
      <div className="p-6">
        <SessionTestPanel />
      </div>
    </>
  );
}
