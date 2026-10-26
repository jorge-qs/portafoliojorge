import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { analizarAxe } from './axe-hero';

const articulo = '/proyectos/coordinacion-multiagente/';
// 44 px menos un margen de subpíxel: el layout puede dar 43,999… al cambiar el viewport.
const TACTIL_MIN = 44 - 0.01;
// Alto de la barra (56 px) menos medio píxel: el scroll al ancla puede quedar en 55,8.
const BARRA_MIN = 56 - 0.5;
const barra = (page: Page) => page.locator('[data-barra-global]');
async function menuMovil(page: Page) {
  if (page.viewportSize()!.width >= 768) {
    await expect(page.getByRole('button', { name: 'Menú' })).toBeHidden();
    await page.setViewportSize({ width: 390, height: 844 });
  }
  await page.getByRole('button', { name: 'Menú' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
}
async function enfocadoVisible(page: Page, id: string, enfocado = true) {
  const titulo = page.locator(`#${id}-titulo`);
  if (enfocado) await expect(titulo).toBeFocused();
  else await expect(titulo).not.toBeFocused();
  await expect(titulo).toBeInViewport();
  expect((await titulo.boundingBox())!.y).toBeGreaterThanOrEqual(BARRA_MIN);
  await expect(barra(page)).not.toHaveAttribute('data-oculta');
}

for (const ruta of ['/', articulo]) {
  test(`axe AA y primer Tab en ${ruta}`, async ({ page }) => {
    await page.goto(ruta);
    await page.keyboard.press('Tab');
    await expect(
      page.getByRole('link', { name: 'Saltar al contenido' }),
    ).toBeFocused();
    const resultado =
      ruta === '/'
        ? await analizarAxe(page)
        : await new AxeBuilder({ page }).analyze();
    expect(resultado.violations).toEqual([]);
    await page.keyboard.press('Enter');
    await expect(page.locator('main')).toBeFocused();
    expect(await page.evaluate(() => scrollY)).toBe(0);
  });
}

test('hero → fija; umbral de descenso, subida y sección activa', async ({
  page,
}) => {
  await page.goto('/');
  await expect(barra(page)).toHaveAttribute('data-estado', 'hero');
  await page.evaluate(() =>
    document
      .getElementById('indice-titulo')!
      .scrollIntoView({ behavior: 'instant' }),
  );
  await expect(barra(page)).toHaveAttribute('data-estado', 'fija');
  await page.evaluate(() => window.scrollBy({ top: 8, behavior: 'instant' }));
  await page.waitForTimeout(100);
  await expect(barra(page)).not.toHaveAttribute('data-oculta');
  await page.evaluate(() => window.scrollBy({ top: 20, behavior: 'instant' }));
  await expect(barra(page)).toHaveAttribute('data-oculta', '');
  await expect(barra(page)).toHaveJSProperty('inert', true);
  await page.evaluate(() => window.scrollBy({ top: -20, behavior: 'instant' }));
  await expect(barra(page)).not.toHaveAttribute('data-oculta');
  await expect(barra(page)).toHaveJSProperty('inert', false);
  await expect(
    barra(page).locator('[data-seccion="proyectos"]'),
  ).toHaveAttribute('aria-current', 'location');
});

test('bajar con flechas o espacio no hace parpadear la barra', async ({
  page,
}) => {
  await page.goto('/');
  await page.evaluate(() =>
    document
      .getElementById('indice-titulo')!
      .scrollIntoView({ behavior: 'instant' }),
  );
  await expect(barra(page)).toHaveAttribute('data-estado', 'fija');
  await page.evaluate(() => window.scrollBy({ top: 40, behavior: 'instant' }));
  await expect(barra(page)).toHaveAttribute('data-oculta', '');
  await page.evaluate(() => {
    const el = document.querySelector('[data-barra-global]')!;
    (window as unknown as { vista: boolean }).vista = false;
    new MutationObserver(() => {
      if (!el.hasAttribute('data-oculta'))
        (window as unknown as { vista: boolean }).vista = true;
    }).observe(el, { attributes: true, attributeFilter: ['data-oculta'] });
  });
  for (const tecla of ['ArrowDown', 'ArrowDown', 'Space']) {
    await page.keyboard.press(tecla);
    await page.waitForTimeout(150);
  }
  expect(
    await page.evaluate(() => (window as unknown as { vista: boolean }).vista),
  ).toBe(false);
});

test('ancla Índice, foco al h2 y barra visible durante el salto', async ({
  page,
}) => {
  await page.goto('/');
  if (page.viewportSize()!.width < 768) {
    await menuMovil(page);
    await page
      .getByRole('dialog')
      .getByRole('link', { name: 'Índice', exact: true })
      .click();
  } else {
    await page.evaluate(() =>
      document
        .getElementById('indice-titulo')!
        .scrollIntoView({ behavior: 'instant' }),
    );
    await expect(barra(page)).toHaveAttribute('data-estado', 'fija');
    await barra(page).locator('a[href="#indice"]').click();
  }
  await expect(page).toHaveURL(/#indice$/);
  await enfocadoVisible(page, 'indice');
});

test('carga con hash y enlace de artículo a Índice', async ({ page }) => {
  await page.goto('/#sobre-mi');
  await enfocadoVisible(page, 'sobre-mi', false);
  await expect(barra(page)).toHaveAttribute('data-estado', 'fija');
  await page.goto(articulo);
  await expect(barra(page)).toHaveAttribute('data-estado', 'articulo');
  if (page.viewportSize()!.width < 768) {
    await page.getByRole('link', { name: '← Proyectos', exact: true }).click();
  } else {
    await page
      .getByRole('navigation', { name: 'Ruta del proyecto' })
      .getByRole('link', { name: 'Proyectos' })
      .click();
  }
  await enfocadoVisible(page, 'indice', false);
});

test('foco de teclado mantiene visible la barra y no anima', async ({
  page,
}) => {
  await page.goto('/#indice');
  await enfocadoVisible(page, 'indice', false);
  // F5 añade los controles del relato antes del índice: se activa el modo
  // teclado y se enfoca la barra directamente.
  await page.keyboard.press('Tab');
  await barra(page).locator('a').first().focus();
  expect(
    await barra(page).evaluate((el) => el.contains(document.activeElement)),
  ).toBe(true);
  await page.evaluate(() => window.scrollBy({ top: 100, behavior: 'instant' }));
  await expect(barra(page)).not.toHaveAttribute('data-oculta');
  expect(
    await barra(page).evaluate((el) => getComputedStyle(el).transitionDuration),
  ).toBe('0s');
});

test('menú: inert, scroll bloqueado, ciclos Tab y Shift+Tab, Esc y foco devuelto', async ({
  page,
}) => {
  await page.goto('/#sobre-mi');
  await enfocadoVisible(page, 'sobre-mi', false);
  const posicion = await page.evaluate(() => scrollY);
  await menuMovil(page);
  const dialogo = page.getByRole('dialog');
  await expect(page.locator('main')).toHaveJSProperty('inert', true);
  expect(
    await page.locator('body').evaluate((el) => getComputedStyle(el).position),
  ).toBe('fixed');
  const enlaces = dialogo.locator('a:not([tabindex="-1"]), button');
  await enlaces.last().focus();
  await page.keyboard.press('Tab');
  await expect(enlaces.first()).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(enlaces.last()).toBeFocused();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.keyboard.press('Escape');
  await expect(dialogo).toBeHidden();
  await expect(page.locator('#menu-movil')).toHaveJSProperty('inert', true);
  await expect(page.getByRole('button', { name: 'Menú' })).toBeFocused();
  await expect(page.locator('main')).toHaveJSProperty('inert', false);
  // Si el proyecto cambia de tamaño para probar el menú, la posición se adapta
  // al nuevo svh; se comprueba restauración exacta en el tamaño móvil original.
  if (test.info().project.name === 'movil')
    expect(await page.evaluate(() => scrollY)).toBe(posicion);
});

test('menú: elegir sección cierra, navega y enfoca; sin Notas, Contacto es 06', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.locator('#notas')).toHaveCount(0);
  await expect(barra(page).locator('[data-seccion="notas"]')).toHaveCount(0);
  await expect(page.locator('#contacto .num')).toHaveText('06');
  await menuMovil(page);
  const dialogo = page.getByRole('dialog');
  await expect(dialogo.locator('[data-seccion="notas"]')).toHaveCount(0);
  await expect(dialogo.locator('[data-seccion="contacto"] .num')).toHaveText(
    '06',
  );
  for (const elemento of await dialogo.locator('a, button').all()) {
    expect((await elemento.boundingBox())!.height).toBeGreaterThanOrEqual(
      TACTIL_MIN,
    );
  }
  await dialogo.locator('[data-seccion="sobre-mi"]').click();
  await expect(dialogo).toBeHidden();
  await enfocadoVisible(page, 'sobre-mi');
  await page.getByRole('button', { name: 'Menú' }).click();
  await expect(dialogo.locator('[data-seccion="sobre-mi"]')).toHaveAttribute(
    'aria-current',
    'location',
  );
  await expect(
    dialogo.locator('[data-seccion="sobre-mi"] .actual'),
  ).toBeVisible();
  const colores = await dialogo
    .locator('[data-seccion="sobre-mi"]')
    .evaluate((el) => {
      const muestra = document.createElement('span');
      muestra.style.color = 'var(--accent)';
      el.append(muestra);
      const esperado = getComputedStyle(muestra).color;
      muestra.remove();
      return { actual: getComputedStyle(el).color, esperado };
    });
  expect(colores.actual).toBe(colores.esperado);

  await dialogo.getByRole('button', { name: 'Cerrar' }).click();
  await expect(page.getByRole('button', { name: 'Menú' })).toBeFocused();
});

test('reduced motion: sin scroll suave, sin transición de barra ni animación de menú', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  expect(
    await page
      .locator('html')
      .evaluate((el) => getComputedStyle(el).scrollBehavior),
  ).toBe('auto');
  expect(
    await barra(page).evaluate((el) => getComputedStyle(el).transitionDuration),
  ).toBe('0s');
  await menuMovil(page);
  const estilos = await page.getByRole('dialog').evaluate((el) => ({
    transicion: getComputedStyle(el).transitionDuration,
    animacion: getComputedStyle(el).animationDuration,
  }));
  expect(estilos).toEqual({ transicion: '0s', animacion: '0s' });
  await page.getByRole('dialog').locator('[data-seccion="indice"]').click();
  await enfocadoVisible(page, 'indice');
  await page.evaluate(() => window.scrollBy({ top: 80, behavior: 'instant' }));
  await expect(barra(page)).toHaveAttribute('data-oculta', '');
  await page.evaluate(() => window.scrollBy({ top: -20, behavior: 'instant' }));
  await expect(barra(page)).not.toHaveAttribute('data-oculta');
});

