import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const serverPort = env.SERVER_PORT || process.env.SERVER_PORT || '3000';
  const uiPort = parseInt(env.UI_PORT || env.VITE_PORT || process.env.UI_PORT || process.env.VITE_PORT || '5173', 10);

  return {
    plugins: [
      react(),
      tailwindcss()
    ],
    server: {
      port: uiPort,
      proxy: {
        '/rpc': {
          target: `http://localhost:${serverPort}`,
          changeOrigin: true
        }
      }
    }
  };
});
