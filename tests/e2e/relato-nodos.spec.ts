import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// F5.1 · Selección de nodos en la figura del relato (bugs 4, 5 y 6 del prototipo).
const relato = '#relato-coordinacion-multiagente';

async function irACapitulo(page: Page, capitulo: number) {
  await page.goto(`/${relato}-capitulo-${capitulo}`);
  await expect(page.locator(relato)).toHaveAttribute(
    'data-capitulo-activo',
    String(capitulo),
  );
}

test.describe('escritorio', () => {
  test.beforeEach(({ page }) => {
    test.skip(
      page.viewportSize()!.width < 1200,
      'Ficha flotante: solo escritorio',
    );
  });

  test('bug 4: la ficha se abre en el lado opuesto, recibe el foco y Esc lo devuelve', async ({
    page,
  }) => {
    await irACapitulo(page, 2);
    const nodo = page.locator(`${relato} [data-boton-nodo="b"]`);
    await nodo.click();
    const ficha = page.locator(`${relato} .ficha-diagrama`);
    await expect(ficha).toBeVisible();
    await expect(ficha).toHaveAttribute('data-lado', 'izquierda');
    const cajaNodo = (await nodo.boundingBox())!;
    const cajaFicha = (await ficha.boundingBox())!;
    expect(cajaFicha.x + cajaFicha.width).toBeLessThan(cajaNodo.x);
    await expect(ficha).toBeFocused();
    const axe = await new AxeBuilder({ page }).include(relato).analyze();
    expect(axe.violations).toEqual([]);
    await page.keyboard.press('Escape');
    await expect(ficha).toBeHidden();
    await expect(nodo).toBeFocused();
  });

  test('bug 6: los nodos atenuados no se pueden seleccionar', async ({
    page,
  }) => {
    await irACapitulo(page, 1);
    await expect(
      page.locator(`${relato} [data-boton-nodo="orq"]`),
    ).toBeHidden();
    await expect(
      page.locator(`${relato} [data-boton-nodo="orq"]`),
    ).toBeDisabled();
    await expect(page.locator(`${relato} [data-boton-nodo="b"]`)).toBeVisible();
  });

  test('bug 5: la pista solo aparece en modo Diagrama y con diagrama en pantalla', async ({
    page,
  }) => {
    await irACapitulo(page, 2);
    const pista = page.locator(`${relato} [data-relato-pista]`);
    await expect(pista).toBeVisible();
    await page.locator(`${relato} [data-relato-modo="texto"]`).click();
    await expect(pista).toBeHidden();
    await expect(
      page.locator(`${relato} [data-boton-nodo]:visible`),
    ).toHaveCount(0);
    await page.locator(`${relato} [data-relato-modo="diagrama"]`).click();
    await expect(pista).toBeVisible();
    await irACapitulo(page, 4);
    await expect(pista).toBeHidden();
  });

  test('cambiar de capítulo cierra la ficha sin mover el foco', async ({
    page,
  }) => {
    await irACapitulo(page, 2);
    await page.locator(`${relato} [data-boton-nodo="b"]`).click();
    const ficha = page.locator(`${relato} .ficha-diagrama`);
    await expect(ficha).toBeVisible();
    await page.evaluate((selector) => {
      const bloque = document.querySelector<HTMLElement>(
        `${selector} [data-relato-bloque][data-capitulo="3"]`,
      )!;
      window.scrollTo(0, bloque.getBoundingClientRect().top + scrollY - 100);
    }, relato);
    await expect(page.locator(relato)).toHaveAttribute(
      'data-capitulo-activo',
      '3',
    );
    await expect(ficha).toBeHidden();
  });
});

test.describe('móvil', () => {
  test.beforeEach(({ page }) => {
    test.skip(page.viewportSize()!.width >= 768, 'Hoja inferior: solo móvil');
  });

  test('la ficha es una hoja inferior', async ({ page }) => {
    await irACapitulo(page, 2);
    await page.locator(`${relato} [data-boton-nodo="b"]`).click();
    const ficha = page.locator(`${relato} .ficha-diagrama`);
    await expect(ficha).toBeVisible();
    const caja = (await ficha.boundingBox())!;
    const alto = page.viewportSize()!.height;
    expect(Math.abs(caja.y + caja.height - alto)).toBeLessThan(1);
    expect(caja.x).toBeLessThan(1);
  });
});

test('reduced motion: sin figura fija no hay pista ni nodos seleccionables', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await irACapitulo(page, 2);
  await expect(page.locator(`${relato} [data-relato-pista]`)).toBeHidden();
  await expect(page.locator(`${relato} [data-boton-nodo]:visible`)).toHaveCount(
    0,
  );
});
