import { readdir } from 'node:fs/promises';
import { join } from 'node:path';

export async function archivosEn(directorio) {
  const entradas = await readdir(directorio, { withFileTypes: true });
  const grupos = await Promise.all(
    entradas.map((entrada) => {
      const ruta = join(directorio, entrada.name);
      return entrada.isDirectory() ? archivosEn(ruta) : [ruta];
    }),
  );
  return grupos.flat().sort();
}
