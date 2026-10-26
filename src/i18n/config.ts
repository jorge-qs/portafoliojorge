export const IDIOMA_BASE = 'es';
export const IDIOMAS_ACTIVOS: Idioma[] = ['es', 'en'];
export const IDIOMAS_PREPARADOS = ['es', 'en'] as const;
export type Idioma = (typeof IDIOMAS_PREPARADOS)[number];
