# F0 · Base técnica

**Estado:** aprobada por Claude, pendiente de fusionar (Jorge)
**Rama:** `f0-base` · **Depende de:** — · **Escrito por:** Claude · **Fecha:** 2026-10-25

> Cómo lanzarlo en Codex: *«Lee AGENTS.md y docs/encargos/F0-base.md. Implementa solo ese encargo y termina con el informe que pide.»*

## Objetivo
Al terminar, el repositorio tiene un proyecto Astro que compila con todo lo que las fases siguientes dan por hecho:

- los tokens de Kairos y la tipografía Geist autoalojada;
- la infraestructura multilingüe (solo el español activo);
- las colecciones de contenido con esquema y contenido placeholder;
- el layout base con la resolución del tema sin parpadeo;
- los tests automáticos (contraste AA, paridad i18n, tokens sueltos) y la CI.

**Todavía no hay interfaz de secciones.**

## Leer antes
- `AGENTS.md`, completo.
- `design/docs/TOKENS.md` y `design/docs/tokens.css`, completos.
- `design/docs/PENDIENTES.md` § «Modelo de contenido sugerido».
- `design/docs/PAGINAS.md` § «Rutas».
- `design/docs/INTERACCIONES.md` § «Cambio de tema» y § «Reduced motion».
- `docs/ARQUITECTURA.md` § Enmiendas, § 4 (estructura) y § 6.1–6.3 (casuísticas C1–C3, C5, I1–I3 y V1–V7).
- `design/referencias/maqueta-1-portada.html` § 03 Índice y § 05 Tecnologías: **solo** para copiar los textos placeholder del contenido semilla.

## Incluye
1. **Proyecto Astro.**
   - La última versión estable, fijada en `package-lock.json`.
   - TypeScript `strict`, `@astrojs/mdx`, `npm` como gestor y la versión LTS de Node en `.nvmrc`.
   - Salida estática.
2. **Estructura de carpetas** (la de `docs/ARQUITECTURA.md` § 4, con las enmiendas):
   ```
   src/
   ├── content/
   │   ├── proyectos/es/*.mdx
   │   ├── notas/es/            # vacía, con .gitkeep: la sección 06 no se renderiza
   │   ├── perfil/es.json
   │   └── tecnologias/es.json
   ├── content.config.ts
   ├── i18n/{config.ts, index.ts, es.json, en.json}
   ├── styles/{tokens.css, global.css}
   ├── layouts/BaseLayout.astro
   ├── components/             # vacía, con .gitkeep
   └── pages/{index.astro, 404.astro, proyectos/[slug].astro}
   public/fonts/
   scripts/{verificar-tokens.mjs, contenido-pendientes.mjs}
   tests/
   .github/workflows/ci.yml
   ```
3. **Tokens.**
   - `src/styles/tokens.css` es una copia de `design/docs/tokens.css` con una cabecera de origen.
   - Un test comprueba que **cada variable de `design/docs/tokens.css` existe en `src/styles/tokens.css` con el mismo valor**, en ambos temas. Así no pueden divergir sin que salte.
4. **`global.css`:**
   - un reset moderno y breve;
   - `html` y `body` con `--bg`, `--text` y `--font-sans`, a 16/1,6;
   - el `:focus-visible` de los tokens;
   - la clase `.visualmente-oculto`, el estilo del enlace «Saltar al contenido» (solo visible con foco) y la utilidad `.num` con `font-variant-numeric: tabular-nums`.
5. **Fuentes.**
   - Geist (400, 500 y 600) y Geist Mono (400 y 500) en woff2, servidas **desde el propio origen**.
   - Pueden venir del paquete npm oficial `geist` o de Fontsource; elige uno y justifícalo en el informe.
   - `font-display: swap`, `preload` de Geist 400 y 600, y el archivo de licencia OFL incluido junto a las fuentes.
