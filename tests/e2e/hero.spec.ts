import { expect, test } from '@playwright/test';
import { analizarAxe } from './axe-hero';

async function terminarEntrada(page: import('@playwright/test').Page) {
  await expect
    .poll(() =>
      page.locator('[data-hero-raiz]').evaluate((raiz) =>
        document
          .getAnimations()
          .filter((animacion) => {
            const destino = (animacion.effect as KeyframeEffect | null)?.target;
            return destino instanceof Element && raiz.contains(destino);
          })
          .every((animacion) => animacion.playState === 'finished'),
      ),
    )
    .toBe(true);
}

test('hero accesible, completo y con sus dimensiones de referencia', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('h1')).toHaveText('Jorge');
  await expect(page.locator('[data-ventana]')).toHaveCount(26);
  await expect(page.locator('.ventana--punta .cursor')).toBeVisible();
  await expect(page.locator('[data-barra-global]')).toHaveAttribute(
    'data-estado',
    'hero',
  );
  const axe = await analizarAxe(page);
  expect(axe.violations).toEqual([]);
  const estado = await page.locator('[data-hero-raiz]').evaluate((raiz) => ({
    alto: raiz.getBoundingClientRect().height,
    sticky: getComputedStyle(raiz.querySelector('.hero-escena')!).position,
    animaciones: document.getAnimations().filter((a) => {
      const destino = (a.effect as KeyframeEffect | null)?.target;
      return destino instanceof Element && raiz.contains(destino);
    }).length,
    frase: raiz.querySelector('.mensaje p')?.textContent,
  }));
  expect(estado.alto).toBeCloseTo(page.viewportSize()!.height, 0);
  expect(estado.sticky).not.toBe('sticky');
  expect(estado.animaciones).toBe(0);
  expect(estado.frase).toBe(
    'Construyo sistemas de IA y explico cómo funcionan.',
  );
});

test('transición reversible, anticipo y estado de la barra', async ({
  page,
}) => {
  await page.goto('/');
  await terminarEntrada(page);
  const fijacion = await page
    .locator('[data-hero-raiz]')
    .evaluate(
      (raiz) =>
        (parseFloat(
          getComputedStyle(raiz).getPropertyValue('--hero-fijacion'),
        ) /
          100) *
        innerHeight,
    );
  await page.evaluate(
    (alto) => window.scrollTo({ top: alto / 2, behavior: 'instant' }),
    fijacion,
  );
  const cajaVentana = await page
    .locator('[data-ventana="2"]')
    .evaluate((ventana) => {
      const estilo = getComputedStyle(ventana);
      return [estilo.left, estilo.top, estilo.width, estilo.height];
    });
  await expect
    .poll(() =>
      page
        .locator('[data-hero-raiz]')
        .evaluate((raiz) =>
          parseFloat(getComputedStyle(raiz).getPropertyValue('--p')),
        ),
    )
    .toBeGreaterThan(0.45);
  await expect
    .poll(() =>
      page
        .locator('[data-hero-raiz]')
        .evaluate((raiz) =>
          parseFloat(getComputedStyle(raiz).getPropertyValue('--p')),
        ),
    )
    .toBeLessThan(0.55);
  await expect(
    page.locator('[data-hero-raiz] > .hero-escena > .texto'),
  ).toHaveCSS('opacity', '0');
  await expect
    .poll(() =>
      page.locator('[data-ventana="2"]').evaluate((ventana) => {
        const estilo = getComputedStyle(ventana);
        return [estilo.left, estilo.top, estilo.width, estilo.height];
      }),
    )
    .toEqual(cajaVentana);
  await page.evaluate(
    (alto) => window.scrollTo({ top: alto, behavior: 'instant' }),
    fijacion,
  );
  await expect
    .poll(() =>
      page
        .locator('[data-hero-raiz]')
        .evaluate((raiz) =>
          parseFloat(getComputedStyle(raiz).getPropertyValue('--p')),
        ),
    )
    .toBeGreaterThan(0.999);
  await expect(page.locator('.anticipo')).toHaveCSS('opacity', '1');
  await expect(page.locator('[data-barra-global]')).toHaveAttribute(
    'data-estado',
    'hero',
  );
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await expect
    .poll(() =>
      page
        .locator('[data-hero-raiz]')
        .evaluate((raiz) =>
          parseFloat(getComputedStyle(raiz).getPropertyValue('--p')),
        ),
    )
    .toBe(0);
  await expect(
    page.locator('[data-hero-raiz] > .hero-escena > .texto'),
  ).toHaveCSS('opacity', '1');
  await page
    .locator('[data-relato]')
    .first()
    .evaluate((relato) => {
      const hero = document.querySelector('[data-hero]')!;
      const cajaRelato = relato.getBoundingClientRect();
      const padding = parseFloat(
        getComputedStyle(document.documentElement).scrollPaddingTop,
      );
      const inicioRelato = scrollY + cajaRelato.top - padding + 1;
      const finHero = scrollY + hero.getBoundingClientRect().bottom + 1;
      window.scrollTo({
        top: Math.max(inicioRelato, finHero),
        behavior: 'instant',
      });
    });
  await expect(page.locator('[data-barra-global]')).toHaveAttribute(
    'data-estado',
    'relato',
  );
});

