export function iniciarArticulo() {
  const raiz = document.documentElement;
  const articulo = document.querySelector<HTMLElement>('[data-articulo]');
  if (!articulo) return;
  function adaptarControles() {
    document
      .querySelectorAll<HTMLElement>(
        '.indice-articulo, .identidad, .panel, .controles-articulo, [data-abrir-menu]',
      )
      .forEach((el) => {
        el.inert = getComputedStyle(el).display === 'none';
      });
  }
  adaptarControles();
  addEventListener('resize', adaptarControles);
  const colorSistema = matchMedia('(prefers-color-scheme: light)');
  let tema = 'cosmos';
  try {
    tema = localStorage.getItem('tema') ?? 'cosmos';
  } catch {
    /* almacenamiento no disponible */
  }
  function aplicarTema() {
    raiz.dataset.theme =
      tema === 'sistema'
        ? colorSistema.matches
          ? 'dawn'
          : 'cosmos'
        : tema === 'dawn'
          ? 'dawn'
          : 'cosmos';
    document
      .querySelectorAll<HTMLButtonElement>('[data-tema]')
      .forEach((b) =>
        b.setAttribute('aria-pressed', String(b.dataset.tema === tema)),
      );
  }
  aplicarTema();
  document.querySelectorAll<HTMLButtonElement>('[data-tema]').forEach((boton) =>
    boton.addEventListener('click', () => {
      raiz.classList.add('cambio-tema');
      // Establecer las propiedades de transición antes de cambiar el color.
      void raiz.offsetWidth;
      tema = boton.dataset.tema!;
      try {
        localStorage.setItem('tema', tema);
      } catch {
        /* preferencia solo en memoria */
      }
      aplicarTema();
    }),
  );
  colorSistema.addEventListener('change', aplicarTema);
  const movimiento = document.querySelector<HTMLInputElement>(
    '[data-reducir-movimiento]',
  );
  if (movimiento) {
    movimiento.checked = raiz.dataset.movimiento === 'reducido';
    movimiento.addEventListener('change', () => {
      if (movimiento.checked) raiz.dataset.movimiento = 'reducido';
      else delete raiz.dataset.movimiento;
      try {
        localStorage.setItem(
          'movimiento',
          movimiento.checked ? 'reducido' : 'sistema',
        );
      } catch {
        /* preferencia solo en memoria */
      }
    });
  }
  // Scroll y teclado respetan también la reducción guardada por el usuario.
  document.addEventListener(
    'click',
    (event) => {
      const enlace =
        event.target instanceof Element
          ? event.target.closest<HTMLAnchorElement>('a[data-capitulo]')
          : null;
      if (!enlace) return;
      // El hash llega codificado (#8--evaluaci%C3%B3n): sin decodificar no se
      // encuentra el capítulo y la página no se mueve.
      const destino = document.getElementById(
        decodeURIComponent(enlace.hash.slice(1)),
      );
      if (!destino) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      const hoja = enlace.closest<HTMLDialogElement>('dialog');
      const navegar = () => {
        history.pushState(null, '', enlace.hash);
        destino.scrollIntoView({
          behavior:
            raiz.dataset.movimiento === 'reducido' ||
            raiz.hasAttribute('data-teclado') ||
            matchMedia('(prefers-reduced-motion: reduce)').matches
              ? 'instant'
              : 'smooth',
        });
        destino.focus({ preventScroll: true });
      };
      if (hoja) {
        hoja.dataset.devolverFoco = 'false';
        hoja.addEventListener('close', navegar, { once: true });
        hoja.close();
      } else navegar();
    },
    true,
  );
  const titulos = [
    ...articulo.querySelectorAll<HTMLElement>('h2[id]:not(dialog h2)'),
  ];
  let observador: IntersectionObserver;
  function activo() {
    let indice = 0;
    const linea = parseFloat(
      getComputedStyle(raiz).getPropertyValue('--anchor-offset'),
    );
    // Tolerancia de 2 px: tras saltar a un ancla, el título queda en la línea
    // (72,x px) y debe contar como alcanzado.
    for (const [i, titulo] of titulos.entries())
      if (titulo.getBoundingClientRect().top <= linea + 2) indice = i;
    const id = titulos[indice]?.id;
    document
      .querySelectorAll<HTMLAnchorElement>('[data-capitulo]')
      .forEach((a) => {
        if (a.dataset.capitulo === id)
          a.setAttribute('aria-current', 'location');
        else a.removeAttribute('aria-current');
      });
    document.querySelectorAll('[data-cuenta-capitulos]').forEach((el) => {
      el.textContent = `${new Intl.NumberFormat(raiz.lang).format(indice + 1)}/${new Intl.NumberFormat(raiz.lang).format(titulos.length)}`;
    });
  }
  function observar() {
    observador?.disconnect();
    observador = new IntersectionObserver(activo, {
      rootMargin: `-${innerHeight * 0.4}px 0px -${innerHeight * 0.6 - 1}px 0px`,
    });
    titulos.forEach((titulo) => observador.observe(titulo));
    activo();
  }
  observar();
  const progreso = document.querySelector<HTMLElement>(
    '[data-progreso-lectura]',
  );
  function actualizar() {
    const rect = articulo!.getBoundingClientRect();
    const nav = parseFloat(getComputedStyle(raiz).getPropertyValue('--nav-h'));
    const disponible = Math.max(1, rect.height - innerHeight + nav);
    const valor = Math.max(0, Math.min(1, (nav - rect.top) / disponible));
    if (progreso) progreso.style.transform = `scaleX(${valor})`;
    activo();
  }
  addEventListener('scroll', actualizar, { passive: true });
  addEventListener('resize', () => {
    observar();
    actualizar();
  });
  actualizar();
  // Conserva el filtro usado al abandonar el índice, sin depender de F2.
  const referencia = document.referrer ? new URL(document.referrer) : null;
  const filtro =
    new URLSearchParams(location.search).get('tipo') ??
    (referencia?.origin === location.origin
      ? referencia.searchParams.get('tipo')
      : null);
  if (filtro && ['ing', 'inv', 'hib'].includes(filtro)) {
    document
      .querySelectorAll<HTMLAnchorElement>(
        '[data-enlace-proyectos], .miga a, .volver-indice, [data-anterior], [data-siguiente]',
      )
      .forEach((a) => {
        const url = new URL(a.href);
        url.searchParams.set('tipo', filtro);
        a.href = url.href;
      });
  }
}
