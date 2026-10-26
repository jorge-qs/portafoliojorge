import { readFileSync } from 'node:fs';
import { expect, test } from 'vitest';
import { declaraciones } from './tokens-util';

test('cada token aprobado conserva su valor y contexto, incluidos ambos temas y reduced motion', () => {
  const origen = declaraciones(readFileSync('design/docs/tokens.css', 'utf8'));
  const implementacion = declaraciones(
    readFileSync('src/styles/tokens.css', 'utf8'),
  );
  expect(Object.keys(origen).length).toBeGreaterThan(60);
  for (const [clave, valor] of Object.entries(origen)) {
    expect(implementacion[clave], clave).toBe(valor);
  }
});
