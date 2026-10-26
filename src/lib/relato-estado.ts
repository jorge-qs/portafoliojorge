import type { Relato } from '../content/esquemas';
import type { EstadoFiguraRelato } from './diagrama';

/** Los pasos son incrementos: conserva el recorrido y las aristas anteriores. */
export function estadoAcumulado(
  relato: Relato,
  paso: number,
): EstadoFiguraRelato {
  const base = relato.capitulos[1].estado;
  const pasos = relato.capitulos[2].pasos.slice(0, Math.max(0, paso + 1));
  const recorrido = [
    ...new Set(pasos.flatMap((p) => p.estado.recorrido ?? [])),
  ];
  const aristas = pasos.flatMap((p) => p.estado.aristasResaltadas ?? []);
  return {
    ...base,
    ...pasos.at(-1)?.estado,
    posiciones: Object.assign(
      {},
      base.posiciones,
      ...pasos.map((p) => p.estado.posiciones),
    ),
    recorrido,
    aristasResaltadas: aristas.filter(
      ([a, b], i) => aristas.findIndex(([x, y]) => a === x && b === y) === i,
    ),
    atenuados: relato.diagrama.nodos
      .filter((n) => !recorrido.includes(n.id))
      .map((n) => n.id),
  };
}

export function bloquesRelato(relato: Relato) {
  return relato.capitulos.flatMap((capitulo, i) => {
    const estado =
      i < 2
        ? relato.capitulos[i as 0 | 1].estado
        : estadoAcumulado(
            relato,
            i === 2 ? 0 : relato.capitulos[2].pasos.length - 1,
          );
    const principal = {
      capitulo: i + 1,
      paso: -1,
      texto: capitulo.texto,
      estado,
    };
    return i === 2
      ? [
          principal,
          ...relato.capitulos[2].pasos.map((p, j) => ({
            capitulo: 3,
            paso: j,
            texto: p.texto,
            estado: estadoAcumulado(relato, j),
          })),
        ]
      : [principal];
  });
}
