import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect, test } from 'vitest';
import { verificarTokens } from '../scripts/verificar-tokens.mjs';

test('detecta literales CSS, bloques y atributos, y permite href y el archivo de tokens', async () => {
  const raiz = await mkdtemp(join(tmpdir(), 'f0-tokens-'));
  try {
    await mkdir(join(raiz, 'styles'));
    await writeFile(
      join(raiz, 'styles/tokens.css'),
      ':root { --bg: #fff; --dur: 0ms; }',
    );
    await writeFile(
      join(raiz, 'pagina.astro'),
      '<a href="#fff">Enlace</a><style>p {color:#fff; transition:opacity 200ms cubic-bezier(0,0,1,1)}</style><div style="color:rgb(0,0,0)"></div><div style={\'background:hsl(0,0%,0%)\'}></div>',
    );
    await writeFile(
      join(raiz, 'global.css'),
      'p{color:rgba(1,2,3,.5);transition:opacity .2s}',
    );
    const errores = await verificarTokens(raiz);
    expect(errores).toHaveLength(7);
    expect(
      errores.filter((e: string) => e.includes('tokens.css')),
    ).toHaveLength(0);
    await writeFile(
      join(raiz, 'pagina.astro'),
      '<a href="#fff">Enlace</a><style>p{color:var(--text)}</style>',
    );
    await writeFile(join(raiz, 'global.css'), 'p{color:var(--text)}');
    expect(await verificarTokens(raiz)).toEqual([]);
  } finally {
    await rm(raiz, { recursive: true, force: true });
  }
});
