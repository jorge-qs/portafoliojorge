import { ruta } from '../i18n';
import type { Idioma } from '../i18n/config';

export const secciones = [
  { id: 'hero', ancla: '', clave: 'seccionHero' },
  { id: 'proyectos', ancla: 'proyectos', clave: 'seccionProyectos' },
  { id: 'indice', ancla: 'indice', clave: 'seccionIndice' },
  { id: 'sobre-mi', ancla: 'sobre-mi', clave: 'seccionSobreMi' },
  { id: 'tecnologias', ancla: 'tecnologias', clave: 'seccionTecnologias' },
  { id: 'notas', ancla: 'notas', clave: 'seccionNotas' },
  { id: 'contacto', ancla: 'contacto', clave: 'seccionContacto' },
] as const;

export function seccionesVisibles(hayNotas: boolean) {
  return secciones
    .filter((seccion) => hayNotas || seccion.id !== 'notas')
    .map((seccion, indice) => ({ ...seccion, numero: indice + 1 }));
}
export type Seccion = ReturnType<typeof seccionesVisibles>[number];

// La barra no sigue el orden de la portada: Notas va antes que Sobre mí (Maqueta 3 § N).
const ordenBarra = ['proyectos', 'notas', 'sobre-mi', 'contacto'];
export function seccionesBarra(hayNotas: boolean) {
  const visibles = seccionesVisibles(hayNotas);
  return ordenBarra.flatMap((id) => visibles.filter((s) => s.id === id));
}

export function enlaceSeccion(idioma: Idioma, ancla: string, portada: boolean) {
  return (
    `${portada ? '' : ruta(idioma)}${ancla ? `#${ancla}` : ''}` || ruta(idioma)
  );
}
