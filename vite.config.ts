import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import electron from 'vite-plugin-electron/simple'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    electron({
      main: {
        entry: 'electron/main/index.ts',
        vite: {
          build: {
            outDir: 'dist/main',
            emptyOutDir: true,
            rollupOptions: {
              external: ['better-sqlite3'],
            },
          },
        },
      },
      preload: {
        input: {
          // You can configure multiple preload scripts here
          index: 'electron/preload/index.ts',
        },
        // 开发环境下，当预加载脚本文件改变时，重新加载主进程和渲染进程
        onstart: (options) => {
          options.reload()
        },
        vite: {
          build: {
            outDir: 'dist/preload',
            emptyOutDir: true,
            rollupOptions: {
              output: {
                format: 'cjs',
                entryFileNames: '[name].js',
              },
            },
          },
        },
      },
    })
  ],
  build: {
    outDir: 'dist/renderer',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
  },
})
