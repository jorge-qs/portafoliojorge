import type { Relato } from '../content/esquemas';
import type { EstadoFiguraRelato } from './diagrama';
import { bloquesRelato } from './relato-estado';
import { activarDiagrama } from './diagrama-interactivo';

export function iniciarRelatos() {
  document
    .querySelectorAll<HTMLElement>('[data-relato]')
    .forEach(activarRelato);
}

function activarRelato(raiz: HTMLElement) {
  if (raiz.hasAttribute('data-mejorado')) return;
  const datos = JSON.parse(
    raiz.querySelector('[data-relato-datos]')!.textContent!,
  ) as Relato;
  const bloques = Array.from(
    raiz.querySelectorAll<HTMLElement>('[data-relato-bloque]'),
  );
  const estados = bloquesRelato(datos);
  const figura = raiz.querySelector<HTMLElement>('[data-relato-fija]')!;
  const visual = raiz.querySelector<HTMLElement>('[data-relato-visual]')!;
  const equivalente = raiz.querySelector<HTMLElement>('[data-relato-texto]')!;
  const svg = visual.querySelector<SVGSVGElement>('.diagrama-svg')!;
  const dibujo = visual.querySelector<HTMLElement>('[data-relato-figura]')!;
  const pista = raiz.querySelector<HTMLElement>('[data-relato-pista]')!;
  const reducir = matchMedia('(prefers-reduced-motion: reduce)');
  const botones = Array.from(
    raiz.querySelectorAll<HTMLButtonElement>('[data-relato-ir]'),
  );
  let actual = -1;
  let animacion = 0;
  let topologia: EstadoFiguraRelato = {};
  let texto = false;
  const posiciones = Object.fromEntries(
    datos.diagrama.nodos.map((n) => [n.id, { x: n.x, y: n.y }]),
  );

  function pintar(estado: EstadoFiguraRelato, inmediato: boolean) {
    cancelAnimationFrame(animacion);
    const inicio = performance.now();
    const duracion =
      inmediato ||
      reducir.matches ||
      document.documentElement.hasAttribute('data-teclado')
        ? 0
        : parseFloat(getComputedStyle(raiz).getPropertyValue('--dur-layout'));
    const origen = structuredClone(posiciones);
    const destino = Object.fromEntries(
      datos.diagrama.nodos.map((n) => [
        n.id,
        estado.posiciones?.[n.id] ?? { x: n.x, y: n.y },
      ]),
    );
    svg.querySelectorAll<SVGGElement>('[data-nodo]').forEach((nodo) => {
      const id = nodo.dataset.nodo!;
      nodo.dataset.estado = estado.atenuados?.includes(id)
        ? 'atenuado'
        : estado.recorrido?.includes(id)
          ? 'recorrido'
          : 'reposo';
    });
    function fotograma(ahora: number) {
      const avance = duracion ? Math.min(1, (ahora - inicio) / duracion) : 1;
      // Ease-out del token: resolver x(t) y evaluar y(t), sin otra curva CSS.
      const curva = getComputedStyle(raiz)
        .getPropertyValue('--ease-out')
        .match(/[\d.]+/g)
        ?.map(Number) ?? [0, 0, 1, 1];
      const bezier = (t: number, a: number, b: number) =>
        3 * (1 - t) ** 2 * t * a + 3 * (1 - t) * t * t * b + t ** 3;
      let bajo = 0,
        alto = 1;
      for (let i = 0; i < 12; i++) {
        const medio = (bajo + alto) / 2;
        if (bezier(medio, curva[0], curva[2]) < avance) bajo = medio;
        else alto = medio;
      }
      const proporcion =
        avance === 1 ? 1 : bezier((bajo + alto) / 2, curva[1], curva[3]);
      for (const [id, punto] of Object.entries(destino)) {
        posiciones[id] = {
          x: origen[id].x + (punto.x - origen[id].x) * proporcion,
          y: origen[id].y + (punto.y - origen[id].y) * proporcion,
        };
      }
      svg.querySelectorAll<SVGGElement>('[data-nodo]').forEach((nodo) => {
        const p = posiciones[nodo.dataset.nodo!];
        nodo.style.transform = `translate(${p.x}px, ${p.y}px)`;
      });
      svg.querySelectorAll<SVGLineElement>('[data-arista]').forEach((linea) => {
        const [a, b] = linea.dataset.arista!.split(':');
        linea.setAttribute('x1', String(posiciones[a].x));
        linea.setAttribute('y1', String(posiciones[a].y));
        linea.setAttribute('x2', String(posiciones[b].x));
        linea.setAttribute('y2', String(posiciones[b].y));
        const incluye = (aristas?: [string, string][]) =>
          aristas?.some(
            ([x, y]) => (a === x && b === y) || (a === y && b === x),
          );
        linea.style.opacity =
          estado.aristasVisibles && !incluye(estado.aristasVisibles)
            ? '0'
            : '1';
        linea.classList.toggle(
          'resaltada',
          incluye(estado.aristasResaltadas) ?? false,
        );
      });
      if (avance < 1) animacion = requestAnimationFrame(fotograma);
    }
    fotograma(inicio);
    topologia = estado;
  }

  function activar(indice: number, inmediato = false) {
    if (indice === actual && !inmediato) return;
    actual = indice;
    // El nuevo estado repinta los nodos: la ficha abierta dejaría de corresponder.
    interaccion.cerrar(false);
    const bloque = estados[indice];
    raiz.dataset.capituloActivo = String(bloque.capitulo);
    raiz.dataset.pasoActivo = String(bloque.paso);
    botones.forEach((boton, i) => {
      if (i + 1 === bloque.capitulo) boton.setAttribute('aria-current', 'step');
      else boton.removeAttribute('aria-current');
    });
    raiz.querySelector('[data-relato-caption]')!.textContent =
      datos.capitulos[bloque.capitulo - 1].leyenda;
    visual.querySelector<HTMLElement>(
      '[data-visual-capitulo]',
    )!.dataset.visualCapitulo = String(bloque.capitulo);
    pintar(bloque.estado, inmediato);
    actualizarInteraccion();
  }
  function actualizar() {
    // Último en orden del documento, independiente del orden de las entradas IO.
    const umbral = innerHeight * 0.4;
    let indice = 0;
    bloques.forEach((bloque, i) => {
      if (bloque.getBoundingClientRect().top <= umbral) indice = i;
    });
    activar(indice);
  }
  let observador: IntersectionObserver;
  function observar() {
    observador?.disconnect();
    const linea = Math.round(innerHeight * 0.4);
    observador = new IntersectionObserver(actualizar, {
      rootMargin: `-${linea}px 0px -${Math.max(0, innerHeight - linea - 1)}px 0px`,
    });
    bloques.forEach((bloque) => observador.observe(bloque));
    actualizar();
  }
  botones.forEach((boton) =>
    boton.addEventListener('click', () => {
      const capitulo = Number(boton.dataset.relatoIr);
      const destino = bloques.find(
        (b) => Number(b.dataset.capitulo) === capitulo,
      )!;
      const top = Math.max(
        raiz.getBoundingClientRect().top + scrollY,
        destino.getBoundingClientRect().top +
          scrollY -
          innerHeight * 0.4 +
          parseFloat(getComputedStyle(raiz).getPropertyValue('--space-4')),
      );
      history.pushState(null, '', `#${raiz.id}-capitulo-${capitulo}`);
      window.scrollTo({
        top,
        behavior:
          reducir.matches ||
          document.documentElement.hasAttribute('data-teclado')
            ? 'instant'
            : 'smooth',
      });
      // Mantener el foco en el rail permite seguir saltando capítulos con teclado.
    }),
  );
  raiz
    .querySelectorAll<HTMLButtonElement>('[data-relato-modo]')
    .forEach((boton) =>
      boton.addEventListener('click', () => {
        texto = boton.dataset.relatoModo === 'texto';
        visual.hidden = texto;
        actualizarInteraccion();
        equivalente.hidden = !texto;
        equivalente.inert = !texto;
        raiz
          .querySelectorAll<HTMLButtonElement>('[data-relato-modo]')
          .forEach((b) =>
            b.setAttribute(
              'aria-pressed',
              String((b.dataset.relatoModo === 'texto') === texto),
            ),
          );
      }),
    );
  function movimiento() {
    figura.hidden = reducir.matches;
    figura.inert = reducir.matches;
    raiz
      .querySelectorAll<HTMLElement>('[data-relato-estatica]')
      .forEach((el) => {
        el.inert = !reducir.matches;
        el.setAttribute('aria-hidden', String(!reducir.matches));
      });
    pintar(topologia, true);
    observar();
    actualizarInteraccion();
  }
  // F5.1 · Selección de nodos con la ficha en el lado opuesto (bugs 4–6 del
  // prototipo). El SVG sigue aria-hidden: los botones del módulo son lo accesible.
  visual.removeAttribute('aria-hidden');
  dibujo.removeAttribute('aria-hidden');
  const interaccion = activarDiagrama(dibujo, {
    modelo: datos.diagrama,
    panel: 'opuesto',
  });
  function actualizarInteraccion() {
    const conDiagrama =
      !texto && !reducir.matches && Number(raiz.dataset.capituloActivo) < 4;
    if (!conDiagrama) interaccion.cerrar(false);
    visual.inert = texto;
    dibujo.inert = !conDiagrama;
    pista.hidden = !conDiagrama;
  }
  raiz.dataset.mejorado = '';
  observar();
  movimiento();
  reducir.addEventListener('change', movimiento);
  addEventListener('resize', observar);
}
