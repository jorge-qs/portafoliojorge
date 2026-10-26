import { readFile } from 'node:fs/promises';
import { archivosEn } from './archivos.mjs';

let total = 0;
for (const archivo of await archivosEn('src/content')) {
  if (!/\.(?:mdx?|json)$/.test(archivo)) continue;
  const contenido = await readFile(archivo, 'utf8');
  const pendientes = [
    ...contenido.matchAll(/‹[^‹›]+›|["']?borrador["']?\s*:\s*true/gu),
  ];
  if (!pendientes.length) continue;
  console.log(`${archivo}:`);
  for (const pendiente of pendientes) {
    const linea = contenido.slice(0, pendiente.index).split('\n').length;
    console.log(`  ${linea}: ${pendiente[0]}`);
  }
  if (archivo.endsWith('.json')) {
    const datos = JSON.parse(contenido);
    if (datos.borrador === true) {
      for (const [campo, valor] of Object.entries(datos)) {
        if (typeof valor === 'string' && !/‹[^‹›]+›/u.test(valor))
          console.log(`  borrador · ${campo}: ${valor}`);
      }
    }
    if (datos.ilustrativo === true) {
      const textos = Object.entries(datos)
        .filter(([campo]) => !['borrador', 'ilustrativo'].includes(campo))
        .flatMap(([campo, valor]) =>
          Array.isArray(valor)
            ? valor.flat(Infinity).map((texto) => [campo, texto])
            : [],
        );
      for (const [campo, texto] of textos)
        console.log(`  ilustrativo · ${campo}: ${texto}`);
      total += textos.length;
    }
  }
  total += pendientes.length;
}
console.log(`${total} pendientes.`);
process.exitCode = process.argv.includes('--estricto') && total > 0 ? 1 : 0;
