/** Contador por contexto de render, sin estado compartido entre páginas. */
const bloques = new WeakMap<object, Map<string, number>>();
export function siguienteBloque(contexto: object, tipo: 'codigo' | 'tabla') {
  let contadores = bloques.get(contexto);
  if (!contadores) {
    contadores = new Map();
    bloques.set(contexto, contadores);
  }
  const numero = (contadores.get(tipo) ?? 0) + 1;
  contadores.set(tipo, numero);
  return numero;
}
