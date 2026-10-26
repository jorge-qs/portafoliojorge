import { expect, test } from 'vitest';
import { generarHistograma } from '../src/lib/datos-sinteticos';
import { ordenarProyectos } from '../src/content/validacion';
import { proyectoSchema } from '../src/content/esquemas';

test('histograma reproducible, acotado, con semilla y parámetro efectivos', () => {
  const datos = generarHistograma();
  expect(datos).toEqual(generarHistograma(7, 32, 0.7));
  expect(datos).not.toEqual(generarHistograma(11));
  expect(datos).toHaveLength(32);
  expect(
    datos.every((d) => d.a >= 0 && d.a <= 93 && d.b >= 0 && d.b <= 93),
  ).toBe(true);
  expect(generarHistograma(7, 32, 0.35)[15].a).toBeCloseTo(datos[15].a / 2);
  expect(datos[13].a).toBeGreaterThan(datos[0].a);
});

test('adyacentes siguen el orden único sin envolver extremos', () => {
  const data = proyectoSchema.parse({
    titulo: 'Prueba',
    tipo: 'ing',
    anio: 2026,
    resumen: 'Prueba',
    herramientas: ['Python'],
    rol: 'Prueba',
    destacado: false,
    enlaces: {},
    borrador: true,
  });
  const entradas = [
    { id: 'es/c', slug: 'c', data: { ...data, estado: 'archivado' as const } },
    { id: 'es/b', slug: 'b', data },
    {
      id: 'es/a',
      slug: 'a',
      data: {
        ...data,
        destacado: true,
        orden_destacado: 1,
      },
    },
  ];
  const orden = ordenarProyectos(entradas);
  const adyacentes = orden.map((p, i) => ({
    slug: p.slug,
    anterior: orden[i - 1]?.slug,
    siguiente: orden[i + 1]?.slug,
  }));
  expect(adyacentes).toEqual([
    { slug: 'a', anterior: undefined, siguiente: 'b' },
    { slug: 'b', anterior: 'a', siguiente: 'c' },
    { slug: 'c', anterior: 'b', siguiente: undefined },
  ]);
  expect(entradas[0].slug).toBe('c');
});
