import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import fs from 'node:fs';

const mimeTypes: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
};

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const serverPort = env.SERVER_PORT || process.env.SERVER_PORT || '3000';
  const uiPort = parseInt(env.UI_PORT || env.VITE_PORT || process.env.UI_PORT || process.env.VITE_PORT || '5173', 10);
  const rootSpecsDir = path.resolve(__dirname, '../../specs');

  return {
    plugins: [
      react(),
      {
        name: 'serve-specs-mockups',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (!req.url) return next();
            const cleanUrl = req.url.split('?')[0];

            let targetFile: string | null = null;
            if (cleanUrl.startsWith('/specs/')) {
              targetFile = path.resolve(__dirname, '../../', cleanUrl.slice(1));
            } else if (cleanUrl.startsWith('/mockups/')) {
              targetFile = path.resolve(rootSpecsDir, 'ui', cleanUrl.slice(1));
            }

            if (targetFile && fs.existsSync(targetFile) && fs.statSync(targetFile).isFile()) {
              const ext = path.extname(targetFile);
              res.writeHead(200, {
                'Content-Type': mimeTypes[ext] || 'application/octet-stream',
              });
              fs.createReadStream(targetFile).pipe(res);
              return;
            }

            next();
          });
        },
      },
    ],
    server: {
      port: uiPort,
      fs: {
        allow: [
          path.resolve(__dirname, '.'),
          path.resolve(__dirname, '../../specs'),
          path.resolve(__dirname, '../../node_modules'),
        ],
      },
      proxy: {
        '/rpc': {
          target: `http://localhost:${serverPort}`,
          changeOrigin: true,
        },
      },
    },
  };
});
