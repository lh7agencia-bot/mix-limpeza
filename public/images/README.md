Pasta reservada para as fotos da Galeria na Vercel
===================================================

Como substituir ou adicionar fotos após publicar na Vercel:

1. Salve suas imagens nesta pasta (`public/images/`), por exemplo:
   - `public/images/foto-01.jpg`
   - `public/images/foto-02.jpg`
   - `public/images/foto-03.jpg`
   - `public/images/foto-04.jpg`

2. Abra o arquivo `src/config/siteContent.ts` e atualize o campo `src` de cada item da galeria para:
   `src: '/images/foto-01.jpg'`

3. Faça o commit e o deploy na Vercel — os arquivos dentro de `public/images/` serão servidos diretamente na URL `/images/...`.
