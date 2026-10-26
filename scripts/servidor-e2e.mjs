import { createServer } from 'node:http';
import { URL } from 'node:url';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';

const raiz = resolve('dist');
const puerto = Number(process.env.PORTAFOLIO_E2E_PORT ?? 4321);
const tipos = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.woff2': 'font/woff2',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.pdf': 'application/pdf',
};
createServer(async (peticion, respuesta) => {
  try {
    const url = new URL(peticion.url, 'http://localhost');
    let archivo = resolve(raiz, `.${decodeURIComponent(url.pathname)}`);
    if (archivo !== raiz && !archivo.startsWith(raiz + sep)) {
      respuesta.writeHead(403).end();
      return;
    }
    if ((await stat(archivo)).isDirectory())
      archivo = resolve(archivo, 'index.html');
    const contenido = await readFile(archivo);
    respuesta.writeHead(200, {
      'Content-Type': tipos[extname(archivo)] ?? 'application/octet-stream',
    });
    respuesta.end(contenido);
  } catch {
    respuesta.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    respuesta.end('404');
  }
}).listen(puerto, '127.0.0.1', () =>
  console.log(`E2E: http://127.0.0.1:${puerto}`),
);
