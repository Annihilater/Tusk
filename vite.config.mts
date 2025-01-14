import { dirname, relative } from 'node:path'
import type { UserConfig } from 'vite'
import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue2'

import { isDev, isLocal, port, r } from './scripts/utils'
import packageJson from './package.json'

export const sharedConfig: UserConfig = {
  root: r('src'),
  resolve: {
    alias: {
      '@': `${r('src')}/`,
			'$services': `${r('services')}/`
    },
  },
  define: {
    __DEV__: isDev,
    __LOCAL__: isLocal,
    __NAME__: JSON.stringify(packageJson.name),
  },
  plugins: [
    Vue(),

    // rewrite assets to use relative path
    {
      name: 'assets-rewrite',
      enforce: 'post',
      apply: 'build',
      transformIndexHtml(html, { path }) {
        return html.replace(/"\/assets\//g, `"${relative(dirname(path), '/assets')}/`)
      },
    },
  ],
  optimizeDeps: {
    include: [
      'vue',
      // 'webextension-polyfill',
    ],
    exclude: [
      // 'vue-demi',
    ],
  },
}

export default defineConfig(({ command }) => ({
  ...sharedConfig,
  base: command === 'serve' ? `http://localhost:${port}/` : '/dist/',
  publicDir: r('public'),
  server: {
    port,
    hmr: {
      host: 'localhost',
    },
    origin: `http://localhost:${port}`,
  },
  build: {
    watch: isDev
      ? {}
      : undefined,
    outDir: r('extension/dist'),
    emptyOutDir: false,
    minify: false,
    sourcemap: isDev ? 'inline' : false,
    rollupOptions: {
      input: {
        options: r('src/options.html'),
        popup: r('src/popup.html'),
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
  },
}))
