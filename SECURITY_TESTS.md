# Guia de Testes de Segurança e RLS (Console e Network)

Este guia contém os comandos e procedimentos necessários para testar a segurança e o isolamento de dados (Row Level Security - RLS) diretamente do console do navegador. Use-o para auditar seus aplicativos atuais e futuros.

---

## 🔐 Preparação: Desbloquear o Console do Navegador

Por segurança, navegadores modernos (como o Chrome) bloqueiam colagem de código no console.
1. Abra o painel de desenvolvedor (**F12**).
2. Vá para a aba **Console**.
3. Digite exactamente **`allow pasting`** e pressione **Enter**.

---

## 🧪 Cenário 1: Teste de Acesso Legítimo (Usuário Autenticado)
Valida se um usuário logado consegue ler apenas os seus próprios registros.

### Comando para Rodar no Console:
```javascript
const response = await fetch('<SUA_URL_DO_SUPABASE_AQUI>/rest/v1/<NOME_DA_TABELA_AQUI>?select=*', {
  method: 'GET',
  headers: {
    'apikey': '<SUA_ANON_KEY_PUBLICA_AQUI>',
    'Authorization': 'Bearer <SEU_TOKEN_JWT_DE_LOGIN_AQUI>'
  }
});
console.log('Status da Requisição:', response.status);
console.log('Dados Recebidos:', await response.json());
```

### O que verificar:
* **Na aba Console:**
  * O `Status da Requisição` deve ser **`200`** (Sucesso).
  * O resultado em `Dados Recebidos` deve conter um array contendo **apenas os seus dados** (ex: suas transações, seu perfil).
* **Na aba Network (Rede):**
  * Procure pela requisição que tem o nome da sua tabela.
  * O status dela deve estar verde com código **`200 OK`**.
  * Nos cabeçalhos (Headers), verifique se o token enviado em `Authorization` corresponde exatamente ao token JWT que você copiou.

---

## 🧪 Cenário 2: Teste de Invasão Anônima (Bloqueio RLS)
Simula um hacker tentando acessar os dados usando a chave pública do seu site, mas sem estar logado no sistema.

### Comando para Rodar no Console:
```javascript
const response = await fetch('<SUA_URL_DO_SUPABASE_AQUI>/rest/v1/<NOME_DA_TABELA_AQUI>?select=*', {
  method: 'GET',
  headers: {
    'apikey': '<SUA_ANON_KEY_PUBLICA_AQUI>'
    // Sem o cabeçalho Authorization
  }
});
console.log('Status da Requisição:', response.status);
console.log('Dados Recebidos (Deve vir vazio):', await response.json());
```

### O que verificar:
* **Na aba Console:**
  * O `Status da Requisição` deve ser **`200`** (retorna sucesso técnico) mas os `Dados Recebidos` devem ser um array **totalmente vazio: `[]`** (comprovando que o RLS filtrou e escondeu tudo).
  * *Alternativamente*, em tabelas com bloqueio mais restrito, o status pode vir como **`401`** ou **`403`** (Unauthorized/Forbidden).
  * **O que NÃO pode acontecer:** Não deve vir nenhuma linha de dados contendo nomes, valores, e-mails ou registros.
* **Na aba Network (Rede):**
  * A requisição deve aparecer na lista e o conteúdo da resposta ("Response" ou "Preview") deve estar em branco (`[]`) ou exibir um JSON de erro de autorização.

---

## 🧪 Cenário 3: Teste de Assinatura Inválida (Tokens de Outro Projeto)
Valida se chaves válidas extraídas de outro aplicativo Supabase conseguem ler dados do seu banco.

### Comando para Rodar no Console:
```javascript
const response = await fetch('<SUA_URL_DO_SUPABASE_AQUI>/rest/v1/<NOME_DA_TABELA_AQUI>?select=*', {
  method: 'GET',
  headers: {
    'apikey': '<CHAVE_PUBLICA_DE_OUTRO_PROJETO_AQUI>',
    'Authorization': 'Bearer <TOKEN_JWT_DE_OUTRO_PROJETO_AQUI>'
  }
});
console.log('Status da Requisição:', response.status);
console.log('Resposta do Servidor:', await response.text());
```

### O que verificar:
* **Na aba Console:**
  * O `Status da Requisição` deve retornar **`400`**, **`401`** ou **`403`**.
  * A `Resposta do Servidor` deve acusar falha de assinatura, ex: `{"message": "Invalid API key"}` ou `{"message": "JWTSignatureHashMismatch"}`.
* **Na aba Network (Rede):**
  * A linha da requisição na aba Network deve ficar **vermelha** sinalizando o erro de barramento HTTP de segurança.

---

## 🔍 Como capturar seu Token JWT na prática (Aba Network)

Para realizar o **Cenário 1**, você precisa do seu token de sessão atual:
1. Com o painel F12 aberto, clique na aba **Network (Rede)**.
2. Faça qualquer alteração ou navegação na sua ferramenta para disparar um salvamento ou carregamento de dados.
3. Clique em qualquer requisição que vá para o Supabase (ex: `transactions?select=*` ou `accounts`).
4. Na aba lateral que se abre, clique na seção **Headers** (Cabeçalhos).
5. Desça a página até encontrar a seção **Request Headers** (Cabeçalhos de Requisição).
6. Procure pela chave **`Authorization`**.
7. Copie toda a sequência de caracteres gigantesca que vem logo após a palavra `Bearer `. Esse é o seu JWT ativo!
