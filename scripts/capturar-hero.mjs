/* global document, Event, fetch, getComputedStyle, innerHeight, setTimeout, window */
import { mkdir, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { chromium, expect } from '@playwright/test';

const salida = 'docs/encargos/capturas/F6';
const puertoSitio = Number(process.env.PORTAFOLIO_CAPTURA_PORT ?? 4382);
const puertoReferencia = 8765;
const urlSitio = `http://127.0.0.1:${puertoSitio}`;
const urlReferencia = `http://127.0.0.1:${puertoReferencia}/hero-final.html`;
const procesos = [];
const tamanos = [
  { clave: '1280x800', width: 1280, height: 800, ref: '1 · Escritorio' },
  { clave: '834x1112', width: 834, height: 1112, ref: '4 · Responsive' },
  { clave: '390x844', width: 390, height: 844, ref: '4 · Responsive' },
  { clave: '844x390', width: 844, height: 390, ref: '4 · Responsive' },
];

async function disponible(url) {
  for (let intento = 0; intento < 60; intento += 1) {
    try {
      if ((await fetch(url)).ok) return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 150));
    }
  }
  throw new Error(`No respondió ${url}`);
}

function iniciar(comando, argumentos, opciones = {}) {
  const proceso = spawn(comando, argumentos, { stdio: 'ignore', ...opciones });
  procesos.push(proceso);
  return proceso;
}

async function pausarEntrada(pagina, milisegundos) {
  await pagina.evaluate((ms) => {
    for (const animacion of document.getAnimations()) {
      animacion.pause();
      animacion.currentTime = ms;
    }
  }, milisegundos);
}

