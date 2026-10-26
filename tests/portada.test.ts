import { expect, test } from 'vitest';
import { perfilSchema } from '../src/content/esquemas';
import { recuentosTipos, proyectosDeHerramienta } from '../src/lib/portada';
import perfil from '../src/content/perfil/es.json';
import tecnologias from '../src/content/tecnologias/es.json';
import { proyectosContenido } from './proyectos-contenido';

const proyectos = proyectosContenido();

test('los recuentos del filtro corresponden al contenido y excluyen archivados', () => {
  expect(recuentosTipos(proyectos)).toEqual({
    todos: 7,
    ing: 3,
    inv: 2,
    hib: 2,
  });
  const archivado = {
    ...proyectos[0],
    data: { ...proyectos[0].data, estado: 'archivado' as const },
  };
  expect(recuentosTipos([...proyectos, archivado])).toEqual(
    recuentosTipos(proyectos),
  );
});

test('cada recuento de herramienta se deriva de proyectos.herramientas, sin normalizar', () => {
  for (const nombre of tecnologias.areas.flatMap((a) => a.herramientas)) {
    expect(proyectosDeHerramienta(proyectos, nombre)).toEqual(
      proyectos.filter((p) => p.data.herramientas.includes(nombre)),
    );
  }
  expect(proyectosDeHerramienta(proyectos, 'PyTorch')).toHaveLength(3);
  expect(proyectosDeHerramienta(proyectos, 'Python')).toHaveLength(7);
  expect(proyectosDeHerramienta(proyectos, 'pytorch')).toEqual([]);
  expect(
    proyectosDeHerramienta(
      proyectos.map((p) => ({
        ...p,
        data: { ...p.data, estado: 'archivado' as const },
      })),
      'Python',
    ),
  ).toEqual([]);
});

test('frase_contacto es obligatoria y la foto es opcional con ruta y alt', () => {
  expect(perfilSchema.parse(perfil).frase_contacto).toBe(
    'Si estás construyendo algo parecido, hablemos.',
  );
  expect(perfil.borrador).toBe(true);
  expect(
    perfilSchema.safeParse({ ...perfil, frase_contacto: '' }).success,
  ).toBe(false);
  expect(
    perfilSchema.safeParse({ ...perfil, frase_contacto: undefined }).success,
  ).toBe(false);
  expect(
    perfilSchema.safeParse({
      ...perfil,
      foto: { ruta: '/foto.webp', alt: 'Retrato de prueba' },
    }).success,
  ).toBe(true);
  expect(
    perfilSchema.safeParse({ ...perfil, foto: { ruta: '/foto.webp', alt: '' } })
      .success,
  ).toBe(false);
});