6. **i18n.**
   - `src/i18n/config.ts`:
     - `IDIOMA_BASE = 'es'`;
     - `IDIOMAS_ACTIVOS = ['es']`;
     - `IDIOMAS_PREPARADOS = ['es', 'en']`.
   - En `astro.config`: `i18n` con `defaultLocale: 'es'`, `locales` = `IDIOMAS_ACTIVOS` y `routing.prefixDefaultLocale: false`. El español vive en la raíz (`/`, `/proyectos/<slug>`) y los demás idiomas llevarán prefijo (`/en/…`).
   - Helpers en `src/i18n/index.ts`:
     - `t(idioma, clave, vars?)`: con la clave inexistente, lanza un error en desarrollo y en el build;
     - `ruta(idioma, camino)`;
     - `formatearFecha(idioma, fecha)`, con `Intl`.
   - `es.json` y `en.json` con **las mismas claves**: por ahora, solo los textos que usa F0 («Saltar al contenido», los títulos de 404 y el aviso de respaldo de idioma de C2). Los textos de interfaz se pueden traducir; el contenido personal, no.
   - Un test falla si un JSON tiene claves que el otro no tiene.
   - Contenido por idioma: `obtenerProyectos(idioma)` devuelve los del idioma pedido y, si falta la traducción, la versión en español con `esRespaldo: true` (casuística C2). Debe funcionar en cuanto se añada `'en'` a `IDIOMAS_ACTIVOS`; un test lo comprueba con datos de prueba.
7. **Colecciones** (`src/content.config.ts`, con el *content layer* y el cargador `glob`/`file`), según el modelo de `PENDIENTES.md`:
   - **`proyectos`**:
     - el `slug` sale del nombre del archivo y el idioma, de la carpeta;
     - campos: `titulo`, `tipo` (`ing | inv | hib`), `anio`, `resumen`, `herramientas[]`, `rol`, `destacado`, `orden_destacado?`, `enlaces{repo?, demo?, pdf?}`, `capitulos_relato?` y `estado` (`activo | terminado | archivado`, por defecto `terminado`, casuística C5);
     - además, `borrador: boolean`, que indica contenido placeholder.
   - **Reglas del esquema:**
     - si `destacado` es `true`, `orden_destacado` (1–3) y `capitulos_relato` son obligatorios;
     - `orden_destacado` no se repite;
     - los campos de texto y `anio` aceptan un placeholder con la forma `‹…›` (por ejemplo, `‹año›`).
   - **`notas`**: `titulo`, `fecha`, `tipo` y `borrador`.
   - **`perfil`** (un JSON por idioma): `frase_hero`, `presentacion`, `preguntas[{tipo, texto}]`, `trayectoria[]`, `cv{url, fecha}` y `contacto{email, github, linkedin}`.
   - **`tecnologias`** (un JSON por idioma): `areas[{id, nombre, herramientas[]}]`, exactamente 5 áreas (ver § 05 de la maqueta).
   - **Validación cruzada:** el build falla si un proyecto usa una herramienta que no aparece en `tecnologias`. La relación herramienta → proyectos **se deriva**, nunca se duplica.
8. **Contenido semilla, solo con placeholders:**
   - los **7 proyectos** de la Maqueta 1 § 03, con sus textos placeholder exactos (‹Proyecto destacado 2›, ‹Proyecto 04›…) y sus tipos;
   - 3 destacados;
   - `perfil/es.json` y `tecnologias/es.json` con los placeholders de § 04, § 05 y § 07;
   - todos con `borrador: true`;
   - **no añadas ningún valor que no aparezca en la maqueta**: si falta uno, usa `‹…›`.
