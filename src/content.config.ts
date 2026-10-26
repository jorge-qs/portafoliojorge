import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { defineCollection } from 'astro:content';
import { glob, type Loader } from 'astro/loaders';
import {
  relatoSchema,
  notaSchema,
  perfilSchema,
  proyectoSchema,
  tecnologiasSchema,
  heroSchema,
  portadaSchema,
} from './content/esquemas';

// Notas es opcional (la sección 06 no se renderiza sin notas): sin archivos, la colección queda
// vacía sin la advertencia de glob. Al añadir la primera nota hay que reiniciar `astro dev`.
function hayArchivos(base: string, extension: RegExp) {
  if (!existsSync(base)) return false;
  return readdirSync(base, { withFileTypes: true }).some(
    (dir) =>
      dir.isDirectory() &&
      readdirSync(join(base, dir.name)).some((archivo) =>
        extension.test(archivo),
      ),
  );
}

function globOpcional(
  opciones: Parameters<typeof glob>[0] & { base: string },
  extension: RegExp,
): Loader {
  if (hayArchivos(opciones.base, extension)) return glob(opciones);
  return { name: 'coleccion-vacia', load: async ({ store }) => store.clear() };
}

const proyectos = defineCollection({
  loader: glob({
    pattern: '*/*.mdx',
    base: './src/content/proyectos',
    generateId: ({ entry }) => entry.replace(/\.mdx$/, ''),
  }),
  schema: proyectoSchema,
});
const notas = defineCollection({
  loader: globOpcional(
    {
      pattern: '*/*.{md,mdx}',
      base: './src/content/notas',
      generateId: ({ entry }) => entry.replace(/\.mdx?$/, ''),
    },
    /\.mdx?$/,
  ),
  schema: notaSchema,
});
const perfil = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/perfil' }),
  schema: perfilSchema,
});
const tecnologias = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/tecnologias' }),
  schema: tecnologiasSchema,
});

const relatos = defineCollection({
  loader: glob({
    pattern: '*/*.json',
    base: './src/content/relatos',
    generateId: ({ entry }) => entry.replace(/\.json$/, ''),
  }),
  schema: relatoSchema,
});

const hero = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/hero' }),
  schema: heroSchema,
});

const portada = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/portada' }),
  schema: portadaSchema,
});

export const collections = {
  proyectos,
  notas,
  perfil,
  tecnologias,
  relatos,
  hero,
  portada,
};
