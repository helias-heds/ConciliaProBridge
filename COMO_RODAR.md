# 🚀 Como Rodar o Sistema

## ✅ BANCO DE DADOS JÁ CONFIGURADO!

A senha do banco já está configurada no `.env`. Basta rodar o sistema!

### Como Iniciar o Sistema

Execute o script de inicialização:

```bash
./start-dev.sh
```

**OU** execute diretamente com o comando completo:

```bash
NODE_ENV=development ./node_modules/.bin/tsx server/index.ts
```

O sistema estará disponível em: **http://localhost:5000**

---

## 📋 Próximo Passo: Aplicar as Migrações SQL

Antes de usar o sistema completamente, execute as migrações no Supabase:

1. Acesse: https://supabase.com/dashboard/project/dpjtszxmoxbijzjgotkq/editor
2. Execute cada arquivo SQL em ordem:
   - `supabase/migrations/20250116_001_create_users_table.sql`
   - `supabase/migrations/20250116_002_create_transactions_table.sql`
   - `supabase/migrations/20250116_003_create_google_sheets_connections_table.sql`

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
