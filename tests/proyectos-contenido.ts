import { readFileSync, readdirSync } from 'node:fs';
import { parse } from 'yaml';
import { proyectoSchema } from '../src/content/esquemas';
import { codigoProyecto, ordenarProyectos } from '../src/content/validacion';

export function proyectosContenido() {
  return ordenarProyectos(
    readdirSync('src/content/proyectos/es')
      .map((archivo) => {
        const texto = readFileSync(
          `src/content/proyectos/es/${archivo}`,
          'utf8',
        );
        return {
          id: `es/${archivo.replace(/\.mdx$/, '')}`,
          slug: archivo.replace(/\.mdx$/, ''),
          data: proyectoSchema.parse(parse(texto.split('---')[1])),
        };
      })
      .filter((p) => p.data.estado !== 'archivado'),
  ).map((p, i) => ({ ...p, codigo: codigoProyecto(i) }));
}
