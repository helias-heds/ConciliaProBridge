export default function Dashboard() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-4">Conciliação Pro</h1>
      <p className="text-lg text-muted-foreground">
        Sistema de Conciliação Financeira
      </p>
      <div className="mt-8 p-6 bg-card rounded-lg border">
        <h2 className="text-2xl font-semibold mb-2">Sistema Configurado</h2>
        <p>O banco de dados Supabase está pronto para uso.</p>
      </div>
    </div>
  );
}
