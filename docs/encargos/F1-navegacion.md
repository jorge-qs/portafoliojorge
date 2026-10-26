# F1 · Navegación global

**Estado:** aprobada por Claude, pendiente de fusionar (Jorge)
**Rama:** `f1-navegacion` · **Depende de:** F0 (en `main`) · **Escrito por:** Claude · **Fecha:** 2026-10-25

> Cómo lanzarlo en Codex: *«Lee AGENTS.md y docs/encargos/F1-navegacion.md. Implementa solo ese encargo y termina con el informe que pide.»*

## Objetivo
Al terminar se puede recorrer el sitio entero con la navegación definitiva:

- la barra global en sus estados de portada y de artículo;
- el menú móvil a pantalla completa;
- el pie de página;
- las anclas, con su desfase y la gestión del foco;
- la detección de la sección activa.

La portada tiene el esqueleto de sus 7 secciones, con el encabezado C1 y alturas reservadas, para que la navegación se pueda probar de verdad. Queda montada la infraestructura de tests e2e con Playwright y axe, que usarán todas las fases siguientes.

## Leer antes
- `AGENTS.md`, completo. Atención a § Forma de trabajar: qué hacer si el sandbox bloquea `.git`.
- `design/docs/INTERACCIONES.md` § Navegación, § Estados de la barra global y § Reduced motion (global).
- `design/docs/PAGINAS.md` § Rutas, § Portada (la tabla de alturas), § Navegación global y § 07 Contacto (solo la frase del pie).
- `design/docs/COMPONENTES.md` C1, C2, C3 y la fila «Barra global».
- `design/docs/TOKENS.md` § Tipografía, § Espaciado y § Retícula y puntos de corte.
- `design/docs/DECISIONES.md` § Notas y § Resueltas en la consolidación (la fila «Barras dentro del relato»).
- Referencias, servidas con `python3 -m http.server` desde `design/referencias/`:
  - `maqueta-3-sistema.html` § N: estados 1, 3 y 4 de la barra y el menú móvil abierto;
  - `maqueta-1-portada.html`: la barra sobre el hero y el pie, a 1280, 834 y 390 px;
  - `maqueta-2-articulos.html`: la barra y el pie del artículo, en escritorio.

## Incluye
1. **Configuración de secciones** (`src/config/secciones.ts`): una lista ordenada de la portada.

   | Número | Sección | Ancla |
   |---|---|---|
   | 01 | Hero | ninguna |
   | 02 | Proyectos | `#proyectos` |
   | 03 | Índice | `#indice` |
   | 04 | Sobre mí | `#sobre-mi` |
   | 05 | Tecnologías | `#tecnologias` |
   | 06 | Notas | `#notas`, solo si hay notas |
   | 07 | Contacto | `#contacto` |

   - Cada entrada lleva su clave i18n.
   - Una función devuelve las secciones visibles con **su número recalculado**: sin notas, Contacto es 06.
   - La barra, el menú y C1 usan esta única fuente.
2. **`EncabezadoSeccion.astro` (C1):**
   - el kicker con el número en `--accent` y el nombre en `--muted`, a 13 px con 12 px de separación;
   - 14 px por debajo, el h2 a 40/600/1,15/−2 % (28–30 en móvil);
   - el h2 lleva `id` y `tabindex="-1"` para poder recibir el foco desde un ancla.
3. **Esqueleto de la portada** (`src/pages/index.astro`). Sustituye la página temporal de F0.
   - Cada sección es un `<section>` con su ancla y `aria-labelledby` apuntando a su h2.
   - La altura mínima de cada sección es la de `PAGINAS.md` § Portada: hero de 100 svh, 02 de 4 × 100 svh por relato × 3, 03 ~900, 04 ~850, 05 ~800, 06 ~450 y 07 880.
   - El ritmo entre secciones es el de `TOKENS.md` § Espaciado.
   - El contenido de cada sección es solo C1 más un bloque vacío marcado para F2, F5 o F6.
   - El hero lleva un h1 visualmente oculto con el nombre de `perfil`. La sección 02 no tiene encabezado C1, porque su papel lo hará la cabecera del relato en F5: lleva un h2 visualmente oculto con `id`.
