import { getCollection, type CollectionEntry } from 'astro:content';
import { IDIOMAS_ACTIVOS, type Idioma } from '../i18n/config';
import {
  seleccionarProyectos,
  validarRelaciones,
  validarRelatos,
  seleccionarConRespaldo,
  seleccionarRelato,
} from './validacion';

export async function obtenerConRespaldo<
  C extends 'perfil' | 'tecnologias' | 'portada' | 'hero',
>(
  coleccion: C,
  idioma: Idioma,
): Promise<{ data: CollectionEntry<C>['data']; esRespaldo: boolean }> {
  const entradas = await getCollection(coleccion);
  const { entrada, esRespaldo } = seleccionarConRespaldo(entradas, idioma);
  return { data: entrada.data as CollectionEntry<C>['data'], esRespaldo };
}

export async function obtenerRelato(slug: string, idioma: Idioma) {
  const entradas = await getCollection('relatos');
  const { entrada, esRespaldo } = seleccionarRelato(entradas, slug, idioma);
  return { data: entrada.data, esRespaldo };
}

export async function obtenerProyectos(idioma: Idioma) {
  const [proyectos, tecnologias, relatos] = await Promise.all([
    getCollection('proyectos'),
    getCollection('tecnologias'),
    getCollection('relatos'),
  ]);
  validarRelaciones(proyectos, tecnologias);
  validarRelatos(proyectos, relatos);
  return seleccionarProyectos(proyectos, idioma, IDIOMAS_ACTIVOS);
}

export async function hayNotasPublicadas(idioma: Idioma) {
  return (await obtenerNotas(idioma)).length > 0;
}

export async function obtenerNotas(idioma: Idioma) {
  if (!Object.keys(import.meta.glob('./notas/*/*.{md,mdx}')).length) return [];
  const notas = await getCollection('notas');
  const slugs = new Set(
    notas
      .filter((nota) => ['es', idioma].includes(nota.id.split('/')[0]))
      .map((nota) => nota.id.split('/').slice(1).join('/')),
  );
  return [...slugs].sort().flatMap((slug) => {
    const actual = notas.find((nota) => nota.id === `${idioma}/${slug}`);
    const nota = actual ?? notas.find((entrada) => entrada.id === `es/${slug}`);
    return nota && !nota.data.borrador
      ? [{ ...nota, slug, idioma, esRespaldo: !actual && idioma !== 'es' }]
      : [];
  });
}
