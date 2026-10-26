import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { expect, test } from 'vitest';

async function archivosEn(directorio: string): Promise<string[]> {
  const entradas = await readdir(directorio, { withFileTypes: true });
  const anidados = await Promise.all(
    entradas.map((entrada) => {
      const ruta = join(directorio, entrada.name);
      return entrada.isDirectory() ? archivosEn(ruta) : [ruta];
    }),
  );
  return anidados.flat();
}

test('componentes, layouts y lib no fijan el idioma español', async () => {
  const raices = ['src/components', 'src/layouts', 'src/lib'];
  const archivos = (await Promise.all(raices.map(archivosEn))).flat();
  const patron =
    /\bidioma\s*(?:=|\?\?)\s*['"]es['"]|getEntry\s*\([^)]*,\s*['"]es['"]\s*\)/;
  const hallazgos = (
    await Promise.all(
      archivos.map(async (archivo) => ({
        archivo,
        contenido: await readFile(archivo, 'utf8'),
      })),
    )
  )
    .filter(({ contenido }) => patron.test(contenido))
    .map(({ archivo }) => archivo);

  expect(hallazgos).toEqual([]);
});
