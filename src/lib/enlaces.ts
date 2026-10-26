export function esPlaceholder(valor: string) {
  return /‹[^‹›]+›/u.test(valor);
}

export function destinoPerfil(valor: string, correo = false) {
  if (esPlaceholder(valor)) return '#';
  return correo ? `mailto:${valor}` : valor;
}
