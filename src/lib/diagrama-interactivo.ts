import type { ModeloDiagrama, NodoDiagrama } from './diagrama';
import { aristasDeNodo } from './diagrama';
import { destinoPerfil, esPlaceholder } from './enlaces';
import { t } from '../i18n';
import type { Idioma } from '../i18n/config';
import '../styles/diagrama-interactivo.css';

export interface OpcionesDiagrama {
  modelo: ModeloDiagrama;
  panel: 'fijo' | 'opuesto';
  alCambiar?: (nodo: NodoDiagrama | undefined) => void;
}
/** La raíz contiene un SVG compartido, [data-lienzo-diagrama] y, opcionalmente,
 * [data-panel-diagrama]. Las posiciones se leen del SVG, incluidas las de F5.
 * Devuelve controles para hojas móviles y para desmontar el relato. */
export function activarDiagrama(raiz: HTMLElement, opciones: OpcionesDiagrama) {
  const { modelo, panel, alCambiar } = opciones;
  if (panel === 'opuesto' && getComputedStyle(raiz).position === 'static')
    raiz.style.position = 'relative';
  const idioma: Idioma = document.documentElement.lang === 'en' ? 'en' : 'es';
  const lienzo =
    raiz.querySelector<HTMLElement>('[data-lienzo-diagrama]') ?? raiz;
  const svg = lienzo.querySelector<SVGSVGElement>('svg')!;
  const capa = document.createElement('div');
  capa.className = 'diagrama-botones';
  lienzo.append(capa);
  const abortar = new AbortController();
  const { signal } = abortar;
  let seleccionado: string | undefined;
  let ultimo: HTMLButtonElement | undefined;
  let ficha = raiz.querySelector<HTMLElement>('[data-panel-diagrama]');
  if (!ficha) {
    ficha = document.createElement('div');
    ficha.dataset.panelDiagrama = '';
    ficha.className = 'ficha-diagrama';
    const titulo = document.createElement('h3');
    titulo.dataset.nombreNodo = '';
    ficha.append(titulo);
    const dl = document.createElement('dl');
    for (const [campo, clave] of [
      ['responsabilidad', 'responsabilidad'],
      ['entradas_salidas', 'entradas'],
      ['cumple', 'cumple'],
    ]) {
      const dt = document.createElement('dt');
      dt.textContent = t(idioma, `articulo.${clave}`);
      const dd = document.createElement('dd');
      dd.dataset.campoNodo = campo;
      dl.append(dt, dd);
    }
    const enlace = document.createElement('a');
    enlace.dataset.codigoNodo = '';
    enlace.textContent = t(idioma, 'articulo.verCodigo');
    const cerrar = document.createElement('button');
    cerrar.type = 'button';
    cerrar.dataset.cerrarFicha = '';
    cerrar.textContent = t(idioma, 'interaccion.cerrar');
    ficha.append(dl, enlace, cerrar);
    raiz.append(ficha);
  }
  const paneles = [
    ...raiz.querySelectorAll<HTMLElement>('[data-panel-diagrama]'),
  ];
  ficha.tabIndex = -1;
  ficha.dataset.panel = panel;
  const botones = new Map<string, HTMLButtonElement>();
  const atenuado = (id: string) =>
    svg
      .querySelector(`[data-nodo="${CSS.escape(id)}"]`)
      ?.getAttribute('data-estado') === 'atenuado';
  function colocar() {
    const contenedor = lienzo.getBoundingClientRect();
    modelo.nodos.forEach((n) => {
      const g = svg.querySelector<SVGGElement>(
        `[data-nodo="${CSS.escape(n.id)}"]`,
      );
      const rect = g?.querySelector('rect')?.getBoundingClientRect();
      const b = botones.get(n.id)!;
      if (rect) {
        b.style.left = `${rect.x - contenedor.x + rect.width / 2}px`;
        b.style.top = `${rect.y - contenedor.y + rect.height / 2}px`;
        b.style.width = `${rect.width}px`;
        b.style.height = `${rect.height}px`;
      }
      const inerte = atenuado(n.id);
      b.inert = inerte;
      b.disabled = inerte;
      b.hidden = inerte;
    });
    if (seleccionado && atenuado(seleccionado)) cerrar(false);
  }
  function pintar(id?: string) {
    raiz.querySelectorAll<SVGGElement>('[data-nodo]').forEach((g) => {
      if (g.dataset.estado === 'atenuado') return;
      if (g.dataset.nodo === id) {
        if (g.dataset.estado !== 'seleccionado')
          g.dataset.anterior = g.dataset.estado;
        g.dataset.estado = 'seleccionado';
      } else if (g.dataset.estado === 'seleccionado')
        g.dataset.estado = g.dataset.anterior ?? 'reposo';
    });
    const aristas = id ? aristasDeNodo(modelo, id) : [];
    raiz.querySelectorAll<SVGLineElement>('[data-arista]').forEach((linea) => {
      const [a, b] = linea.dataset.arista!.split(':');
      linea.classList.toggle(
        'resaltada',
        aristas.some(([x, y]) => (a === x && b === y) || (a === y && b === x)),
      );
    });
    botones.forEach((b, key) =>
      b.setAttribute('aria-pressed', String(key === id)),
    );
  }
  function seleccionar(id: string, enfocar = false) {
    const nodo = modelo.nodos.find((n) => n.id === id);
    if (!nodo || atenuado(id)) return;
    seleccionado = id;
    ultimo = botones.get(id);
    pintar(id);
    paneles.forEach((p) => {
      p.hidden = false;
      p.inert = false;
      p.querySelector('[data-nombre-nodo]')!.textContent = nodo.etiqueta;
      p.querySelectorAll<HTMLElement>('[data-campo-nodo]').forEach((campo) => {
        campo.textContent =
          nodo[
            campo.dataset.campoNodo as
              'responsabilidad' | 'entradas_salidas' | 'cumple'
          ];
      });
      const enlace = p.querySelector<HTMLAnchorElement>(
        'a[data-codigo-nodo], [data-codigo-nodo] a',
      )!;
      enlace.hidden = !nodo.codigo;
      enlace.inert = !nodo.codigo;
      enlace.href = nodo.codigo ? destinoPerfil(nodo.codigo) : '#';
      if (nodo.codigo && esPlaceholder(nodo.codigo)) {
        enlace.setAttribute('aria-disabled', 'true');
        enlace.tabIndex = -1;
      } else {
        enlace.removeAttribute('aria-disabled');
        enlace.removeAttribute('tabindex');
      }
    });
    if (panel === 'opuesto') {
      const rect = ultimo!.getBoundingClientRect();
      const centro = raiz.getBoundingClientRect();
      ficha!.dataset.lado =
        rect.x + rect.width / 2 > centro.x + centro.width / 2
          ? 'izquierda'
          : 'derecha';
      if (enfocar) ficha!.focus({ preventScroll: true });
    }
    alCambiar?.(nodo);
  }
  // Sin devolver el foco cuando cierra el propio relato al cambiar de capítulo:
  // mover el foco durante un scroll provocaría saltos.
  function cerrar(devolverFoco = true) {
    seleccionado = undefined;
    pintar();
    paneles.forEach((p) => {
      p.hidden = true;
      p.inert = true;
    });
    if (devolverFoco && ultimo && !ultimo.inert)
      ultimo.focus({ preventScroll: true });
    alCambiar?.(undefined);
  }
  modelo.nodos.forEach((n) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'diagrama-nodo';
    b.dataset.botonNodo = n.id;
    b.setAttribute('aria-label', n.etiqueta);
    b.setAttribute('aria-pressed', 'false');
    b.addEventListener('click', () => seleccionar(n.id, true), { signal });
    b.addEventListener(
      'pointerenter',
      () =>
        svg
          .querySelector(`[data-nodo="${CSS.escape(n.id)}"]`)
          ?.classList.add('nodo-hover'),
      { signal },
    );
    b.addEventListener(
      'pointerleave',
      () =>
        svg
          .querySelector(`[data-nodo="${CSS.escape(n.id)}"]`)
          ?.classList.remove('nodo-hover'),
      { signal },
    );
    capa.append(b);
    botones.set(n.id, b);
  });
  raiz.addEventListener(
    'keydown',
    (event) => {
      if (
        event.key === 'Escape' &&
        seleccionado &&
        !(event.target as Element).closest('dialog')
      ) {
        event.preventDefault();
        cerrar();
      }
    },
    { signal },
  );
  raiz
    .querySelectorAll('[data-cerrar-ficha]')
    .forEach((b) => b.addEventListener('click', () => cerrar(), { signal }));
  const resize = new ResizeObserver(colocar);
  resize.observe(lienzo);
  const cambios = new MutationObserver(colocar);
  cambios.observe(svg, {
    subtree: true,
    attributes: true,
    attributeFilter: ['data-estado', 'transform', 'style'],
  });
  colocar();
  if (panel === 'fijo')
    seleccionar(
      modelo.seleccionado ?? modelo.nodos.find((n) => !atenuado(n.id))!.id,
    );
  else {
    ficha.hidden = true;
    ficha.inert = true;
  }
  return {
    seleccionar,
    cerrar,
    destruir() {
      abortar.abort();
      resize.disconnect();
      cambios.disconnect();
      capa.remove();
    },
  };
}
