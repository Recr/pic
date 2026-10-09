import { execFileSync } from 'node:child_process'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const gitVersion = execFileSync('git', ['describe', '--tag', '--abbrev=0'], {
    encoding: 'utf8',
  }).trim()

  return {
    define: {
      __GIT_VERSION__: JSON.stringify(gitVersion),
    },
    plugins: [react(), tailwindcss()],
    server: {
      port: env.PORT ? Number(env.PORT) : 5173,
      proxy: {
        '/api': {
          target: env.VITE_API_URL,
          changeOrigin: true,
        },
      },
    },
  }
})