4. **`BarraGlobal.astro`**, con `data-estado`. Va fuera de `<main>`, en el `<header>` del layout.
   - **Estado `hero`** (portada, mientras el hero está a la vista):
     - sin fondo, con padding de 28 / 64;
     - texto a 14: JORGE (enlace a `/`) · Proyectos · Notas (solo si hay notas) · Sobre mí · Contacto · CV;
     - CV es un enlace en `--accent` al `cv.url` del perfil.
   - **Estado `relato`:** solo preparado. Se aplica con `data-estado="relato"` y oculta la barra (`transform` + `inert`). F5 lo activará; en F1 no se activa nunca.
   - **Estado `fija`** (portada desde 03 hasta 07):
     - mide 56 px (`--nav-h`), es *sticky* o fija arriba, con fondo `--bg` al 94 % (por ejemplo, `color-mix` sobre el token) y un filete `--line` abajo;
     - **se oculta al bajar y reaparece al subir**, con `translateY` en `--dur` y `--ease-inout`;
     - la sección activa va en `--heading` con un subrayado de oro de 2 px y `aria-current="location"`.
   - **Estado `articulo`** (`/proyectos/<slug>`):
     - igual que `fija`, siempre visible, más la miga de pan «Proyectos / Ingeniería | Investigación | Híbrido» según `tipo`;
     - «Proyectos» lleva a `/#indice`;
     - deja **huecos vacíos y con nombre** para el selector de tema y la barra de progreso de 2 px, que llegan en F3. No los implementes.
   - **Móvil** (< 768, y en tablet si la Maqueta 1 lo muestra así): JORGE y un botón «Menú» de 44 × 44 px como mínimo, con `aria-expanded` y `aria-controls`. Si la maqueta móvil no muestra cómo es el botón, usa el texto «Menú» a 14 px y anótalo en el informe.
   - Los enlaces de sección apuntan a `/#ancla` desde cualquier página y a `#ancla` dentro de la portada.
5. **Comportamiento de la barra** (`<script>` TS vanilla, en un módulo pequeño):
   - el estado `hero` → `fija` cambia cuando el final del hero sale del viewport (IntersectionObserver), no con cálculos de scroll en cada fotograma;
   - la sección activa se detecta con IntersectionObserver;
   - **ocultar al bajar** solo se dispara con un desplazamiento hacia abajo de más de 8 px y **nunca** al saltar a un ancla, al recibir foco por teclado ni durante el scroll suave de un ancla; mientras algo de la barra tiene el foco, sigue visible;
   - **reduced motion:** sin transición, y la barra se oculta y reaparece por corte.
6. **Anclas:**
   - `scroll-padding-top: 72px` en `html`;
   - scroll suave solo con `prefers-reduced-motion: no-preference`;
   - al activar un ancla de la barra o del menú: la URL se actualiza (`#indice`) y **el foco pasa al h2 de la sección**, una vez terminado el scroll;
   - si la carga llega con un hash, la sección queda alineada y la barra no la tapa.
7. **`MenuMovil.astro`**, a pantalla completa sobre `--bg`:
   - cabecera con JORGE y «Cerrar ✕»;
   - lista numerada con las secciones visibles de `secciones.ts` (02 Proyectos … 07 Contacto) a 24/600, y la sección actual en `--accent` con el texto «estás aquí»;
   - al pie: «Descargar CV · PDF ↓» como botón primario (C2), GitHub ↗, LinkedIn ↗ y Correo, todo desde `perfil`;
   - **comportamiento:** bloquea el scroll del fondo, atrapa el foco, deja el resto de la página `inert` y se cierra con ✕, con Esc o al elegir una sección (que entonces navega con la regla 6). Al cerrarse, el foco vuelve al botón «Menú»;
   - entra con opacidad y `translateY` de 16 px en `--dur`; con reduced motion, aparece sin animación.