9. **`BaseLayout.astro`.**
   - Props: `titulo`, `descripcion`, `idioma` y `tema: 'cosmos' | 'elegible'`.
   - Pone `<html lang>` y `<meta charset>`, el viewport y la descripción.
   - El enlace «Saltar al contenido» es el **primer elemento enfocable** y apunta a `<main id="contenido">`.
   - Con `tema="cosmos"`: `data-theme="cosmos"` fijo y sin script.
   - Con `tema="elegible"`:
     - un script **`is:inline` en el `<head>`, antes de pintar**, lee `localStorage['tema']` (`cosmos | dawn | sistema`);
     - con `sistema`, resuelve `prefers-color-scheme`;
     - pone `data-theme` y va envuelto en `try/catch`;
     - el valor por defecto es `cosmos`.
10. **Páginas mínimas** (temporales; las sustituyen F2 y F3):
    - `index.astro` (`tema="cosmos"`): un h1 con `frase_hero` del perfil y la lista de los proyectos con su título y tipo, solo para demostrar que las colecciones funcionan.
    - `proyectos/[slug].astro` (`tema="elegible"`): título, resumen y cuerpo MDX.
    - `404.astro`.
11. **Calidad:**
    - ESLint con `eslint-plugin-astro` y su configuración de accesibilidad, más Prettier con `prettier-plugin-astro`.
    - **`scripts/verificar-tokens.mjs`:**
      - falla si encuentra hex, `rgb(`, `rgba(`, `hsl(`, una duración (`\d+m?s`) o `cubic-bezier(` en archivos `.css`, en bloques `<style>` o en atributos `style=` dentro de `src/`;
      - la única excepción es `src/styles/tokens.css`.
    - **`scripts/contenido-pendientes.mjs`:**
      - lista, por archivo, los placeholders `‹…›` y los `borrador: true`;
      - en modo informe sale con 0; con `--estricto`, sale con 1 si encuentra alguno (lo usará F8).
    - **Tests con Vitest:**
      - contraste AA;
      - igualdad de tokens;
      - paridad i18n;
      - esquemas (un proyecto inválido falla);
      - respaldo de idioma.
12. **Test de contraste** (`tests/contraste.test.ts`).
    - Lee `src/styles/tokens.css` y comprueba ≥ 4,5:1 en **los dos temas**. Las mezclas con alfa se componen sobre `--bg`.
    - Pares:
      - `text`, `heading`, `muted`, `accent`, `accent-hover`, `eng`, `res` y `link` sobre `bg`;
      - `muted` sobre `surface`, `surface-2` y `surface-hover`;
      - `text` sobre `surface-hover` y sobre `selected`;
      - `on-accent` sobre `accent` y sobre `accent-hover`;
      - `accent` sobre `accent-tint`;
      - `pending-fg` sobre `pending-bg`;
      - `heading` sobre `res` al 8 % y `text` sobre `accent` al 8 % (los bloques de C10).
13. **Scripts de `package.json`:** `dev`, `build`, `preview`, `check` (`astro check` + `eslint` + `verificar-tokens`), `test`, `format` y `contenido:pendientes`.
14. **CI** (`.github/workflows/ci.yml`):
    - se ejecuta en cada *pull request* y en cada *push* a `main`;
    - pasos: Node desde `.nvmrc`, `npm ci`, `check`, `test` y `build`.
15. **Documentación:**
    - en `README.md`, cómo instalar y los comandos;
    - en `AGENTS.md` § Comandos, la tabla ajustada a los comandos reales.

## No incluye
- Barra global, menú y pie de página (F1).
- Ninguna sección de la portada ni la plantilla de artículo (F2 y F3).
- La transición de color al cambiar de tema y el selector de tema (F3).
- El scroll suave y el desfase de anclas (F1).
- Activar `en`, el selector de idioma, `hreflang` y el sitemap (F7 y F8).
- Conectar Cloudflare Pages (F0.5); dominio, analytics, OG y favicon (F8).
- Tailwind, React o Preact: **no los instales**.

