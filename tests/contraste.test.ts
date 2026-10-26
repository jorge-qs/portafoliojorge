import { describe, expect, test } from 'vitest';
import { coloresTema } from './tokens-util';

type Color = [number, number, number, number];
function color(valor: string): Color {
  if (valor.startsWith('#'))
    return [
      ...[1, 3, 5].map((i) => parseInt(valor.slice(i, i + 2), 16)),
      1,
    ] as Color;
  const componentes = valor.match(/[\d.]+/g)!.map(Number);
  return [componentes[0], componentes[1], componentes[2], componentes[3] ?? 1];
}
function componer(frente: Color, fondo: Color): Color {
  return [0, 1, 2]
    .map((i) => frente[i] * frente[3] + fondo[i] * (1 - frente[3]))
    .concat(1) as Color;
}
function luminancia(c: Color) {
  const [r, g, b] = c.slice(0, 3).map((v) => {
    const canal = v / 255;
    return canal <= 0.04045 ? canal / 12.92 : ((canal + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contraste(a: Color, b: Color) {
  const [claro, oscuro] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (claro + 0.05) / (oscuro + 0.05);
}

const pares: [string, string, number?][] = [
  ...[
    'text',
    'heading',
    'muted',
    'accent',
    'accent-hover',
    'eng',
    'res',
    'link',
  ].map((t): [string, string] => [t, 'bg']),
  ...['surface', 'surface-2', 'surface-hover'].map((f): [string, string] => [
    'muted',
    f,
  ]),
  ...[
    'code-text',
    'code-muted',
    'code-keyword',
    'code-string',
    'code-number',
    'plot-a',
    'plot-b',
  ].map((rol): [string, string] => [rol, 'surface']),
  ['text', 'chapter-current'],
  ['text', 'minute-bg'],
  ['heading', 'question-bg'],
  ['res', 'formula-prob'],
  ['eng', 'formula-weight'],
  ['muted', 'formula-hidden'],
  ['text', 'surface-hover'],
  ['text', 'selected'],
  ['on-accent', 'accent'],
  ['on-accent', 'accent-hover'],
  ['accent', 'accent-tint'],
  ['pending-fg', 'pending-bg'],
  ['pending-fg', 'article-pending-bg'],
  ['heading', 'res', 0.08],
  ['text', 'accent', 0.08],
];

for (const tema of ['cosmos', 'dawn'] as const) {
  describe(tema, () => {
    const tokens = coloresTema(tema);
    for (const rol of ['muted', 'heading', 'text', 'accent']) {
      test(`${rol} sobre la barra translúcida: AA 4,5:1`, () => {
        const opacidad = Number(tokens['nav-bg'].match(/(\d+)%/)![1]) / 100;
        const fondoBarra = color(tokens.bg);
        fondoBarra[3] = opacidad;
        const compuesto = componer(fondoBarra, color(tokens['surface-hover']));
        expect(contraste(color(tokens[rol]), compuesto)).toBeGreaterThanOrEqual(
          4.5,
        );
      });
    }
    for (const [texto, fondo, alfa] of pares) {
      test(`${texto} sobre ${fondo}${alfa ? ' al 8 %' : ''}: AA 4,5:1`, () => {
        const bg = color(tokens.bg);
        const base = color(tokens[fondo]);
        if (alfa !== undefined) base[3] = alfa;
        const superficie = componer(base, bg);
        const primerPlano = componer(color(tokens[texto]), superficie);
        expect(contraste(primerPlano, superficie)).toBeGreaterThanOrEqual(4.5);
      });
    }
  });
}
