import type { Idioma } from '../i18n/config';
import type { Proyecto, Tecnologias } from './esquemas';

export interface EntradaProyecto {
  id: string;
  filePath?: string;
  data: Proyecto;
}

export function seleccionarConRespaldo<T extends { id: string }>(
  entradas: T[],
  idioma: Idioma,
) {
  const actual = entradas.find((entrada) => entrada.id === idioma);
  const entrada = actual ?? entradas.find((candidata) => candidata.id === 'es');
  if (!entrada)
    throw new Error(`Falta el contenido base en español (${idioma})`);
  return { entrada, esRespaldo: !actual && idioma !== 'es' };
}

export function seleccionarRelato<T extends { id: string }>(
  entradas: T[],
  slug: string,
  idioma: Idioma,
) {
  const actual = entradas.find((entrada) => entrada.id === `${idioma}/${slug}`);
  const entrada =
    actual ?? entradas.find((candidata) => candidata.id === `es/${slug}`);
  if (!entrada) throw new Error(`Falta el relato ${slug} en español`);
  return { entrada, esRespaldo: !actual && idioma !== 'es' };
}

export function identidad(id: string) {
  const [idioma, ...partes] = id.split('/');
  return { idioma, slug: partes.join('/') };
}

export function validarRelaciones(
  proyectos: EntradaProyecto[],
  tecnologias: { id: string; data: Tecnologias }[],
) {
  const ordenes = new Map<string, string>();
  for (const proyecto of proyectos) {
    const { idioma } = identidad(proyecto.id);
    const archivo =
      proyecto.filePath ?? `src/content/proyectos/${proyecto.id}.mdx`;
    const catalogo =
      tecnologias.find((entrada) => entrada.id === idioma) ??
      tecnologias.find((entrada) => entrada.id === 'es');
    if (!catalogo)
      throw new Error(
        `${archivo}: falta el catálogo de tecnologias para ${idioma}`,
      );
    const herramientas = new Set(
      catalogo.data.areas.flatMap((area) => area.herramientas),
    );
    for (const herramienta of proyecto.data.herramientas) {
      if (!herramientas.has(herramienta)) {
        throw new Error(
          `${archivo}: herramientas: «${herramienta}» no aparece en tecnologias/${catalogo.id}.json`,
        );
      }
    }
    if (proyecto.data.orden_destacado !== undefined) {
      const clave = `${idioma}/${proyecto.data.orden_destacado}`;
      const anterior = ordenes.get(clave);
      if (anterior)
        throw new Error(`${archivo}: orden_destacado repetido con ${anterior}`);
      ordenes.set(clave, archivo);
    }
  }
}

// Conserva la entrada original (y su cuerpo MDX) al ofrecer el respaldo español.
export function seleccionarProyectos<T extends EntradaProyecto>(
  entradas: T[],
  idioma: Idioma,
  activos: readonly Idioma[],
) {
  if (!activos.includes(idioma)) throw new Error(`Idioma inactivo: ${idioma}`);
  const slugs = new Set(
    entradas
      .filter((p) => ['es', idioma].includes(identidad(p.id).idioma))
      .map((p) => identidad(p.id).slug),
  );
  return [...slugs].sort().map((slug) => {
    const traduccion = entradas.find((p) => p.id === `${idioma}/${slug}`);
    const proyecto = traduccion ?? entradas.find((p) => p.id === `es/${slug}`)!;
    return {
      ...proyecto,
      slug,
      idioma,
      esRespaldo: !traduccion && idioma !== 'es',
    };
  });
}

export function seleccionarDestacados<T extends EntradaProyecto>(
  proyectos: T[],
) {
  return proyectos
    .filter((p) => p.data.destacado && p.data.estado !== 'archivado')
    .sort((a, b) => a.data.orden_destacado! - b.data.orden_destacado!);
}

// Orden único del sitio: índice (03), franja de evidencia (05) y Anterior/Siguiente
// de los artículos. Destacados por orden_destacado, luego por año descendente
// (los años placeholder al final), luego por slug; los archivados, al final.
export function ordenarProyectos<T extends EntradaProyecto & { slug: string }>(
  proyectos: T[],
) {
  const anio = (p: T) =>
    typeof p.data.anio === 'number' ? p.data.anio : -Infinity;
  const grupo = (p: T) =>
    p.data.estado === 'archivado' ? 2 : p.data.destacado ? 0 : 1;
  return [...proyectos].sort(
    (a, b) =>
      grupo(a) - grupo(b) ||
      (a.data.orden_destacado ?? 0) - (b.data.orden_destacado ?? 0) ||
      anio(b) - anio(a) ||
      a.slug.localeCompare(b.slug),
  );
}

// Código visible de un proyecto («01»…): su posición en ordenarProyectos.
export function codigoProyecto(posicion: number) {
  return String(posicion + 1).padStart(2, '0');
}

// Relación bidireccional por idioma y slug, también para los borradores.
export function validarRelatos(
  proyectos: EntradaProyecto[],
  relatos: { id: string; filePath?: string }[],
) {
  for (const proyecto of proyectos) {
    const { slug } = identidad(proyecto.id);
    if (
      proyecto.data.destacado &&
      !relatos.some((r) => identidad(r.id).slug === slug)
    )
      throw new Error(
        `${proyecto.filePath ?? `src/content/proyectos/${proyecto.id}.mdx`}: falta src/content/relatos/${proyecto.id}.json para el proyecto destacado`,
      );
  }
  for (const relato of relatos) {
    if (
      !proyectos.some(
        (p) =>
          identidad(p.id).slug === identidad(relato.id).slug &&
          p.data.destacado,
      )
    )
      throw new Error(
        `${relato.filePath ?? `src/content/relatos/${relato.id}.json`}: no corresponde a un proyecto destacado`,
      );
  }
}
