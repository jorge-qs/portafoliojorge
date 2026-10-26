# F2 · Portada estática (secciones 03–07)

**Estado:** aprobada
**Rama:** `f2-portada` (worktree propio) · **Depende de:** F1 (en `main`) · **En paralelo con:** F3 · **Escrito por:** Claude · **Fecha:** 2026-10-25

> Cómo lanzarlo en Codex: *«Lee AGENTS.md y docs/encargos/F2-portada.md. Implementa solo ese encargo y termina con el informe que pide.»*

## Objetivo
Al terminar, las secciones 03 Índice, 04 Sobre mí, 05 Tecnologías, 06 Notas y 07 Contacto de la portada están completas, con el layout, la tipografía y el ritmo de la Maqueta 1 en escritorio, tablet y móvil. Todo el contenido sale de `src/content/` y de `src/i18n/`.

**La interacción no entra en esta fase:**
- el filtro del índice se ve en «Todos»;
- 5b se ve con la primera herramienta seleccionada;
- «Copiar» queda oculto.

Las tres cosas se activan en F4. Lo que sí funciona sin JS desde ahora:
- los enlaces;
- el acordeón móvil, con `<details>`;
- la trayectoria plegada.

## Leer antes
- `AGENTS.md`, completo.
- `design/docs/PAGINAS.md` § Portada, § 03 Índice, § 04 Sobre mí, § 05 Tecnologías, § 06 Notas y § 07 Contacto.
- `design/docs/COMPONENTES.md` C1–C7, C10 y C12.
- `design/docs/TOKENS.md`, completo.
- `design/docs/DECISIONES.md` § Índice, § Sobre mí, § Tecnologías, § Notas y § Contacto.
- `design/docs/INTERACCIONES.md` § Hover y selección: solo los estados de reposo y hover. La interacción es de F4.
- `design/referencias/maqueta-1-portada.html`, servida con `python3 -m http.server` desde `design/referencias/`: secciones 03–07 a 1280, 834 y 390 px, **incluidas las notas al margen**.
- Código que ya existe y que **hay que reutilizar**:
  - `src/pages/index.astro`: el esqueleto, con los bloques `data-reservado="F2"`;
  - `src/components/EncabezadoSeccion.astro` (C1), `Boton.astro` (C2) y `Enlace.astro` (C3);
  - `src/lib/enlaces.ts`, con `esPlaceholder()`;
  - `src/content/validacion.ts`: `ordenarProyectos()` y `codigoProyecto()`.

## Incluye
1. **Retícula** (`TOKENS.md` § Retícula):
   - 12 columnas con medianil de 24 en ≥ 1200;
   - 8 columnas entre 768 y 1199;
   - 4 columnas por debajo de 768.

   Puede ser una utilidad CSS o un componente `Reticula.astro`. Respeta los márgenes ya definidos en F1 (`--page-margin`…).
2. **Componentes nuevos** en `src/components/`:
   - `EtiquetaTipo.astro` (C4):
     - Ingeniería en `--eng`, Investigación en `--res` e Híbrido con punto bicolor;
     - punto de 8 px y texto a 14;
     - nunca es un enlace;
     - la variante `‹pendiente›` solo se usa si `tipo` falta.
   - `FiltroSegmentado.astro` (C5):
     - grupo de botones con `aria-pressed`, recuento con `.num` y «Todos» activo;
     - en móvil, chips de 44 px que pasan a varias líneas;
     - **sin JS en esta fase:** los botones no hacen nada todavía (F4);
     - las etiquetas son Todos, Ingeniería, Investigación e Híbridos, y los recuentos se derivan del contenido.
   - `FilaIndice.astro` (C6):
     - la fila entera es un único `<a>` al artículo;
     - reposo y hover: fondo `--surface`, título subrayado en oro y flecha en `--accent-hover`, en 150 ms;
     - foco con el contorno en la fila.
   - `Herramienta.astro` y `TarjetaEvidencia.astro` (C7), con sus estados de reposo, seleccionada, activa y atenuada al 30 %.
   - `Acordeon.astro` (C12): `<details>` con filas de 56 px y signos +/−. La animación de altura queda para F4.
   - `FilaContacto.astro` (C12): filas de 60 px en escritorio y 56 en móvil, con columnas 120 / 1fr / 48.
   - `Estrellas.astro`: SVG con semilla fija y estrellas de 1–2 px en marfil o gris al 15–45 % y alguna en oro. Lleva `aria-hidden`. La semilla y las densidades están en `HERO.md` § Capas, L1. Lo reutilizará el hero en F6.
