import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import http from 'http';
import sharp from 'sharp';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'bozze-proxy-middleware',
      configureServer(server) {
        server.middlewares.use('/bozze-proxy', (req, res) => {
          // Utilizzo di URL per estrarre pathname e parametri query (?slice=top / ?slice=rest)
          const requestUrl = new URL(req.url || '', 'http://localhost');
          const parts = requestUrl.pathname.split('/').filter(Boolean);
          const siteParam = parts[0];
          const restPath = parts.slice(1).join('/');
          const sliceParam = requestUrl.searchParams.get('slice');

          if (!siteParam) {
            res.statusCode = 400;
            res.end('Parametro sito mancante');
            return;
          }

          // Ricostruzione URL sorgente (mantiene la query originale se presente)
          const targetUrl = `http://${siteParam}.bozzasito.com/bozze/${restPath}`;

          http
            .get(targetUrl, (targetRes) => {
              if (targetRes.statusCode !== 200) {
                res.writeHead(targetRes.statusCode || 500, targetRes.headers);
                return targetRes.pipe(res);
              }

              const isImage = /\.(jpg|jpeg|png|webp)$/i.test(restPath);

              // 1. PASS-THROUGH DIRETTO: Se non è un'immagine o non viene richiesto slicing
              if (!isImage || !sliceParam) {
                res.writeHead(targetRes.statusCode || 200, targetRes.headers);
                return targetRes.pipe(res);
              }

              // 2. PROCESSING AD ALTA FEDELTÀ (PIXEL-PERFECT) PER LE BOZZE
              const chunks: Buffer[] = [];
              targetRes.on('data', (chunk) => chunks.push(chunk));
              targetRes.on('end', async () => {
                try {
                  const inputBuffer = Buffer.concat(chunks);
                  const image = sharp(inputBuffer);
                  const metadata = await image.metadata();

                  const width = metadata.width || 1920;
                  const height = metadata.height || 14000;
                  const topSliceHeight = Math.min(1400, height);

                  let pipeline = sharp(inputBuffer);

                  if (sliceParam === 'top') {
                    // Ritaglia i primi 1400px (Hero / primo viewport)
                    pipeline = pipeline.extract({
                      left: 0,
                      top: 0,
                      width,
                      height: topSliceHeight,
                    });
                  } else if (sliceParam === 'rest') {
                    // Ritaglia dal pixel 1400 fino al fondo
                    const remainingHeight = height - topSliceHeight;
                    if (remainingHeight <= 0) {
                      res.statusCode = 204; // Nessun contenuto se l'immagine è corta
                      return res.end();
                    }
                    pipeline = pipeline.extract({
                      left: 0,
                      top: topSliceHeight,
                      width,
                      height: remainingHeight,
                    });
                  }

                  // Configurazione LOSSLESS: 0 artefatti cromatici, font e vettori affilati al 100%
                  const outputBuffer = await pipeline
                    .webp({
                      lossless: true, // Garanzia pixel-perfect (nessuna compressione con perdita)
                      effort: 4,      // Bilanciamento CPU/Velocità di elaborazione
                    })
                    .toBuffer();

                  res.writeHead(200, {
                    'Content-Type': 'image/webp',
                    'Content-Length': outputBuffer.length,
                    'Cache-Control': 'public, max-age=31536000, immutable',
                  });
                  res.end(outputBuffer);
                } catch (err: any) {
                  res.statusCode = 500;
                  res.end(`Errore elaborazione immagine: ${err.message}`);
                }
              });
            })
            .on('error', (err) => {
              res.statusCode = 500;
              res.end(`Errore proxy: ${err.message}`);
            });
        });
      },
    },
  ],
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('pdfjs-dist') || id.includes('react-pdf')) {
              return 'pdf-vendor';
            }
            if (id.includes('gsap')) {
              return 'gsap-vendor';
            }
            if (id.includes('bootstrap') || id.includes('lucide-react')) {
              return 'ui-vendor';
            }
            return 'vendor';
          }
        },
      },
    },
  },
});