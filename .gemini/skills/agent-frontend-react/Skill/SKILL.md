---
name: dashboard-design-rules
description: Regras de design visual e UX para dashboards, incluindo posições de componentes, formatação numérica de moedas (Real/BRL), gráficos essenciais e filtros de período.
allowed-tools: []
---

# Dashboard Design Rules

## When to Use
- Exclusivo do `agent-frontend-react` ao criar, ajustar ou otimizar interfaces de dashboard, Stat Cards, gráficos e filtros de dados.

## Guidelines

### 1. Posicionamento e Layout (Grid de 12 Colunas)
- **Estrutura de Tela**: Use um layout limpo de 12 colunas com espaçamento (gap) baseado no baseline de 8px (ex: `gap-4` para 16px, `gap-6` para 24px).
- **Hierarquia Visual (Padrão F/Z)**:
  - **Topo Esquerdo**: Logo do sistema e navegação principal (ou sidebar no canto esquerdo).
  - **Topo Central/Direito**: Cabeçalho de contexto e Date Range Picker (filtro de período).
  - **Primeira Dobra (Acima do Fold)**: Metric Grid contendo de 3 a 4 Stat Cards (KPIs) cruciais.
  - **Centro**: Painel de análise principal com os gráficos essenciais.
  - **Parte Inferior**: Tabelas densas de dados (Data Grids) com paginação e busca contextual.
  - **Limites de Viewport para Diálogos**: Ao renderizar tabelas ou dados complexos dentro de modais, defina breakpoints de largura e altura máxima (ex: `max-w-6xl max-h-[85vh]` do Tailwind) com rolagem interna apenas no container do grid (`overflow-y-auto`), evitando barras de rolagem duplas na tela principal.

### 2. Lógica e Formatação de Números
- **Exibição Inteligente**:
  - Abrevie valores altos para evitar sobrecarga visual: `1.000` -> `1K`, `1.000.000` -> `1M`, `1.000.000.000` -> `1B`.
  - Use `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })` para formatar valores em Real (ex: `R$ 1.500,50`).
  - Omitir centavos em valores inteiros muito grandes (ex: `R$ 1.2M` em vez de `R$ 1.200.000,00`), a menos que seja um extrato de conciliação detalhado.
- **Lógica Interna (Cálculos e Estado)**:
  - NUNCA envie ou salve strings formatadas (como `"R$ 100,00"`) para cálculos, variáveis de estado ou payloads de requisição. O estado deve armazenar números puros (floats limpos ou inteiros em centavos).
  - Use regex para limpar entradas antes de calcular: `val.replace(/[R$\s]/g, '').replace(/\./g, '').replace(/,/g, '.')`.
- **Integridade Matemática e Performance (Web/Database)**:
  - **Prevenção de NaN**: Sempre utilize operadores de fallback (`|| 0` ou `?? 0`) ao capturar dados do backend/API no React para evitar que a interface quebre.
  - **Agregações no Backend**: Para grandes volumes de dados, exija que a API entregue dados pré-agregados (calculados pelo banco de dados via SQL/Supabase). Evite realizar cálculos pesados de array (como `.reduce()` ou `.map()` repetitivos) no client-side.

### 3. Os 3 Gráficos Essenciais
- **A. Gráfico de Linha/Área (Tendências)**:
  - Use para mostrar a evolução temporal de uma métrica (ex: faturamento ao longo dos meses).
  - Use preenchimento translúcido sob a linha (gráfico de área) para dar peso visual.
  - Adicione linhas tracejadas (dashed lines) para indicar comparações com o período anterior.
- **B. Gráfico de Barra (Comparação)**:
  - Use para comparar categorias discretas (ex: vendas por categoria de produto).
  - **Regra Inviolável**: O eixo Y deve iniciar estritamente em **zero** para evitar distorções de magnitude.
  - Use barras verticais para poucas categorias (até 8) e barras horizontais para categorias com nomes longos.
- **C. Gráfico Donut (Proporções)**:
  - Use para mostrar a composição de partes de um todo (ex: faturamento por método de pagamento).
  - Limite rigorosamente a **no máximo 5 categorias/fatias** para manter a legibilidade.
  - Use o formato Donut (cutout de 70%) em vez de Pizza preenchido. Se possível, posicione um resumo de KPI centralizado no interior do círculo.

### 4. Filtro por Período (Date Range Picker)
- **Presets na Tela Inicial**: Ofereça botões rápidos para presets comuns: Hoje, Ontem, Últimos 7 dias, Últimos 30 dias, Este mês, Mês passado.
- **Navegabilidade**: Sincronize o período selecionado com a URL usando query parameters (ex: `?de=2026-06-01&ate=2026-06-30`). Isso permite que o usuário compartilhe o link ou use o botão de voltar do navegador preservando a visão.
- **Fusos Horários**: Processe e armazene as datas em UTC no banco, e converta para o fuso local do navegador na renderização da tela.
