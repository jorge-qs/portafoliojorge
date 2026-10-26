import { expect, test } from '@playwright/test';
import { proyectosContenido } from '../proyectos-contenido';
import { recuentosTipos } from '../../src/lib/portada';
import tecnologias from '../../src/content/tecnologias/es.json' with { type: 'json' };

const TACTIL_MIN = 44 - 0.01;
const proyectos = proyectosContenido();

// Axe de toda la portada ya se ejecuta en navegacion.spec.ts, sin excluir F2.
test('F2: índice ordenado, un enlace por fila y recuentos', async ({
  page,
}) => {
  await page.goto('/');
  const filas = page.locator('.fila-indice');
  await expect(filas).toHaveCount(proyectos.length);
  for (const [i, p] of proyectos.entries()) {
    const fila = filas.nth(i);
    await expect(fila).toHaveAttribute('href', `/proyectos/${p.slug}/`);
    await expect(fila.locator('a')).toHaveCount(0);
    await expect(fila.locator('.codigo')).toHaveText(p.codigo);
    await expect(fila.locator('.titulo')).toHaveText(p.data.titulo);
  }
  const recuentos = recuentosTipos(proyectos);
  for (const tipo of ['todos', 'ing', 'inv', 'hib'] as const) {
    const boton = page.locator(`[data-filtro-tipo="${tipo}"]`);
    await expect(boton.locator('.num')).toHaveText(String(recuentos[tipo]));
    await expect(boton).toHaveAttribute(
      'aria-pressed',
      String(tipo === 'todos'),
    );
  }
  for (const [i, enlace] of (
    await page.locator('#indice .relato a').all()
  ).entries())
    await expect(enlace).toHaveAttribute(
      'href',
      `/#relato-${proyectos.filter((p) => p.data.destacado)[i].slug}`,
    );
  await expect(page.locator('#notas')).toHaveCount(0);
  await expect(page.locator('[data-copia] button')).toHaveAttribute(
    'hidden',
    '',
  );
  const mano = page.locator('.arte-contacto img');
  await expect(mano).toHaveAttribute('aria-hidden', 'true');
  await expect(mano).toHaveAttribute('src', /\.webp$/);
  await expect(page.locator('[data-descripcion-contacto]')).not.toBeEmpty();
});

test('F2: herramientas y evidencia conservan el orden y el estado inicial', async ({
  page,
}) => {
  await page.goto('/');
  const seleccionada = tecnologias.areas[0].herramientas[0];
  for (const nombre of tecnologias.areas.flatMap((a) => a.herramientas)) {
    const boton = page.locator(`[data-herramienta="${nombre}"]`);
    await expect(boton).toHaveAttribute(
      'aria-pressed',
      String(nombre === seleccionada),
    );
    await expect(boton.locator('.num')).toHaveText(
      String(
        proyectos.filter((p) => p.data.herramientas.includes(nombre)).length,
      ),
    );
  }
  for (const [i, p] of proyectos.entries()) {
    const tarjeta = page.locator('[data-evidencia]').nth(i);
    await expect(tarjeta).toHaveAttribute('href', `/proyectos/${p.slug}/`);
    await expect(tarjeta.locator('.codigo')).toHaveText(p.codigo);
    if (p.data.herramientas.includes(seleccionada))
      await expect(tarjeta).toHaveClass(/activa/);
    else await expect(tarjeta).not.toHaveClass(/activa/);
  }
});

test('F2: acordeón abre y cierra con teclado, incluso sin JS', async ({
  browser,
}, info) => {
  for (const javaScriptEnabled of [true, false]) {
    const contexto = await browser.newContext({
      viewport: info.project.use.viewport,
      baseURL: info.project.use.baseURL,
      javaScriptEnabled,
    });
    const page = await contexto.newPage();
    await page.goto('/');
    await expect(page.locator('.fila-indice')).toHaveCount(proyectos.length);
    await expect(page.locator('#sobre-mi .presentacion')).not.toBeEmpty();
    await expect(page.locator('.enlaces-contacto .fila-contacto')).toHaveCount(
      4,
    );
    if (page.viewportSize()!.width < 1200) {
      const trayectoria = page.locator('.trayectoria-plegada details');
      await expect(trayectoria).not.toHaveAttribute('open');
      await trayectoria.locator('summary').focus();
      await page.keyboard.press('Enter');
      await expect(trayectoria).toHaveAttribute('open', '');
      await page.keyboard.press('Space');
      await expect(trayectoria).not.toHaveAttribute('open');
    }
    if (page.viewportSize()!.width < 768) {
      const area = page.locator('.tecnologias-movil details').first();
      await area.locator('summary').focus();
      await page.keyboard.press('Space');
      await expect(area).not.toHaveAttribute('open');
      await page.keyboard.press('Enter');
      await expect(area).toHaveAttribute('open', '');
      await expect(area.locator('.herramienta-movil')).toHaveCount(
        tecnologias.areas[0].herramientas.length,
      );
    }
    await contexto.close();
  }
});

test('F2: 390 y 360 px sin desbordamiento, sin recortes y objetivos de 44 px', async ({
  page,
}) => {
  for (const width of [390, 360]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/');
    for (const details of await page
      .locator('.tecnologias-movil details, .trayectoria-plegada details')
      .all())
      if (!(await details.evaluate((el) => el.hasAttribute('open'))))
        await details.locator('summary').click();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    for (const el of await page
      .locator('main a, main button, main summary')
      .all()) {
      if (!(await el.isVisible())) continue;
      const caja = (await el.boundingBox())!;
      expect(caja.height).toBeGreaterThanOrEqual(TACTIL_MIN);
      expect(caja.width).toBeGreaterThanOrEqual(TACTIL_MIN);
      expect(caja.x).toBeGreaterThanOrEqual(0);
      expect(caja.x + caja.width).toBeLessThanOrEqual(width + 0.01);
    }
  }
});

test('F2: reduced motion mantiene contenido y duraciones a cero', async ({
  page,
}) => {
  await page.goto('/');
  const contenido = await page
    .locator('[data-seccion-portada]:not(#proyectos)')
    .allInnerTexts();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  expect(
    await page
      .locator('[data-seccion-portada]:not(#proyectos)')
      .allInnerTexts(),
  ).toEqual(contenido);
  const duraciones = await page
    .locator('[data-evidencia]')
    .evaluateAll((els) =>
      els.map((el) => getComputedStyle(el).transitionDuration),
    );
  expect(
    duraciones.every((lista) =>
      lista.split(',').every((duracion) => duracion.trim() === '0s'),
    ),
  ).toBe(true);
  expect(
    await page
      .locator('.comando span')
      .evaluate((el) => getComputedStyle(el).animationName),
  ).toBe('none');
});
