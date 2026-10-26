import { expect, test } from 'vitest';
import {
  seccionesVisibles,
  seccionesBarra,
  enlaceSeccion,
} from '../src/config/secciones';
import { esPlaceholder, destinoPerfil } from '../src/lib/enlaces';

test('Notas es condicional y Contacto se renumera sin huecos', () => {
  expect(seccionesVisibles(false).map((s) => [s.id, s.numero])).toEqual([
    ['hero', 1],
    ['proyectos', 2],
    ['indice', 3],
    ['sobre-mi', 4],
    ['tecnologias', 5],
    ['contacto', 6],
  ]);
  expect(seccionesVisibles(true).at(-1)?.numero).toBe(7);
  expect(seccionesVisibles(true).find((s) => s.id === 'notas')?.numero).toBe(6);
});
test('la barra ordena Proyectos · Notas · Sobre mí · Contacto', () => {
  expect(seccionesBarra(true).map((s) => s.id)).toEqual([
    'proyectos',
    'notas',
    'sobre-mi',
    'contacto',
  ]);
  expect(seccionesBarra(false).map((s) => s.id)).toEqual([
    'proyectos',
    'sobre-mi',
    'contacto',
  ]);
});
test('anclas locales y entre páginas respetan las rutas por idioma', () => {
  expect(enlaceSeccion('es', 'indice', true)).toBe('#indice');
  expect(enlaceSeccion('es', 'indice', false)).toBe('/#indice');
  expect(enlaceSeccion('en', 'indice', false)).toBe('/en/#indice');
});
test('los placeholders completos y parciales no generan destinos rotos', () => {
  for (const valor of ['‹…›', 'github.com/‹usuario›', '‹nombre›@‹dominio›']) {
    expect(esPlaceholder(valor)).toBe(true);
    expect(destinoPerfil(valor)).toBe('#');
  }
  expect(destinoPerfil('https://example.com')).toBe('https://example.com');
  expect(destinoPerfil('hola@example.com', true)).toBe(
    'mailto:hola@example.com',
  );
});
