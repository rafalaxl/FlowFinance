# 🟢 FlowFinance SaaS Dashboard MVP

O FlowFinance é um **SaaS de gestão financeira e controle de fluxo de caixa** construído com foco em eficiência, segurança multi-tenant e design de alta densidade para tomadores de decisão (CFOs/CEOs).

## 🚀 Arquitetura Técnica
Este MVP foi orquestrado e entregue com a seguinte stack tecnológica:
- **Frontend:** React 18, Vite (TypeScript)
- **Design & UI:** Tailwind CSS, Radix UI, Estética Swiss/Minimal × Neo-Corporate
- **Estado (Server/UI):** TanStack Query v5 + Zustand
- **Visualização de Dados:** Recharts (Gráficos fluidos responsivos)
- **Backend / Database:** Supabase (PostgreSQL) com isolamento estrito via RLS (Row Level Security)
- **Deploy:** Vercel

## 🎯 KPIs de Negócio
O Dashboard central oferece resposta imediata a métricas vitais para o negócio:
1. **Caixa Disponível** (Saldo consolidado em tempo real)
2. **Burn Rate Mensal & Runway** (Estimativa em meses baseada nas despesas correntes)
3. **Previsão de Receita** (EBITDA Projetado)
4. **Contas a Pagar/Receber** da semana corrente

## 🛠️ Como rodar o projeto localmente

### 1. Requisitos Prévios
- Node.js versão 18+ instalado
- Conta no [Supabase](https://supabase.com/) e projeto criado

### 2. Configurando o Banco de Dados (Supabase)
Abra o SQL Editor no seu painel do Supabase e siga a ordem descrita detalhadamente em [`supabase/APPLY_ORDER.md`](supabase/APPLY_ORDER.md).

As migrações cobrem desde o scaffold inicial até o hardening de segurança (RLS & views):
- `001_create_tenants_profiles.sql` a `009_fix_account_balances_view.sql` (Estrutura base e correções)
- `010_secure_account_balances_view.sql` (Isolamento com `security_invoker = true`)
- `011_lock_profile_privileged_columns.sql` (Bloqueio de colunas privilegiadas e RPC de roles)
- `012_harden_handle_new_user.sql` (Proteção contra injeção de metadata no signup)
- `013_transactions_fk_tenant_check.sql` (Validação estrita de chaves de tenant em transações)
- `014_definer_search_path.sql` (Blindagem de `search_path` em funções SECURITY DEFINER)

Para validar a segurança das políticas e views, execute [`supabase/tests/verify_security.sql`](supabase/tests/verify_security.sql).
Para dados fictícios em ambiente local de teste, utilize [`supabase/seed.dev.sql`](supabase/seed.dev.sql) (*nunca execute em produção*).

### 3. Setup do Frontend
Na raiz do projeto, renomeie `.env.example` para `.env.local` e preencha as credenciais:
```bash
VITE_SUPABASE_URL=sua_url_do_projeto
VITE_SUPABASE_ANON_KEY=sua_chave_anon_publica
```

Execute os comandos:
```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

## 🔐 Segurança Inegociável
Nenhum dado é público. O acesso e CRUD do sistema são totalmente isolados via **RLS (Row Level Security)**, atrelado ao `tenant_id` de cada empresa. Cada conta possui acesso unicamente ao seu plano, e todas as requisições respeitam a política validada nativamente no banco Postgres.

## 🚢 Deploy
Para instruções completas sobre o apontamento DNS para `app.flowfinance.com.br` e setup contínuo (CI/CD) na Vercel, consulte o arquivo `DEPLOY_INSTRUCTIONS.md` gerado pela equipe de DevOps.

---

*Criado pela frota de agentes sob supervisão do Antigravity.*
