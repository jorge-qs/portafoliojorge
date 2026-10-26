import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const slugs = ['coordinacion-multiagente', 'proyecto-02', 'proyecto-03'];
const url = (slug: string) => `/proyectos/${slug}/`;
async function guardarTema(page: Page, tema: string) {
  await page.addInitScript((tema) => localStorage.setItem('tema', tema), tema);
}
for (const slug of slugs)
  for (const tema of ['cosmos', 'dawn']) {
    test(`axe ${slug} en ${tema}, capítulos y bloques estáticos`, async ({
      page,
    }) => {
      await guardarTema(page, tema);
      await page.goto(url(slug));
      await expect(page.locator('html')).toHaveAttribute('data-theme', tema);
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
      await expect(page.locator('article h2:not(dialog h2)')).toHaveCount(10);
      await expect(page.locator('[data-plantilla]')).toHaveAttribute(
        'data-plantilla',
        slug === 'proyecto-02' ? 'B' : 'A',
      );
      if (slug === 'proyecto-02') {
        await expect(page.locator('.katex')).toHaveCount(1);
        for (const control of await page
          .locator('.experimento input, .experimento button')
          .all())
          await expect(control).toBeEnabled();
        await expect(page.locator('.citar button')).toHaveAttribute(
          'hidden',
          '',
        );
      } else {
        expect(
          await page
            .locator('.lienzo .nodos')
            .evaluate((el) =>
              el.previousElementSibling?.classList.contains('aristas'),
            ),
        ).toBe(true);
        await expect(page.locator('.astro-code').first()).toBeVisible();
      }
    });
  }
test('tema persiste al navegar: correcto en DOMContentLoaded; portada Cosmos', async ({
  page,
}) => {
  await page.goto(url(slugs[0]));
  if (page.viewportSize()!.width < 768)
    await page.getByRole('button', { name: 'Opciones de lectura' }).click();
  await page
    .getByRole('button', { name: 'Dawn', exact: true })
    .filter({ visible: true })
    .click();
  if (page.viewportSize()!.width < 768) await page.keyboard.press('Escape');
  await page.addInitScript(() =>
    document.addEventListener('DOMContentLoaded', () => {
      document.documentElement.dataset.temaAlDom =
        document.documentElement.dataset.theme;
    }),
  );
  await page.locator('[data-siguiente]').click();
  await expect(page.locator('html')).toHaveAttribute(
    'data-tema-al-dom',
    'dawn',
  );
  await expect(page.locator('html')).not.toHaveClass(/cambio-tema/);
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute(
    'data-tema-al-dom',
    'cosmos',
  );
});
test('índice activo, progreso calculado en el artículo y miga según tipo', async ({
  page,
}) => {
  for (const [i, slug] of slugs.entries()) {
    await page.goto(url(slug));
    const miga = page.locator('.miga');
    await expect(miga).toContainText(
      ['Ingeniería', 'Investigación', 'Híbrido'][i],
    );
    if (page.viewportSize()!.width >= 768) await expect(miga).toBeVisible();
  }
  const quinto = page.locator('article h2:not(dialog h2)').nth(4);
  await quinto.evaluate((el) =>
    window.scrollTo({
      top: el.getBoundingClientRect().top + scrollY - 70,
      behavior: 'instant',
    }),
  );
  const id = await quinto.getAttribute('id');
  await expect(page.locator('.indice-articulo [aria-current]')).toHaveAttribute(
    'data-capitulo',
    id!,
  );
  expect(
    await page
      .locator('[data-progreso-lectura]')
      .evaluate((el) => getComputedStyle(el).transform),
  ).not.toBe('matrix(0, 0, 0, 1, 0, 0)');
});
test('capítulos: ciclo de foco, Esc, restauración y elegir capítulo', async ({
  page,
}) => {
  await page.goto(url(slugs[0]));
  if (page.viewportSize()!.width >= 1200)
    await page.setViewportSize({ width: 834, height: 1112 });
  const boton = page.locator('[data-abrir-capitulos]');
  await boton.click();
  const hoja = page.locator('#capitulos');
  await expect(hoja).toBeVisible();
  await expect(page.locator('.articulo-reticula')).toHaveJSProperty(
    'inert',
    true,
  );
  const enlaces = hoja.locator('button,a');
  await enlaces.last().focus();
  await page.keyboard.press('Tab');
  await expect(enlaces.first()).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(enlaces.last()).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(hoja).toBeHidden();
  await expect(boton).toBeFocused();
  await boton.click();
  const enlace = hoja.locator('[data-capitulo]').nth(4);
  const hash = await enlace.getAttribute('href');
  await enlace.click();
  await expect(hoja).toBeHidden();
  await expect(page.locator(`[id="${hash!.slice(1)}"]`)).toBeFocused();
});
test('Aa: foco modal, reducción persistida antes de pintar y Sistema', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(url(slugs[0]));
  const boton = page.getByRole('button', { name: 'Opciones de lectura' });
  await boton.click();
  const hoja = page.locator('#opciones-lectura');
  await expect(page.locator('.articulo-reticula')).toHaveJSProperty(
    'inert',
    true,
  );
  const controles = hoja.locator(
    'button:not([disabled]), a[href], input:not([disabled])',
  );
  await controles.last().focus();
  await page.keyboard.press('Tab');
  await expect(controles.first()).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(controles.last()).toBeFocused();
  await hoja.getByLabel('Reducir movimiento').check();
  expect(
    await page
      .locator('html')
      .evaluate((el) => getComputedStyle(el).getPropertyValue('--dur').trim()),
  ).toMatch(/^0(?:ms|s)$/);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.emulateMedia({ colorScheme: 'light' });
  await hoja.getByRole('button', { name: 'Sistema' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dawn');
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'cosmos');
  await page.keyboard.press('Escape');
  await expect(boton).toBeFocused();
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('html')).toHaveAttribute(
    'data-movimiento',
    'reducido',
  );
  expect(
    await page
      .locator('html')
      .evaluate((el) => getComputedStyle(el).getPropertyValue('--dur').trim()),
  ).toMatch(/^0(?:ms|s)$/);
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute(
    'data-movimiento',
    'reducido',
  );
  await page.evaluate(() => {
    const scrollOriginal = window.scrollTo.bind(window);
    window.scrollTo = ((opciones: ScrollToOptions) => {
      document.documentElement.dataset.scrollSolicitado = opciones.behavior;
      scrollOriginal(opciones);
    }) as typeof window.scrollTo;
  });
  await page.getByRole('button', { name: 'Menú', exact: true }).click();
  await page
    .locator('#menu-movil')
    .getByRole('link', { name: 'Índice', exact: true })
    .click();
  await expect(page.locator('html')).toHaveAttribute(
    'data-scroll-solicitado',
    'instant',
  );
});
test('360 px: página contenida, regiones desplazables y objetivos de 44 px', async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 800 });
  for (const slug of slugs) {
    await page.goto(url(slug));
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth,
      ),
    ).toBe(true);
    for (const control of await page
      .locator(
        '[data-barra-global] a, [data-barra-global] button, article a, footer a',
      )
      .all()) {
      if (!(await control.isVisible())) continue;
      expect((await control.boundingBox())!.height).toBeGreaterThanOrEqual(44);
      expect((await control.boundingBox())!.width).toBeGreaterThanOrEqual(44);
    }
    if (slug !== 'proyecto-02')
      for (const region of await page.locator('.codigo-scroll,.tabla').all()) {
        await expect(region).toHaveAttribute('tabindex', '0');
        expect(
          await region.evaluate((el) => el.scrollWidth > el.clientWidth),
        ).toBe(true);
      }
  }
});
test('reduced motion del sistema: mismo contenido sin animación', async ({
  page,
}) => {
  await page.goto(url(slugs[0]));
  const contenido = await page.locator('article').textContent();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  expect(await page.locator('article').textContent()).toBe(contenido);
  expect(
    await page
      .locator('html')
      .evaluate((el) => getComputedStyle(el).getPropertyValue('--dur').trim()),
  ).toMatch(/^0(?:ms|s)$/);
});

