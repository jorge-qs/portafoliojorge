import { expect, test } from 'vitest';
import { proyectoSchema } from '../src/content/esquemas';
import { codigoProyecto, ordenarProyectos } from '../src/content/validacion';

const base = {
  titulo: '‹…›',
  tipo: 'ing',
  anio: '‹año›',
  resumen: '‹…›',
  herramientas: ['Python'],
  rol: '‹…›',
  destacado: false,
  enlaces: {},
  borrador: true,
};
const p = (slug: string, cambios = {}) => ({
  id: `es/${slug}`,
  slug,
  data: proyectoSchema.parse({ ...base, ...cambios }),
});

test('destacados primero, luego año descendente, placeholders y archivados al final', () => {
  const orden = ordenarProyectos([
    p('archivado', { anio: 2030, estado: 'archivado' }),
    p('sin-anio'),
    p('viejo', { anio: 2021 }),
    p('d2', { destacado: true, orden_destacado: 2 }),
    p('nuevo', { anio: 2025 }),
    p('d1', { destacado: true, orden_destacado: 1 }),
  ]).map((x) => x.slug);
  expect(orden).toEqual([
    'd1',
    'd2',
    'nuevo',
    'viejo',
    'sin-anio',
    'archivado',
  ]);
});

test('el código es la posición con dos dígitos', () => {
  expect(codigoProyecto(0)).toBe('01');
  expect(codigoProyecto(9)).toBe('10');
});
