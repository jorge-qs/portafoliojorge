import { IDIOMA_BASE, IDIOMAS_ACTIVOS, type Idioma } from './config';

export function idiomaDe(astro: { currentLocale?: string }): Idioma {
  const locale = astro.currentLocale;
  return locale && IDIOMAS_ACTIVOS.includes(locale as Idioma)
    ? (locale as Idioma)
    : IDIOMA_BASE;
}
