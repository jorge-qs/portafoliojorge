import { readFile } from 'node:fs/promises';
import { resolve, relative } from 'node:path';
import { pathToFileURL } from 'node:url';
import { archivosEn } from './archivos.mjs';

const literal =
  /#[\da-f]{3,8}\b|\b(?:rgba?|hsla?)\s*\(|\b(?:\d*\.)?\d+(?:ms|s)\b|\bcubic-bezier\s*\(/gi;

export async function verificarTokens(raiz = 'src') {
  const errores = [];
  for (const archivo of await archivosEn(raiz)) {
    if (resolve(archivo) === resolve(raiz, 'styles/tokens.css')) continue;
    const contenido = await readFile(archivo, 'utf8');
    const fragmentos = archivo.endsWith('.css')
      ? [{ texto: contenido, inicio: 0 }]
      : [
          ...contenido.matchAll(
            /<style\b[^>]*>([\s\S]*?)<\/style>|\bstyle\s*=\s*(?:"([^"]*)"|'([^']*)'|\{([\s\S]*?)\})/gi,
          ),
        ].map((m) => ({
          texto: m[1] ?? m[2] ?? m[3] ?? m[4],
          inicio: m.index,
        }));
    for (const { texto, inicio } of fragmentos) {
      // Conservar los saltos para informar la línea del literal.
      const css = texto.replace(/\/\*[\s\S]*?\*\//g, (c) =>
        c.replace(/[^\n]/g, ' '),
      );
      for (const coincidencia of css.matchAll(literal)) {
        const linea = contenido
          .slice(0, inicio + coincidencia.index)
          .split('\n').length;
        errores.push(`${archivo}:${linea}: token suelto «${coincidencia[0]}»`);
      }
    }
  }
  return errores;
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  const errores = await verificarTokens();
  for (const error of errores) console.error(error);
  console.log(
    errores.length
      ? `${errores.length} tokens sueltos.`
      : `Tokens: sin literales fuera de ${relative('.', 'src/styles/tokens.css')}.`,
  );
  process.exitCode = errores.length ? 1 : 0;
}
