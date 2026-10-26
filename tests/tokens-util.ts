import { readFileSync } from 'node:fs';
import postcss from 'postcss';

export function declaraciones(css: string) {
  const resultado: Record<string, string> = {};
  postcss.parse(css).walkDecls(/^--/, (declaracion) => {
    const contexto: string[] = [];
    let padre = declaracion.parent;
    while (padre && padre.type !== 'root') {
      contexto.unshift(
        padre.type === 'rule'
          ? padre.selector
          : `@${padre.name} ${padre.params}`,
      );
      padre = padre.parent;
    }
    resultado[`${contexto.join(' > ')} | ${declaracion.prop}`] =
      declaracion.value;
  });
  return resultado;
}

export function coloresTema(tema: 'cosmos' | 'dawn') {
  const colores: Record<string, string> = {};
  postcss
    .parse(readFileSync('src/styles/tokens.css', 'utf8'))
    .walkRules((regla) => {
      if (
        regla.selector
          .split(',')
          .some(
            (selector) =>
              selector.trim() === ':root' ||
              selector.trim() === `[data-theme="${tema}"]`,
          )
      ) {
        regla.walkDecls(/^--/, (d) => {
          colores[d.prop.slice(2)] = d.value;
        });
      }
    });
  return colores;
}