3. **03 Índice** (`PAGINAS.md` § 03):
   - **Encabezado:** C1 (03 · Todos los proyectos · Índice), la entradilla en `--muted` de 560 px como máximo y el filtro a la derecha, alineado abajo.
   - **Filas en el orden de `ordenarProyectos()`**, con el código de `codigoProyecto()` en la columna `#`.
   - **Columnas en escritorio:** 56 / 1fr / 150 / 72 / 230 / 160. **En tablet:** 44 / 1fr / 130 / 120, sin el año ni las herramientas.
   - **Móvil:** cada fila se apila en este orden: código · punto · tipo · año; título a 17; resumen a 14.
   - **Fila:** padding vertical de 22 y filete superior; título a 18/500 y resumen a 14 en `--muted`.
   - **Herramientas:** las primeras que quepan, más «+n».
   - **Acción:** «Leer →». En los destacados, además, «ver relato ↑», que apunta a `#proyectos` hasta que F5 cree los relatos.
   - 144 px por encima de la sección (ya existe `--index-gap`).
4. **04 Sobre mí** (`PAGINAS.md` § 04):
   - **Campo nuevo en el esquema de `perfil`:** `foto` opcional (ruta de imagen y `alt`). **Ahora no hay foto**, así que el texto se centra en 8 columnas (`DECISIONES.md` § Sobre mí). El layout con foto (columnas 1–5 en 4:5 y texto en 7–12) también debe funcionar: pruébalo con una imagen temporal **solo durante la verificación** y no hagas commit de ella.
   - **Orden del texto:** C1 y el h2, el párrafo a 17 (`presentacion`), «Preguntas que me acompañan», la trayectoria y el CV, con 40 px entre bloques.
   - **Preguntas:** lista con la etiqueta a 110 px y la pregunta a 18/400/1,45.
   - **Trayectoria:** 3 filas a 14 sin filetes. En móvil, plegada con `<details>` y el título «Trayectoria 3 ＋».
   - **CV:** botón primario de 48 px con «Actualizado ‹mes año›» (`perfil.cv`). Mientras la URL sea un placeholder, aplica el patrón de F1 (`esPlaceholder()`, `aria-disabled`).
   - **Tablet:** foto de 240 px a la izquierda, si existe, y trayectoria plegada. **Móvil:** h2 → foto 4:3 → texto → preguntas → trayectoria → CV a todo el ancho.
5. **05 Tecnologías, versión 5b** (`PAGINAS.md` § 05 y `DECISIONES.md` § Tecnologías):
   - **Escritorio:** 5 columnas, una por área, con el número, el nombre a 16/600 y las herramientas como botones de 40 px con su **recuento derivado** de `proyectos.herramientas`.
   - Debajo: «‹Herramienta› · aparece en N proyectos» y la **franja de evidencia** con los 7 proyectos (tarjetas de 96 px de alto como mínimo, código y título), en el orden de `ordenarProyectos()`. Las que no usan la herramienta seleccionada van al 30 %.
   - **Estado inicial:** la primera herramienta del área 1, seleccionada. Sin JS en esta fase.
   - Cada tarjeta de evidencia enlaza a su artículo. Las atenuadas también, porque siguen siendo proyectos.
   - **Tablet:** las áreas en rejilla de 3 + 2 y la franja en 4 columnas.
   - **Móvil:** acordeón (C12) con filas de 56 px. Dentro, cada herramienta muestra los códigos de sus proyectos: hasta 4 chips y «+n».
   - **Prohibido:** barras de porcentaje y puntuaciones.
