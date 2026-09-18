import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import http from 'http';
/* import sharp from 'sharp'; */


export default defineConfig({
  plugins: [
    react(),
    {
      name: 'bozze-proxy-middleware',
      configureServer(server) {
        server.middlewares.use('/bozze-proxy', (req, res) => {
          const parts = req.url?.split('/').filter(Boolean) || [];
          const siteParam = parts[0];
          const restPath = parts.slice(1).join('/');
          if (!siteParam) {
            res.statusCode = 400;
            res.end('Parametro sito mancante');
            return;
          }
          const targetUrl = `http://${siteParam}.bozzasito.com/bozze/${restPath}`;
          http.get(targetUrl, (targetRes) => {
            let contentType = targetRes.headers['content-type'] || 'application/octet-stream';
            
            if (restPath.endsWith('.jpg') || restPath.endsWith('.jpeg')) {
              contentType = 'image/jpeg';
            } else if (restPath.endsWith('.png')) {
              contentType = 'image/png';
            } else if (restPath.endsWith('.webp')) {
              contentType = 'image/webp';
            } else if (restPath.endsWith('.svg')) {
              contentType = 'image/svg+xml';
            } else if (restPath.endsWith('.gif')) {
              contentType = 'image/gif';
            }
            
            const headers = { ...targetRes.headers };
            headers['content-type'] = contentType;
            
            res.writeHead(targetRes.statusCode || 200, headers);
            targetRes.pipe(res);
          }).on('error', (err) => {
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

/*  _REDIRECTS !!!!!
/bozze-proxy/:site/*  http://:site.bozzasito.com/bozze/:splat  200!

*/


/* 
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
        server.middlewares.use('/bozze-proxy', async (req, res) => {
          const parts = req.url?.split('/').filter(Boolean) || [];
          const siteParam = parts[0];
          const restPath = parts.slice(1).join('/');
          
          if (!siteParam) {
            res.statusCode = 400;
            res.end('Parametro sito mancante');
            return;
          }
          
          const targetUrl = `http://${siteParam}.bozzasito.com/bozze/${restPath}`;
          
          http.get(targetUrl, (targetRes) => {
            if (targetRes.statusCode !== 200) {
              res.statusCode = targetRes.statusCode || 404;
              res.end('Not Found');
              return;
            }

            // 1. Accumula i chunk dell'immagine in un buffer
            const chunks: Buffer[] = [];
            targetRes.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
            
            targetRes.on('end', async () => {
              try {
                const buffer = Buffer.concat(chunks);
                let finalBuffer = buffer;
                let contentType = targetRes.headers['content-type'] || 'application/octet-stream';
                
                // 2. LOGICA DI CONVERSIONE AUTOMATICA CON SHARP
                if (restPath.endsWith('.jpg') || restPath.endsWith('.jpeg') || restPath.endsWith('.png')) {
                  // Converte al volo in WebP (qualità 80%, effort 6 = ottimo compromesso velocità/peso)
                  finalBuffer = await sharp(buffer)
                    .webp({ quality: 80, effort: 6 })
                    .toBuffer();
                  contentType = 'image/webp';
                } else if (restPath.endsWith('.webp')) {
                  contentType = 'image/webp';
                } else if (restPath.endsWith('.svg')) {
                  contentType = 'image/svg+xml';
                } else if (restPath.endsWith('.gif')) {
                  contentType = 'image/gif';
                }

                // 3. Invia l'immagine (convertita o originale) con header ottimizzati
                const headers = { 
                  ...targetRes.headers,
                  'content-type': contentType,
                  'cache-control': 'public, max-age=31536000' // Cache aggressiva per le immagini
                };
                
                res.writeHead(200, headers);
                res.end(finalBuffer);
                
              } catch (err) {
                console.error('Errore durante la conversione sharp:', err);
                res.statusCode = 500;
                res.end('Errore interno durante l\'elaborazione dell\'immagine');
              }
            });
          }).on('error', (err) => {
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
}); */