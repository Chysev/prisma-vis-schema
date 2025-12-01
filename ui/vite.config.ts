import path from 'path'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite"
import { defineConfig, loadEnv } from 'vite'
import obfuscator from 'rollup-plugin-obfuscator';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isProd = mode === 'production';
  return {
    plugins: [
      react({
        babel: {
          plugins: [['babel-plugin-react-compiler']],
        },
      }),
      tailwindcss(),
      ...(isProd
        ? [
          obfuscator({
            global: false,
            include: ['dist/**/*.js'],
            exclude: ['node_modules/**'],
            options: {
              compact: true,
              controlFlowFlattening: true,
              controlFlowFlatteningThreshold: 0.6,
              deadCodeInjection: true,
              deadCodeInjectionThreshold: 0.2,
              stringArray: true,
              stringArrayThreshold: 0.7,
              stringArrayEncoding: ['base64'],
              selfDefending: false,
              simplify: true,
              renameGlobals: false,
              transformObjectKeys: true,
              unicodeEscapeSequence: false,
              sourceMap: false,
              disableConsoleOutput: true,
              seed: 12345,
            },
          }),
        ]
        : []),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      host: env.PROD_SERVER_HOST,
      allowedHosts: [env.PROD_SERVER_ALLOWED_HOST]
    },
    build: {
      rollupOptions: {
        plugins: [
          visualizer({
            filename: './dist/stats.html',
            open: true,
            gzipSize: true,
            brotliSize: true,
          }),
        ],
      },
    },
  }
})
