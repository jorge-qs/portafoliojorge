/** Comportamiento global de F1. F5 podrá aplicar data-estado="relato" + inert. */
export function iniciarNavegacion() {
  const barra = document.querySelector<HTMLElement>('[data-barra-global]');
  const menu = document.querySelector<HTMLDialogElement>('#menu-movil');
  const abrir = document.querySelector<HTMLButtonElement>('[data-abrir-menu]');
  if (!barra || !menu || !abrir) return;
  const raiz = document.documentElement;
  const reducir = matchMedia('(prefers-reduced-motion: reduce)');
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  let navegando = false;
  let ultimoY = scrollY;
  let scrollMenu = 0;
  let operacionAncla = 0;
  const inertes = new Map<HTMLElement, boolean>();

  function mostrarBarra() {
    barra!.removeAttribute('data-oculta');
    barra!.inert = barra!.dataset.estado === 'relato';
  }

  function actualizarProyectos() {
    if (!hero) return;
    const enlace = barra!.querySelector<HTMLAnchorElement>(
      '[data-enlace-proyectos]',
    );
    if (enlace)
      enlace.setAttribute(
        'href',
        barra!.dataset.estado === 'hero' ? '#proyectos' : '#indice',
      );
  }

  if (hero) {
    // F5 · estado de barra según el borde superior, también al cargar con hash.
    const relatos = Array.from(
      document.querySelectorAll<HTMLElement>('[data-relato]'),
    );
    function actualizarContexto() {
      const enRelato = relatos.some((relato) => {
        const caja = relato.getBoundingClientRect();
        return (
          caja.top <= parseFloat(getComputedStyle(raiz).scrollPaddingTop) &&
          caja.bottom >
            parseFloat(getComputedStyle(raiz).scrollPaddingTop) + 0.5
        );
      });
      const estado = enRelato
        ? 'relato'
        : hero!.getBoundingClientRect().bottom > 0
          ? 'hero'
          : 'fija';
      if (barra!.dataset.estado === estado) return;
      barra!.dataset.estado = estado;
      mostrarBarra();
      actualizarProyectos();
      ultimoY = scrollY;
    }
    addEventListener('scroll', actualizarContexto, { passive: true });
    addEventListener('resize', actualizarContexto);
    actualizarContexto();

    // Banda justo debajo de la barra, independiente del tamaño de las secciones.
    let observarSecciones: IntersectionObserver;
    function observarActiva() {
      observarSecciones?.disconnect();
      const altoBarra = parseFloat(
        getComputedStyle(raiz).getPropertyValue('--nav-h'),
      );
      observarSecciones = new IntersectionObserver(
        (entradas) => {
          const actual = entradas.find((entrada) => entrada.isIntersecting);
          if (!actual) return;
          const id = (actual.target as HTMLElement).dataset.seccionPortada;
          document
            .querySelectorAll<HTMLAnchorElement>('[data-seccion]')
            .forEach((enlace) => {
              const corresponde =
                enlace.dataset.seccion === id ||
                (enlace.closest('[data-barra-global]') &&
                  enlace.dataset.seccion === 'proyectos' &&
                  id === 'indice');
              if (corresponde) enlace.setAttribute('aria-current', 'location');
              else enlace.removeAttribute('aria-current');
            });
        },
        {
          rootMargin: `-${altoBarra}px 0px -${Math.max(0, innerHeight - altoBarra - 1)}px 0px`,
        },
      );
      document
        .querySelectorAll('[data-seccion-portada]')
        .forEach((seccion) => observarSecciones.observe(seccion));
    }
    observarActiva();
    addEventListener('resize', observarActiva);
  }

  addEventListener(
    'scroll',
    () => {
      const y = scrollY;
      if (
        navegando ||
        menu.open ||
        barra.contains(document.activeElement) ||
        barra.dataset.estado !== 'fija'
      ) {
        ultimoY = y;
        return;
      }
      const delta = y - ultimoY;
      if (delta > 8) {
        barra.setAttribute('data-oculta', '');
        barra.inert = true;
        ultimoY = y;
      } else if (delta < 0) {
        mostrarBarra();
        ultimoY = y;
      }
    },
    { passive: true },
  );

  document.addEventListener('keydown', (evento) => {
    if (
      evento.key === 'Tab' ||
      evento.key.startsWith('Arrow') ||
      evento.key === 'Enter' ||
      evento.key === ' '
    ) {
      raiz.dataset.teclado = '';
      // Permite llegar a la barra aunque estaba oculta e inert al bajar. Solo con
      // Tab: las flechas y el espacio desplazan la página y harían parpadear la barra.
      if (evento.key === 'Tab') mostrarBarra();
    }
  });
  document.addEventListener('pointerdown', () =>
    raiz.removeAttribute('data-teclado'),
  );
  barra.addEventListener('focusin', mostrarBarra);
  new MutationObserver(() => {
    if (barra.dataset.estado === 'relato') barra.inert = true;
    else if (!barra.hasAttribute('data-oculta')) barra.inert = false;
  }).observe(barra, { attributes: true, attributeFilter: ['data-estado'] });

  const pantallaMovil = matchMedia('(max-width: 767px)');
  function sincronizarControles() {
    barra!.querySelectorAll<HTMLElement>('.enlaces, .miga').forEach((el) => {
      el.inert = pantallaMovil.matches;
    });
    abrir!.inert = !pantallaMovil.matches;
  }
  sincronizarControles();
  pantallaMovil.addEventListener('change', sincronizarControles);

  function cerrarMenu(devolverFoco = true) {
    if (!menu!.open) return;
    menu!.close();
    menu!.inert = true;
    abrir!.setAttribute('aria-expanded', 'false');
    for (const [elemento, anterior] of inertes) elemento.inert = anterior;
    inertes.clear();
    document.body.classList.remove('menu-abierto');
    document.body.style.removeProperty('top');
    // Evita una restauración suave al desbloquear body, también en iOS.
    window.scrollTo({ top: scrollMenu, behavior: 'instant' });
    ultimoY = scrollMenu;
    if (devolverFoco) abrir!.focus({ preventScroll: true });
  }

  abrir.addEventListener('click', () => {
    mostrarBarra();
    scrollMenu = scrollY;
    document.body.style.top = `-${scrollMenu}px`;
    document.body.classList.add('menu-abierto');
    menu.inert = false;
    menu.showModal();
    abrir.setAttribute('aria-expanded', 'true');
    for (const hijo of document.body.children) {
      if (
        hijo instanceof HTMLElement &&
        hijo !== menu &&
        !hijo.contains(menu)
      ) {
        inertes.set(hijo, hijo.inert);
        hijo.inert = true;
      }
    }
    menu
      .querySelector<HTMLButtonElement>('[data-cerrar-menu]')
      ?.focus({ preventScroll: true });
  });
  menu
    .querySelector('[data-cerrar-menu]')
    ?.addEventListener('click', () => cerrarMenu());
  menu.addEventListener('cancel', (evento) => {
    evento.preventDefault();
    cerrarMenu();
  });
  menu.addEventListener('keydown', (evento) => {
    if (evento.key !== 'Tab') return;
    const elementos = Array.from(
      menu.querySelectorAll<HTMLElement>('a[href], button'),
    ).filter((el) => el.tabIndex >= 0 && !el.hasAttribute('disabled'));
    const primero = elementos[0];
    const ultimo = elementos.at(-1);
    if (evento.shiftKey && document.activeElement === primero) {
      evento.preventDefault();
      ultimo?.focus();
    } else if (!evento.shiftKey && document.activeElement === ultimo) {
      evento.preventDefault();
      primero?.focus();
    }
  });
  matchMedia('(min-width: 768px)').addEventListener('change', (evento) => {
    if (evento.matches) cerrarMenu();
  });

  async function irAncla(hash: string, actualizarUrl: boolean, arriba = false) {
    const destino = document.getElementById(decodeURIComponent(hash.slice(1)));
    if (!destino) return;
    const titulo = arriba
      ? document.querySelector<HTMLElement>('.saltar-contenido')
      : destino.matches('section, [data-relato]')
        ? (destino.querySelector<HTMLElement>('h2, h3') ?? destino)
        : destino;
    if (!titulo) return;
    const operacion = ++operacionAncla;
    navegando = true;
    mostrarBarra();
    if (actualizarUrl && location.hash !== hash)
      history.pushState(null, '', hash);
    const desfase = parseFloat(getComputedStyle(raiz).scrollPaddingTop);
    const top =
      arriba || destino.id === 'contenido'
        ? 0
        : Math.max(0, titulo.getBoundingClientRect().top + scrollY - desfase);
    window.scrollTo({
      top,
      behavior:
        !actualizarUrl ||
        reducir.matches ||
        raiz.dataset.movimiento === 'reducido' ||
        raiz.hasAttribute('data-teclado')
          ? 'instant'
          : 'smooth',
    });
    // Espera a que la posición se estabilice. No depende de una duración arbitraria
    // ni de scrollend, que no se emite si ya estábamos en el destino.
    let anterior = scrollY;
    let quietos = 0;
    const inicio = performance.now();
    await new Promise<void>((resolver) => {
      function comprobar() {
        if (operacion !== operacionAncla) {
          resolver();
          return;
        }
        quietos = Math.abs(scrollY - anterior) < 0.5 ? quietos + 1 : 0;
        anterior = scrollY;
        if (quietos >= 4 || performance.now() - inicio > 5000) resolver();
        else requestAnimationFrame(comprobar);
      }
      requestAnimationFrame(comprobar);
    });
    if (operacion !== operacionAncla) return;
    if (actualizarUrl) titulo.focus({ preventScroll: true });
    // El navegador puede enfocar por sí solo un destino con tabindex al cargar
    // el fragmento. En cargas e historial solo alineamos; el foco es del usuario.
    else if (document.activeElement === titulo) titulo.blur();
    ultimoY = scrollY;
    navegando = false;
    mostrarBarra();
  }

  document.addEventListener('click', (evento) => {
    const enlace =
      evento.target instanceof Element
        ? evento.target.closest<HTMLAnchorElement>('a')
        : null;
    if (!enlace) return;
    if (enlace.getAttribute('aria-disabled') === 'true') {
      evento.preventDefault();
      return;
    }
    if (
      evento.button !== 0 ||
      evento.metaKey ||
      evento.ctrlKey ||
      evento.shiftKey ||
      evento.altKey
    )
      return;
    const url = new URL(enlace.href);
    if (menu.contains(enlace)) cerrarMenu();
    if (
      url.origin !== location.origin ||
      url.pathname !== location.pathname ||
      url.search !== location.search ||
      !url.hash
    )
      return;
    evento.preventDefault();
    void irAncla(url.hash, true, enlace.hasAttribute('data-volver-arriba'));
  });
  addEventListener('hashchange', () => {
    if (location.hash) void irAncla(location.hash, false);
  });
  if (
    location.hash &&
    (
      performance.getEntriesByType(
        'navigation',
      )[0] as PerformanceNavigationTiming
    )?.type !== 'back_forward'
  ) {
    if (document.readyState === 'complete') void irAncla(location.hash, false);
    else
      addEventListener('load', () => void irAncla(location.hash, false), {
        once: true,
      });
  }
}