8. **`PiePagina.astro`**, a 13 px y en `--muted`. Copia los textos de las maquetas.
   - **Portada:** «© ‹año› Jorge Quenta» a la izquierda y «Volver arriba ↑» a la derecha, que enfoca el «Saltar al contenido» o el inicio. **Sin el control «Tema»:** ver «Decisión aplicada».
   - **Artículo:** «© ‹año› Jorge Quenta» y las filas Correo · GitHub ↗ · LinkedIn ↗ · CV ↓, como en la Maqueta 2.
   - El año sale de `perfil` o se deja como placeholder. **No uses el año actual del sistema**, porque es un dato que Jorge debe confirmar.
9. **Componentes base `Boton.astro` (C2) y `Enlace.astro` (C3)**, con las variantes de `COMPONENTES.md` y sus estados (hover, foco, pulsar a escala 0,98 y nada con reduced motion). Los usan el menú y el pie; F2 los reutilizará.
   - Enlace externo: `target="_blank"`, `rel="noopener"`, ↗ y un texto oculto «(se abre en una pestaña nueva)» desde i18n.
10. **Layout:**
    - `BaseLayout` acepta un `<header>` con la barra y un `<footer>` con el pie, fuera de `<main>`;
    - «Saltar al contenido» sigue siendo el **primer** elemento enfocable;
    - `src/pages/proyectos/[slug].astro` usa la barra en estado `articulo` y el pie de artículo.
11. **i18n:** todos los textos nuevos van en `es.json` y `en.json`, con las mismas claves. Los nombres de las secciones, «Menú», «Cerrar», «estás aquí», «Volver arriba» y los textos ocultos se pueden traducir al inglés; los datos de `perfil`, no.
12. **Tests e2e** (Playwright + `@axe-core/playwright`):
    - **Navegadores dentro del repo:** `PLAYWRIGHT_BROWSERS_PATH=.cache/ms-playwright`, ignorado por git, para que el sandbox pueda instalarlos. Añade el script `npm run e2e:instalar`.
    - **Servidor:** `astro preview` se queda en segundo plano en Astro 7 (ver la revisión de F0) y el `webServer` de Playwright necesita un proceso en primer plano. Usa un servidor estático en primer plano sobre `dist/`: una devDependency ligera o un script Node propio en `scripts/`.
    - Script `npm run e2e` y un trabajo `e2e` en la CI que instale Chromium y lo ejecute tras el build.
    - **Proyectos de Playwright:** escritorio (1280 × 800), tablet (834 × 1112) y móvil (390 × 844).
    - **Pruebas mínimas:**
      - axe sin violaciones en `/` y en un artículo, en los tres tamaños;
      - el primer Tab es «Saltar al contenido»;
      - el ancla `#indice` desde la barra deja el h2 de 03 enfocado, visible y no tapado por la barra (su `top` ≥ 56);
      - el estado `hero` pasa a `fija` al bajar, se oculta al seguir bajando, reaparece al subir y la sección activa lleva `aria-current`;
      - **el menú móvil:** se abre, el foco queda atrapado (Tab y Shift+Tab ciclan dentro), Esc lo cierra y devuelve el foco, y elegir una sección navega y lo cierra;
      - sin notas, el menú y C1 muestran Contacto como 06;
      - con `reducedMotion: 'reduce'`, el menú aparece sin transición (duración computada 0);
      - a 360 px no hay scroll horizontal (`scrollWidth <= clientWidth`).
13. **Capturas** en `docs/encargos/capturas/F1/`:
    - la barra en los estados `hero`, `fija` y `articulo`, y el menú abierto;
    - a 1280, 834 y 390 px;
    - cada una junto a la sección equivalente de la maqueta (dos imágenes o una compuesta).

