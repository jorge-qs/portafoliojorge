import { t } from '../i18n';
import { activarDiagrama } from './diagrama-interactivo';
import type { ModeloDiagrama } from './diagrama';
export function iniciarDiagramasArticulo() {
  document
    .querySelectorAll<HTMLElement>('[data-diagrama-articulo]')
    .forEach((raiz) => {
      const modelo = JSON.parse(raiz.dataset.modelo!) as ModeloDiagrama;
      let actual = modelo.nodos.findIndex((n) => n.id === modelo.seleccionado);
      const anterior = raiz.querySelector<HTMLButtonElement>(
        '[data-componente-anterior]',
      )!;
      const siguiente = raiz.querySelector<HTMLButtonElement>(
        '[data-componente-siguiente]',
      )!;
      const cuenta = raiz.querySelector('dialog h2')!;
      cuenta.setAttribute('data-cuenta-componente', '');
      cuenta.setAttribute('aria-live', 'polite');
      const control = activarDiagrama(raiz, {
        modelo,
        panel: 'fijo',
        alCambiar(nodo) {
          if (!nodo) return;
          actual = modelo.nodos.indexOf(nodo);
          const nf = new Intl.NumberFormat(document.documentElement.lang);
          cuenta.textContent = raiz.dataset
            .cuenta!.replace('{n}', nf.format(actual + 1))
            .replace('{total}', nf.format(modelo.nodos.length));
          anterior.disabled = actual === 0;
          siguiente.disabled = actual === modelo.nodos.length - 1;
        },
      });
      anterior.addEventListener('click', () =>
        control.seleccionar(modelo.nodos[actual - 1].id),
      );
      siguiente.addEventListener('click', () =>
        control.seleccionar(modelo.nodos[actual + 1].id),
      );
      raiz.querySelector<HTMLButtonElement>(
        '[data-explorar-diagrama]',
      )!.hidden = false;
      const movil = matchMedia('(max-width: 767px)');
      const adaptar = () => {
        raiz.querySelector<HTMLElement>('.diagrama-botones')!.inert =
          movil.matches;
        const panel = raiz.querySelector<HTMLElement>('.panel')!;
        panel.inert = movil.matches;
        if (movil.matches)
          raiz
            .querySelector<HTMLDialogElement>('dialog')!
            .querySelector('[data-cerrar-hoja]')!.textContent = t(
            document.documentElement.lang === 'en' ? 'en' : 'es',
            'interaccion.cerrar',
          );
      };
      adaptar();
      movil.addEventListener('change', adaptar);
    });
}
