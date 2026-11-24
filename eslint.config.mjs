import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'

export default defineConfig([
  ...nextVitals,
  {
    // Document navigation refreshes server permissions and counts dashboard entries.
    files: ['app/**/*.js', 'components/**/*.js'],
    rules: { '@next/next/no-html-link-for-pages': 'off' },
  },
  globalIgnores(['.next/**', '.agents/**', '.claude/**']),
])