test('build: KaTeX y Shiki sin JS cliente, fuentes del propio origen', async ({
  page,
}) => {
  const externos: string[] = [];
  page.on('request', (r) => {
    if (
      new URL(r.url()).origin !==
      new URL(test.info().project.use.baseURL as string).origin
    )
      externos.push(r.url());
  });
  await page.goto(url('proyecto-02'));
  await page.evaluate(() => document.fonts.ready);
  expect(externos).toEqual([]);
  for (const src of await page
    .locator('script[src]')
    .evaluateAll((es) => es.map((el) => (el as HTMLScriptElement).src))) {
    const texto = await (await page.request.get(src)).text();
    expect(texto).not.toMatch(/katex|shiki|codeToHtml|renderToString/);
  }
  await expect(page.locator('.formula .formula-prob')).toHaveCount(1);
  expect(
    await page
      .locator('.formula .expresion')
      .evaluate((el) => getComputedStyle(el).fontSize),
  ).toBe(page.viewportSize()!.width < 768 ? '22px' : '30px');
});

test('regreso al índice y adyacentes conservan el filtro de tipo', async ({
  page,
}) => {
  await page.goto(`${url(slugs[0])}?tipo=inv`);
  await expect(page.locator('.volver-articulo')).toHaveAttribute(
    'href',
    /\?tipo=inv#indice$/,
  );
  await expect(page.locator('[data-siguiente]')).toHaveAttribute(
    'href',
    /\?tipo=inv$/,
  );
  await page.locator('[data-siguiente]').click();
  await expect(page).toHaveURL(/proyecto-02\/?\?tipo=inv$/);
  await expect(page.locator('.volver-indice')).toHaveAttribute(
    'href',
    /\?tipo=inv#indice$/,
  );
});
