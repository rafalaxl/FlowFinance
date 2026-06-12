/**
 * SeoHead — Componente de metadados dinâmicos por página
 *
 * Injeta <title> e <meta name="description"> via document APIs.
 * Para SPAs com Vite, não há SSR, então usamos document.title diretamente.
 * Se futuramente migrar para SSR (Remix/Next), trocar por react-helmet-async.
 *
 * Uso:
 *   <SeoHead
 *     title="Dashboard | FlowFinance"
 *     description="Acompanhe saldo, burn rate e EBITDA em tempo real."
 *   />
 */

import { useEffect } from 'react';

// ─── Constantes de identidade da marca ──────────────────────────────────────
const SITE_NAME = 'FlowFinance';
const BASE_URL = 'https://app.flowfinance.com.br';
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.png`;

// ─── Tipos ───────────────────────────────────────────────────────────────────
interface SeoHeadProps {
  /** Título da página. Máx 60 chars. Sufixo " | FlowFinance" é adicionado automaticamente. */
  title: string;
  /** Descrição da página. Entre 140–150 chars para melhor exibição no Google. */
  description: string;
  /** URL canônica da página. Padrão: BASE_URL. */
  canonical?: string;
  /** Caminho da imagem OG específica da página. Padrão: og-image.png global. */
  ogImage?: string;
  /** Impede indexação da página (ex: páginas de erro ou auth). */
  noIndex?: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function setMetaTag(name: string, content: string, property = false): void {
  const attr = property ? 'property' : 'name';
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setLinkTag(rel: string, href: string): void {
  let el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

// ─── Componente ──────────────────────────────────────────────────────────────
export function SeoHead({
  title,
  description,
  canonical,
  ogImage = DEFAULT_OG_IMAGE,
  noIndex = false,
}: SeoHeadProps): null {
  const fullTitle = `${title} | ${SITE_NAME}`;
  const canonicalUrl = canonical ?? BASE_URL;

  useEffect(() => {
    // Título
    document.title = fullTitle;

    // Meta primários
    setMetaTag('description', description);
    setMetaTag('robots', noIndex ? 'noindex, nofollow' : 'index, follow');

    // Canonical
    setLinkTag('canonical', canonicalUrl);

    // Open Graph
    setMetaTag('og:title', fullTitle, true);
    setMetaTag('og:description', description, true);
    setMetaTag('og:url', canonicalUrl, true);
    setMetaTag('og:image', ogImage, true);
    setMetaTag('og:site_name', SITE_NAME, true);
    setMetaTag('og:type', 'website', true);

    // Twitter Card
    setMetaTag('twitter:title', fullTitle);
    setMetaTag('twitter:description', description);
    setMetaTag('twitter:image', ogImage);
    setMetaTag('twitter:card', 'summary_large_image');
  }, [fullTitle, description, canonicalUrl, ogImage, noIndex]);

  // Componente headless — não renderiza nada no DOM do body
  return null;
}

// ─── Configurações pré-definidas por rota ────────────────────────────────────
export const PAGE_SEO = {
  login: {
    title: 'Entrar',
    description:
      'Acesse o FlowFinance e monitore fluxo de caixa, burn rate e EBITDA da sua empresa em tempo real.',
    canonical: `${BASE_URL}/login`,
  },
  dashboard: {
    title: 'Dashboard',
    description:
      'Visão consolidada de caixa, burn rate mensal, runway estimado e EBITDA projetado para sua empresa.',
    canonical: `${BASE_URL}/dashboard`,
    noIndex: true, // Rota privada — não indexar
  },
  transactions: {
    title: 'Transações',
    description:
      'Gerencie e concilie lançamentos financeiros. Filtre por período, categoria e status de conciliação.',
    canonical: `${BASE_URL}/transactions`,
    noIndex: true, // Rota privada — não indexar
  },
} as const satisfies Record<string, SeoHeadProps>;
