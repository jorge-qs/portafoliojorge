import { expect, test, type Page } from '@playwright/test';
import { analizarAxe } from './axe-hero';

const TACTIL_MIN = 44 - 0.01;

async function sinViolaciones(page: Page) {
  const resultado = await analizarAxe(page);
  expect(resultado.violations).toEqual([]);
}

test('idioma: /en/ muestra interfaz en inglés y sus enlaces internos conservan el prefijo', async ({
  page,
}) => {
  await page.goto('/en/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(
    page.getByRole('link', { name: 'Skip to content' }),
  ).toBeVisible();
  await expect(page.locator('#indice h2')).toHaveText('Index');
  await expect(page.locator('#sobre-mi h2')).toContainText(
    'Between building systems',
  );
  await expect(page.locator('#tecnologias h2')).toHaveText('Tools, by area');
  await expect(page.locator('#contacto h2')).toHaveText(
    'If you are building something similar, let us talk.',
  );
  const destinos = await page
    .locator('a[href]')
    .evaluateAll((links) =>
      links.map((link) => (link as HTMLAnchorElement).getAttribute('href')),
    );
  const fuera = destinos.filter((href) => {
    if (
      !href ||
      href.startsWith('#') ||
      href.startsWith('/_astro/') ||
      href.startsWith('/fonts/')
    )
      return false;
    if (href === '/') return false;
    return href.startsWith('/') && !href.startsWith('/en/');
  });
  expect(fuera).toEqual([]);
});

test('idioma: el selector cambia de idioma en la misma página y conserva query y hash', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/proyectos/proyecto-02/');
  const ingles = page.locator(
    '[data-barra-global] [data-selector-idioma] a[hreflang="en"]',
  );
  await expect(ingles).toHaveAttribute('href', '/en/proyectos/proyecto-02/');
  await ingles.click();
  await expect(page).toHaveURL(/\/en\/proyectos\/proyecto-02\/$/);
  await expect(
    page.locator(
      '[data-barra-global] [data-selector-idioma] [aria-current="true"]',
    ),
  ).toHaveText('EN');
  await page
    .locator('[data-barra-global] [data-selector-idioma] a[hreflang="es"]')
    .click();
  await expect(page).toHaveURL(/\/proyectos\/proyecto-02\/$/);

  await page.goto('/?tipo=ing#indice');
  const destino = await page
    .locator('[data-barra-global] [data-selector-idioma] a[hreflang="en"]')
    .getAttribute('href');
  expect(destino).toBe('/en/?tipo=ing#indice');
});

test('idioma: el proyecto 07 usa respaldo español y canonical sin alternativa en', async ({
  page,
}) => {
  await page.goto('/en/proyectos/proyecto-07/');
  await expect(page.getByRole('note')).toHaveText('Available in Spanish only.');
  await expect(page.locator('article')).toHaveAttribute('lang', 'es');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://example.com/proyectos/proyecto-07/',
  );
  await expect(page.locator('link[hreflang="en"]')).toHaveCount(0);
  await expect(page.locator('link[hreflang="es"]')).toHaveAttribute(
    'href',
    'https://example.com/proyectos/proyecto-07/',
  );
});

test('idioma: hreflang es recíproco y x-default apunta a español', async ({
  page,
}) => {
  for (const ruta of ['/', '/en/']) {
    await page.goto(ruta);
    await expect(page.locator('link[hreflang="es"]')).toHaveAttribute(
      'href',
      'https://example.com/',
    );
    await expect(page.locator('link[hreflang="en"]')).toHaveAttribute(
      'href',
      'https://example.com/en/',
    );
    await expect(page.locator('link[hreflang="x-default"]')).toHaveAttribute(
      'href',
      'https://example.com/',
    );
  }
});

test('idioma: la barra global cabe en 56 px sin salto en anchos críticos', async ({
  page,
}) => {
  for (const ruta of ['/en/', '/en/proyectos/coordinacion-multiagente/']) {
    await page.goto(ruta);
    if (ruta === '/en/') await page.locator('#indice').scrollIntoViewIfNeeded();
    for (const width of [1200, 1024, 834, 768]) {
      await page.setViewportSize({ width, height: 900 });
      const barra = page.locator('[data-barra-global]');
      await expect(barra).toBeVisible();
      const medidas = await barra.evaluate((element) => {
        const enlaces = element.querySelector('.enlaces')!;
        const caja = element.getBoundingClientRect();
        return {
          alto: caja.height,
          altoEnlaces: enlaces.getBoundingClientRect().height,
          altoInterior: (enlaces as HTMLElement).scrollHeight,
        };
      });
      expect(medidas.alto).toBeCloseTo(56, 0);
      expect(medidas.altoEnlaces).toBeLessThanOrEqual(56);
      expect(medidas.altoInterior).toBeLessThanOrEqual(56);
    }
  }
});

test('idioma: selectores móviles del menú y hoja Aa superan 44 px y no desbordan a 360', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/en/');
  await page.locator('[data-abrir-menu]').click();
  const menu = page.locator('#menu-movil [data-selector-idioma] a');
  for (const enlace of await menu.all()) {
    const caja = await enlace.boundingBox();
    expect(caja!.width).toBeGreaterThanOrEqual(TACTIL_MIN);
    expect(caja!.height).toBeGreaterThanOrEqual(TACTIL_MIN);
  }
  await page.keyboard.press('Escape');
  await page.goto('/en/proyectos/coordinacion-multiagente/');
  await page.locator('.aa').click();
  const hoja = page.locator('#opciones-lectura [data-selector-idioma] a');
  for (const enlace of await hoja.all()) {
    const caja = await enlace.boundingBox();
    expect(caja!.width).toBeGreaterThanOrEqual(TACTIL_MIN);
    expect(caja!.height).toBeGreaterThanOrEqual(TACTIL_MIN);
  }
  await page.locator('#opciones-lectura [data-cerrar-hoja]').click();
  await page.setViewportSize({ width: 360, height: 800 });
  await expect(page.locator('html')).toHaveJSProperty('scrollWidth', 360);
});

test('idioma: axe en portada, artículo y respaldo, en Cosmos y Dawn', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const tema of ['cosmos', 'dawn']) {
    await page.addInitScript(
      (preferencia) => localStorage.setItem('tema', preferencia),
      tema,
    );
    for (const ruta of [
      '/en/',
      '/en/proyectos/coordinacion-multiagente/',
      '/en/proyectos/proyecto-07/',
    ]) {
      await page.goto(ruta);
      await sinViolaciones(page);
    }
  }
});

test('el capítulo 1 del artículo A se oculta igual en los dos idiomas', async ({
  page,
}) => {
  for (const ruta of [
    '/proyectos/coordinacion-multiagente/',
    '/en/proyectos/coordinacion-multiagente/',
  ]) {
    await page.goto(ruta);
    const primero = page.locator('.cuerpo-articulo > h2').first();
    // Oculto visualmente (solo para lectores de pantalla), no eliminado.
    expect((await primero.boundingBox())!.width).toBeLessThan(2);
    await expect(primero).toHaveAttribute('id', /^1--/);
  }
});