try {
  await mkdir(salida, { recursive: true });
  iniciar(process.execPath, ['scripts/servidor-e2e.mjs'], {
    env: { ...process.env, PORTAFOLIO_E2E_PORT: String(puertoSitio) },
  });
  iniciar(
    'python3',
    ['-m', 'http.server', String(puertoReferencia), '--bind', '127.0.0.1'],
    {
      cwd: 'design/referencias',
    },
  );
  await Promise.all([disponible(`${urlSitio}/`), disponible(urlReferencia)]);
  const navegador = await chromium.launch();
  try {
    const sitio = await navegador.newPage();
    const referencia = await navegador.newPage();
    for (const tamano of tamanos) {
      const viewport = { width: tamano.width, height: tamano.height };
      await sitio.setViewportSize(viewport);
      await sitio.goto(`${urlSitio}/`);
      await expect(sitio.locator('[data-hero-raiz]')).toBeVisible();
      await pausarEntrada(sitio, 2600);
      await sitio.evaluate(() =>
        window.scrollTo({ top: 0, behavior: 'instant' }),
      );
      await sitio.screenshot({
        path: `${salida}/hero-final-${tamano.clave}.png`,
      });

      await referencia.setViewportSize(viewport);
      await referencia.goto(urlReferencia);
      const enlace = referencia.getByText(tamano.ref, { exact: false }).first();
      await enlace.click();
      if (tamano.clave === '1280x800') {
        await referencia.locator('#H1 .sc-host').screenshot({
          path: `${salida}/referencia-${tamano.clave}.png`,
        });
      } else {
        const indice = tamano.clave === '834x1112' ? 1 : 2;
        await referencia
          .locator('#H4 .sc-host')
          .nth(indice)
          .screenshot({
            path: `${salida}/referencia-${tamano.clave}.png`,
          });
      }
    }

    await sitio.setViewportSize({ width: 1280, height: 800 });
    await sitio.goto(`${urlSitio}/`);
    for (const tiempo of [300, 1000, 1800, 2600]) {
      await pausarEntrada(sitio, tiempo);
      await sitio.screenshot({ path: `${salida}/entrada-${tiempo}ms.png` });
    }
    await referencia.setViewportSize({ width: 1280, height: 800 });
    await referencia.goto(urlReferencia);
    await referencia.getByText('2 · Entrada', { exact: false }).first().click();
    await referencia.locator('#H1 .sc-host').screenshot({
      path: `${salida}/referencia-entrada.png`,
    });

    for (const progreso of [0.25, 0.5, 0.75, 1]) {
      await sitio.evaluate((p) => {
        const raiz = document.querySelector('[data-hero-raiz]');
        const fijacion =
          (parseFloat(
            getComputedStyle(raiz).getPropertyValue('--hero-fijacion'),
          ) *
            innerHeight) /
          100;
        window.scrollTo({ top: p * fijacion, behavior: 'instant' });
      }, progreso);
      await expect
        .poll(() =>
          sitio
            .locator('[data-hero-raiz]')
            .evaluate((raiz) =>
              parseFloat(getComputedStyle(raiz).getPropertyValue('--p')),
            ),
        )
        .toBeGreaterThan(progreso - 0.03);
      await sitio.screenshot({
        path: `${salida}/transicion-${Math.round(progreso * 100)}.png`,
      });
    }
    await referencia.setViewportSize({ width: 1280, height: 800 });
    await referencia.goto(urlReferencia);
    await referencia
      .getByText('3 · Transición', { exact: false })
      .first()
      .click();
    for (const progreso of [0.25, 0.5, 0.75, 1]) {
      const slider = referencia.locator('#H3 input[type="range"]');
      await slider.evaluate(
        (elemento, valor) => {
          const rango = elemento;
          rango.value = String(valor);
          rango.dispatchEvent(new Event('input', { bubbles: true }));
        },
        Math.round(progreso * 100),
      );
      await referencia
        .locator('#H3 .sc-host')
        .first()
        .screenshot({
          path: `${salida}/referencia-transicion-${Math.round(progreso * 100)}.png`,
        });
    }

    await sitio.emulateMedia({ reducedMotion: 'reduce' });
    await sitio.setViewportSize({ width: 390, height: 844 });
    await sitio.goto(`${urlSitio}/`);
    await sitio.screenshot({
      path: `${salida}/hero-reduced-motion-390x844.png`,
    });
    await referencia.setViewportSize({ width: 390, height: 844 });
    await referencia.goto(urlReferencia);
    await referencia
      .getByText('4 · Responsive', { exact: false })
      .first()
      .click();
    await referencia
      .locator('#H4 .sc-host')
      .nth(2)
      .screenshot({
        path: `${salida}/referencia-reduced-motion.png`,
      });
    await navegador.close();
  } finally {
    await navegador.close();
  }

  const pares = [
    ...tamanos.map(({ clave }) => [
      `hero-final-${clave}`,
      `referencia-${clave}`,
    ]),
    ...[300, 1000, 1800, 2600].map((ms) => [
      `entrada-${ms}ms`,
      'referencia-entrada',
    ]),
    ...[25, 50, 75, 100].map((p) => [
      `transicion-${p}`,
      `referencia-transicion-${p}`,
    ]),
    ['hero-reduced-motion-390x844', 'referencia-reduced-motion'],
  ];
  const filas = pares
    .map(
      ([sitio, ref]) =>
        `<tr><th>${sitio}</th><td><img src="${sitio}.png" alt="${sitio}"></td><th>${ref}</th><td><img src="${ref}.png" alt="${ref}"></td></tr>`,
    )
    .join('\n');
  await writeFile(
    `${salida}/comparacion.html`,
    `<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Comparación F6 · hero</title><style>body{margin:0;padding:24px;background:#10141d;color:#e8dcc4;font:15px/1.5 system-ui}table{width:100%;border-collapse:collapse}tr{border-bottom:1px solid #333}th{padding:12px;text-align:left;vertical-align:top}td{width:42%;padding:12px}img{display:block;max-width:100%;height:auto;border:1px solid #555}</style><h1>F6 · Comparación del hero</h1><table>${filas}</table></html>\n`,
  );
} finally {
  for (const proceso of procesos) {
    proceso.kill('SIGTERM');
    await new Promise((resolve) => proceso.once('exit', resolve));
  }
}
