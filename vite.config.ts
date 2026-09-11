import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import http from 'http';

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