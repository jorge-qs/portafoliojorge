import { configuracion } from './composicion';

export function iniciarHero() {
  const raiz = document.querySelector<HTMLElement>('[data-hero-raiz]');
  const escena = raiz?.querySelector<HTMLElement>('.hero-escena');
  if (!raiz || !escena) return;

  const reducirSistema = matchMedia('(prefers-reduced-motion: reduce)');
  let inicioHero = 0;
  let alturaFijacion = 0;
  let pendiente = false;
  let frame = 0;
  let animado = false;

  function movimientoReducido() {
    return (
      reducirSistema.matches ||
      document.documentElement.dataset.movimiento === 'reducido'
    );
  }

  function fijacionEnPixeles() {
    const valor = getComputedStyle(raiz!)
      .getPropertyValue('--hero-fijacion')
      .trim();
    if (valor.endsWith('vh')) return (parseFloat(valor) / 100) * innerHeight;
    const configurada = configuracion(innerWidth, innerHeight);
    return configurada.fijacion * innerHeight;
  }

  function medir() {
    inicioHero = raiz!.getBoundingClientRect().top + scrollY;
    alturaFijacion = fijacionEnPixeles();
  }

  function ponerReducido() {
    raiz!.classList.remove('hero--animado', 'hero--entrada', 'hero--moviendo');
    raiz!.style.setProperty('--p', '0');
    raiz!.removeAttribute('data-fase');
    animado = false;
    medir();
  }

  function actualizar() {
    pendiente = false;
    if (movimientoReducido() || !animado) return;
    const p = Math.max(0, Math.min(1, (scrollY - inicioHero) / alturaFijacion));
    raiz!.style.setProperty('--p', String(p));
    if (p >= 0.5) raiz!.dataset.fase = 'anticipo';
    else raiz!.removeAttribute('data-fase');
    raiz!.classList.toggle('hero--moviendo', p > 0 && p < 1);
  }

  function solicitarActualizacion() {
    if (pendiente) return;
    pendiente = true;
    frame = requestAnimationFrame(actualizar);
  }

  function preparar() {
    if (movimientoReducido()) {
      ponerReducido();
      return;
    }
    raiz!.classList.add('hero--animado');
    animado = true;
    medir();
    if (!raiz!.dataset.entradaIniciada) {
      raiz!.classList.add('hero--entrada');
      raiz!.dataset.entradaIniciada = 'true';
    }
    solicitarActualizacion();
  }

  preparar();
  addEventListener('scroll', solicitarActualizacion, { passive: true });
  addEventListener('resize', () => {
    if (!movimientoReducido()) {
      medir();
      solicitarActualizacion();
    } else ponerReducido();
  });
  reducirSistema.addEventListener('change', preparar);
  addEventListener('pageshow', (evento) => {
    if (evento.persisted) {
      // El BFCache conserva el estado de la entrada; se mide sin reiniciar sus animaciones.
      if (!movimientoReducido()) {
        raiz!.classList.remove('hero--entrada');
        animado = true;
        medir();
        solicitarActualizacion();
      } else ponerReducido();
    }
  });

  return () => {
    cancelAnimationFrame(frame);
    removeEventListener('scroll', solicitarActualizacion);
  };
}