## No incluye
- El contenido de las secciones 03–07 (F2) y los componentes C4–C12 (F2–F4).
- El hero y el relato: solo hay bloques reservados. Activar el estado `relato` (F5).
- El selector de tema, la barra de progreso de lectura, «Capítulos ▾» y la hoja «Aa» (F3). Solo se dejan sus huecos.
- El selector de idioma (F7).
- View Transitions entre páginas (F4).

## Decisión aplicada
**D10:** el pie de la portada se queda **sin el control «Tema»**, porque la portada siempre es Cosmos (regla 4 de `AGENTS.md`). Lo propone Claude y falta la confirmación final de Jorge. Si decide lo contrario, se añade en F3 junto al selector de tema.

## Trampas conocidas
- **El scroll suave y el «ocultar al bajar» se pisan.** Ignora los eventos de scroll mientras dura un scroll provocado por un ancla.
- **`scroll-padding-top` no basta para el foco.** Usa `focus({ preventScroll: true })` cuando el scroll ya terminó.
- **`inert`** en el resto de la página cuando el menú está abierto: no puede quedar `inert` el propio menú.
- **El bloqueo de scroll en iOS:** `overflow: hidden` en `body` no siempre basta. Usa el patrón de fijar `body` con `top: -scrollY` y restaurar la posición al cerrar.
- **IntersectionObserver para la sección activa:** usa un `rootMargin` que tenga en cuenta los 56 px de la barra, para que la activa sea la que está bajo la barra y no la anterior.
- **No inventes enlaces:** los de `perfil` son placeholders (`‹usuario›`). Se renderizan tal cual, sin `href` roto: el enlace va a `#` con `aria-disabled="true"` mientras el valor sea un placeholder. Escribe un helper `esPlaceholder()` y úsalo de forma uniforme.
- **Ningún valor suelto en el CSS.** Si necesitas un valor que no está en los tokens (por ejemplo el 94 % del fondo), créalo como token en `tokens.css` **y** en `design/docs/tokens.css`, y menciónalo en el informe.

## Criterios de aceptación
- [x] `npm ci && npm run check && npm test && npm run build && npm run e2e` termina sin errores ni advertencias.
- [x] Todas las pruebas e2e del punto 12 existen y pasan en los tres tamaños.
- [x] axe no encuentra violaciones en `/` ni en `/proyectos/<slug>`.
- [x] La CI incluye el trabajo `e2e`.
- [x] Sin notas, el menú, la barra y C1 no muestran Notas y numeran Contacto como 06. Hay un test que lo comprueba.
- [x] Todos los textos nuevos están en `es.json` y `en.json`, y pasa la paridad.
- [x] Con `prefers-reduced-motion: reduce`: no hay scroll suave, el menú aparece sin animación y la barra se oculta y aparece por corte.
- [x] A 390 y 360 px no hay scroll horizontal y el botón «Menú», «Cerrar» y los enlaces del menú miden ≥ 44 px de alto.
- [x] Las capturas de 1280, 834 y 390 px están en `docs/encargos/capturas/F1/`, junto a su maqueta.
- [x] `npm run contenido:pendientes` no cuenta textos de interfaz como placeholders.

## Si te bloqueas
Si una fuente se contradice, falta un dato o algo exige rediseñar, **no lo decidas tú**. Implementa lo que no dependa de eso y deja la pregunta en el informe.

## Informe de entrega
Añádelo al final de este archivo, en la sección «Informe»:
1. **Hecho:** la lista de entregables, con sus rutas.
2. **Verificación:** los comandos ejecutados con su resultado real, el resumen de los e2e por proyecto y las capturas.
3. **Desviaciones:** qué difiere del encargo o de la maqueta, y por qué. Incluye los tokens nuevos.
4. **Preguntas abiertas.**
5. **No verificado:** lo que no pudiste comprobar.

---

## Informe
### Hecho

