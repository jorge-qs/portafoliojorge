export function iniciarHerramientas() {
  document
    .querySelectorAll<HTMLElement>('[data-evidencia-mensaje]')
    .forEach((raiz) => {
      const botones = [
        ...raiz.querySelectorAll<HTMLButtonElement>('[data-herramienta]'),
      ];
      botones.forEach((boton) =>
        boton.addEventListener('click', () => {
          const nombre = boton.dataset.herramienta!;
          botones.forEach((b) =>
            b.setAttribute('aria-pressed', String(b === boton)),
          );
          let n = 0;
          raiz
            .querySelectorAll<HTMLElement>('[data-herramientas]')
            .forEach((tarjeta) => {
              const activa = (
                JSON.parse(tarjeta.dataset.herramientas!) as string[]
              ).includes(nombre);
              tarjeta.classList.toggle('activa', activa);
              if (activa) n++;
            });
          raiz.querySelector('[data-anuncio-herramienta]')!.textContent =
            raiz.dataset
              .evidenciaMensaje!.replace('{herramienta}', nombre)
              .replace(
                '{n}',
                new Intl.NumberFormat(document.documentElement.lang).format(n),
              );
        }),
      );
    });
}