test('sin JavaScript: contenido completo y sin fijación', async ({
  browser,
  page,
}) => {
  await page.goto('/');
  const contexto = await browser.newContext({
    javaScriptEnabled: false,
    viewport: page.viewportSize()!,
  });
  const sinJs = await contexto.newPage();
  try {
    await sinJs.goto(new URL('/', page.url()).href);
    await expect(sinJs.locator('h1')).toHaveText('Jorge');
    await expect(sinJs.locator('.mensaje p')).toHaveText(
      'Construyo sistemas de IA y explico cómo funcionan.',
    );
    await expect(sinJs.locator('[data-ventana]')).toHaveCount(26);
    await expect(sinJs.locator('.ventana--punta .cursor')).toBeVisible();
    const estilos = await sinJs
      .locator('[data-hero-raiz]')
      .evaluate((raiz) => ({
        alto: raiz.getBoundingClientRect().height,
        sticky: getComputedStyle(raiz.querySelector('.hero-escena')!).position,
      }));
    expect(estilos.alto).toBeCloseTo(page.viewportSize()!.height, 0);
    expect(estilos.sticky).not.toBe('sticky');
  } finally {
    await contexto.close();
  }
});

test('360 px, horizontal y escritorio ancho sin scroll horizontal', async ({
  page,
}) => {
  for (const viewport of [
    { width: 360, height: 640 },
    { width: 844, height: 390 },
    { width: 1440, height: 900 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto('/');
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await expect(page.locator('[data-ventana]')).toHaveCount(26);
    const geometria = await page.evaluate(() => {
      const raiz = document.querySelector<HTMLElement>('[data-hero-raiz]')!;
      const manoArtificial =
        raiz.querySelector<HTMLElement>('.mano-artificial')!;
      const puntaVentana = raiz
        .querySelector<HTMLElement>('.ventana--punta')!
        .getBoundingClientRect();
      const transformacion = new DOMMatrix(
        getComputedStyle(manoArtificial).transform,
      );
      const [origenX, origenY] = getComputedStyle(manoArtificial)
        .transformOrigin.split(' ')
        .map(parseFloat);
      const artificialX =
        manoArtificial.offsetLeft +
        origenX +
        transformacion.a * (812 - origenX) +
        transformacion.c * (197 - origenY);
      const artificialY =
        manoArtificial.offsetTop +
        origenY +
        transformacion.b * (812 - origenX) +
        transformacion.d * (197 - origenY);
      const humana = raiz
        .querySelector<HTMLElement>('.mano-humana')!
        .getBoundingClientRect();
      const humanaX = humana.left + humana.width * (14 / 540);
      const humanaY = humana.top + humana.height * (170 / 320);
      const mx =
        innerWidth *
        (innerHeight < 560
          ? 0.52
          : innerWidth >= 1200
            ? 0.53
            : innerWidth < 768
              ? 0.55
              : 0.54);
      const my =
        innerHeight *
        (innerHeight < 560
          ? 0.46
          : innerWidth >= 1200
            ? 0.43
            : innerWidth < 768
              ? 0.37
              : 0.4);
      const gap =
        innerHeight < 560
          ? 40
          : innerWidth >= 1200
            ? 56
            : innerWidth < 768
              ? 24
              : 40;
      const circle = {
        left: mx - 2 * gap,
        right: mx + 2 * gap,
        top: my - 2 * gap,
        bottom: my + 2 * gap,
      };
      const textos = [
        ...raiz.querySelectorAll<HTMLElement>('.identidad, .mensaje'),
      ].map((el) => el.getBoundingClientRect());
      return {
        altoPunta: puntaVentana.height,
        hueco: Math.hypot(humanaX - artificialX, humanaY - artificialY),
        cruzaTexto: textos.some(
          (r) =>
            r.left < circle.right &&
            r.right > circle.left &&
            r.top < circle.bottom &&
            r.bottom > circle.top,
        ),
        cajas: textos.map((r) => ({
          left: r.left,
          right: r.right,
          top: r.top,
          bottom: r.bottom,
        })),
        circulo: circle,
      };
    });
    expect(geometria.altoPunta).toBeGreaterThanOrEqual(8 - 0.01);
    expect(geometria.hueco).toBeGreaterThanOrEqual(20 - 0.01);
    expect(
      geometria.cruzaTexto,
      `Intersección con texto en ${viewport.width}×${viewport.height}: ${JSON.stringify(geometria)}`,
    ).toBe(false);
  }
});

test('CLS de la carga y entrada bajo 0,01', async ({ page }) => {
  await page.addInitScript(() => {
    (window as Window & { heroCls?: number }).heroCls = 0;
    new PerformanceObserver((lista) => {
      for (const entrada of lista.getEntries() as (PerformanceEntry & {
        value: number;
        hadRecentInput: boolean;
      })[]) {
        if (!entrada.hadRecentInput)
          (window as Window & { heroCls?: number }).heroCls! += entrada.value;
      }
    }).observe({ type: 'layout-shift', buffered: true });
  });
  await page.goto('/');
  await terminarEntrada(page);
  const cls = await page.evaluate(
    () => (window as Window & { heroCls?: number }).heroCls ?? 0,
  );
  expect(cls).toBeLessThan(0.01);
});

test('escritorio: las 26 ventanas muestran su nombre y ninguna línea desborda', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const nombres = page.locator('[data-hero-arte] .ventana-nombre');
  await expect(nombres).toHaveCount(26);
  for (const nombre of await nombres.all()) await expect(nombre).toBeVisible();
  await expect(page.locator('.ventana--punta .ventana-nombre')).toHaveText(
    'coder',
  );
  // Cada línea visible cabe entera dentro de su ventana (nl de la referencia).
  const desbordes = await page.locator('[data-hero-arte] .ventana').evaluateAll(
    (ventanas) =>
      ventanas.filter((v) => {
        const caja = v.getBoundingClientRect();
        return [...v.querySelectorAll('.ventana-lineas span')].some((s) => {
          if (getComputedStyle(s).display === 'none') return false;
          const linea = s.getBoundingClientRect();
          return linea.height > 0 && linea.bottom > caja.bottom + 1;
        });
      }).length,
  );
  expect(desbordes).toBe(0);
});
