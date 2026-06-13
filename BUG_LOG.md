# Diário de Bordo: Registro de Bugs e Resoluções (FlowFinance)

Este documento registra os principais desafios técnicos encontrados durante a integração do frontend com o Supabase e as políticas de segurança a nível de linha (RLS), como foram resolvidos e quais práticas seguir para evitar que ocorram em futuros projetos SaaS Multi-tenant.

---

## 🐛 Bug 1: Sintaxe Inválida de UUID para String Vazia (`""`)

### Sintomas
Ao tentar salvar uma transação para um novo usuário que acabou de se registrar, o modal continuava aberto e o console exibia o erro:
`Erro ao criar conta: invalid input syntax for type uuid: ""`

### Causa Raiz
* **Frontend**: O hook `useAuth` inicializava o `tenant_id` como uma string vazia `""` na ausência de metadados de sessão no login.
* **Banco de Dados**: As colunas `tenant_id` das tabelas (como `accounts`) esperavam um formato UUID válido. O PostgreSQL não converte uma string vazia `""` em um UUID nulo, gerando um erro de sintaxe imediato.

### Como foi Resolvido
1. **Tratamento no Frontend**: No arquivo `TransactionForm.tsx`, modificamos a montagem do payload para omitir as chaves `tenant_id` e `user_id` caso fossem strings vazias (`""`).
2. **Definição de DEFAULT no Banco de Dados**: Criamos uma migração (`006_alter_accounts_tenant_default.sql`) adicionando um valor padrão para a coluna `tenant_id` usando a função de segurança:
   ```sql
   ALTER TABLE public.accounts ALTER COLUMN tenant_id SET DEFAULT public.auth_tenant_id();
   ```
   Desta forma, se o frontend não envia o campo, o banco de dados cuida de preenchê-lo automaticamente com base na sessão ativa.

---

## 🐛 Bug 2: Recursão Infinita nas Políticas de RLS da Tabela `profiles`

### Sintomas
Após ajustar o payload do frontend, a aplicação parou de responder a consultas na tabela `profiles` e o console exibia o erro:
`infinite recursion detected in policy for relation "profiles"`

### Causa Raiz
A política antiga de seleção (`SELECT`) na tabela `profiles` continha a seguinte condição:
```sql
CREATE POLICY "profiles_select_same_tenant" ON public.profiles
    FOR SELECT USING (
        tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
    );
```
Para verificar se o usuário podia ler a tabela `profiles`, o banco precisava executar o subquery `SELECT tenant_id FROM public.profiles`. Como essa subconsulta lia a mesma tabela `profiles`, o banco tentava aplicar a mesma política de RLS novamente, criando um loop infinito de verificações.

### Como foi Resolvido
1. Criamos funções com a propriedade `SECURITY DEFINER` (que rodam com privilégios de administrador do banco, contornando a checagem recursiva de RLS apenas dentro da função):
   ```sql
   CREATE OR REPLACE FUNCTION public.auth_tenant_id()
   RETURNS uuid LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
   DECLARE
       v_tenant_id uuid;
   BEGIN
       SELECT tenant_id INTO v_tenant_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
       RETURN v_tenant_id;
   END;
   $$;
   ```
2. Atualizamos as políticas de RLS da tabela `profiles` para usar essa função diretamente, eliminando subconsultas recursivas:
   ```sql
   CREATE POLICY "profiles_select_same_tenant" ON public.profiles
       FOR SELECT USING (tenant_id = public.auth_tenant_id());
   ```

---

## 🐛 Bug 3: Violação de RLS em `transactions` (`new row violates row-level security policy`)

### Sintomas
Ao salvar uma transação, o console do navegador reportava:
`new row violates row-level security policy for table "transactions"`

### Causa Raiz
No PostgreSQL, regras de segurança RLS com a cláusula `WITH CHECK` (usadas em `INSERT`) são validadas **antes** de restrições de obrigatoriedade (`NOT NULL`).
Como omitimos o `tenant_id` no frontend e a tabela `transactions` no banco de dados da nuvem ainda não possuía a configuração de valor padrão (`DEFAULT`), a coluna recebeu `NULL`. A regra de RLS comparou:
`NULL = public.auth_tenant_id()` (falso).
Por isso, a inserção foi negada como violação de segurança antes mesmo do banco acusar que o campo não podia ser nulo.

### Como foi Resolvido
Criamos a migração `008_alter_transactions_categories_tenant_default.sql` aplicando o valor padrão às tabelas restantes:
```sql
ALTER TABLE public.transactions ALTER COLUMN tenant_id SET DEFAULT public.auth_tenant_id();
ALTER TABLE public.categories ALTER COLUMN tenant_id SET DEFAULT public.auth_tenant_id();
```

---

## 💡 Diretrizes para Futuros Projetos SaaS Multi-tenant

Para evitar dores de cabeça e economizar dias de depuração nos seus próximos sistemas, siga este guia rápido:

1. **Nunca envie IDs vazios do Frontend**: Se um campo de identificação (UUID) for opcional ou puder ser resolvido pelo banco, remova-o do objeto de payload (`delete payload.tenant_id` ou faça condicionais `if (id) payload.id = id`).
2. **Defina defaults robustos no Banco**: Sempre configure as colunas de controle (`tenant_id`, `user_id`) com valores padrão derivados de funções do sistema (ex: `DEFAULT auth.uid()` ou `DEFAULT public.auth_tenant_id()`). Isso simplifica o código do frontend.
3. **Cuidado com Subconsultas no RLS**: Se você estiver criando uma regra de segurança para a **Tabela A**, evite fazer `SELECT` na própria **Tabela A** dentro da condição. Se precisar fazer isso, encapsule a busca dentro de uma função `SECURITY DEFINER`.
4. **Tratamento de Erros Visível**: Garanta que o frontend exiba o erro real vindo do banco de dados na tela do modal em desenvolvimento (como fizemos adicionando o estado `errorMsg` no formulário). Falhas silenciosas consomem muito tempo para depurar.