## Trampas conocidas
- Un `<script>` normal en Astro se empaqueta y se difiere, y entonces el tema parpadea. El script del tema tiene que ser `is:inline` y estar en el `<head>`.
- `prefixDefaultLocale: false` con un solo idioma activo puede esconder errores de rutas. Por eso el test de respaldo debe simular `IDIOMAS_ACTIVOS = ['es', 'en']`.
- `‹…›` usa los caracteres U+2039 y U+203A, no `<` ni `>`.
- Los fragmentos `#` de los `href` (por ejemplo `#contenido`) no son colores. `verificar-tokens` solo mira CSS: archivos `.css`, `<style>` y `style=`.
- No inventes contenido semilla «para que se vea mejor».

## Criterios de aceptación
- [x] `npm ci && npm run check && npm test && npm run build` termina sin errores **ni advertencias**.
- [x] `dist/index.html` contiene `<html lang="es"` y `data-theme="cosmos"`.
- [x] `grep -rE "googleapis|gstatic|jsdelivr|unpkg|cdnjs" dist/` no devuelve nada, y las fuentes woff2 están en `dist/`.
- [x] El primer `Tab` en `/` enfoca «Saltar al contenido», que se ve con el contorno de foco. Hay que adjuntar una captura.
- [x] En `/proyectos/<slug>`, con `localStorage.tema = 'dawn'` y recargando, `document.documentElement.dataset.theme === 'dawn'` ya en el primer fotograma. Verificarlo con Playwright y explicar en el informe cómo se comprobó.
- [x] En `/`, con `localStorage.tema = 'dawn'`, el tema sigue siendo `cosmos`.
- [x] Al emular `prefers-reduced-motion: reduce`, `getComputedStyle(document.documentElement).getPropertyValue('--dur')` vale `0ms`.
- [x] Hay que probar a romper el contenido, pegar en el informe la salida de cada prueba y deshacer el cambio:
  - quitar `tipo` de un proyecto hace fallar el build con un mensaje que nombra el archivo y el campo;
  - poner `destacado: true` sin `capitulos_relato` hace fallar el build;
  - usar una herramienta inexistente hace fallar el build;
  - meter un `#fff` en un `<style>` hace fallar `npm run check`.
- [x] El test de contraste cubre todos los pares del punto 12 en ambos temas y pasa.
- [x] El test de igualdad de tokens pasa, y falla si se cambia un valor en una sola de las dos copias.
- [x] `npm run contenido:pendientes` lista los placeholders del contenido semilla, y `-- --estricto` sale con 1.
- [x] No hay dependencias de Tailwind, React ni Preact en `package.json`.

## Si te bloqueas
Si una fuente se contradice, falta un dato o algo exige rediseñar, **no lo decidas tú**. Implementa lo que no dependa de eso y deja la pregunta en el informe.

## Informe de entrega
Añádelo al final de este archivo, en la sección «Informe»:
1. **Hecho:** la lista de entregables, con sus rutas.
2. **Verificación:** los comandos ejecutados con su resultado real; las capturas del foco y del tema en `docs/encargos/capturas/F0/`; y la salida de las pruebas de romper el contenido.
3. **Desviaciones:** qué difiere del encargo y por qué. Por ejemplo, la fuente elegida y la versión de Astro.
4. **Preguntas abiertas.**
5. **No verificado:** lo que no pudiste comprobar.

---

## Informe
### Hecho (entrega parcial)

Se prepararon los siguientes archivos en `f0-base`, sin tocar `main` ni fusionar:

- Proyecto estático: `package.json`, `package-lock.json`, `.nvmrc`, `astro.config.ts`, `tsconfig.json` y `.gitignore`.
- Colecciones y validadores: `src/content.config.ts`, `src/content/esquemas.ts`, `src/content/validacion.ts` y `src/content/consultas.ts`.
- Semilla: siete MDX en `src/content/proyectos/es/`, tres destacados, `perfil/es.json`, `tecnologias/es.json` y las carpetas vacías requeridas con `.gitkeep`.
- Infraestructura i18n: `src/i18n/{config.ts,index.ts,es.json,en.json}`; español activo, inglés preparado y selección con respaldo español.
- Tokens, CSS base, fuentes locales con licencia, `src/layouts/BaseLayout.astro` y las tres páginas temporales requeridas.
- Scripts de tokens y pendientes en `scripts/`, suites de Vitest en `tests/`, configuración de ESLint/Prettier y `.github/workflows/ci.yml`.
- Comandos e instalación documentados en `README.md` y `AGENTS.md`.

