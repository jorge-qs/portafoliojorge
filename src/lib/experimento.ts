import { generarHistograma } from './datos-sinteticos';
export function iniciarExperimentos() {
  document
    .querySelectorAll<HTMLElement>('[data-experimento]')
    .forEach((raiz) => {
      const rango = raiz.querySelector<HTMLInputElement>('input')!;
      const comparar = [
        ...raiz.querySelectorAll<HTMLButtonElement>('.comparar button'),
      ];
      const restablecer = raiz.querySelector<HTMLButtonElement>(
        '.controles > button',
      )!;
      let ambos = true;
      raiz
        .querySelectorAll<
          HTMLInputElement | HTMLButtonElement | HTMLFieldSetElement
        >('[disabled]')
        .forEach((el) => (el.disabled = false));
      raiz.querySelector('[data-proximamente]')?.remove();
      rango.removeAttribute('aria-describedby');
      function actualizar() {
        const datos = generarHistograma(7, 32, Number(rango.value));
        raiz.querySelector('output')!.textContent = new Intl.NumberFormat(
          document.documentElement.lang,
        ).format(Number(rango.value));
        for (const serie of ['a', 'b'] as const) {
          raiz
            .querySelectorAll<SVGRectElement>(`.serie-${serie}`)
            .forEach((barra, i) => {
              barra.setAttribute('height', String(datos[i][serie] * 2.3));
              barra.setAttribute('y', String(240 - datos[i][serie] * 2.3));
              barra.style.display = serie === 'b' && !ambos ? 'none' : '';
            });
        }
        comparar.forEach((boton, i) =>
          boton.setAttribute('aria-pressed', String(i === (ambos ? 1 : 0))),
        );
      }
      rango.addEventListener('input', actualizar);
      comparar.forEach((boton, i) =>
        boton.addEventListener('click', () => {
          ambos = i === 1;
          actualizar();
        }),
      );
      restablecer.addEventListener('click', () => {
        rango.value = '0.7';
        ambos = true;
        actualizar();
      });
      // No se recalcula al iniciar: el build ya usa la misma función y semilla.
    });
}
