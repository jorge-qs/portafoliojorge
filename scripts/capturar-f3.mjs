/* global document, localStorage, getComputedStyle */
/** Capturas de F3. Requiere build y servidores locales PORTAFOLIO_E2E_PORT y F3_REF_PORT. */
import { chromium, expect } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
const destino = 'docs/encargos/capturas/F3';
const sitio = `http://127.0.0.1:${process.env.PORTAFOLIO_E2E_PORT ?? 4331}`;
const ref = `http://127.0.0.1:${process.env.F3_REF_PORT ?? 4332}`;
const browser = await chromium.launch();
const comparaciones = [];
try {
  await mkdir(destino, { recursive: true });
  const referencia = await browser.newPage();
  await referencia.route('**/*', (r) =>
    r.request().url().startsWith(ref) || /^(blob|data):/.test(r.request().url())
      ? r.continue()
      : r.abort(),
  );
  await referencia.goto(`${ref}/maqueta-2-articulos.html`);
  await referencia.evaluate(() => document.fonts.ready);
  for (const [ancho, alto] of [
    [1280, 800],
    [834, 1112],
    [390, 844],
  ]) {
    await referencia.setViewportSize({ width: ancho, height: alto });
    for (const [letra, slug, tema, board] of [
      ['A', 'coordinacion-multiagente', 'cosmos', 'A1'],
      ['B', 'proyecto-02', 'dawn', 'A2'],
    ]) {
      const context = await browser.newContext({
        viewport: { width: ancho, height: alto },
      });
      await context.addInitScript(
        (tema) => localStorage.setItem('tema', tema),
        tema,
      );
      const page = await context.newPage();
      await page.goto(`${sitio}/proyectos/${slug}/`);
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({
        path: `${destino}/${letra}-${tema}-${ancho}.png`,
        fullPage: true,
        animations: 'disabled',
      });
      const bloque = referencia.locator(`#${board}`);
      const lienzo =
        ancho === 390
          ? bloque
              .locator(':scope > div')
              .nth(1)
              .locator(':scope > div')
              .nth(1)
              .locator(':scope > div')
              .first()
              .locator(':scope > div')
              .first()
          : bloque
              .locator(':scope > div')
              .nth(1)
              .locator(':scope > div')
              .first();
      await lienzo.screenshot({
        path: `${destino}/maqueta-${letra}-${ancho}.png`,
        animations: 'disabled',
      });
      comparaciones.push({ letra, tema, ancho });
      if (ancho === 390 && letra === 'B') {
        await page.getByRole('button', { name: 'Opciones de lectura' }).click();
        await page.screenshot({
          path: `${destino}/Aa-390.png`,
          animations: 'disabled',
        });
        await page.keyboard.press('Escape');
        await page.locator('[data-abrir-capitulos]').click();
        await page.screenshot({
          path: `${destino}/capitulos-390.png`,
          animations: 'disabled',
        });
        await page.keyboard.press('Escape');
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await page.reload();
        await page.screenshot({
          path: `${destino}/B-dawn-390-reduce.png`,
          animations: 'disabled',
        });
      }
      await context.close();
    }
    console.log(`A, B y referencia: ${ancho}px.`);
  }
  // Estados de decisión: el CSS temporal vive solo en esta página de captura.
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  await context.addInitScript(() => localStorage.setItem('tema', 'dawn'));
  const page = await context.newPage();
  await page.goto(`${sitio}/proyectos/coordinacion-multiagente/`);
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => {
    const muestra = document.createElement('div');
    muestra.id = 'decision-d1';
    muestra.append(
      document.querySelector('.etiqueta-tipo.ing').cloneNode(true),
    );
    const boton = document.createElement('button');
    boton.textContent = document.querySelector('.cv').textContent.trim();
    muestra.append(boton);
    document.body.append(muestra);
  });
  await page.addStyleTag({
    content:
      '#decision-d1 {position:fixed;left:40px;top:90px;display:flex;align-items:center;gap:32px;background:var(--bg);padding:32px;border-radius:12px;z-index:30} #decision-d1 button {background:var(--accent);color:var(--on-accent);min-height:48px;padding:12px 24px;border:0;border-radius:12px;font-weight:600}',
  });
  await page
    .locator('#decision-d1')
    .screenshot({ path: `destino/D1-actual.png`.replace('destino', destino) });
  await page.addStyleTag({
    content: '#decision-d1 .etiqueta-tipo {color:#7A6448}',
  });
  await page
    .locator('#decision-d1')
    .screenshot({ path: `${destino}/D1-propuesta.png` });
  await page.locator('#decision-d1').evaluate((el) => el.remove());
  await page.addStyleTag({
    content: '#contenido .nodo[data-nodo="a"] rect {fill:var(--surface-hover)}',
  });
  await page.locator('[data-nodo="a"]').hover();
  const hover = await page.locator('[data-nodo="a"] rect').evaluate((el) => {
    const muestra = document.createElement('span');
    muestra.style.color = 'var(--surface-hover)';
    document.body.append(muestra);
    const esperado = getComputedStyle(muestra).color;
    muestra.remove();
    return { actual: getComputedStyle(el).fill, esperado };
  });
  expect(hover.actual).toBe(hover.esperado);
  await page
    .locator('.diagrama')
    .screenshot({ path: `${destino}/D4-hover-y-seleccionado.png` });
  await page.locator('.pendiente').evaluate((el) => {
    el.textContent = document.querySelector('.ficha dd').textContent;
  });
  await page
    .locator('.pendiente')
    .screenshot({ path: `${destino}/D4-pendiente.png` });
  await context.close();
  await writeFile(
    `${destino}/comparacion.html`,
    `<!doctype html><html lang="es"><meta charset="utf-8"><title>F3 · Comparación con Maqueta 2</title><style>body{font:16px system-ui;margin:24px}section{margin-bottom:64px}.par{display:grid;grid-template-columns:1fr 1fr;gap:24px;align-items:start}img{width:100%;height:auto}h2{margin:0 0 16px}figure{margin:0}figcaption{margin:8px 0}</style><h1>F3 · Implementación y Maqueta 2</h1><p>La maqueta proporciona lienzos fijos de 1280 y 390 px. A 834 se conserva su lienzo de escritorio; la implementación sí responde al ancho.</p>${comparaciones.map(({ letra, tema, ancho }) => `<section><h2>${letra} · ${tema} · ${ancho} px</h2><div class="par"><figure><figcaption>Implementación</figcaption><img src="${letra}-${tema}-${ancho}.png" alt="Artículo ${letra} implementado a ${ancho} píxeles"></figure><figure><figcaption>Maqueta 2</figcaption><img src="maqueta-${letra}-${ancho}.png" alt="Referencia de artículo ${letra}"></figure></div></section>`).join('')}<h2>D1 · Ingeniería junto al botón primario</h2><div class="par"><figure><figcaption>Actual</figcaption><img src="D1-actual.png" alt="Bronce actual"></figure><figure><figcaption>Propuesta temporal</figcaption><img src="D1-propuesta.png" alt="Bronce propuesto"></figure></div><h2>D4 · Hover y seleccionado en Dawn</h2><img src="D4-hover-y-seleccionado.png" alt="Nodo Agente A en hover y Orquestador seleccionado"><h2>D4 · Pendiente</h2><img src="D4-pendiente.png" style="width:auto" alt="Etiqueta pendiente">`,
  );
} finally {
  await browser.close();
}
