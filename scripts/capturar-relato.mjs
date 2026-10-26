/* global window, scrollY, innerHeight */
// QA manual de F5: requiere build servido en 4354 y las referencias en 4353.
import { mkdir } from 'node:fs/promises';
import { chromium } from '@playwright/test';
const carpeta = 'docs/encargos/capturas/F5';
await mkdir(carpeta, { recursive: true });
const navegador = await chromium.launch();
try {
  const pagina = await navegador.newPage();
  for (const width of [1280, 834, 390]) {
    await pagina.setViewportSize({
      width,
      height: width === 834 ? 1112 : width === 390 ? 844 : 800,
    });
    await pagina.goto('http://127.0.0.1:4354/');
    for (let n = 1; n <= 4; n++) {
      await pagina
        .locator(
          `#relato-coordinacion-multiagente [data-relato-bloque][data-capitulo="${n}"][data-paso="-1"]`,
        )
        .evaluate((el) => {
          window.scrollTo({
            top: Math.max(
              scrollY +
                el.closest('[data-relato]').getBoundingClientRect().top +
                1,
              scrollY + el.getBoundingClientRect().top - innerHeight * 0.4 + 2,
            ),
            behavior: 'instant',
          });
        });
      await pagina.waitForTimeout(350);
      await pagina.screenshot({
        path: `${carpeta}/relato-${width}-capitulo-${n}.png`,
      });
    }
    await pagina
      .locator('#relato-coordinacion-multiagente [data-relato-modo="texto"]')
      .click();
    await pagina.screenshot({ path: `${carpeta}/relato-${width}-texto.png` });
    if (width !== 834) {
      await pagina.goto('http://127.0.0.1:4353/scrollytelling-v1.html');
      await pagina
        .getByRole('navigation', { name: 'Capítulos', exact: true })
        .waitFor();
      for (let n = 1; n <= 4; n++) {
        await pagina
          .getByRole('navigation', { name: 'Capítulos', exact: true })
          .getByRole('button')
          .nth(n - 1)
          .click();
        await pagina.waitForTimeout(700);
        await pagina.screenshot({
          path: `${carpeta}/referencia-${width}-capitulo-${n}.png`,
        });
      }
    }
  }
  await pagina.setViewportSize({ width: 920, height: 900 });
  await pagina.goto('http://127.0.0.1:4354/');
  await pagina
    .locator(
      '#relato-coordinacion-multiagente [data-relato-bloque][data-capitulo="4"]',
    )
    .evaluate((el) =>
      window.scrollTo({
        top: scrollY + el.getBoundingClientRect().top - innerHeight * 0.4 + 2,
        behavior: 'instant',
      }),
    );
  await pagina.waitForTimeout(350);
  await pagina.screenshot({ path: `${carpeta}/relato-920-capitulo-4.png` });
  await pagina.emulateMedia({ reducedMotion: 'reduce' });
  await pagina.setViewportSize({ width: 390, height: 844 });
  await pagina.reload();
  await pagina
    .locator('#relato-coordinacion-multiagente-capitulo-3')
    .scrollIntoViewIfNeeded();
  await pagina.screenshot({ path: `${carpeta}/relato-390-reduced-motion.png` });
  for (const nombre of ['maqueta-1-portada', 'maqueta-3-sistema']) {
    await pagina.goto(`http://127.0.0.1:4353/${nombre}.html`);
    await pagina.waitForTimeout(1000);
    console.log(
      `${nombre}: ${(await pagina.locator('body').innerText()).includes('relato') ? 'abierta' : 'revisar carga'}`,
    );
  }
} finally {
  await navegador.close();
}
