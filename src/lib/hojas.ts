/** Diálogo nativo para aislamiento modal; ciclo de foco explícito y restauración. */
export function iniciarHojas() {
  document
    .querySelectorAll<HTMLDialogElement>('[data-hoja]')
    .forEach((hoja) => {
      let disparador: HTMLElement | null = null;
      let y = 0;
      const previos = new Map<HTMLElement, boolean>();
      const cerrar = () => hoja.close();
      document
        .querySelectorAll<HTMLButtonElement>(`[aria-controls="${hoja.id}"]`)
        .forEach((boton) => {
          boton.addEventListener('click', () => {
            disparador = boton;
            y = scrollY;
            hoja.inert = false;
            hoja.showModal();
            boton.setAttribute('aria-expanded', 'true');
            // Aísla también hermanos cuando el diálogo está dentro de un layout.
            let nivel: HTMLElement = hoja;
            while (nivel.parentElement) {
              for (const hermano of nivel.parentElement.children) {
                if (hermano instanceof HTMLElement && hermano !== nivel) {
                  previos.set(hermano, hermano.inert);
                  hermano.inert = true;
                }
              }
              nivel = nivel.parentElement;
              if (nivel === document.body) break;
            }
            document.body.style.top = `-${y}px`;
            document.body.classList.add('menu-abierto');
            hoja.querySelector<HTMLElement>('button, a[href]')?.focus();
          });
        });
      hoja
        .querySelector('[data-cerrar-hoja]')
        ?.addEventListener('click', cerrar);
      hoja.addEventListener('cancel', (event) => {
        event.preventDefault();
        cerrar();
      });
      hoja.addEventListener('close', () => {
        hoja.inert = true;
        previos.forEach((inert, el) => {
          el.inert = inert;
        });
        previos.clear();
        document.body.classList.remove('menu-abierto');
        document.body.style.removeProperty('top');
        window.scrollTo({ top: y, behavior: 'instant' });
        disparador?.setAttribute('aria-expanded', 'false');
        if (hoja.dataset.devolverFoco !== 'false')
          disparador?.focus({ preventScroll: true });
        delete hoja.dataset.devolverFoco;
      });
      hoja.addEventListener('keydown', (event) => {
        if (event.key !== 'Tab') return;
        const items = [
          ...hoja.querySelectorAll<HTMLElement>(
            'button:not([disabled]), a[href], input:not([disabled]), [tabindex="0"]',
          ),
        ].filter((el) => !el.hidden && el.tabIndex >= 0);
        const primero = items[0],
          ultimo = items.at(-1);
        if (event.shiftKey && document.activeElement === primero) {
          event.preventDefault();
          ultimo?.focus();
        } else if (!event.shiftKey && document.activeElement === ultimo) {
          event.preventDefault();
          primero?.focus();
        }
      });
      hoja
        .querySelectorAll<HTMLAnchorElement>('[data-capitulo]')
        .forEach((enlace) => {
          enlace.addEventListener('click', () => {
            cerrar();
            const destino = document.getElementById(
              decodeURIComponent(enlace.hash.slice(1)),
            );
            requestAnimationFrame(() => {
              destino?.focus({ preventScroll: true });
            });
          });
        });
      matchMedia('(min-width: 1200px)').addEventListener('change', (e) => {
        if (e.matches && hoja.open) cerrar();
      });
    });
}