- `src/config/secciones.ts`: configuración ordenada, claves i18n, rutas y numeración condicional. `src/content/consultas.ts` determina si existen notas publicadas del idioma, sin advertencias por la colección vacía.
- `src/components/EncabezadoSeccion.astro`, `Boton.astro` y `Enlace.astro`: C1–C3, variantes, foco, pulsación y movimiento reducido. Enlaces externos con aviso accesible; placeholders desactivados mediante `src/lib/enlaces.ts`.
- `src/components/BarraGlobal.astro`, `MenuMovil.astro` y `PiePagina.astro`: estados hero/fija/artículo, preparación de relato, navegación responsive, miga según tipo, huecos vacíos para F3 y pies de portada/artículo.
- `src/lib/navegacion.ts`: IntersectionObserver para hero y sección activa; ocultación direccional con umbral de más de 8 px; protección del foco y del scroll de anclas; URL, desfase de 72 px y foco final; menú modal con ciclos de foco, Esc, fondo inert y restauración de scroll tras fijar body.
- `src/layouts/BaseLayout.astro` y `src/pages/proyectos/[slug].astro`: header/footer fuera de main, slots, primer enlace de salto y navegación de artículo. `src/pages/index.astro`: esqueleto con alturas reservadas, encabezados y bloques F2/F5/F6; sin Notas, Contacto es 06. El contenido previsto para otras fases sigue vacío.
- `src/i18n/es.json` y `en.json`: todas las nuevas etiquetas. `src/content/perfil/es.json` y su esquema incorporan el nombre ya confirmado y `anio_copyright: ‹año›`; no se toma el año del sistema ni se sustituyen enlaces pendientes.
- `playwright.config.ts`, `tests/e2e/navegacion.spec.ts`, `scripts/servidor-e2e.mjs`, scripts npm y `.github/workflows/ci.yml`: Chromium en `.cache/ms-playwright` (ya ignorada), servidor estático en primer plano, axe y trabajo e2e de CI con artefacto del informe. `tsconfig.json` y ESLint excluyen los artefactos generados.
- Tests de secciones, rutas y placeholders en `tests/secciones.test.ts`; contraste adicional de la barra translúcida en ambos temas. Capturas reproducibles con `scripts/capturar-f1.mjs`.

### Verificación

Entorno: Node 26.11.1. Resultados finales reales:

| Comando | Resultado |
|---|---|
| `npm ci` (primera acción de instalación) | Correcto; 396 paquetes instalados sobre F0. |
| `npm run e2e:instalar` (al añadir el script) | Correcto con red autorizada: Chromium v1248 y recursos instalados dentro de `.cache/ms-playwright`. |
| `npm ci --cache .cache/npm` (lockfile final) | Salida 0; 397 paquetes instalados, 398 auditados, 0 vulnerabilidades. |
| `npm run check` | Salida 0; Astro: 37 archivos, 0 errores, 0 advertencias y 0 indicaciones; lint, tokens y Prettier correctos. |
| `npm test` | Salida 0; 61 pruebas en 6 archivos, todas aprobadas. Incluye contraste AA en Cosmos/Dawn, paridad i18n, esquemas, tokens y configuración de navegación. |
| `npm run build` | Salida 0; 9 páginas generadas, sin errores ni advertencias. |
| `npm run e2e` | Salida 0; 33 pruebas aprobadas en 11,7 s, sin advertencias en la ejecución final. |
| `npm run contenido:pendientes` | Salida 0; 65 pendientes de contenido, todos bajo `src/content/`; ningún texto de interfaz contado como placeholder. No se ejecutó el modo estricto, pues esos datos siguen pendientes por diseño. |
| `git diff --check` | Salida 0. |
| `PLAYWRIGHT_BROWSERS_PATH=.cache/ms-playwright node scripts/capturar-f1.mjs` | Salida 0; capturas a 1280, 834 y 390; «Volver arriba» devuelve scroll a 0 y enfoca el enlace de salto en los tres anchos. |

| Proyecto Playwright | Viewport | Resultado |
|---|---|---|
| escritorio | 1280 × 800 | 11/11 aprobadas |
| tablet | 834 × 1112 | 11/11 aprobadas |
| movil | 390 × 844 | 11/11 aprobadas |

