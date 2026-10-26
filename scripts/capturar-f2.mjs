/* global fetch, setTimeout, document */
/** Capturas offline y verificación de contenido temporal de F2. Restaura el contenido y el build en finally. */
import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { spawn, execFileSync } from 'node:child_process';
import { mkdir, readFile, writeFile, unlink, access } from 'node:fs/promises';

const carpeta = 'docs/encargos/capturas/F2';
const perfilRuta = 'src/content/perfil/es.json';
const perfilOriginal = await readFile(perfilRuta, 'utf8');
const fotoRuta = 'public/f2-retrato-temporal.svg';
const notas = Array.from(
  { length: 4 },
  (_, i) => `src/content/notas/es/f2-verificacion-${i + 1}.mdx`,
);
const creados = new Set();
const servidores = [];
const medidas = [];
const secciones = ['indice', 'sobre-mi', 'tecnologias', 'notas', 'contacto'];
const etiquetas = [
  '03 Índice',
  '04 Sobre mí',
  '05 Tecnologías',
  '06 Notas (opcional)',
  '07 Contacto',
];
const titulos = [
  'Índice',
  'Entre construir sistemas y entender por qué funcionan',
  'Herramientas, por área',
  '‹Título de la nota›',
  'Si estás construyendo algo parecido, hablemos.',
];
const tamanos = [
  [1280, 800],
  [834, 1112],
  [390, 844],
];
let navegador;
let perfilModificado = false;