6. **06 Notas** (`PAGINAS.md` § 06):
   - filas de 120 / 1fr / 140 / 120: fecha con `formatearFecha`, título a 17, tipo y «Leer →»;
   - un máximo de 3, y «Todas las notas →» solo si hay más de 3;
   - **si no hay notas publicadas, la sección no se renderiza**, cosa que ya resuelve F1;
   - pruébalo con una nota temporal **solo durante la verificación** y no hagas commit de ella;
   - el borde punteado de la maqueta **no va en producción**.
7. **07 Contacto** (`PAGINAS.md` § 07 y `DECISIONES.md` § Contacto):
   - **Texto:** C1, la frase en borrador desde `perfil` (añade el campo `frase_contacto` con el texto de la maqueta y márcalo como borrador), y el bloque de 560 px de ancho como máximo.
   - **Cuatro filas (C12):**
     - Correo: `perfil.contacto.email` y el botón «Copiar», que se renderiza con el atributo **`hidden`** porque F4 lo activará;
     - GitHub ↗;
     - LinkedIn ↗;
     - CV ↓, con «PDF · actualizado ‹mes año›».
   - **Fragmento artístico:**
     - la mano humana provisional (`design/assets/mano-adan-v2.provisional.png`): cópiala a `src/assets/` y sírvela con `astro:assets` en WebP o AVIF, al 45 % de opacidad con `saturate(.7)`, abajo a la derecha;
     - la terminal de 120 × 68 al 85 %, en Geist Mono, con el texto de la maqueta (`$ contacto` y el cursor ▍ **sin parpadeo**: el parpadeo es del hero, en F6);
     - el hueco de unos 12 px entre la terminal y la punta de la mano;
     - las estrellas (`Estrellas.astro`);
     - todo con `aria-hidden` y con una descripción alternativa oculta visualmente;
     - **la imagen queda por debajo de los enlaces en contraste y en orden de capas.**
   - **Móvil:** el fragmento artístico ocupa una franja de 130 px arriba y debajo van las filas de 56 px.
8. **Contenido:** solo con lo que ya hay en `src/content/`. Si la maqueta muestra un texto que no está en el contenido, por ejemplo la entradilla del índice o la frase de contacto, añádelo al JSON o MDX que corresponda, **con el texto exacto de la maqueta y marcado como borrador**, o a i18n si es un texto de interfaz. **No inventes nada.**
9. **Tests:**
   - **unitarios:** recuentos del filtro y de las herramientas derivados del contenido, y `frase_contacto` en el esquema;
   - **e2e** (amplía `tests/e2e/`, en los tres tamaños):
     - axe sin violaciones en `/`;
     - las filas del índice siguen el orden de `ordenarProyectos()` y cada una es un único enlace al artículo correcto;
     - sin notas, no existe `#notas`;
     - el acordeón móvil abre y cierra con teclado;
     - a 360 px no hay scroll horizontal;
     - los objetivos táctiles miden ≥ 44 px en móvil, con `TACTIL_MIN` de F1;
     - la imagen de Contacto tiene `aria-hidden` y existe la descripción alternativa.
10. **Capturas** en `docs/encargos/capturas/F2/`:
    - de cada sección (03–07) a 1280, 834 y 390 px;
    - cada una junto a la sección equivalente de la Maqueta 1, como en F1: puedes adaptar `scripts/capturar-f1.mjs` o generalizarlo.

## No incluye
- El funcionamiento del filtro del índice, de 5b, de «Copiar» y de la animación del acordeón (F4).
- El hero y los relatos (F6 y F5): sus bloques reservados se quedan como están.
- Los artículos y la página de nota (F3).
- La barra, el menú y el pie (F1, ya hechos), salvo un fallo que te bloquee. Si es así, documéntalo.

## Coordinación con F3, que va en paralelo
Hay otro Codex trabajando en F3 en otra rama. Para que las dos ramas se fusionen sin conflictos:

