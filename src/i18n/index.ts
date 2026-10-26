import es from './es.json';
import en from './en.json';
import { IDIOMA_BASE, type Idioma } from './config';

const mensajes: Record<Idioma, Record<string, string>> = { es, en };

export function t(
  idioma: Idioma,
  clave: string,
  vars: Record<string, string | number> = {},
) {
  const mensaje = mensajes[idioma][clave];
  if (mensaje === undefined)
    throw new Error(`Clave i18n inexistente: ${idioma}.${clave}`);
  return mensaje.replace(/\{(\w+)\}/g, (_, nombre: string) => {
    if (!(nombre in vars))
      throw new Error(`Variable i18n ausente: ${clave}.${nombre}`);
    return typeof vars[nombre] === 'number'
      ? new Intl.NumberFormat(idioma).format(vars[nombre])
      : vars[nombre];
  });
}

export function ruta(idioma: Idioma, camino = '/') {
  const normalizado = `/${camino.replace(/^\/+/, '')}`;
  return idioma === IDIOMA_BASE ? normalizado : `/${idioma}${normalizado}`;
}

export function rutaEquivalente(rutaActual: string, idiomaDestino: Idioma) {
  const sinIdioma = rutaActual.replace(/^\/en(?=\/|$)/, '') || '/';
  return ruta(idiomaDestino, sinIdioma);
}

export function formatearFecha(idioma: Idioma, fecha: string | Date) {
  return new Intl.DateTimeFormat(idioma, {
    dateStyle: 'long',
    timeZone: 'UTC',
  }).format(new Date(fecha));
}
