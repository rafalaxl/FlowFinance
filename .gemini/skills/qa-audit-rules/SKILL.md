---
name: qa-audit-rules
description: Regras e critérios de auditoria para validar a qualidade, segurança OWASP, acessibilidade WCAG 2.1 AA, responsividade de layout e barreira de testes em Dashboards, Landing Pages e Sites Institucionais.
allowed-tools: []
---

# QA Audit Rules

## When to Use
- Exclusivo do `agent-qa-auditor` ao realizar auditorias completas de código, interface ou usabilidade no repositório de frontend.

## Guidelines

### 1. Segurança e Integridade (OWASP & Vibe Coding)
- **IDOR / Controle de Acesso**:
  - Para dashboards e endpoints de dados: Garanta que todas as buscas/ações validem se o usuário logado é de fato o proprietário do recurso (ex: `userId === req.user.id`). Bloqueie buscas cegas por IDs numéricos ou UUIDs que venham da URL sem validação de autoria.
- **Tratamento de Segredos (Secrets)**:
  - NUNCA permita chaves privadas de API (`STRIPE_SECRET`, `SUPABASE_KEY`, credenciais de banco) declaradas diretamente no código (hardcoded). Elas devem residir estritamente em variáveis de ambiente (`process.env` ou `import.meta.env`) e o arquivo `.env` deve estar explicitamente listado no `.gitignore`.
- **Row Level Security (RLS)**:
  - Para projetos usando Supabase, toda e qualquer nova tabela criada deve conter comandos SQL habilitando RLS (`ALTER TABLE table_name ENABLE ROW LEVEL SECURITY`) e definindo políticas específicas de propriedade.
- **Sanitização contra Injeções (SQL/NoSQL) e XSS**:
  - Certifique-se de que não há concatenação direta de strings em queries de banco de dados. Use consultas parametrizadas ou ORMs consolidados.
  - Para templates de frontend (React/Astro), bloqueie o uso de injeção de HTML cru (como `dangerouslySetInnerHTML`) sem o uso de sanitizadores adequados (ex: `DOMPurify`).
  - Formulários de contato de Landing Pages e Sites Institucionais devem utilizar validação de tipos de dados (ex: com `Zod` ou regex robusto) tanto no frontend quanto no backend, prevenindo ataques de buffer overflow e inputs de scripts maliciosos.

### 2. Qualidade de Código & Limites Estritos
- **Limite de Linhas (150 linhas)**:
  - Qualquer arquivo de frontend (componente React, página Astro, script TypeScript) não pode ultrapassar o limite absoluto de **150 linhas**. Caso exceda, reporte como bloqueio e exija a quebra em arquivos e subcomponentes dedicados.
- **Proibição de Placeholders**:
  - NUNCA aprove códigos em produção que contenham placeholders como `lorem ipsum`, caminhos de imagens cinzas temporárias (`placeholder.com`) ou textos fictícios de preenchimento.
  - Links em botões ou navegações nunca devem estar vazios (`href="#"` ou `href=""`). Eles devem direcionar para âncoras funcionais da página, páginas internas reais ou para o link final configurado (como WhatsApp sanitizado).
- **Console Limpo**:
  - Certifique-se de que a interface não dispare mensagens de `Warning` ou `Error` no console de desenvolvedor durante a inicialização ou iterações comuns da página.

### 3. Acessibilidade (WCAG 2.1 AA)
- **Razão de Contraste**:
  - Garanta que todos os textos normais do site (incluindo rodapés, descrições menores e termos de uso) tenham um contraste de cor de pelo menos **4.5:1** contra o fundo. Textos em tamanho grande (títulos de Hero ou seções principais) exigem contraste de pelo menos **3:1**.
- **Navegabilidade por Teclado e Foco**:
  - Botões de chamada para ação (CTAs), menus móveis e caixas de diálogo (modais) devem ser navegáveis via teclado usando a tecla `Tab`. O outline de foco deve ser visível e com alto contraste (`:focus-visible` do Tailwind ou CSS customizado).
  - Modais abertos devem criar uma barreira de foco (Focus Trap), impedindo que o usuário navegue por elementos que estão escondidos atrás do modal.

### 4. Responsividade (Mobile Viewport Gate)
- **Breakpoints e Overflow**:
  - Toda a tela do projeto (Dashboard, Landing Page ou Site Institucional) deve estar 100% livre de barra de rolagem horizontal em viewports a partir de **320px** (tamanho padrão de smartphones pequenos como o iPhone SE).
  - Componentes densos (como tabelas ou grids de cards) devem ocultar colunas secundárias ou se transformar em cards com quebras de linha automáticas no mobile.

### 5. Barreira de Testes (Vitest & Playwright)
- **Testes Unitários & Integração (Vitest / Testing Library)**:
  - Exija cobertura de testes unitários para funções matemáticas críticas, sanitizações e manipuladores de estado.
  - Testes de integração devem verificar se os componentes de dados mudam de comportamento ou de cor baseados em parâmetros do sistema (ex: alarmes, metas financeiras ou erros de API).
- **Testes End-to-End (E2E) (Playwright)**:
  - Landing Pages e Sites Institucionais devem conter testes E2E básicos simulando o fluxo de preenchimento e envio de formulários de contato ou cliques em botões de conversão.
  - Dashboards devem cobrir os fluxos de aplicação de filtros de data (se a rede dispara as queries corretas de data) e exportação de relatórios (se o download do PDF/CSV é disparado).