- **i18n:** añade tus claves nuevas **al final** de `es.json` y `en.json`, todas con el prefijo `portada.` (por ejemplo `portada.indiceEntradilla`). No reordenes las claves existentes.
- **Tokens:** si necesitas tokens nuevos, añádelos **al final** de cada bloque de `tokens.css`, en ambas copias, bajo el comentario `/* F2 · portada */`.
- **No modifiques** `BaseLayout.astro`, `BarraGlobal.astro`, `src/pages/proyectos/[slug].astro` ni `src/content/validacion.ts`.
- **El esquema de `perfil`:** solo añade los campos `foto?` y `frase_contacto`.

## Trampas conocidas
- **Las tablas de la maqueta son retícula, no `<table>`.** El índice es una lista (`<ol>`) de enlaces, no una tabla de datos.
- **El recuento del filtro** usa `tabular-nums` (`.num`) y cuenta los proyectos no archivados.
- **Los nombres de herramienta** se comparan tal cual, sin normalizar: los valida `validarRelaciones()`.
- **La mano provisional es de 540 × 320.** No la escales por encima de su tamaño ni intentes «mejorarla».
- **Ningún valor suelto en el CSS** (`npm run check` lo comprueba). Las opacidades del 45 %, el 85 % y el 30 % también van como tokens.

## Criterios de aceptación
- [ ] `npm ci && npm run check && npm test && npm run build && npm run e2e` termina sin errores ni advertencias.
- [ ] axe no encuentra violaciones en `/` en los tres tamaños.
- [x] El orden y los códigos del índice y de la franja de evidencia salen de `ordenarProyectos()` y `codigoProyecto()`.
- [x] Los recuentos (filtro y herramientas) se derivan del contenido y lo comprueba un test.
- [x] Sin JS (Playwright con `javaScriptEnabled: false`), las secciones 03–07 muestran todo el contenido y los acordeones abren.
- [x] Sin notas no existe la sección 06, y con una nota temporal aparece con un máximo de 3 filas. La nota no se sube.
- [x] El layout con foto de Sobre mí se comprobó con una imagen temporal, que no se sube.
- [x] A 390 y 360 px no hay scroll horizontal, nada se corta y los objetivos táctiles miden ≥ 44 px.
- [x] Las capturas de 03–07 a 1280, 834 y 390 px están junto a la maqueta, y el informe lista las diferencias visibles.
- [x] `npm run contenido:pendientes` incluye los textos de borrador nuevos.

## Si te bloqueas
Si una fuente se contradice, falta un dato o algo exige rediseñar, **no lo decidas tú**. Implementa lo que no dependa de eso y deja la pregunta en el informe.

## Informe de entrega
Añádelo al final de este archivo, en la sección «Informe»:
1. **Hecho:** la lista de entregables, con sus rutas.
2. **Verificación:** los comandos ejecutados con su resultado real, los e2e por proyecto y las capturas.
3. **Desviaciones:** qué difiere del encargo o de la maqueta, y por qué. Incluye los tokens y las claves i18n nuevas.
4. **Preguntas abiertas.**
5. **No verificado:** lo que no pudiste comprobar.

---

## Informe

Entrega de Codex · 2026-10-26. **Lista para revisión con dos bloqueos: contraste de la evidencia al 30 % y destino de «Todas las notas».** Los dos primeros criterios de aceptación siguen sin marcar; no se han silenciado ni excluido comprobaciones de axe.

### 1. Hecho

