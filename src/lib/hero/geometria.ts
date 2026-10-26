import textosHero from '../../content/hero/es.json';

export type Ventana = {
  cx: number;
  cy: number;
  w: number;
  h: number;
  a: number;
  parte: string;
  punta: boolean;
  brazo: boolean;
  texto?: string[];
  dx: number;
  dy: number;
  dr: number;
  ord: number;
};

export type Estrella = {
  x: number;
  y: number;
  z: number;
  color: 'accent' | 'text' | 'muted';
  opacidad: number;
};

export function azar(semilla: number) {
  let s = semilla;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

export function ventanasBase(
  contenido: typeof textosHero = textosHero,
): Ventana[] {
  const R = azar(97);
  const partes: Record<string, [number[][], number[]]> = {
    radius: [
      [
        [-90, 206],
        [392, 230],
      ],
      [62],
    ],
    ulna: [
      [
        [-90, 302],
        [392, 278],
      ],
      [52],
    ],
    thumbM: [
      [
        [470, 204],
        [548, 160],
      ],
      [30],
    ],
    thumb: [
      [
        [556, 154],
        [606, 132],
        [650, 121],
      ],
      [28, 22],
    ],
    m2: [
      [
        [482, 216],
        [612, 202],
      ],
      [38],
    ],
    m3: [
      [
        [484, 243],
        [617, 238],
      ],
      [33],
    ],
    m4: [
      [
        [484, 269],
        [607, 274],
      ],
      [30],
    ],
    m5: [
      [
        [482, 294],
        [587, 307],
      ],
      [26],
    ],
    i: [
      [
        [622, 201],
        [704, 195],
        [764, 193],
        [812, 197],
      ],
      [30, 25, 21],
    ],
    mi: [
      [
        [626, 238],
        [702, 244],
        [750, 262],
        [772, 290],
      ],
      [28, 23, 19],
    ],
    r: [
      [
        [616, 275],
        [700, 298],
        [732, 340],
      ],
      [26, 20],
    ],
    p: [
      [
        [596, 308],
        [660, 336],
        [680, 372],
      ],
      [22, 17],
    ],
  };
  const ventanas: Ventana[] = [];
  for (const [parte, [puntos, grosores]] of Object.entries(partes)) {
    for (let j = 0; j < puntos.length - 1; j += 1) {
      const [x0, y0] = puntos[j];
      const [x1, y1] = puntos[j + 1];
      const largo = Math.hypot(x1 - x0, y1 - y0);
      const angulo = (Math.atan2(y1 - y0, x1 - x0) * 180) / Math.PI;
      ventanas.push({
        cx: (x0 + x1) / 2,
        cy: (y0 + y1) / 2,
        w: (largo - 9) * (1 + (R() - 0.5) * 0.1),
        h: grosores[j] * (1 + (R() - 0.5) * 0.12),
        a: angulo + (R() - 0.5) * 2.4,
        parte,
        punta: parte === 'i' && j === puntos.length - 2,
        brazo: parte === 'radius' || parte === 'ulna',
        dx: 0,
        dy: 0,
        dr: 0,
        ord: 0,
      });
    }
  }
  for (const [x, y, w, h] of [
    [420, 222, 22, 24],
    [424, 250, 22, 24],
    [426, 278, 22, 24],
    [450, 212, 20, 22],
    [452, 240, 20, 22],
    [454, 266, 20, 22],
    [452, 292, 20, 22],
  ]) {
    ventanas.push({
      cx: x,
      cy: y,
      w: w * (1 + (R() - 0.5) * 0.15),
      h,
      a: (R() - 0.5) * 6,
      parte: 'carp',
      punta: false,
      brazo: false,
      dx: 0,
      dy: 0,
      dr: 0,
      ord: 0,
    });
  }
  const ordenTextos = [...ventanas.keys()]
    .filter((indice) => !ventanas[indice].brazo && !ventanas[indice].punta)
    .sort(
      (a, b) => ventanas[b].w * ventanas[b].h - ventanas[a].w * ventanas[a].h,
    );
  ordenTextos.forEach((indice, rango) => {
    ventanas[indice].texto =
      contenido.ventanas[Math.min(rango, contenido.ventanas.length - 1)];
  });
  for (const ventana of ventanas) {
    if (ventana.parte === 'radius') ventana.texto = [...contenido.radio];
    if (ventana.parte === 'ulna') ventana.texto = [...contenido.cubito];
    if (ventana.punta) ventana.texto = contenido.punta;
    const dx0 = ventana.cx - 520;
    const dy0 = ventana.cy - 255;
    const n = Math.hypot(dx0, dy0) || 1;
    const m = 26 + R() * 60;
    ventana.dx = (dx0 / n) * m + (R() - 0.5) * 24;
    ventana.dy = (dy0 / n) * m + (R() - 0.5) * 24;
    ventana.dr = (R() - 0.5) * 16;
    ventana.ord = Math.max(0, Math.min(1, (ventana.cx + 90) / 902));
  }
  return ventanas;
}

export function estrellasBase(
  n: number,
  W: number,
  H: number,
  Mx: number,
  My: number,
  hueco: number,
): Estrella[] {
  const R = azar(61);
  const estrellas: Estrella[] = [];
  for (let i = 0; i < n; i += 1) {
    const oro = R() < 0.06;
    const z = oro ? 2.2 : 1 + R();
    const x = R() * W;
    const y = R() * H;
    const color = oro ? 'accent' : R() < 0.5 ? 'text' : 'muted';
    const opacidad = 0.15 + R() * 0.3;
    if (Math.hypot(x - Mx * W, y - My * H) < 2 * hueco) continue;
    estrellas.push({ x, y, z, color, opacidad });
  }
  return estrellas;
}
