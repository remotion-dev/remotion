# NEXORA Digital — site institucional

Site premium da NEXORA Digital: direção de arte editorial, animações cinematográficas
(GSAP + ScrollTrigger), interações com o cursor e uma peça 3D interativa (Three.js) no hero.

Projeto independente — fica fora dos workspaces do monorepo e tem seu próprio `package.json`.

## Rodar

```bash
cd nexora-site
npm install
npm run dev        # desenvolvimento em http://localhost:5173
npm run build      # typecheck + build de produção em dist/
npm run preview    # serve o build
```

O `dist/` é estático (caminhos relativos) e pode ser publicado em qualquer hospedagem
(Vercel, Netlify, Cloudflare Pages, S3…).

## Antes de publicar — dados provisórios

Tudo que é informação do negócio fica em **`src/config.ts`**. Os campos com
`placeholder: true` aparecem no site com o selo **EDITAR** e são listados no console:

- e-mail, WhatsApp e cidade;
- Instagram e LinkedIn;
- frase de disponibilidade do hero;
- `formEndpoint`: URL que recebe o formulário via `POST` (JSON). Sem ela, o formulário
  abre o aplicativo de e-mail do visitante com a mensagem pronta para o e-mail configurado.

A seção **Laboratório** mostra estudos conceituais do próprio estúdio, identificados como
"Conceito" e "Não representam clientes reais". Substitua por cases reais quando houver
(conteúdo em `index.html`, arte em `src/modules/art.ts`).

## Estrutura

```
index.html                 marcação semântica de todas as seções
src/config.ts              dados editáveis do negócio
src/main.ts                inicialização e carregamento sob demanda da cena 3D
src/scene/armillary.ts     esfera armilar (Three.js, shader de ruído, PBR)
src/modules/motion.ts      abertura, revelações, manifesto, rolagem horizontal, faixa, processo
src/modules/interactions.ts cursor, botões magnéticos, inclinação 3D dos cards
src/modules/navigation.ts  rolagem suave (Lenis), barra, menu mobile, âncoras
src/modules/contact.ts     dados do config + formulário com validação
src/modules/art.ts         ilustrações vetoriais geradas em código
src/styles/                tokens, componentes e seções
```

## Desempenho e acessibilidade

- O Three.js (~140 kB gzip) só é baixado depois da primeira pintura (`requestIdleCallback`).
- A qualidade da cena varia por dispositivo (geometria, antialias, partículas, densidade de pixels)
  e cai sozinha se os primeiros quadros forem lentos. A renderização pausa fora da tela e com a aba oculta.
- Sem WebGL, fica uma ilustração SVG estática no lugar da cena.
- Com `prefers-reduced-motion`: sem abertura, sem rolagem suave, sem rolagem horizontal fixada,
  sem cursor personalizado e cena 3D estática.
- Em telas touch: cursor nativo, sem efeito magnético nem inclinação. O menu mobile é em tela cheia
  com foco gerenciado e fecha com Esc.
- Fontes auto-hospedadas (Fontsource): Instrument Serif, Geist e Geist Mono.
