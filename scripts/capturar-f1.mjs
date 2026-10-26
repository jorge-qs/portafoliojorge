/* global fetch, setTimeout, document, scrollY */
/** Evidencia visual de F1. Ejecutar tras build, con PLAYWRIGHT_BROWSERS_PATH=.cache/ms-playwright. */
import { chromium, expect } from '@playwright/test';
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';

const carpeta = 'docs/encargos/capturas/F1';
const servidores = [
  spawn(process.execPath, ['scripts/servidor-e2e.mjs'], { stdio: 'ignore' }),
  spawn('python3', ['-m', 'http.server', '4322', '--bind', '127.0.0.1'], {
    cwd: 'design/referencias',
    stdio: 'ignore',
  }),
];
async function esperar(url) {
  for (let intento = 0; intento < 50; intento++) {
    try {
      if ((await fetch(url)).ok) return;
    } catch {
      /* servidor arrancando */
    }
    await new Promise((resolver) => setTimeout(resolver, 100));
  }
  throw new Error(`Servidor no disponible: ${url}`);
}
async function guardar(elemento, nombre) {
  await elemento.screenshot({
    animations: 'disabled',
    path: `${carpeta}/${nombre}.png`,
  });
}
let navegador;
try {
  await Promise.all([
    esperar('http://127.0.0.1:4321/'),
    esperar('http://127.0.0.1:4322/'),
  ]);
  navegador = await chromium.launch();
  await mkdir(carpeta, { recursive: true });
  const referencia = await navegador.newPage({
    viewport: { width: 1280, height: 800 },
  });
  // Las referencias se abren sin conexiones externas ni cambios a su diseño.
  await referencia.route('**/*', (r) =>
    r.request().url().startsWith('http://127.0.0.1:4322/') ||
    /^(blob|data):/.test(r.request().url())
      ? r.continue()
      : r.abort(),
  );
  await referencia.goto('http://127.0.0.1:4322/maqueta-1-portada.html');
  await referencia.evaluate(() => document.fonts.ready);
  for (const [indice, ancho] of [1280, 834, 390].entries()) {
    await referencia.setViewportSize({
      width: ancho,
      height: ancho === 834 ? 1112 : ancho === 390 ? 844 : 800,
    });
    await guardar(
      referencia.getByText('JORGE', { exact: true }).nth(indice).locator('..'),
      `maqueta-hero-${ancho}`,
    );
    const pie =
      ancho === 390
        ? referencia.getByText('© ‹año› Jorge Quenta · Volver arriba ↑', {
            exact: true,
          })
        : referencia
            .getByText('© ‹año› Jorge Quenta', { exact: true })
            .nth(indice)
            .locator('..');
    await guardar(pie, `maqueta-pie-${ancho}`);
  }
  await referencia.setViewportSize({ width: 1280, height: 800 });
  await referencia.goto('http://127.0.0.1:4322/maqueta-2-articulos.html');
  await referencia.evaluate(() => document.fonts.ready);
  const articuloRef = referencia.locator(
    '[data-screen-label="A · Ingeniería (Cosmos)"]',
  );
  await guardar(
    articuloRef.getByText('JORGE', { exact: true }).locator('../..'),
    'maqueta-articulo',
  );
  await guardar(articuloRef.locator('footer'), 'maqueta-pie-articulo');
  await referencia.goto('http://127.0.0.1:4322/maqueta-3-sistema.html');
  await referencia.evaluate(() => document.fonts.ready);
  const sistema = referencia.locator('#N');
  await guardar(
    sistema.getByText('JORGE', { exact: true }).nth(0).locator('..'),
    'maqueta-sistema-hero',
  );
  await guardar(
    sistema.getByText('JORGE', { exact: true }).nth(1).locator('..'),
    'maqueta-fija',
  );
  await guardar(
    sistema.getByText('JORGE', { exact: true }).nth(2).locator('../..'),
    'maqueta-sistema-articulo',
  );
  await guardar(
    sistema.getByText('Cerrar ✕', { exact: true }).locator('../..'),
    'maqueta-menu',
  );

  for (const [ancho, alto] of [
    [1280, 800],
    [834, 1112],
    [390, 844],
  ]) {
    const pagina = await navegador.newPage({
      viewport: { width: ancho, height: alto },
    });
    const barra = pagina.locator('[data-barra-global]');
    await pagina.goto('http://127.0.0.1:4321/');
    await pagina.evaluate(() => document.fonts.ready);
    await expect(barra).toHaveAttribute('data-estado', 'hero');
    await guardar(barra, `sitio-hero-${ancho}`);
    await pagina.goto('http://127.0.0.1:4321/#sobre-mi');
    await expect(pagina.locator('#sobre-mi-titulo')).toBeFocused();
    await expect(barra).toHaveAttribute('data-estado', 'fija');
    await guardar(barra, `sitio-fija-${ancho}`);
    if (ancho < 768) await pagina.getByRole('button', { name: 'Menú' }).click();
    else {
      // Solo evidencia del componente a estos tamaños; el botón existe <768.
      await pagina.locator('#menu-movil').evaluate((el) => {
        el.inert = false;
        el.showModal();
      });
    }
    await guardar(pagina.locator('#menu-movil'), `sitio-menu-${ancho}`);
    await pagina.keyboard.press('Escape');
    await guardar(pagina.locator('footer'), `sitio-pie-${ancho}`);
    await pagina.locator('[data-volver-arriba]').click();
    await expect(pagina.locator('.saltar-contenido')).toBeFocused();
    expect(await pagina.evaluate(() => scrollY)).toBe(0);
    await pagina.goto(
      'http://127.0.0.1:4321/proyectos/coordinacion-multiagente/',
    );
    await guardar(barra, `sitio-articulo-${ancho}`);
    await guardar(pagina.locator('footer'), `sitio-pie-articulo-${ancho}`);
    if (ancho === 390) {
      await pagina.emulateMedia({ reducedMotion: 'reduce' });
      await pagina.goto('http://127.0.0.1:4321/#sobre-mi');
      await expect(pagina.locator('#sobre-mi-titulo')).toBeFocused();
      await guardar(barra, 'sitio-fija-390-reduce');
      await pagina.getByRole('button', { name: 'Menú' }).click();
      await guardar(pagina.locator('#menu-movil'), 'sitio-menu-390-reduce');
    }
    await pagina.close();
    console.log(`Capturas y comprobación de Volver arriba: ${ancho}px.`);
  }
} finally {
  await navegador?.close();
  for (const servidor of servidores) servidor.kill();
}
