# Memory Piece — Jogo da Memória

Jogo da memória com HTML, CSS e JavaScript, com backend local em Node.js e banco SQLite para contas e recordes.

## Testar localmente (backend + SQLite)

**Requisito:** Node.js 18 ou superior.

1. Instale o Node.js: https://nodejs.org/
2. Baixe o repositório pelo botão Code → Download ZIP no GitHub e extraia.
3. Abra a pasta do projeto no terminal (PowerShell, CMD ou terminal do VS Code).
4. Execute:

~~~bash
npm install
npm run dev
~~~

5. Abra http://127.0.0.1:3000 no navegador.

O primeiro comando instala a dependência SQLite. O segundo inicia o site e a API local. O banco é criado automaticamente em data/memory-piece.sqlite.

Para parar o servidor, volte ao terminal e pressione Ctrl + C.

## Contas e recordes

- Cadastro com nome de jogador, e-mail e senha.
- Senhas protegidas com scrypt (não são armazenadas em texto puro).
- Sessão de login em cookie HttpOnly.
- Recordes pessoais por dificuldade (East Blue, Grand Line e Novo Mundo).
- O recorde prioriza menor tempo; em empate, menor número de tentativas.
- Os dados ficam no arquivo SQLite local e continuam salvos após fechar o servidor.

**Importante:** esta primeira versão é para desenvolvimento local. O SQLite fica na sua máquina e não sincroniza com o site público da Cloudflare. Para publicar contas online depois, migraremos a API para Cloudflare Pages Functions/Workers e o banco para Cloudflare D1. Não coloque o arquivo data/memory-piece.sqlite no GitHub.

## Outros comandos

- npm run build: prepara os arquivos estáticos em dist/.
- npm run dev:pages: abre a prévia estática com Wrangler (não inicia a API SQLite).
- npm start: inicia o mesmo servidor local usado em npm run dev.

## Arquivos

- index.html: interface do jogo e telas de autenticação.
- style.css: visual e responsividade.
- script.js: jogo, chamadas da API e interface de conta.
- server.js: backend local, autenticação, sessões e endpoints de recordes.
- data/memory-piece.sqlite: banco criado automaticamente na primeira execução.