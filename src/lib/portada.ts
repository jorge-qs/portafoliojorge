import type { EntradaProyecto } from '../content/validacion';

export function recuentosTipos(proyectos: EntradaProyecto[]) {
  const activos = proyectos.filter((p) => p.data.estado !== 'archivado');
  return {
    todos: activos.length,
    ing: activos.filter((p) => p.data.tipo === 'ing').length,
    inv: activos.filter((p) => p.data.tipo === 'inv').length,
    hib: activos.filter((p) => p.data.tipo === 'hib').length,
  };
}

export function proyectosDeHerramienta<T extends EntradaProyecto>(
  proyectos: T[],
  herramienta: string,
) {
  return proyectos.filter(
    (p) =>
      p.data.estado !== 'archivado' &&
      p.data.herramientas.includes(herramienta),
  );
}
