import { ventanasBase } from './geometria';

export type ConfiguracionHero = {
  clave: 'd' | 't' | 'm' | 'h';
  W: number;
  H: number;
  mx: number;
  my: number;
  escala: number;
  hueco: number;
  giro: number;
  estrellas: number;
  nombre: number;
  texto: 'esquinas' | 'apilado';
  fijacion: number;
};

const configuraciones: Record<ConfiguracionHero['clave'], ConfiguracionHero> = {
  d: {
    clave: 'd',
    W: 1280,
    H: 800,
    mx: 0.53,
    my: 0.43,
    escala: 1.2,
    hueco: 56,
    giro: -4,
    estrellas: 60,
    nombre: 96,
    texto: 'esquinas',
    fijacion: 0.6,
  },
  t: {
    clave: 't',
    W: 834,
    H: 1112,
    mx: 0.54,
    my: 0.4,
    escala: 0.8,
    hueco: 40,
    giro: -5,
    estrellas: 50,
    nombre: 88,
    texto: 'apilado',
    fijacion: 0.6,
  },
  m: {
    clave: 'm',
    W: 390,
    H: 844,
    mx: 0.55,
    my: 0.37,
    escala: 0.44,
    hueco: 24,
    giro: -6,
    estrellas: 32,
    nombre: 56,
    texto: 'apilado',
    fijacion: 0.4,
  },
  h: {
    clave: 'h',
    W: 834,
    H: 1112,
    mx: 0.52,
    my: 0.46,
    escala: 0.8,
    hueco: 40,
    giro: -5,
    estrellas: 50,
    nombre: 48,
    texto: 'apilado',
    fijacion: 0.6,
  },
};

export function configuracion(ancho: number, alto: number) {
  if (alto < 560) return configuraciones.h;
  if (ancho >= 1200) return configuraciones.d;
  if (ancho >= 768) return configuraciones.t;
  return configuraciones.m;
}

export function composicion(ancho: number, alto: number) {
  const config = configuracion(ancho, alto);
  const altoPunta = ventanasBase().find((ventana) => ventana.punta)!.h;
  const Mx = config.mx * ancho;
  const My = config.my * alto;
  const k = (1.45 * config.escala) / 1.15;
  const circulo = {
    left: Mx - config.hueco * 2,
    top: My - config.hueco * 2,
    right: Mx + config.hueco * 2,
    bottom: My + config.hueco * 2,
  };
  return {
    ...config,
    ancho,
    alto,
    Mx,
    My,
    manoArtificial: {
      left: Mx - config.hueco / 2 - 812,
      top: My - 197,
      width: 1000,
      height: 460,
      originX: 812,
      originY: 197,
      puntaX: Mx - config.hueco / 2,
      puntaY: My,
      puntaAlto: altoPunta * config.escala,
      escala: config.escala,
      giro: config.giro,
    },
    manoHumana: {
      left: Mx + config.hueco / 2 - 14 * k,
      top: My + 6 * config.escala - 170 * k,
      width: 540 * k,
      height: 320 * k,
      escala: k,
      puntaX: Mx + config.hueco / 2,
      puntaY: My + 6 * config.escala,
    },
    circulo,
    estrellasLienzo: { width: config.W, height: config.H },
    fijacionPx: config.fijacion * alto,
    minimaHueco: config.hueco >= 20,
    minimaPunta: altoPunta * config.escala >= 8,
    circuloDentro:
      circulo.left >= 0 &&
      circulo.top >= 0 &&
      circulo.right <= ancho &&
      circulo.bottom <= alto,
  };
}
