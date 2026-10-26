/** Generación en build y cliente. La semilla fija hace las figuras reproducibles. */
export function generarHistograma(semilla = 7, cantidad = 32, parametro = 0.7) {
  let estado = semilla;
  const azar = () => (estado = (estado * 16807) % 2147483647) / 2147483647;
  const gauss = (x: number, media: number, sigma: number) =>
    Math.exp(-((x - media) ** 2) / (2 * sigma * sigma));
  const redondear = (valor: number) => Math.round(valor * 1e9) / 1e9;
  return Array.from({ length: cantidad }, (_, i) => {
    const x = i / (cantidad - 1);
    // El valor 0,7 es el estado inicial; las envolventes proceden de la maqueta.
    const ruido = 1 + (azar() - 0.5) * 0.01;
    return {
      a: redondear(gauss(x, 0.42, 0.13) * 92 * (parametro / 0.7) * ruido),
      b: redondear(gauss(x, 0.6, 0.18) * 0.8 * 92 * (parametro / 0.7) * ruido),
    };
  });
}
