import { expect, test } from 'vitest';
import { relatoSchema, proyectoSchema } from '../src/content/esquemas';
import { validarRelatos } from '../src/content/validacion';
import { estadoAcumulado } from '../src/lib/relato-estado';
import semilla from '../src/content/relatos/es/coordinacion-multiagente.json';
import dos from '../src/content/relatos/es/proyecto-02.json';
import tres from '../src/content/relatos/es/proyecto-03.json';

const relato = relatoSchema.parse(semilla);
const proyecto = {
  id: 'es/ejemplo',
  data: proyectoSchema.parse({
    titulo: 'Prueba',
    tipo: 'ing',
    anio: 2026,
    resumen: 'Prueba',
    herramientas: ['Python'],
    rol: 'Prueba',
    destacado: true,
    orden_destacado: 1,
    enlaces: {},
    borrador: true,
  }),
};

test('las tres semillas son borradores válidos con cuatro capítulos en orden', () => {
  for (const datos of [semilla, dos, tres])
    expect(relatoSchema.safeParse(datos).success).toBe(true);
  for (const capitulos of [
    semilla.capitulos.slice(1),
    [...semilla.capitulos, semilla.capitulos[0]],
    [semilla.capitulos[2], ...semilla.capitulos.slice(1)],
  ])
    expect(relatoSchema.safeParse({ ...semilla, capitulos }).success).toBe(
      false,
    );
  expect(semilla.capitulos[3].resultados?.every((r) => r.sintetico)).toBe(true);
});

test('rechaza referencias a nodos inexistentes, IDs repetidos y valores fuera de escala', () => {
  const datos = structuredClone(semilla);
  datos.diagrama.aristas.push(['user', 'no-existe']);
  expect(relatoSchema.safeParse(datos).success).toBe(false);
  datos.diagrama.aristas.pop();
  datos.diagrama.nodos.push(datos.diagrama.nodos[0]);
  expect(relatoSchema.safeParse(datos).success).toBe(false);
  datos.diagrama.nodos.pop();
  datos.capitulos[3].resultados![0].valor = 101;
  expect(relatoSchema.safeParse(datos).success).toBe(false);
});

test('cada destacado exige relato y cada relato exige destacado con su archivo en el error', () => {
  expect(() => validarRelatos([proyecto], [{ id: proyecto.id }])).not.toThrow();
  expect(() => validarRelatos([proyecto], [])).toThrow(
    'src/content/proyectos/es/ejemplo.mdx: falta src/content/relatos/es/ejemplo.json',
  );
  expect(() => validarRelatos([], [{ id: proyecto.id }])).toThrow(
    'src/content/relatos/es/ejemplo.json: no corresponde',
  );
  expect(() =>
    validarRelatos(
      [{ ...proyecto, data: { ...proyecto.data, destacado: false } }],
      [{ id: proyecto.id, filePath: 'archivo.json' }],
    ),
  ).toThrow('archivo.json');
  expect(() =>
    validarRelatos([proyecto], [{ id: 'es/ejemplo' }, { id: 'en/ejemplo' }]),
  ).not.toThrow();
});

test('el recorrido y sus aristas se acumulan sin mutar los datos ni perder las posiciones', () => {
  const copia = structuredClone(relato);
  expect(estadoAcumulado(relato, 0).recorrido).toEqual(['user', 'orq']);
  expect(estadoAcumulado(relato, 1).recorrido).toEqual(['user', 'orq', 'b']);
  const final = estadoAcumulado(relato, 3);
  expect(final.recorrido).toEqual(['user', 'orq', 'b', 'tools']);
  expect(final.aristasResaltadas).toEqual([
    ['user', 'orq'],
    ['orq', 'b'],
    ['b', 'tools'],
    ['b', 'orq'],
  ]);
  expect(final.atenuados).toEqual(['a', 'c', 'mem']);
  expect(final.posiciones).toEqual(relato.capitulos[1].estado.posiciones);
  expect(relato).toEqual(copia);
});