function construir() {
  const env = { ...process.env };
  delete env.NO_COLOR;
  execFileSync('npm', ['run', 'build'], { stdio: 'inherit', env });
}
async function esperar(url) {
  for (let i = 0; i < 50; i++) {
    try {
      if ((await fetch(url)).ok) return;
    } catch {
      /* Arranque local. */
    }
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error(`Servidor no disponible: ${url}`);
}
async function temporal(ruta, contenido) {
  await writeFile(ruta, contenido, { flag: 'wx' });
  creados.add(ruta);
}
async function quitar(ruta) {
  if (!creados.has(ruta)) return;
  await unlink(ruta);
  creados.delete(ruta);
}
async function guardar(elemento, nombre, sitio = false) {
  const pagina = elemento.page();
  const viewport = pagina.viewportSize();
  const caja = await elemento.boundingBox();
  if (!caja || !viewport) throw new Error(`No se puede capturar ${nombre}`);
  // Conserva el ancho del dispositivo. Da espacio al scroll-padding para que
  // Chromium no deje sin pintar el final de una sección más alta que la ventana.
  await pagina.setViewportSize({
    width: viewport.width,
    height: Math.max(viewport.height, Math.ceil(caja.height) + 144),
  });
  try {
    await elemento.screenshot({
      path: `${carpeta}/${nombre}.png`,
      animations: 'disabled',
      ...(sitio
        ? { style: '[data-barra-global] { visibility: hidden !important; }' }
        : {}),
    });
  } finally {
    await pagina.setViewportSize(viewport);
  }
}

try {
  // No sobrescribe archivos que no haya creado este proceso.
  for (const ruta of [fotoRuta, ...notas]) {
    const existe = await access(ruta).then(
      () => true,
      () => false,
    );
    if (existe) throw new Error(`Ya existe la fixture: ${ruta}`);
  }
  await mkdir(carpeta, { recursive: true });
  await mkdir('src/content/notas/es', { recursive: true });
  await temporal(
    fotoRuta,
    '<svg xmlns="http://www.w3.org/2000/svg" width="540" height="675" viewBox="0 0 540 675"><rect width="540" height="675" fill="gray"/><circle cx="270" cy="250" r="90" fill="silver"/><path d="M90 675V540a180 180 0 0 1 360 0v135" fill="silver"/></svg>',
  );
  for (const [i, ruta] of notas.entries())
    await temporal(
      ruta,
      `---\ntitulo: '‹Título de la nota›'\nfecha: '2026-10-${25 - i}'\ntipo: 'Nota técnica'\nborrador: false\n---\n\n‹Nota temporal para verificar F2; no se entrega como contenido.›\n`,
    );
  perfilModificado = true;
  await writeFile(
    perfilRuta,
    JSON.stringify(
      {
        ...JSON.parse(perfilOriginal),
        foto: {
          ruta: '/f2-retrato-temporal.svg',
          alt: 'Imagen temporal para verificar el layout con foto',
        },
      },
      null,
      2,
    ) + '\n',
  );
  construir();
  servidores.push(
    spawn(process.execPath, ['scripts/servidor-e2e.mjs'], {
      env: { ...process.env, PORTAFOLIO_E2E_PORT: '4326' },
      stdio: 'ignore',
    }),
  );
  servidores.push(
    spawn('python3', ['-m', 'http.server', '4327', '--bind', '127.0.0.1'], {
      cwd: 'design/referencias',
      stdio: 'ignore',
    }),
  );
  await Promise.all([
    esperar('http://127.0.0.1:4326/'),
    esperar('http://127.0.0.1:4327/'),
  ]);
  navegador = await chromium.launch();
  const contexto = await navegador.newContext({
    baseURL: 'http://127.0.0.1:4326',
  });
  const pagina = await contexto.newPage();
  for (const [width, height] of tamanos) {
    await pagina.setViewportSize({ width, height });
    await pagina.goto('/');
    await pagina.evaluate(() => document.fonts.ready);
    await expect(pagina.locator('#notas ol > li')).toHaveCount(3);
    await expect(
      pagina.getByRole('link', { name: 'Todas las notas' }),
    ).toHaveAttribute('href', '#');
    await expect(
      pagina.getByRole('link', { name: 'Todas las notas' }),
    ).toHaveAttribute('aria-disabled', 'true');
    const foto = pagina.locator('.retrato img');
    await foto.scrollIntoViewIfNeeded();
    await expect(foto).toBeVisible();
    await expect
      .poll(() => foto.evaluate((el) => el.complete && el.naturalWidth > 0))
      .toBe(true);
    const caja = await foto.boundingBox();
    const texto = await pagina.locator('#sobre-mi .texto').boundingBox();
    const titulo = await pagina.locator('#sobre-mi .cabecera').boundingBox();
    if (width === 1280) {
      expect(caja.x).toBeLessThan(texto.x);
      expect(caja.width / caja.height).toBeCloseTo(4 / 5);
    }
    if (width === 834) {
      expect(caja.width).toBe(240);
      expect(caja.x).toBeLessThan(texto.x);
    }
    if (width === 390) {
      expect(caja.width / caja.height).toBeCloseTo(4 / 3);
      expect(caja.y).toBeGreaterThan(titulo.y);
      expect(texto.y).toBeGreaterThan(caja.y);
    }
    medidas.push({ ancho: width, foto: caja, texto, titulo, notasDeCuatro: 3 });
    await guardar(
      pagina.locator('#sobre-mi'),
      `sitio-sobre-mi-foto-temporal-${width}`,
      true,
    );
    await guardar(
      pagina.locator('#notas'),
      `sitio-notas-cuatro-temporales-${width}`,
      true,
    );
    const sinJS = await navegador.newContext({
      javaScriptEnabled: false,
      viewport: { width, height },
      baseURL: 'http://127.0.0.1:4326',
    });
    const paginaSinJS = await sinJS.newPage();
    await paginaSinJS.goto('/');
    await expect(paginaSinJS.locator('#notas ol > li')).toHaveCount(3);
    await sinJS.close();
  }
  await writeFile(perfilRuta, perfilOriginal);
  perfilModificado = false;
  await quitar(fotoRuta);
  for (const ruta of notas.slice(1)) await quitar(ruta);
  construir();
  for (const [width, height] of tamanos) {
    await pagina.setViewportSize({ width, height });
    await pagina.goto('/');
    await pagina.evaluate(() => document.fonts.ready);
    await expect(pagina.locator('#notas ol > li')).toHaveCount(1);
    await expect(
      pagina.getByRole('link', { name: 'Todas las notas' }),
    ).toHaveCount(0);
    await expect(pagina.locator('.retrato')).toHaveCount(0);
    await guardar(
      pagina.locator('#notas'),
      `sitio-notas-una-temporal-${width}`,
      true,
    );
  }
  await quitar(notas[0]);
  construir();
  const referencia = await navegador.newPage();
  await referencia.route('**/*', (r) =>
    r.request().url().startsWith('http://127.0.0.1:4327/') ||
    /^(blob|data):/.test(r.request().url())
      ? r.continue()
      : r.abort(),
  );
  await referencia.goto('http://127.0.0.1:4327/maqueta-1-portada.html');
  await referencia.locator('[data-screen-label="03 Índice"]').waitFor();
  await referencia.evaluate(() => document.fonts.ready);
  // Solo anota los contenedores de la maqueta; no altera sus estilos.
  await referencia.evaluate(() => {
    for (const ancho of [834, 390]) {
      const marco = [...document.querySelectorAll('div')].find(
        (el) =>
          el.style.width === `${ancho}px` &&
          el.style.background &&
          el.children.length > 5,
      );
      if (!marco) throw new Error(`No se encontró el marco de ${ancho}`);
      marco.setAttribute('data-f2-viewport', String(ancho));
    }
  });
  for (const [width, height] of tamanos) {
    await pagina.setViewportSize({ width, height });
    await referencia.setViewportSize({ width, height });
    await pagina.goto('/');
    await pagina.evaluate(() => document.fonts.ready);
    await expect(pagina.locator('#notas')).toHaveCount(0);
    const axe = await new AxeBuilder({ page: pagina }).analyze();
    await writeFile(
      `${carpeta}/axe-${width}.json`,
      JSON.stringify(
        {
          violations: axe.violations,
          incomplete: axe.incomplete,
          reglasCorrectas: axe.passes.length,
        },
        null,
        2,
      ) + '\n',
    );
    for (const [i, id] of secciones.entries()) {
      const ref =
        width === 1280
          ? referencia.locator(`[data-screen-label="${etiquetas[i]}"]`)
          : referencia.locator(`[data-f2-viewport="${width}"] > div`).filter({
              has: referencia.getByText(titulos[i], { exact: true }),
            });
      await guardar(ref, `maqueta-${id}-${width}`);
      if (width === 1280)
        await guardar(
          ref.locator('xpath=following-sibling::aside[1]'),
          `maqueta-margen-${id}`,
        );
      if (id !== 'notas')
        await guardar(pagina.locator(`#${id}`), `sitio-${id}-${width}`, true);
    }
    await pagina.emulateMedia({ reducedMotion: 'reduce' });
    await pagina.reload();
    await guardar(
      pagina.locator('#tecnologias'),
      `sitio-tecnologias-${width}-reduce`,
      true,
    );
    await pagina.emulateMedia({ reducedMotion: 'no-preference' });
    console.log(
      `F2: referencias, capturas, foto temporal y notas (4 → 3, 1 → 1, 0 → ausente): ${width}px.`,
    );
  }
  const filas = tamanos.flatMap(([width]) =>
    secciones.map(
      (id) =>
        `<section><h2>${id} · ${width} px</h2>${id === 'notas' ? '<p>Sección ausente en la entrega. Captura de una nota temporal, retirada después de comprobarla.</p>' : ''}<div class="par"><figure><figcaption>Implementación${id === 'notas' ? ' · fixture temporal' : ''}</figcaption><a href="sitio-${id}-${id === 'notas' ? 'una-temporal-' : ''}${width}.png"><img src="sitio-${id}-${id === 'notas' ? 'una-temporal-' : ''}${width}.png" alt="Implementación ${id} a ${width} px"></a></figure><figure><figcaption>Maqueta 1</figcaption><a href="maqueta-${id}-${width}.png"><img src="maqueta-${id}-${width}.png" alt="Referencia ${id} a ${width} px"></a></figure>${width === 1280 ? `<figure><figcaption>Notas al margen</figcaption><img src="maqueta-margen-${id}.png" alt="Notas de la maqueta para ${id}"></figure>` : ''}</div></section>`,
    ),
  );
  await writeFile(
    `${carpeta}/comparacion.html`,
    `<!doctype html><html lang="es"><meta charset="utf-8"><title>F2 · Comparación con Maqueta 1</title><style>body{font:16px system-ui;margin:24px;background:#10141d;color:#f4f1ea}h2{margin-top:48px}.par{display:grid;grid-template-columns:1fr 1fr;gap:24px;align-items:start}figure{margin:0}img{width:100%;height:auto}figcaption{margin-bottom:12px}.par figure:nth-child(3){grid-column:1/-1;max-width:400px}</style><h1>F2 · Comparación con Maqueta 1</h1><p>Capturas del build de este worktree y referencia servida offline. La barra fija se oculta solo al capturar para evitar que tape las secciones. Foto y notas son fixtures retiradas; los archivos adicionales conservan su evidencia. Sin Notas, Contacto es 06.</p>${filas.join('\n')}</html>`,
  );
  await writeFile(
    `${carpeta}/verificacion-temporales.json`,
    JSON.stringify(
      {
        medidas,
        fotoRetirada: true,
        notasRetiradas: true,
        buildFinalSinNotas: true,
      },
      null,
      2,
    ) + '\n',
  );
} finally {
  if (perfilModificado) await writeFile(perfilRuta, perfilOriginal);
  for (const ruta of [...creados]) await quitar(ruta);
  await navegador?.close();
  for (const servidor of servidores) servidor.kill();
  // También restaura dist si una comprobación falló mientras había fixtures.
  construir();
}
