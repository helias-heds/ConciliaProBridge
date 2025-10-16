# Configuração do Banco de Dados Supabase

Este documento descreve como configurar e aplicar as migrações do banco de dados no Supabase para o sistema de Conciliação Pro.

## Estrutura do Banco de Dados

O sistema utiliza três tabelas principais:

### 1. Tabela `users`
Armazena informações dos usuários do sistema.
- `id`: Identificador único (UUID)
- `username`: Nome de usuário único
- `password`: Senha hasheada
- `created_at`: Data de criação da conta

### 2. Tabela `transactions`
Armazena todas as transações financeiras (bancárias e contábeis).
- `id`: Identificador único (UUID)
- `date`: Data da transação
- `name`: Descrição da transação
- `value`: Valor da transação
- `status`: Status da reconciliação (pending-ledger, pending-bank, reconciled, etc.)
- `confidence`: Pontuação de confiança na correspondência (0-100)
- `source`: Origem da transação (bank, ledger, manual)
- `matched_transaction_id`: Referência à transação correspondente
- `user_id`: ID do usuário proprietário

### 3. Tabela `google_sheets_connections`
Armazena conexões com Google Sheets para importação automática.
- `id`: Identificador único (UUID)
- `api_key`: Chave de API do Google (criptografada)
- `sheet_url`: URL completa da planilha
- `sheet_id`: ID extraído da planilha
- `status`: Status da conexão (connected, error, disconnected)
- `user_id`: ID do usuário proprietário

## Segurança (Row Level Security)

Todas as tabelas implementam RLS (Row Level Security) para garantir que:
- Usuários só podem acessar seus próprios dados
- Cada operação (SELECT, INSERT, UPDATE, DELETE) tem políticas específicas
- Os dados são isolados por usuário (multi-tenancy)

## Como Aplicar as Migrações

### Opção 1: Usando a Interface do Supabase

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá para "SQL Editor"
4. Execute cada arquivo de migração na ordem:
   - `20250116_001_create_users_table.sql`
   - `20250116_002_create_transactions_table.sql`
   - `20250116_003_create_google_sheets_connections_table.sql`

### Opção 2: Usando Supabase CLI (se disponível)

```bash
# Aplicar todas as migrações
supabase db push

# Ou aplicar migrações individuais
supabase db push --file supabase/migrations/20250116_001_create_users_table.sql
supabase db push --file supabase/migrations/20250116_002_create_transactions_table.sql
supabase db push --file supabase/migrations/20250116_003_create_google_sheets_connections_table.sql
```

### Opção 3: Usando MCP Tools (se disponível no seu ambiente)

As migrações podem ser aplicadas diretamente através de ferramentas MCP do Supabase.

## Variáveis de Ambiente

Certifique-se de que seu arquivo `.env` contém:

```
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
```

## Próximos Passos

Após aplicar as migrações:

1. **Configurar Autenticação**: O sistema usa Supabase Auth para gerenciar usuários
2. **Adaptar o Código**: Atualizar `server/db.ts` para usar o cliente Supabase ao invés do Neon
3. **Testar Conexão**: Verificar se a aplicação consegue conectar ao banco de dados
4. **Importar Dados**: Se houver dados existentes, planeje a migração

## Notas Importantes

- **Senhas**: As senhas devem ser hasheadas usando bcrypt ou similar antes de armazenar
- **API Keys**: As chaves de API do Google Sheets devem ser criptografadas
- **Timestamps**: Todos os timestamps usam `timestamptz` (timezone-aware)
- **Índices**: Foram criados índices para melhorar a performance de consultas comuns
- **Constraints**: Constraints garantem integridade dos dados (ex: confidence entre 0-100)

## Troubleshooting

### Erro ao criar tabelas
Se receber erro de tabela já existente, as migrações usam `IF NOT EXISTS` e podem ser executadas múltiplas vezes com segurança.

### Erro de permissões
Certifique-se de estar usando um usuário com permissões adequadas no Supabase.

### RLS bloqueando acesso
Verifique se o usuário está autenticado corretamente e se `auth.uid()` retorna o ID correto.