Los archivos están escritos, pero **no se declara que compilen ni que satisfagan todos los criterios**. Se interrumpió el trabajo al aparecer el bloqueo de permisos descrito a continuación.

### Verificación real y bloqueo

- Inicio: `git status --short --branch` mostró `## f0-base`, sin cambios previos.
- Entorno inicial: Node `v26.11.1`, npm `11.20.0`. Se obtuvo Node `v24.22.1` con `npm exec --yes --package=node@24 -- node -p 'process.version + " " + process.execPath'`. Las instalaciones y el intento de check usaron ese ejecutable mediante `PATH`; no se modificó Node global.
- `npm view astro version engines`: Astro `7.4.2` estable. Se fijaron versiones exactas y lockfile.
- Instalación de Astro/MDX: exit 0, 186 paquetes añadidos, 0 vulnerabilidades.
- La primera instalación de herramientas falló con `ERESOLVE`: `eslint-plugin-jsx-a11y@6.10.2` admite ESLint hasta 9 y el plugin Astro actual requiere ESLint 10. Se usó la alternativa compatible documentada `eslint-plugin-jsx-a11y-x`, sin `--force` ni `--legacy-peer-deps`.
- Instalación de herramientas con esa alternativa: exit 0, 210 paquetes añadidos, 0 vulnerabilidades. Emitió una advertencia de npm sobre el script de instalación de `fsevents@2.3.3` no cubierto por `allowScripts`. No se ha resuelto ni se afirma instalación sin advertencias.
- `npm run check`: **exit 1, bloqueado antes del análisis**. Salida:

```text
> portafolio-jorge-quenta@0.0.0 check
> astro check && eslint . --max-warnings 0 && node scripts/verificar-tokens.mjs

EPERM: operation not permitted, mkdir '/Users/pobidau/Library/Preferences/astro'
  Location:
    /Users/pobidau/2nd Brain/portafolio/node_modules/@astrojs/telemetry/dist/config.js:54:6
  Stack trace:
    at Object.mkdirSync (node:fs:1410:26)
    at get store (file:///Users/pobidau/2nd%20Brain/portafolio/node_modules/@astrojs/telemetry/dist/config.js:37:8)
    at AstroTelemetry.getConfigWithFallback (file:///Users/pobidau/2nd%20Brain/portafolio/node_modules/@astrojs/telemetry/dist/index.js:47:36)
    at get isDisabled (file:///Users/pobidau/2nd%20Brain/portafolio/node_modules/@astrojs/telemetry/dist/index.js:78:15)
    at notify (file:///Users/pobidau/2nd%20Brain/portafolio/node_modules/astro/dist/cli/telemetry/index.js:5:18)
```

La ruta está fuera de las raíces de escritura autorizadas. Siguiendo la instrucción de Jorge de documentar y terminar ante un bloqueo de permisos, no se amplió acceso ni se intentó una configuración alternativa para continuar.

- Se intentó el primer commit pequeño con `git add` de la infraestructura seguido de `git commit -m 'Prepara la base de Astro y las herramientas de calidad'`. `git add` terminó con **exit 128**, por lo que no llegó a ejecutarse el commit:

```text
fatal: Unable to create '/Users/pobidau/2nd Brain/portafolio/.git/index.lock': Operation not permitted
```

La política del entorno permite leer `.git`, pero no escribir en él. No se han creado commits, incluido el commit final solicitado. Los cambios y este informe quedan guardados en el árbol de trabajo de `f0-base`; `main` no se modificó.

