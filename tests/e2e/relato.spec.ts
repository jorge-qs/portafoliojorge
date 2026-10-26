import { expect, test, type Page } from '@playwright/test';
import { analizarAxe } from './axe-hero';
import { readFileSync } from 'node:fs';
import type { Relato } from '../../src/content/esquemas';
const semilla = JSON.parse(
  readFileSync(
    new URL(
      '../../src/content/relatos/es/coordinacion-multiagente.json',
      import.meta.url,
    ),
    'utf8',
  ),
) as Relato;

const selector = '#relato-coordinacion-multiagente';
async function capitulo(page: Page, n: number, paso = -1) {
  await page
    .locator(
      `${selector} [data-relato-bloque][data-capitulo="${n}"][data-paso="${paso}"]`,
    )
    .evaluate((el) =>
      window.scrollTo({
        top: Math.max(
          scrollY +
            el.closest('[data-relato]')!.getBoundingClientRect().top +
            1,
          scrollY + el.getBoundingClientRect().top - innerHeight * 0.4 + 2,
        ),
        behavior: 'instant',
      }),
    );
  await expect(page.locator(selector)).toHaveAttribute(
    'data-capitulo-activo',
    String(n),
  );
}

test('capítulos y recorrido al 40 %, rail, barra global, axe en cada capítulo', async ({
  page,
}) => {
  await page.goto('/');
  for (let n = 1; n <= 4; n++) {
    await capitulo(page, n);
    await expect(
      page.locator(`${selector} [data-relato-ir="${n}"]`),
    ).toHaveAttribute('aria-current', 'step');
    const barra = page.locator('[data-barra-global]');
    await expect(barra).toHaveAttribute('data-estado', 'relato');
    await expect(barra).toHaveJSProperty('inert', true);
    await expect
      .poll(() => barra.evaluate((el) => el.getBoundingClientRect().bottom))
      .toBeLessThanOrEqual(0);
    // Desde F5.1 la figura es accesible: axe mide su texto, así que se espera
    // a que termine el fundido de entrada para no medir colores a medio camino.
    await page.waitForFunction(() =>
      document.getAnimations().every((a) => a.playState !== 'running'),
    );
    expect((await analizarAxe(page)).violations).toEqual([]);
  }
  await capitulo(page, 3, 2);
  await expect(
    page.locator(`${selector} [data-relato-fija] [data-nodo="tools"]`),
  ).toHaveAttribute('data-estado', 'recorrido');
  await expect(
    page.locator(`${selector} [data-relato-fija] .resaltada`),
  ).toHaveCount(3);
  await expect(
    page.locator(`${selector} [data-relato-fija] [data-nodo="a"]`),
  ).toHaveAttribute('data-estado', 'atenuado');
  await page.locator(`${selector} [data-relato-ir="2"]`).click();
  await expect(page.locator(selector)).toHaveAttribute(
    'data-capitulo-activo',
    '2',
  );
  await page
    .locator('#indice-titulo')
    .evaluate((el) => el.scrollIntoView({ behavior: 'instant' }));
  await expect(page.locator('[data-barra-global]')).toHaveAttribute(
    'data-estado',
    'fija',
  );
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await expect(page.locator('[data-barra-global]')).toHaveAttribute(
    'data-estado',
    'hero',
  );
});

test('bug 3: Texto vuelve inert la figura, sin elementos enfocables; axe', async ({
  page,
}) => {
  await page.goto('/');
  await capitulo(page, 2);
  await page.locator(`${selector} [data-relato-modo="texto"]`).click();
  const visual = page.locator(`${selector} [data-relato-visual]`);
  // Desde F5.1 la figura no lleva aria-hidden (sus botones de nodo son
  // accesibles); en modo Texto la protegen hidden + inert.
  await expect(visual).toHaveJSProperty('inert', true);
  await expect(visual).toBeHidden();
  expect(
    await visual.evaluate((el) =>
      Array.from(el.querySelectorAll<HTMLElement>('a,button,[tabindex]')).every(
        (n) => n.tabIndex < 0 || !!n.closest('[inert]'),
      ),
    ),
  ).toBe(true);
  await expect(page.locator(`${selector} [data-relato-texto]`)).toContainText(
    semilla.equivalente_texto[1],
  );
  expect((await analizarAxe(page)).violations).toEqual([]);
  await page.locator(`${selector} [data-relato-modo="diagrama"]`).click();
  await expect(visual).toBeVisible();
});

