# Marmitaria Nosso Sabor — site

Site da marmitaria com cardápio, sacola e pedido enviado direto para o WhatsApp da casa.
Destaque: uma marmitex 3D (Three.js) com feijoada light que abre ao carregar a página,
com a tampa trazendo o logo da marmitaria.

Projeto independente (fora dos workspaces do monorepo).

## Rodar

```bash
cd marmitaria-nosso-sabor
npm install
npm run dev            # http://localhost:5173
npm run build          # site estático em dist/
npm run build:single   # o site inteiro em um único arquivo: dist-single/nosso-sabor.html
```

## Editar dados e cardápio

Tudo fica em **`src/data.ts`**:

- nome, endereço, telefone/WhatsApp, e-mail e horário (já preenchidos com os dados do cardápio atual);
- categorias, pratos, descrições, tamanhos e preços;
- fotos dos pratos: coloque o arquivo em `src/assets/` e importe no topo de `data.ts`.

### A confirmar antes de publicar (marcados com `// EDITAR`)

- **Dias de funcionamento** — o selo "Aberto agora / Fechado" usa segunda a sábado por padrão.
- **Cidade/bairro** — deixa o link "abrir no mapa" exato.
- **Preços do Frango à parmegiana M e G** — aparecem como "a confirmar".
- **Pratos das categorias Executiva, Saladas, Bebidas e Doces** — enquanto vazias, o site
  convida o cliente a perguntar o cardápio do dia no WhatsApp.
- **Instagram e Facebook** — os links só aparecem quando preenchidos.

As fotos e o logo foram recortados do cardápio digital atual. Para mais nitidez, troque pelos
arquivos originais em alta resolução (mesmos nomes em `src/assets/`).

## Como funciona o pedido

1. O cliente escolhe prato e tamanho e adiciona à sacola (salva no navegador).
2. Na sacola escolhe Delivery ou Para retirar, informa nome e endereço.
3. "Enviar pedido pelo WhatsApp" abre a conversa com (19) 99892-7863 com a mensagem pronta:
   itens, tamanhos, total dos itens, forma de entrega, nome e endereço.
   Taxa de entrega e valor final são confirmados pela casa no WhatsApp.

## Desempenho e acessibilidade

- O 3D é baixado depois da primeira pintura, com qualidade menor em celulares, pausa fora da tela
  e reduz a resolução sozinho se o aparelho estiver lento. Sem WebGL, mostra as fotos dos pratos.
- `prefers-reduced-motion`: sem animações de entrada, sem rolagem suave, tampa já aberta.
- Sacola com foco preso, fecha com Esc; abas do cardápio navegáveis por setas.