- `git diff --check`: exit 0.
- `npm run build`: **no ejecutado**.
- `npm test`: **no ejecutado**.
- `npm ci`: **no ejecutado**; la instalación realizada fue `npm install`.
- No se ejecutaron las pruebas de romper contenido ni la mutación de tokens; por ello no hay salidas que adjuntar ni mutaciones temporales pendientes de deshacer.

### Desviaciones y decisiones de implementación

- Entrega incompleta por el bloqueo: los criterios de aceptación siguen sin marcar.
- Astro `7.4.2` y MDX `8.1.1`, versiones estables consultadas en npm. Referencia de API: [colecciones de Astro](https://docs.astro.build/en/guides/content-collections/).
- Node `24.22.1`: rama LTS vigente; Node 26 figura como Current en la [tabla oficial de versiones](https://nodejs.org/en/about/previous-releases).
- Fuentes: Fontsource (`@fontsource/geist` y `@fontsource/geist-mono`, ambas `5.3.0`) permite copiar los cinco pesos estáticos woff2 latinos pedidos y sus licencias OFL, sin integración de framework ni peticiones externas en ejecución. Los paquetes son dependencias de desarrollo; los archivos publicados están en `public/fonts/`.
- Accesibilidad: se eligió `eslint-plugin-jsx-a11y-x`, alternativa admitida por la [documentación de eslint-plugin-astro](https://ota-meshi.github.io/eslint-plugin-astro/user-guide/), por compatibilidad con ESLint 10. Su configuración aún no se ha ejecutado.
- Se conservaron literalmente el título «Coordinación multiagente», su resumen y las herramientas/relaciones presentes en la maqueta. Todo está marcado `borrador: true`; no se presenta como información personal confirmada. Para datos ausentes se usó `‹…›`, incluida `frase_hero`, ya que F0 solo autoriza extraer contenido de las secciones señaladas.
- `trayectoria` y `capitulos_relato` se modelaron como listas de texto; el encargo no especifica una estructura interna adicional.
- La validación cruzada se invoca desde `obtenerProyectos`, utilizado por la portada y las rutas de artículos durante el build. No se ha comprobado todavía su fallo real en Astro.

### Preguntas abiertas

- ¿Cómo desea Jorge resolver el acceso de Astro a su configuración de telemetría para reanudar la verificación? Se necesita una nueva indicación antes de continuar desde este bloqueo.
- Hace falta un entorno con escritura autorizada en `.git` para crear los commits pendientes y el commit final del informe.

### No verificado y trabajo pendiente

- Compilación, tipos, lint, formato, contraste (los 38 pares están escritos pero no ejecutados), igualdad de tokens, esquemas, paridad i18n y respaldo de idioma.
- El cargador `glob` de Astro registra una advertencia cuando una colección está vacía. Se detectó leyendo su implementación instalada; aún queda resolver el caso esperado de `notas/es/` vacío para cumplir el requisito de cero advertencias, sin ocultar otros avisos.
- Instalación reproducible con `npm ci` y advertencia de `fsevents`.
- `contenido:pendientes` en ambos modos, y las cinco pruebas negativas solicitadas (cuatro de contenido/CSS y una de igualdad de tokens).
- HTML de `dist`, ausencia de CDN, pesos publicados y render MDX.
- Playwright: foco del primer Tab, tema en primer fotograma, Cosmos fijo en portada, Sistema, storage bloqueado y reduced motion.
- No hay capturas en `docs/encargos/capturas/F0/`: no se llegó a ejecutar el sitio ni el navegador. No se realizó comparación a 1280, 834, 390 o 360 px. F0 no implementa las secciones visuales de la referencia.
- CI remota no ejecutada.


## Revisión
**Claude, 2026-10-25.** Codex dejó F0 casi completa, pero sin verificar: el sandbox le impidió escribir en `.git` y en la configuración global de Astro. Claude completó la verificación y corrigió lo que faltaba.

### Verificación (comandos reales, Node 24.22.1 y también Node 26.11.1)
- `npm ci`: sin advertencias, una vez denegado el script de instalación de `fsevents`, que trae un binario precompilado.
- `npm run check`: 0 errores, 0 advertencias y 0 sugerencias. ESLint, `verificar-tokens` y Prettier, correctos.
- `npm test`: 50 de 50 en 5 archivos.
- `npm run build`: 9 páginas y ninguna advertencia.
- `dist/index.html`: `<html lang="es" data-theme="cosmos">`, sin dominios de terceros y con las 5 woff2 en `dist/fonts/`.
- **Playwright** (`astro preview`):
  - el primer Tab enfoca «Saltar al contenido» (`#contenido`), con contorno sólido de 2 px en rgb(201,160,106) y separación de 2 px (captura en `capturas/F0/foco-saltar.png`);
  - con `localStorage.tema='dawn'`, el artículo carga en `dawn` (fondo rgb(247,243,234)) y la portada sigue en `cosmos`;
  - el script del tema va en línea y es lo primero del `<head>`, antes de cualquier estilo: no puede haber un fotograma con el tema equivocado;
  - con reduced motion, `--dur`, `--dur-fast` y `--dur-layout` valen `0s`, y sin él `--dur` vale `.2s`.
- **Pruebas de romper el contenido.** Las cinco fallan como deben y se restauraron con git:
  - sin `tipo`: `InvalidContentEntryDataError … es/proyecto-04 … tipo: Invalid option`;
  - destacado sin capítulos: `capitulos_relato: Un proyecto destacado requiere capitulos_relato`;
  - herramienta inexistente: `proyecto-04.mdx: herramientas: «NoExiste» no aparece en tecnologias/es.json`;
  - `#fff` en un `<style>`: `src/pages/404.astro:11: token suelto «#fff»` y `check` sale con 1;
  - `--muted` cambiado en una sola copia: falla `tests/tokens.test.ts`.
- `contenido:pendientes`: 64 pendientes, sale con 0; con `--estricto`, sale con 1.

### Correcciones de Claude
1. **Colección vacía de notas:** el aviso de `glob` impedía cumplir «cero advertencias». Ahora `globOpcional` (en `content.config.ts`) deja la colección vacía cuando no hay archivos y usa `glob` en cuanto existe la primera nota.
2. **Telemetría de Astro desactivada en los scripts** (`ASTRO_TELEMETRY_DISABLED=1`). Escribía en `~/Library/Preferences` y era lo que bloqueaba a Codex.
3. **`engines`** pasa de `>=24.22.1 <25` a `>=24.22.1`: funciona igual con Node 26, que es el instalado en local. La CI sigue en `.nvmrc`.
4. **Prettier dentro de `check`**, con el código formateado. `src/styles/tokens.css` queda excluido de Prettier: el formateador rompía el lector de tokens de los tests (39 fallos), y la copia tiene que ser literal.
5. **`AGENTS.md`:** qué hacer si el sandbox bloquea `.git` (seguir sin hacer commit) y cómo evitar escribir fuera del repositorio.

### Notas para fases siguientes
- **Contenido semilla con nombres concretos.** «Coordinación multiagente», su resumen y las herramientas (PyTorch, FastAPI, GCP…) vienen literalmente de la Maqueta 1. Son ejemplos de Claude Design, no datos de Jorge. Están marcados `borrador: true` y deben sustituirse (§ 5 de `PLAN.md`).
- **El lector de tokens de los tests depende del formato del CSS.** Funciona con la copia literal; si alguna vez se reformatea `tokens.css`, hay que hacer el lector más robusto.
- **`astro preview` se ejecuta como proceso independiente en Astro 7** (`astro preview stop` para pararlo). Hay que tenerlo en cuenta en los tests e2e de F1.

**Recomendación:** fusionar en `main`.
