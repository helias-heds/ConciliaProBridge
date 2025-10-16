# Instruções de Configuração do Sistema

## Passo 1: Configurar a Senha do Banco de Dados

Para conectar ao Supabase, você precisa adicionar a senha do banco de dados no arquivo `.env`.

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto: `dpjtszxmoxbijzjgotkq`
3. Vá para **Settings** → **Database**
4. Na seção **Connection string**, copie a senha (ou use "Reset database password" se necessário)
5. Abra o arquivo `.env` e substitua `[YOUR_DB_PASSWORD]` pela senha real:

```
DATABASE_URL=postgresql://postgres.dpjtszxmoxbijzjgotkq:SUA_SENHA_AQUI@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

## Passo 2: Aplicar as Migrações no Supabase

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá para **SQL Editor**
3. Execute cada arquivo SQL na ordem:

### Migração 1: Criar tabela de usuários
```sql
-- Cole o conteúdo de: supabase/migrations/20250116_001_create_users_table.sql
```

### Migração 2: Criar tabela de transações
```sql
-- Cole o conteúdo de: supabase/migrations/20250116_002_create_transactions_table.sql
```

### Migração 3: Criar tabela de conexões Google Sheets
```sql
-- Cole o conteúdo de: supabase/migrations/20250116_003_create_google_sheets_connections_table.sql
```

## Passo 3: Verificar se as Tabelas foram Criadas

No Supabase Dashboard:
1. Vá para **Table Editor**
2. Você deve ver as tabelas:
   - `users`
   - `transactions`
   - `google_sheets_connections`

## Passo 4: Rodar o Sistema

Depois de configurar tudo, volte aqui e diga: "configurei tudo, pode rodar o sistema"

## Estrutura do Banco de Dados

### Tabela: users
- Gerencia usuários do sistema
- Campos: id, username, password, created_at
- RLS habilitado (usuários só veem seus próprios dados)

### Tabela: transactions
- Armazena transações bancárias e contábeis
- Campos: id, date, name, value, status, confidence, source, etc.
- RLS habilitado (usuários só veem suas próprias transações)

### Tabela: google_sheets_connections
- Gerencia conexões com Google Sheets
- Campos: id, api_key, sheet_url, status, etc.
- RLS habilitado (usuários só veem suas próprias conexões)

## Próximos Passos

Após concluir estes passos, o sistema estará pronto para:
- Importar transações de arquivos CSV/OFX/XLSX
- Conectar com Google Sheets
- Realizar conciliação automática entre transações bancárias e contábeis
- Visualizar dashboards e relatórios
