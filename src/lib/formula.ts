/** data-termino en la figura asociada utiliza el mismo índice que las píldoras.
 * La asignación semántica pertenece al contenido, no se deduce de una serie A/B. */
export function iniciarFormulas() {
  document
    .querySelectorAll<HTMLElement>('[data-formula]')
    .forEach((formula) => {
      formula
        .querySelectorAll<HTMLButtonElement>('[data-elegir-termino]')
        .forEach((boton) => {
          boton.addEventListener('click', () => {
            const termino = boton.dataset.elegirTermino!;
            formula
              .querySelectorAll('[data-elegir-termino]')
              .forEach((b) =>
                b.setAttribute('aria-pressed', String(b === boton)),
              );
            const definicion = formula.querySelector(
              `[data-definicion="${termino}"]`,
            );
            formula.querySelector('[data-definicion-activa]')!.textContent =
              definicion?.textContent ?? '';
            const ambito = formula.closest('article') ?? document;
            ambito
              .querySelectorAll<HTMLElement>('[data-termino]')
              .forEach((elemento) => {
                elemento.classList.toggle(
                  'termino-activo',
                  elemento.dataset.termino === termino,
                );
              });
          });
        });
    });
}