- Integradas las secciones de F2 en [`src/pages/index.astro`](../../src/pages/index.astro). Los bloques reservados de F5 y F6 conservan su contenido y sus alturas. Sin Notas publicadas, Contacto se numera como 06.
- Componentes nuevos en `src/components/`: `Reticula`, `EtiquetaTipo`, `FiltroSegmentado`, `FilaIndice`, `Herramienta`, `TarjetaEvidencia`, `Acordeon`, `FilaContacto` y `Estrellas`. Las composiciones están separadas en [`src/components/portada/`](../../src/components/portada/). Se reutilizan C1, C2, C3, `esPlaceholder()`, `ordenarProyectos()` y `codigoProyecto()`. C1 recibe únicamente una prop opcional para el titular narrativo.
- Índice editorial con siete proyectos, un enlace al artículo por fila y enlaces hermanos a `/#proyectos` para los destacados. Filtro en Todos. Recuentos derivados, sin manejadores de interacción de F4. La evidencia mantiene todos sus enlaces, incluidos los atenuados. La primera herramienta seleccionada es PyTorch.
- Sobre mí sin foto, centrado en ocho columnas en escritorio; variante con foto, preguntas, trayectoria nativa plegable y CV deshabilitado mientras su URL sea un placeholder.
- Notas condicionales, ordenadas por fecha, con máximo de tres filas y fechas formateadas con el helper existente. Contacto incluye sus cuatro filas, «Copiar» con `hidden`, terminal sin parpadeo, descripción alternativa y mano provisional optimizada mediante `astro:assets` a WebP (aproximadamente 13 kB frente a 111 kB del PNG).
- En [`src/content/esquemas.ts`](../../src/content/esquemas.ts), el perfil solo añade `foto? { ruta, alt }` y `frase_contacto`. La frase exacta de la maqueta vive en `perfil/es.json`, cuyo `borrador` sigue siendo `true`. La entradilla y el titular narrativo exactos están en [`src/content/portada/es.json`](../../src/content/portada/es.json), también en borrador.
- Derivación de recuentos en [`src/lib/portada.ts`](../../src/lib/portada.ts); unitarios en `tests/portada.test.ts` y e2e en `tests/e2e/portada.spec.ts`. `tests/proyectos-contenido.ts` lee el frontmatter real; se declara `yaml@2.9.1` como dependencia de desarrollo explícita (esa versión ya estaba en el lockfile como dependencia transitiva).
- [`scripts/capturar-f2.mjs`](../../scripts/capturar-f2.mjs) reproduce las pruebas temporales, restaura los archivos y reconstruye el build final incluso si falla una comprobación. `contenido:pendientes` ahora imprime también los textos sin placeholders de los JSON marcados como borrador.

### 2. Verificación real

| Comando | Resultado |
|---|---|
| `npm ci` | Correcto: 397 paquetes instalados, 398 auditados, cero vulnerabilidades. Repetido al final con `--cache .cache/npm`, también correcto. |
| `npm run e2e:instalar` | Correcto: Chromium, headless shell y FFmpeg instalados en `.cache/ms-playwright`. El primer intento se lanzó mientras `npm ci` aún terminaba y salió con 127; se repitió correctamente después. |
| `npm run check` | Correcto: 57 archivos, cero errores, advertencias e indicaciones de Astro; ESLint, tokens y Prettier correctos. Repetido tras el último ajuste del script de capturas. |
| `npm test` | Correcto: 67 tests en 8 archivos. Incluye contraste de los roles existentes en Cosmos/Dawn, paridad i18n, esquemas y recuentos de F2. |
| `npm run build` | Correcto: 9 páginas, sin errores ni advertencias. El script de capturas también reconstruyó correctamente el estado final sin fixtures. |
| `npm run e2e` | **Salida 1: 49 correctos y 2 fallidos**, en 14,4 s. Ambos fallos son `axe AA y primer Tab en /`, por el contraste de la evidencia atenuada. |
| `PLAYWRIGHT_BROWSERS_PATH=.cache/ms-playwright node scripts/capturar-f2.mjs` | Correcto a 1280, 834 y 390 px: foto temporal, cuatro notas → tres filas, una nota → una fila, cero notas → sección ausente; también comprobadas las notas sin JavaScript. Fixtures retiradas y build restaurado. |
| `npm run contenido:pendientes` | Correcto: 67 pendientes; incluye la frase de Contacto, la entradilla, el titular de Sobre mí y la URL pendiente del índice de notas. |
| `git diff --check` | Correcto. |

