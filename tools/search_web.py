import sys
import argparse
import urllib.parse
from duckduckgo_search import DDGS
import requests
from bs4 import BeautifulSoup

def buscar(query, max_results=5):
    """Realiza a busca no DuckDuckGo de forma gratuita e sem chaves de API."""
    print(f"=== INICIANDO BUSCA: {query} ===")
    try:
        with DDGS() as ddgs:
            # text() retorna um gerador com os resultados da busca
            results = list(ddgs.text(query, max_results=max_results))
            if not results:
                print("Nenhum resultado encontrado para esta busca.")
                return
            
            for i, r in enumerate(results, 1):
                print(f"\n--- Resultado [{i}] ---")
                print(f"Título: {r.get('title')}")
                print(f"Link: {r.get('href')}")
                print(f"Snippet: {r.get('body')}")
    except Exception as e:
        print(f"Erro ao realizar busca no DuckDuckGo: {e}")

def ler_pagina(url):
    """Acessa uma URL, extrai o texto principal e converte para leitura da IA."""
    print(f"=== ACESSANDO URL: {url} ===")
    try:
        # Decodifica a URL caso venha com caracteres especiais
        url_decoded = urllib.parse.unquote(url)
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7'
        }
        
        response = requests.get(url_decoded, headers=headers, timeout=12)
        response.raise_for_status()
        
        # Define encoding correto para evitar problemas com acentuação brasileira
        if response.encoding == 'ISO-8859-1' or response.apparent_encoding:
            response.encoding = response.apparent_encoding
            
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Remove tags inúteis que poluem o contexto da IA
        for element in soup(["script", "style", "header", "footer", "nav", "aside", "form", "iframe"]):
            element.decompose()
            
        # Extrai o texto limpo
        text = soup.get_text()
        
        # Processamento de linhas e espaços
        lines = (line.strip() for line in text.splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        text_clean = '\n'.join(chunk for chunk in chunks if chunk)
        
        if not text_clean:
            print("A página foi acessada, mas nenhum conteúdo de texto relevante foi extraído.")
            return

        # Limita o output para evitar estouro da janela de contexto da IA
        limit = 6000
        if len(text_clean) > limit:
            print(text_clean[:limit])
            print(f"\n[... Conteúdo truncado em {limit} caracteres para economia de tokens ...]")
        else:
            print(text_clean)
            
    except requests.exceptions.HTTPError as e:
        print(f"Erro HTTP ao acessar a página ({response.status_code}): {e}")
    except requests.exceptions.Timeout:
        print("Erro: Tempo limite de conexão esgotado (Timeout) ao tentar acessar o site.")
    except Exception as e:
        print(f"Erro inesperado ao ler o conteúdo da página: {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Ferramenta de Busca e Extração Web Gratuita para Agentes")
    parser.add_argument("--search", type=str, help="Termo de pesquisa no DuckDuckGo")
    parser.add_argument("--fetch", type=str, help="URL do site para ler e extrair texto")
    args = parser.parse_args()

    if args.search:
        buscar(args.search)
    elif args.fetch:
        ler_pagina(args.fetch)
    else:
        parser.print_help()
