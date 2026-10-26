import { test, expect } from 'vitest';
import { coincideTipo, filtroDeURL } from '../src/lib/filtro';
import { aristasDeNodo, vecinosDeNodo } from '../src/lib/diagrama';
import { generarHistograma } from '../src/lib/datos-sinteticos';
import { diagrama } from '../src/content/articulos/semilla';

test('filtro: tipos, Todos y query válida o desconocida', () => {
  for (const tipo of ['ing', 'inv', 'hib'] as const) {
    expect(
      filtroDeURL(new URL(`https://example.test/?tipo=${tipo}#indice`)),
    ).toBe(tipo);
    for (const candidato of ['ing', 'inv', 'hib']) {
      expect(coincideTipo(candidato, tipo)).toBe(candidato === tipo);
      expect(coincideTipo(candidato, 'todos')).toBe(true);
    }
  }
  for (const query of ['', '?tipo=', '?tipo=desconocido'])
    expect(filtroDeURL(new URL(`https://example.test/${query}`))).toBe('todos');
});
test('histograma: estado inicial idéntico y restablecimiento sin estado residual', () => {
  const inicial = generarHistograma();
  expect(generarHistograma(7, 32, 0)).toEqual(
    Array.from({ length: 32 }, () => ({ a: 0, b: 0 })),
  );
  expect(generarHistograma(7, 32, 1)).not.toEqual(inicial);
  expect(generarHistograma(7, 32, 0.7)).toEqual(inicial);
});
test('aristas incidentes y vecinos: ambos extremos, sin falsos positivos', () => {
  expect(aristasDeNodo(diagrama, 'user')).toEqual([['user', 'orq']]);
  expect(vecinosDeNodo(diagrama, 'b')).toEqual(['orq', 'tools']);
  expect(aristasDeNodo(diagrama, 'ausente')).toEqual([]);
  expect(vecinosDeNodo(diagrama, 'orq')).toHaveLength(6);
  expect(diagrama.aristas).toHaveLength(7);
});
