import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, resolve(__dirname, '../../'), '')
  if (!env.SERVER_PORT && command === 'serve' ) {
    console.warn('\n\x1b[38;5;208m||||||||||||||   >>  WARNING  <<   |||||||||||||\x1b[0m')
    console.warn(  '\x1b[38;5;208m|\x1b[0m      Couldn\'t connect to \x1b[34mBackend\x1b[0m server      \x1b[38;5;208m|\x1b[0m')
    console.warn(  '\x1b[38;5;208m|\x1b[0m No \x1b[36mSERVER_PORT\x1b[0m found in \x1b[32m./Minisprint004/.env\x1b[0m \x1b[38;5;208m|\x1b[0m')
    console.warn(  '\x1b[38;5;208m||||||||||||||||||||||||||||||||||||||||||||||||\x1b[0m')
  }


  return {
    plugins: [react()],
    envDir: resolve(__dirname, '../../'),
    define: {
      'import.meta.env.SERVER_PORT': JSON.stringify(env.SERVER_PORT),
    },
  }
})
