import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // Opinionated react-hooks v7 rule: flags the fetch-on-mount pattern used
      // across every page. Keep it as a signal (warn), not a build-breaker —
      // a reusable data-fetching hook is a deliberate Day 12-13 polish item.
      'react-hooks/set-state-in-effect': 'warn',
      // DX-only Fast Refresh rule. The Context-provider + `useX`-hook in one
      // file pattern (AuthContext/ThemeContext) is intentional and standard.
      'react-refresh/only-export-components': 'warn',
    },
  },
  {
    // Build/tooling configs run in Node, not the browser.
    files: ['**/*.config.{js,jsx}'],
    languageOptions: { globals: globals.node },
  },
])
