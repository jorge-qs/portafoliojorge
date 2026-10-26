export type FiltroTipo = 'todos' | 'ing' | 'inv' | 'hib';
export function filtroDeURL(url: URL): FiltroTipo {
  const tipo = url.searchParams.get('tipo');
  return tipo === 'ing' || tipo === 'inv' || tipo === 'hib' ? tipo : 'todos';
}
export function coincideTipo(tipo: string, filtro: FiltroTipo) {
  return filtro === 'todos' || tipo === filtro;
}
export function iniciarFiltro() {
  const filtro = document.querySelector<HTMLElement>('[data-filtro]');
  if (!filtro) return;
  const filas = [
    ...document.querySelectorAll<HTMLElement>('.lista-indice [data-tipo]'),
  ];
  function aplicar(tipo: FiltroTipo) {
    filtro!
      .querySelectorAll<HTMLButtonElement>('[data-filtro-tipo]')
      .forEach((b) => {
        b.setAttribute('aria-pressed', String(b.dataset.filtroTipo === tipo));
      });
    let n = 0;
    filas.forEach((fila) => {
      const visible = coincideTipo(fila.dataset.tipo!, tipo);
      fila.hidden = !visible;
      fila.inert = !visible;
      if (visible) n++;
    });
    const resumen = document.querySelector('[data-resumen-filtro]');
    if (resumen)
      resumen.textContent = filtro!.dataset.resumen!.replace(
        '{n}',
        new Intl.NumberFormat(document.documentElement.lang).format(n),
      );
  }
  filtro
    .querySelectorAll<HTMLButtonElement>('[data-filtro-tipo]')
    .forEach((b) =>
      b.addEventListener('click', () => {
        const tipo = b.dataset.filtroTipo as FiltroTipo;
        const url = new URL(location.href);
        if (tipo === 'todos') url.searchParams.delete('tipo');
        else url.searchParams.set('tipo', tipo);
        history.replaceState(history.state, '', url);
        aplicar(tipo);
      }),
    );
  const restaurar = () => aplicar(filtroDeURL(new URL(location.href)));
  addEventListener('popstate', restaurar);
  addEventListener('pageshow', restaurar);
  restaurar();
}
