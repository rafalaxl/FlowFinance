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
Abra o SQL Editor no seu painel do Supabase e rode em ordem as `migrations` criadas em `supabase/migrations/`:
- `001_create_tenants_profiles.sql` (Ativa os triggers e tabelas base)
- `002_create_accounts_categories.sql`
- `003_create_transactions.sql`

Opcional: para popular com dados fictícios, rode o arquivo `004_seed_demo_data.sql`.

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
