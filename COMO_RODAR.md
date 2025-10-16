# 🚀 Como Rodar o Sistema

## ⚠️ AÇÃO NECESSÁRIA: Configurar Senha do Banco

Antes de rodar o sistema, você precisa adicionar a senha do banco de dados Supabase:

### Passo 1: Obter a Senha do Supabase

1. Acesse: https://supabase.com/dashboard/project/dpjtszxmoxbijzjgotkq/settings/database
2. Na seção "Connection string", você verá a senha ou pode clicar em "Reset database password"
3. Copie a senha

### Passo 2: Configurar o .env

Abra o arquivo `.env` e substitua `[YOUR_DB_PASSWORD]` pela senha real:

```bash
DATABASE_URL=postgresql://postgres.dpjtszxmoxbijzjgotkq:SUA_SENHA_AQUI@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

### Passo 3: Aplicar as Migrações SQL

1. Acesse: https://supabase.com/dashboard/project/dpjtszxmoxbijzjgotkq/editor
2. Execute cada arquivo SQL em ordem:
   - `supabase/migrations/20250116_001_create_users_table.sql`
   - `supabase/migrations/20250116_002_create_transactions_table.sql`
   - `supabase/migrations/20250116_003_create_google_sheets_connections_table.sql`

### Passo 4: Rodar o Sistema

```bash
npm run dev
```

O sistema estará disponível em: http://localhost:5000

## 📁 Estrutura Criada

✅ Frontend básico (React + TypeScript)
✅ Backend (Express + Node.js)
✅ Banco de dados Supabase configurado
✅ Migrações SQL prontas

## 🔧 Sistema Funcional Básico

Atualmente o sistema tem:
- ✅ Página Dashboard inicial
- ⏳ Páginas de Transações (próximo passo)
- ⏳ Upload de arquivos (próximo passo)
- ⏳ Configurações (próximo passo)

## ❓ Precisa de Ajuda?

Se não conseguir a senha do Supabase, me avise que eu ajusto o sistema para funcionar sem ela!
