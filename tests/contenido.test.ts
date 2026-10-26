import { describe, expect, test } from 'vitest';
import {
  proyectoSchema,
  tecnologiasSchema,
  perfilSchema,
  notaSchema,
} from '../src/content/esquemas';
import {
  seleccionarDestacados,
  seleccionarProyectos,
  validarRelaciones,
  seleccionarConRespaldo,
  seleccionarRelato,
} from '../src/content/validacion';
import type { EntradaProyecto } from '../src/content/validacion';
import perfil from '../src/content/perfil/es.json';
import tecnologias from '../src/content/tecnologias/es.json';

const proyecto = {
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
const entrada = (id: string, cambios = {}): EntradaProyecto => ({
  id,
  data: proyectoSchema.parse({ ...proyecto, ...cambios }),
});

describe('esquemas', () => {
  test('aceptan la semilla y el estado predeterminado', () => {
    expect(proyectoSchema.parse(proyecto).estado).toBe('terminado');
    expect(perfilSchema.safeParse(perfil).success).toBe(true);
    expect(tecnologiasSchema.safeParse(tecnologias).success).toBe(true);
    expect(
      notaSchema.safeParse({
        titulo: '‹…›',
        fecha: '‹fecha›',
        tipo: '‹…›',
        borrador: true,
      }).success,
    ).toBe(true);
  });
  test('rechazan tipo ausente, año libre, orden fuera de rango y destacados incompletos', () => {
    for (const cambios of [
      { tipo: undefined },
      { anio: 'año' },
      { orden_destacado: 4 },
      { destacado: true },
    ]) {
      expect(
        proyectoSchema.safeParse({ ...proyecto, ...cambios }).success,
      ).toBe(false);
    }
  });
  test('exigen exactamente cinco áreas', () => {
    expect(
      tecnologiasSchema.safeParse({
        ...tecnologias,
        areas: tecnologias.areas.slice(1),
      }).success,
    ).toBe(false);
  });
  test('validan herramientas y órdenes por idioma, con el archivo en el error', () => {
    const catalogos = [{ id: 'es', data: tecnologias }];
    expect(() =>
      validarRelaciones([entrada('es/ejemplo')], catalogos),
    ).not.toThrow();
    expect(() =>
      validarRelaciones(
        [entrada('es/ejemplo', { herramientas: ['Inexistente'] })],
        catalogos,
      ),
    ).toThrow('src/content/proyectos/es/ejemplo.mdx: herramientas');
    const destacados = [
      entrada('es/uno', {
        destacado: true,
        orden_destacado: 1,
      }),
      entrada('es/dos', { orden_destacado: 1 }),
    ];
    expect(() => validarRelaciones(destacados, catalogos)).toThrow(
      'orden_destacado repetido',
    );
    expect(() =>
      validarRelaciones(
        [destacados[0], { ...destacados[0], id: 'en/uno' }],
        catalogos,
      ),
    ).not.toThrow();
  });
});

test('al activar es/en, usa la traducción disponible y respalda las ausentes con el MDX español', () => {
  const entradas = [
    entrada('es/uno'),
    entrada('es/dos'),
    entrada('en/dos', { titulo: 'Example' }),
  ];
  const resultado = seleccionarProyectos(entradas, 'en', ['es', 'en']);
  expect(resultado).toHaveLength(2);
  expect(resultado.find((p) => p.slug === 'uno')).toMatchObject({
    id: 'es/uno',
    idioma: 'en',
    esRespaldo: true,
  });
  expect(resultado.find((p) => p.slug === 'dos')).toMatchObject({
    id: 'en/dos',
    esRespaldo: false,
    data: { titulo: 'Example' },
  });
  expect(
    seleccionarProyectos(entradas, 'es', ['es', 'en']).every(
      (p) => !p.esRespaldo,
    ),
  ).toBe(true);
  expect(() => seleccionarProyectos(entradas, 'en', ['es'])).toThrow(
    'Idioma inactivo',
  );
});

test('los archivados conservan su URL pero quedan fuera de los destacados', () => {
  const archivado = entrada('es/uno', {
    destacado: true,
    orden_destacado: 1,
    estado: 'archivado',
  });
  expect(seleccionarProyectos([archivado], 'es', ['es'])).toHaveLength(1);
  expect(seleccionarDestacados([archivado])).toEqual([]);
});

test('el respaldo genérico sirve perfil, tecnologías, portada y hero', () => {
  for (const coleccion of ['perfil', 'tecnologias', 'portada', 'hero']) {
    expect(
      seleccionarConRespaldo(
        [
          { id: 'es', data: 'Spanish' },
          { id: 'en', data: 'English' },
        ],
        'en',
      ),
    ).toMatchObject({ entrada: { data: 'English' }, esRespaldo: false });
    expect(
      seleccionarConRespaldo([{ id: 'es', data: coleccion }], 'en'),
    ).toMatchObject({ entrada: { data: coleccion }, esRespaldo: true });
    expect(
      seleccionarConRespaldo([{ id: 'es', data: coleccion }], 'es'),
    ).toMatchObject({ entrada: { data: coleccion }, esRespaldo: false });
  }
});

test('el relato inglés usa el relato español cuando falta la traducción', () => {
  expect(
    seleccionarRelato(
      [{ id: 'es/relato', data: 'Spanish story' }],
      'relato',
      'en',
    ),
  ).toEqual({
    entrada: { id: 'es/relato', data: 'Spanish story' },
    esRespaldo: true,
  });
});