Se comprobó axe sin violaciones en portada y artículo de ingeniería en los tres tamaños, también en Dawn y con el menú abierto. Los e2e cubren primer Tab y activación del salto, anclas locales y desde artículo, cargas con hash, foco al h2 y posición bajo la barra, estado/ocultación/subida, sección activa, foco por teclado, inert, bloqueo/restauración del scroll, ciclos Tab/Shift+Tab, Esc, botón Cerrar, selección de sección, ausencia de Notas, Contacto 06, color activo y movimiento reducido. A 360 px se comprueban portada, artículo y menú, sin desbordamiento horizontal y con objetivos táctiles mínimos.

El botón de menú solo existe visualmente por debajo de 768 px. En los proyectos escritorio/tablet se comprueba primero que está oculto y se cambia el viewport a 390 para ejecutar los casos del menú. Las auditorías de las páginas y las pruebas de barra/anclas conservan el viewport propio del proyecto.

**Capturas y comparación:** 32 PNG en [capturas/F1](capturas/F1/README.md), emparejadas con las secciones equivalentes de las maquetas 1, 2 y 3. Revisadas visualmente las barras de los tres tamaños, el menú de 390, su equivalente reducido y los pies. Se sirven las referencias por HTTP con Python y se bloquean sus conexiones externas. Las capturas muestran los estados finales de las animaciones. Las comparativas documentan qué referencias solo existen en escritorio o móvil.

Durante la implementación se corrigieron la advertencia de colección Notas vacía, la serialización del ancla local, un selector de prueba del diálogo cerrado, la inclusión accidental del informe de Playwright en Astro check y la especificidad del color activo del menú. Los resultados de la tabla corresponden a la versión corregida.

### Desviaciones

- **Git bloqueado:** `git switch -c f1-navegacion main` falló con `Unable to create .../.git/index.lock: Operation not permitted`. Se continuó sin commits conforme a AGENTS.md. Los cambios quedan sin commit en `f0-base`, sobre `a88e5b1` (F0), que en la comprobación final también es la referencia de `main`. Este agente no hizo commits, fusiones ni escrituras sobre `main`. Falta situar los cambios en `f1-navegacion` durante la revisión.
- **Referencias y precedencia:** se conserva «Menú» textual, que sí aparece en el hero móvil de la Maqueta 1. A 834 se mantiene la navegación de escritorio, como esa maqueta; el margen es de 32 px conforme a TOKENS.md, que prevalece sobre los 40 px del hero importado. Los números inactivos del menú van en `--muted`; el oro queda para activo/acción/foco. El pie de portada no incluye Tema por la decisión aplicada D10. Los enlaces del pie móvil mantienen objetivos de 44 px.
- **Capturas:** los estados fija y artículo solo tienen referencia de escritorio, y el menú solo una de 390. Se emparejan con esas referencias originales. Para aportar también imágenes del componente menú a 1280 y 834 se abre el diálogo directamente en el script de capturas; no se habilita el botón a esos tamaños ni se presenta como interacción de escritorio.
- **Tokens nuevos:** sincronizados en `src/styles/tokens.css` y `design/docs/tokens.css`; sin nuevos colores literales. `--nav-bg` deriva `--bg` al 94 % y pasa contraste AA de texto, metadatos, títulos y acción en ambos temas. Se añadieron estos roles:

| Grupo | Tokens |
|---|---|
| Tipografía | `--text-kicker`, `--text-meta`, `--text-ui`, `--section-title`, `--section-title-mobile`, `--section-leading`, `--section-tracking`, `--kicker-gap`, `--menu-title`, `--brand-tracking` |
| Controles y menú | `--menu-row`, `--menu-entry`, `--touch-min`, `--button-h`, `--press-scale`, `--line-width`, `--active-line`, `--underline-offset` |
| Barra y retícula | `--nav-bg`, `--nav-margin`, `--nav-article-margin`, `--nav-hero-padding`, `--nav-link-gap`, `--theme-slot`, `--page-margin`, `--page-margin-mobile`, `--anchor-offset`, `--z-nav`, `--z-skip` |
| Ritmo y reservas | `--section-gap`, `--index-gap`, `--section-gap-tablet`, `--section-gap-mobile`, `--hero-min`, `--stories-min`, `--index-min`, `--about-min`, `--technologies-min`, `--notes-min`, `--contact-min` |

