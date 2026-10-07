# Guia de Execução de Migrations — Supabase Studio

Este guia fornece a ordem estrita e os procedimentos para aplicar as migrações de banco de dados e correções de segurança no **FlowFinance SaaS**.

---

## 📋 Ordem de Execução no SQL Editor

Acesse o painel do **Supabase Studio** > **SQL Editor** e execute os arquivos na ordem indicada abaixo.

### Cenário A: Novo Ambiente do Zero (Setup Completo)
Execute as migrações sequencialmente:
1. `supabase/migrations/001_create_tenants_profiles.sql`
2. `supabase/migrations/002_create_accounts_categories.sql`
3. `supabase/migrations/003_create_transactions.sql`
4. `supabase/migrations/004_seed_demo_data.sql` *(NO-OP seguro)*
5. `supabase/migrations/005_fix_missing_profiles.sql`
6. `supabase/migrations/006_alter_accounts_tenant_default.sql`
7. `supabase/migrations/007_fix_profiles_rls_recursion.sql`
8. `supabase/migrations/008_alter_transactions_categories_tenant_default.sql`
9. `supabase/migrations/009_fix_account_balances_view.sql`
10. `supabase/migrations/010_secure_account_balances_view.sql` *(BUG-01)*
11. `supabase/migrations/011_lock_profile_privileged_columns.sql` *(BUG-02)*
12. `supabase/migrations/012_harden_handle_new_user.sql` *(BUG-03)*
13. `supabase/migrations/013_transactions_fk_tenant_check.sql` *(BUG-04)*
14. `supabase/migrations/014_definer_search_path.sql` *(BUG-06)*

---

### Cenário B: Atualização de Segurança em Banco Existente (Patch 010 a 014)
Se o banco já possui as migrations 001 a 009 aplicadas, execute apenas o lote de segurança:

1. **`010_secure_account_balances_view.sql`**
   - Ativa `security_invoker = true` na view `v_account_balances` e restringe leitura para `authenticated`.
2. **`011_lock_profile_privileged_columns.sql`**
   - Bloqueia alteração indevida de `tenant_id` e `role` em `profiles` e cria a RPC `change_member_role`.
3. **`012_harden_handle_new_user.sql`**
   - Blinda o trigger de signup contra injeção de metadata maliciosa.
4. **`013_transactions_fk_tenant_check.sql`**
   - Força validação de tenant cruzado em `account_id` e `category_id` e atualiza trigger de saldo.
5. **`014_definer_search_path.sql`**
   - Aplica `search_path = public, pg_temp` em todas as funções `SECURITY DEFINER`.

---

## 🧹 Limpeza de Dados de Teste / Produção (Opcional)

Se você já executou testes com dados falsos ou seed da Acme Corp e deseja limpar o ambiente de produção:
- Execute o script: **`supabase/scripts/cleanup_production.sql`**
- *Atenção:* Este script remove contas `@acme.dev` e zera lançamentos de contas de teste mantendo os usuários intactos.

---

## 🧪 Verificação Pós-Aplicação

Após aplicar as migrações, execute o script de diagnóstico:
- **`supabase/tests/verify_security.sql`**

Verifique os resultados na aba de saída do Supabase Studio:
- `v_account_balances`: Deve exibir `✅ ATIVO (security_invoker)`.
- `profiles` / `tenants`: Apenas colunas permitidas listadas com privilégio `UPDATE`.
- `pg_tables`: Todas as tabelas públicas devem constar com `rowsecurity = true`.
- Funções SECURITY DEFINER: Devem exibir `✅ SEGURO` com `search_path=public, pg_temp`.

---

## ⚠️ Ambiente de Desenvolvimento Local (Seed)
Caso esteja em ambiente de desenvolvimento local e deseje carregar dados fictícios para testes:
- Execute: **`supabase/seed.dev.sql`**
- **NUNCA EXECUTE ESTE ARQUIVO EM PRODUÇÃO!**
