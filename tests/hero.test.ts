import { describe, expect, it } from 'vitest';
import { estrellasBase, ventanasBase } from '../src/lib/hero/geometria';
import { composicion } from '../src/lib/hero/composicion';
import {
  capas,
  cursorVisible,
  entrada,
  transicion,
} from '../src/lib/hero/animacion';

describe('geometría del hero', () => {
  it('genera las 26 ventanas de forma determinista', () => {
    expect(ventanasBase()).toHaveLength(26);
    expect(ventanasBase()).toEqual(ventanasBase());
  });

  it('conserva la punta y sus textos de referencia', () => {
    const ventanas = ventanasBase();
    const punta = ventanas.find((ventana) => ventana.punta);
    expect(punta).toMatchObject({
      cx: (764 + 812) / 2,
      cy: (193 + 197) / 2,
      texto: ['coder', 'edit agent.py'],
    });
    expect(punta).toBeDefined();
    expect(
      ventanas.find((ventana) => ventana.parte === 'radius')?.texto?.[0],
    ).toBe('traza · run 4f2a');
    expect(
      ventanas.find((ventana) => ventana.parte === 'ulna')?.texto?.[0],
    ).toBe('memoria · episodios');
    expect(
      ventanas.every((ventana) => ventana.ord >= 0 && ventana.ord <= 1),
    ).toBe(true);
  });

  it('descarta las estrellas dentro del círculo de encuentro sin reponerlas', () => {
    const estrellas = estrellasBase(60, 1280, 800, 0.53, 0.43, 56);
    expect(estrellas.length).toBeLessThan(60);
    expect(
      estrellas.every(
        ({ x, y }) => Math.hypot(x - 0.53 * 1280, y - 0.43 * 800) >= 112,
      ),
    ).toBe(true);
  });

  it.each([
    [1280, 800],
    [1440, 900],
    [1920, 1080],
    [1024, 768],
    [834, 1112],
    [768, 1024],
    [390, 844],
    [360, 640],
    [844, 390],
  ])('compone las manos desde M en %i × %i', (ancho, alto) => {
    const c = composicion(ancho, alto);
    expect(c.manoArtificial.puntaX).toBeCloseTo(c.Mx - c.hueco / 2, 8);
    expect(c.manoArtificial.puntaY).toBeCloseTo(c.My, 8);
    expect(c.hueco).toBeGreaterThanOrEqual(20);
    expect(c.manoArtificial.puntaAlto).toBeGreaterThanOrEqual(8);
    expect(c.circuloDentro).toBe(true);
  });

  it('porta las fórmulas de entrada, transición y cursor', () => {
    const ventana = { ord: 1, dx: 30, dy: -40, dr: 8, a: 12 };
    expect(entrada(2.6, ventana).opacidad).toBe(1);
    expect(transicion(0, ventana).opacidad).toBe(1);
    expect(transicion(1, ventana).opacidad).toBeCloseTo(0.08, 10);
    expect(transicion(1, ventana, 2.6, true)).toMatchObject({
      translateX: 15,
      translateY: -20,
      giro: 20,
    });
    expect(cursorVisible(2.0, 0)).toBe(false);
    expect(cursorVisible(2.2, 0)).toBe(true);
    expect(capas(2.6, 1).anticipo.opacidad).toBe(1);
    expect(capas(2.6, 1).texto.opacidad).toBe(0);
  });
});