test('360 px sin desbordamiento y objetivos táctiles', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  for (const ruta of ['/', articulo]) {
    await page.goto(ruta);
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth,
      ),
    ).toBe(true);
    const boton =
      ruta === '/'
        ? page.getByRole('button', { name: 'Menú' })
        : page.getByRole('button', { name: 'Opciones de lectura' });
    expect((await boton.boundingBox())!.height).toBeGreaterThanOrEqual(
      TACTIL_MIN,
    );
    expect((await boton.boundingBox())!.width).toBeGreaterThanOrEqual(
      TACTIL_MIN,
    );
    await boton.click();
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth,
      ),
    ).toBe(true);
    for (const enlace of await page
      .getByRole('dialog')
      .locator('a, button, input')
      .all()) {
      expect((await enlace.boundingBox())!.height).toBeGreaterThanOrEqual(
        TACTIL_MIN,
      );
    }
  }
});

test('placeholders desactivados, controles F3 y portada siempre Cosmos', async ({
  page,
}) => {
  await page.goto(articulo);
  await page.evaluate(() => localStorage.setItem('tema', 'dawn'));
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dawn');
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await expect(
    page.locator('[data-reservado="selector-tema"] [data-tema]'),
  ).toHaveCount(2);
  await expect(
    page.locator('[data-reservado="progreso-lectura"] [data-progreso-lectura]'),
  ).toHaveCount(1);
  for (const enlace of await page.locator('a[aria-disabled="true"]').all())
    await expect(enlace).toHaveAttribute('href', '#');
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'cosmos');
});
