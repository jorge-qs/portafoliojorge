import { esPlaceholder } from './enlaces';
export function iniciarCopias() {
  document.querySelectorAll<HTMLElement>('[data-copia]').forEach((raiz) => {
    const boton = raiz.querySelector('button')!;
    const valor = raiz.dataset.valor!;
    if (!navigator.clipboard || esPlaceholder(valor)) return;
    boton.hidden = false;
    const original = boton.textContent;
    let temporizador: ReturnType<typeof setTimeout>;
    boton.addEventListener('click', async () => {
      clearTimeout(temporizador);
      try {
        await navigator.clipboard.writeText(valor);
        boton.textContent = raiz.dataset.ok!;
        raiz.querySelector('[aria-live]')!.textContent = raiz.dataset.ok!;
        temporizador = setTimeout(() => {
          boton.textContent = original;
        }, 2000);
      } catch {
        boton.textContent = raiz.dataset.error!;
        raiz.querySelector('[aria-live]')!.textContent = raiz.dataset.error!;
        // El valor permanece seleccionable incluso con portapapeles denegado.
        const texto = document.createElement('span');
        texto.textContent = valor;
        texto.className = 'valor-copia';
        raiz.querySelector('.valor-copia')?.remove();
        raiz.append(texto);
      }
    });
  });
}