E2e por proyecto:

| Proyecto | Correctos | Fallidos |
|---|---:|---:|
| escritorio · 1280 | 16 | 1 |
| tablet · 834 | 16 | 1 |
| móvil · 390 | 17 | 0 |

Comprobados el orden y los destinos del índice y la evidencia, sus códigos y recuentos, ausencia de Notas, navegación nativa de acordeones con Enter/Espacio, contenido con JavaScript desactivado y paridad de contenido con reduced motion. A 390 y 360 px se abren las áreas y se comprueban los objetivos visibles de F2 con `TACTIL_MIN`, tanto en alto como en ancho, además de ausencia de desbordamiento horizontal. La imagen de Contacto tiene `aria-hidden`, WebP y una descripción alternativa fuera del bloque decorativo.

La foto temporal se comprobó a 4:5 en escritorio, con 240 px de ancho en tablet y a 4:3 entre el titular y el texto en móvil. Las medidas están en [`verificacion-temporales.json`](capturas/F2/verificacion-temporales.json). El perfil final no tiene `foto`; no quedan el SVG ni las notas temporales.

**Capturas:** 44 PNG en [`capturas/F2/`](capturas/F2/), reunidos lado a lado en [`comparacion.html`](capturas/F2/comparacion.html): las cinco secciones en los tres anchos, los cinco márgenes de escritorio, variantes con foto y notas temporales y Tecnologías con reduced motion. La referencia se sirvió por HTTP y se bloquearon sus conexiones externas. Solo durante las capturas se oculta la barra de F1 y se amplía la altura de la ventana manteniendo el ancho solicitado, para evitar recortes de Chromium por el margen de scroll.

Diagnósticos persistentes de axe: [`1280`](capturas/F2/axe-1280.json), [`834`](capturas/F2/axe-834.json), [`390`](capturas/F2/axe-390.json). Móvil tiene cero violaciones. En escritorio y tablet hay una regla fallida (`color-contrast`) con ocho nodos: código y título de las cuatro tarjetas atenuadas. Los contrastes medidos son 1,57:1 y 2,44:1, frente a 4,5:1 requerido.

### 3. Desviaciones y coordinación

- **Git:** `git switch -c f2-portada main` falló al crear `index.lock` por el sandbox. Se siguió sin commits, según AGENTS.md y la instrucción del usuario. La rama sigue llamándose `F2`. Al inicio y al cierre, `HEAD` y `main` apuntan a `127d2928208c5af0b3d6747f6a94761e787f9fe8`. No se ha tocado `main` ni fusionado nada.
- **Aislamiento de pruebas:** 4321 ya servía otro checkout. Los primeros resultados obtenidos reutilizando ese servidor se descartaron. Playwright ahora usa 4325 por defecto, admite `PORTAFOLIO_E2E_PORT` y tiene `reuseExistingServer: false`; el servidor auxiliar conserva 4321 como predeterminado para mantener compatibles los scripts anteriores. Las capturas usan 4326/4327. Chromium necesita ejecutarse fuera del sandbox por el bloqueo de MachPortRendezvous; las ejecuciones con escalación fueron autorizadas. No se modificó el servidor ajeno.
- **Contraste bloqueado:** se conserva la opacidad del 30 % pedida para toda la tarjeta. Cumplir simultáneamente esa apariencia y AA para su texto es imposible con esos colores. La corrección propuesta, aún sin aplicar, es atenuar únicamente fondo y adornos y mantener el texto con contraste AA. Se solicitó esta decisión durante la tarea y no se recibió respuesta antes de entregar.
- **«Todas las notas»:** no hay una ruta de listado definida en las fuentes ni incluida en F3. En lugar de inventarla, `portada/es.json` contiene `‹URL del índice de notas›`; con más de tres publicaciones el enlace aparece con `aria-disabled` siguiendo C3. No aparece en el contenido final porque no hay notas.
- **Diferencias visibles respecto de la maqueta:** se respetan los márgenes de F1 (40 px en escritorio, frente a los 80 efectivos del marco de referencia); Sobre mí no muestra el recuadro de fotografía y centra el texto; se conserva el contenido completo del repo, más largo que los placeholders abreviados de tablet/móvil. El índice móvil conserva la entradilla y las acciones requeridas por el encargo, por lo que sus filas y la sección son más altas que en la maqueta móvil. Los chips de proyecto son enlaces de 44 px, mayores que las pequeñas fichas decorativas de la referencia. C1 conserva sus escalas de F1 (40/30 px); algunas variantes de la maqueta usan 34/36 o 28 px. Los números de las áreas van en `--muted` para reservar el oro a acción/estado/foco. Los bordes activos usan el token de acento sólido. Las notas usan C1, fechas reales de fixture y no llevan el marco punteado; Contacto queda como 06 sin notas. La terminal conserva `$ contacto` y el cursor también en móvil. El pie de F1 permanece fuera de la sección capturada y no se modificó.
- **Tokens e i18n:** se añaden 62 tokens de medidas, retícula, tipografía, geometría, capas y opacidades, al final del bloque correspondiente bajo `/* F2 · portada */`, sincronizados en ambas copias. No se añaden colores. Las 24 claves nuevas se añaden al final de ambos JSON y todas empiezan por `portada.`. El inventario exacto de nombres y valores está en [`inventario.json`](capturas/F2/inventario.json).
- No se modificaron `BaseLayout.astro`, `BarraGlobal.astro`, `src/pages/proyectos/[slug].astro` ni `src/content/validacion.ts`. En el esquema de perfil solo se añadieron los dos campos autorizados.

