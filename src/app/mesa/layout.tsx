export default function MesaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="h-dvh w-full overflow-hidden bg-background">
      {children}
    </main>
  );
}
