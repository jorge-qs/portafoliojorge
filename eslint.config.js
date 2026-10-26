import js from '@eslint/js';
import astro from 'eslint-plugin-astro';
import tseslint from 'typescript-eslint';

export default [
  {
    ignores: [
      'dist/**',
      '.astro/**',
      'design/**',
      'node_modules/**',
      '.cache/**',
      'playwright-report/**',
      'test-results/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  ...astro.configs['jsx-a11y-recommended'],
  {
    files: ['**/*.astro'],
    languageOptions: { parserOptions: { parser: tseslint.parser } },
  },
  {
    files: ['scripts/**/*.mjs'],
    languageOptions: { globals: { console: 'readonly', process: 'readonly' } },
  },
];