test('bug 7: segmentado y rail de 44 px; 360 sin scroll horizontal', async ({
  page,
}) => {
  for (const width of [page.viewportSize()!.width, 360]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/');
    await capitulo(page, 2);
    for (const boton of await page
      .locator(`${selector} [data-relato-modo], ${selector} [data-relato-ir]`)
      .all()) {
      const caja = (await boton.boundingBox())!;
      expect(caja.height).toBeGreaterThanOrEqual(44);
      expect(caja.width).toBeGreaterThanOrEqual(44);
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
});

test('bug 2: leyenda completa a 920, 1180 y 1440 px', async ({ page }) => {
  for (const width of [920, 1180, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await capitulo(page, 4);
    const leyenda = page.locator(
      `${selector} [data-relato-fija] [data-relato-leyenda]`,
    );
    await expect(leyenda).toBeVisible();
    expect(
      await leyenda.evaluate((el) => el.scrollWidth <= el.clientWidth),
    ).toBe(true);
    const caja = (await leyenda.boundingBox())!;
    for (const etiqueta of await leyenda.locator('span').all()) {
      const r = (await etiqueta.boundingBox())!;
      expect(r.x).toBeGreaterThanOrEqual(caja.x);
      expect(r.x + r.width).toBeLessThanOrEqual(caja.x + caja.width + 0.01);
    }
  }
});

test('salidas reales, último a índice, recarga intermedia y rail solo con teclado', async ({
  page,
}) => {
  await page.goto('/#relato-coordinacion-multiagente');
  await page.locator(`${selector} [data-relato-siguiente]`).click();
  await expect(page).toHaveURL(/#relato-proyecto-02$/);
  await expect(page.locator('[data-barra-global]')).toHaveAttribute(
    'data-estado',
    'relato',
  );
  await page.locator('#relato-proyecto-02 [data-relato-siguiente]').click();
  await expect(page).toHaveURL(/#relato-proyecto-03$/);
  await page.locator('#relato-proyecto-03 [data-relato-siguiente]').click();
  await expect(page).toHaveURL(/#indice$/);
  await expect(page.locator('[data-barra-global]')).toHaveAttribute(
    'data-estado',
    'fija',
  );
  await page.goto('/#relato-coordinacion-multiagente-capitulo-2');
  await expect(page.locator('[data-barra-global]')).toHaveAttribute(
    'data-estado',
    'relato',
  );
  // Carga directa con hash: se alinea sin mover el foco (regla de F4).
  await expect(page.locator(`${selector}-c2`)).toBeInViewport();
  await expect(page.locator(`${selector}-c2`)).not.toBeFocused();
  await page.locator(`${selector} [data-relato-ir="3"]`).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator(selector)).toHaveAttribute(
    'data-capitulo-activo',
    '3',
  );
  await page.keyboard.press('Tab');
  await expect(page.locator(`${selector} [data-relato-ir="4"]`)).toBeFocused();
  await page.keyboard.press('Space');
  await expect(page.locator(selector)).toHaveAttribute(
    'data-capitulo-activo',
    '4',
  );
  await page.locator(`${selector} [data-relato-saltar]`).focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#indice$/);
  await expect(page.locator('#indice-titulo')).toBeFocused();
});

test('reduced motion sin pinning, figura por paso; sin JS, mismo texto completo', async ({
  browser,
}, info) => {
  for (const javaScriptEnabled of [true, false]) {
    const contexto = await browser.newContext({
      viewport: info.project.use.viewport,
      baseURL: info.project.use.baseURL,
      javaScriptEnabled,
      reducedMotion: 'reduce',
    });
    const page = await contexto.newPage();
    await page.goto('/');
    const raiz = page.locator(selector);
    for (const c of semilla.capitulos)
      await expect(raiz).toContainText(c.texto);
    for (const paso of semilla.capitulos[2].pasos!)
      await expect(raiz).toContainText(paso.texto);
    const estaticas = raiz.locator('[data-relato-estatica]');
    await expect(estaticas).toHaveCount(8);
    for (const figura of await estaticas.all())
      await expect(figura).toBeVisible();
    expect(
      await raiz
        .locator('[data-relato-fija]')
        .evaluate((el) => getComputedStyle(el).position),
    ).not.toBe('sticky');
    if (javaScriptEnabled) {
      await raiz.locator('[data-relato-ir="4"]').focus();
      await page.keyboard.press('Enter');
      await expect(raiz).toHaveAttribute('data-capitulo-activo', '4');
    }
    await contexto.close();
  }
});
