import type { Ventana } from './geometria';

export function clamp(valor: number) {
  return Math.max(0, Math.min(1, valor));
}

export function ease(valor: number) {
  return 1 - Math.pow(1 - clamp(valor), 3);
}

export function entrada(t: number, ventana: Pick<Ventana, 'ord'>) {
  const e = ease((t - (0.6 + ventana.ord * 0.9)) / 0.35);
  const luz = 0.38 + 0.62 * Math.pow(ventana.ord, 1.3);
  return {
    progreso: e,
    opacidad: luz * e,
    translateY: (1 - e) * 6,
  };
}

export function transicion(
  p: number,
  ventana: Pick<Ventana, 'ord' | 'dx' | 'dy' | 'dr' | 'a'>,
  t = 2.6,
  movil = false,
) {
  const e = entrada(t, ventana).progreso;
  const deriva = movil ? 0.5 : 1;
  return {
    opacidad: entrada(t, ventana).opacidad * (1 - clamp(p) * 0.92),
    translateX: ventana.dx * clamp(p) * deriva,
    translateY: ventana.dy * clamp(p) * deriva + (1 - e) * 6,
    giro: ventana.a + ventana.dr * clamp(p),
  };
}

export function cursorVisible(t: number, p: number) {
  return t >= 1.7 && !(t > 1.9 && t < 2.1) && !(t > 2.3 && t < 2.5) && p < 0.5;
}

export function capas(t: number, p: number) {
  const eh = ease((t - 0.2) / 0.9);
  const eT = ease((t - 1.8) / 0.5);
  const eN = ease((p - 0.5) * 2);
  return {
    estrellas: { opacidad: clamp(t / 0.6), translateY: -40 * p },
    manoHumana: {
      opacidad: eh * (1 - p),
      translateX: (1 - eh) * 28 + p * 110,
    },
    texto: {
      opacidad: eT * (1 - clamp(p * 2)),
      translateY: (1 - eT) * 8 - p * 30,
    },
    anticipo: { opacidad: eN, translateY: (1 - eN) * 40 },
    cursor: cursorVisible(t, p),
  };
}
