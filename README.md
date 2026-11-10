# Memory Piece — Jogo da Memória

Jogo da memória com tema oceano, feito com HTML, CSS e JavaScript puro. Não precisa instalar dependências.

## Como jogar localmente

1. Baixe o repositório pelo botão **Code → Download ZIP** no GitHub e extraia o arquivo.
2. Abra a pasta extraída.
3. Dê dois cliques em `index.html` para abrir o jogo no navegador.

Também é possível abrir a pasta no VS Code e usar a extensão **Live Server**, clicando em **Go Live**.

## Recursos

- Três dificuldades: 6, 8 ou 12 pares.
- Cronômetro, contador de tentativas e barra de progresso.
- Recorde salvo no próprio navegador, separado por dificuldade.
- Efeitos sonoros com controle de ligar/desligar.
- Layout responsivo para computador e celular.
- Não usa bibliotecas ou serviços externos para funcionar (a fonte personalizada pode usar internet).

## Arquivos

- `index.html`: estrutura do jogo.
- `style.css`: visual, animações e adaptação para telas menores.
- `script.js`: cartas, regras, cronômetro, sons e recordes.

## Publicar na Cloudflare Pages

Este projeto é um site estático (HTML, CSS e JavaScript), sem framework ou dependências externas de build. O repositório inclui um script que prepara os arquivos para publicação.

No painel da Cloudflare Pages, em **Settings → Builds & deployments → Build configurations**, configure:

- **Framework preset:** None
- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Root directory:** `/` (raiz do repositório)

Salve e execute **Retry deployment**. O script `build.mjs` copia o HTML, CSS, JavaScript e a pasta `assets` para `dist/`.