### 4. Preguntas abiertas

1. ¿Se autoriza atenuar al 30 % solo fondo/adornos de las tarjetas que no corresponden, conservando sus textos con contraste AA? Hasta resolverlo, los dos e2e de axe seguirán fallando.
2. ¿Cuál será el destino de «Todas las notas» y qué encargo implementará ese listado? La URL queda como placeholder deshabilitado.

### 5. No verificado

- No se declara axe limpio ni aceptación completa en escritorio/tablet: el incumplimiento de contraste está reproducido y documentado.
- Las páginas finales de notas y artículos de F3 quedan fuera de esta entrega. Las fixtures de Notas verifican presentación, límite y destinos generados, no el lector de F3.
- No hay foto final, CV ni datos de contacto reales con los que verificar descarga o enlaces externos; se comprobó el patrón de placeholders deshabilitados.

## Revisión
**Claude, 2026-10-26.** Una entrega cuidadosa: respeta el alcance y la coordinación con F3, y el informe es fiel. Codex se detuvo correctamente ante el conflicto entre el 30 % de la maqueta y la regla AA, en lugar de saltarse axe.

### Correcciones de Claude
1. **Contraste de la evidencia atenuada** (el bloqueo del informe). Se aplica la propuesta de Codex: el texto de las tarjetas que no aplican pasa a `--muted` (AA en los dos temas) y solo el punto decorativo usa `--evidence-opacity`. Se lee igual de «apagado», sin texto ilegible. Queda registrado en `design/docs/DECISIONES.md`.
2. **El test de reduced motion** comparaba `transitionDuration === '0s'`. Con dos transiciones, el valor es una lista, así que ahora se comprueba cada duración.
3. **Integración con F3:** el puerto de los e2e queda unificado en `PORTAFOLIO_E2E_PORT`, con 4325 por defecto y sin reutilizar un servidor ajeno.

### Verificación (después de integrar F2 + F3 en `main`)
`npm ci`, `check` (0 errores y 0 advertencias), `npm test` (97/97), `build` (9 páginas, sin advertencias) y `npm run e2e` (93/93 en los tres tamaños).

### Pendiente
- **«Todas las notas»** no tiene destino, porque ningún encargo crea `/notas/`. Queda en `PLAN.md` y no afecta mientras haya 3 notas o menos.

**Recomendación:** aprobada e integrada en `main`.
