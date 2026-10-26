import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import { unified } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { IDIOMA_BASE, IDIOMAS_ACTIVOS } from './src/i18n/config';

export default defineConfig({
  site: 'https://example.com', // TODO(F8): dominio real (D5)
  output: 'static',
  markdown: {
    processor: unified({
      remarkPlugins: [remarkMath],
      rehypePlugins: [
        [
          rehypeKatex,
          {
            trust: (context: { command: string }) =>
              context.command === '\\htmlClass',
            strict: (code: string) =>
              code === 'htmlExtension' ? 'ignore' : 'warn',
          },
        ],
      ],
    }),
    shikiConfig: { theme: 'css-variables' },
  },
  integrations: [mdx()],
  i18n: {
    defaultLocale: IDIOMA_BASE,
    locales: IDIOMAS_ACTIVOS,
    routing: { prefixDefaultLocale: false },
  },
});