### Preguntas abiertas

- La revisión debe crear `f1-navegacion` y recoger los cambios sin commit, una vez disponible la escritura en Git.
- Sigue pendiente la confirmación final de Jorge sobre D10, ya aplicada por este encargo. También siguen pendientes el año de copyright y los enlaces reales del perfil; se conservan como placeholders. No hubo decisiones nuevas de diseño.

### No verificado

- El trabajo de CI está configurado, pero no se ha ejecutado remotamente ni se ha publicado o fusionado la entrega.
- No se probó Safari/iOS físico. El bloqueo con body fijo y la restauración se verificaron en Chromium, incluida la emulación móvil.


## Revisión
**Claude, 2026-10-25.** Entrega sólida y bien verificada: cumple el alcance, respeta «No incluye» y el informe coincide con lo que se puede reproducir. Codex no pudo escribir en `.git`, así que Claude creó `f1-navegacion` desde `main` (que era el mismo commit que `f0-base`), hizo los commits y corrigió dos fallos.

### Verificación (comandos reales, Node 26.11.1)
- Antes de corregir: `npm run check` (0 errores, 0 advertencias), `npm test` (61/61), `npm run build` (9 páginas) y `npm run e2e` (33/33). Coincide con el informe.
- Después de corregir: `check` limpio, `npm test` 62/62 y `npm run e2e` 36/36 en **tres ejecuciones seguidas**.
- Prueba manual con Playwright sobre `astro dev` a 1280 px: al bajar con flechas y espacio desde Sobre mí, la barra registraba `visible → oculta` en cada pulsación. Con la rueda se quedaba oculta, como debe.

### Correcciones de Claude
1. **Orden de la barra.** Se renderizaba Proyectos · Sobre mí · Notas · Contacto, el orden de la portada. El encargo y la Maqueta 3 piden Proyectos · Notas · Sobre mí · Contacto. Sin notas no se notaba, por eso ningún test lo cazó. Ahora `seccionesBarra()` en `src/config/secciones.ts` fija el orden, con su test unitario.
2. **La barra parpadeaba al bajar con el teclado.** Cualquier flecha, Enter o espacio la mostraba, y el scroll siguiente la volvía a ocultar. Ahora solo Tab la muestra, que es lo necesario para poder llegar a ella. Nuevo e2e: «bajar con flechas o espacio no hace parpadear la barra».
3. **Test intermitente de 44 px.** En una ejecución el menú midió 43,999… px a 834 → 390. Las comprobaciones de objetivos táctiles usan ahora `TACTIL_MIN = 44 - 0.01`.

### Observaciones (no bloquean)
- Con teclado (`data-teclado`) el salto a un ancla es instantáneo aunque no haya reduced motion, y la barra no anima. Es una interpretación razonable del «nunca al recibir foco por teclado», pero el encargo no lo pedía: queda anotado como desviación aceptada.
- El enlace «Proyectos» de la barra apunta a `#proyectos` en estado `hero` y a `#indice` en `fija`, y se marca activo en 03. Tiene sentido mientras 02 es un bloque reservado. Revisarlo en F5, cuando exista el relato.
- Falta lo que el informe declara no verificado: la CI remota y Safari/iOS físico (bloqueo de scroll del menú).

### Pendiente de Jorge
- **D10:** confirmar que el pie de la portada va sin «Tema».
- **Perfil:** `anio_copyright` y los enlaces de GitHub, LinkedIn, correo y CV siguen como placeholders (se ven desactivados, sin `href` roto).
- Probar en el navegador y, si está conforme, fusionar `f1-navegacion` en `main`.

**Recomendación:** fusionar en `main`.
