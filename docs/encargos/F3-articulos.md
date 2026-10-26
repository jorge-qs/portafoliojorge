# F3 · Artículos y notas

**Estado:** aprobada
**Rama:** `f3-articulos` (worktree propio) · **Depende de:** F1 (en `main`) · **En paralelo con:** F2 · **Escrito por:** Claude · **Fecha:** 2026-10-25

> Cómo lanzarlo en Codex: *«Lee AGENTS.md y docs/encargos/F3-articulos.md. Implementa solo ese encargo y termina con el informe que pide.»*

## Objetivo
Al terminar, `/proyectos/<slug>` usa la plantilla definitiva según el tipo de proyecto:

- **A, ingeniería:** Cosmos por defecto;
- **B, investigación:** se muestra en Dawn en las capturas;
- **Híbrido:** la plantilla A con bloques de B.

Además, `/notas/<slug>` tiene su página de lectura. Funcionan también:

- el selector de tema sin parpadeo;
- el progreso de lectura;
- el índice lateral con el capítulo activo;
- «Capítulos ▾» en tablet y móvil;
- la hoja «Aa» con el tema y la opción de reducir movimiento;
- Anterior/Siguiente.

**El diagrama, la fórmula y el experimento se ven en estado estático.** Su interacción llega en F4.

## Leer antes
- `AGENTS.md`, completo.
- `design/docs/PAGINAS.md` § Rutas, § Artículo de ingeniería (plantilla A) y § Artículo de investigación (plantilla B).
- `design/docs/COMPONENTES.md` C2–C4, C8 (solo los estados de reposo y seleccionado), C9–C11 y la fila «Hoja inferior».
- `design/docs/INTERACCIONES.md` § Cambio de tema, § Reduced motion (global) y § Navegación (la fila «Artículo → ← Índice de proyectos»).
- `design/docs/TOKENS.md`, completo, incluida la tipografía del h1 de artículo y del código.
- `design/docs/DECISIONES.md` § Artículos y § Resueltas en la consolidación.
- `design/referencias/maqueta-2-articulos.html` **completa**, servida con `python3 -m http.server` desde `design/referencias/`:
  - § A: escritorio, móvil y la hoja inferior del diagrama;
  - § B: escritorio, móvil y la hoja «Aa».
- Código que ya existe y que **hay que reutilizar**:
  - `BaseLayout.astro`, con `tema="elegible"` y el script del tema;
  - `BarraGlobal.astro`, en estado `articulo`: tiene los huecos `--theme-slot` y `data-reservado="progreso-lectura"`, que rellenas tú;
  - `PiePagina.astro` en su variante de artículo, `Boton.astro` y `Enlace.astro`;
  - `src/content/validacion.ts`, con `ordenarProyectos()` para Anterior/Siguiente.

## Incluye
1. **`ArticuloLayout.astro`**:
   - **Retícula:** 180 / 632 / 260 con separación de 40 en ≥ 1200. Entre 768 y 1199 desaparece el índice lateral y aparece «Capítulos ▾»; por debajo de 768, una columna.
   - **Índice lateral *sticky*:** «← Índice de proyectos» (a `/#indice`), la lista de capítulos numerados y «Lectura · ‹n› min». El capítulo actual lleva `aria-current="location"` y fondo de marfil al 6 % (créalo como token), detectado con IntersectionObserver.
   - **Cabecera:** C4 (tipo) · fecha, h1 a 52/600/1,1/−2,5 % (30–32 en móvil) y la entradilla a 20/400/1,45.
   - **Columna de lectura** de unos 65 caracteres, cuerpo a 16/1,6–1,65, y **margen** de 260 para las notas. En móvil, las notas al margen se abren en línea.
   - **Cierre:** las tarjetas Anterior/Siguiente, en el orden de `ordenarProyectos()` (en el primero y en el último, solo una tarjeta), y el pie de artículo de F1.
2. **Plantilla según `tipo`:**
   - `ing` → A;
   - `inv` → B, cuya miga de pan es «Proyectos / Investigación»;
   - `hib` → A con los bloques de B que el MDX use y la etiqueta bicolor.

   La plantilla la elige `[slug].astro`; el contenido decide qué bloques aparecen.
3. **Componentes MDX** (`src/components/articulo/`), que el MDX importa o recibe por `components`:
   - **Comunes:**
     - `EnUnMinuto`: fondo de `--accent` al 8 % con Problema / Qué construí / Resultado;
     - `Ficha`: vertical en A (Rol, Tecnologías, Fecha y Recursos) y horizontal de 4 columnas en B (Autores, Afiliación, Publicado y Recursos); en móvil, una cuadrícula de 2 × 2;
     - `Capitulo`: un h2 numerado con el `id` que usa el índice lateral;
     - `Figura`: fondo `--surface`, radio 12 y leyenda numerada a 13 debajo; si los datos son sintéticos, la marca «Datos sintéticos» es obligatoria;
     - `NotaMargen`;
     - `TablaDecisiones`: tabla real (`<table>`) con Decisión / Elegida / Alternativa / Por qué;
     - `CodigoAnotado`: Geist Mono 13/1,75, con las marcas numeradas en el código y su explicación al margen;
     - `Referencias`: [n] con anclas de ida y vuelta.
   - **Solo de B:**
     - `Pregunta`: fondo de `--res` al 8 %, la pregunta a 26/500 y debajo H1 y H0;
     - `Formula`: la fórmula a 30 px con los términos en píldoras;
     - `Experimento`: ver el punto 6;
     - `Citar`: «Citar este trabajo · BibTeX», con el bloque BibTeX y un botón «Copiar» con el atributo `hidden`, porque F4 lo activa.
   - **Diagrama** (`Diagrama.astro`, versión estática): SVG con nodos C8 de **fondo sólido y por encima de las aristas**, aristas de 1 px en `--muted` al 40 % y un panel de 280 px con la ficha del nodo seleccionado por defecto (Responsabilidad, Entradas · salidas, Cumple y «Ver el código»).
     - **Modelo de datos** (lo reutilizarán F4 y F5):
       ```ts
       { nodos: { id, etiqueta, x, y, responsabilidad, entradas_salidas, cumple, codigo? }[],
         aristas: [origen, destino][], seleccionado?: id }
       ```
     - **Móvil:** la miniatura del diagrama y un botón «Explorar componentes» con el atributo `hidden`, porque la hoja del diagrama se activa en F4.
4. **Esquema de `proyectos`**, solo con campos opcionales:
   - `fecha?` (texto o placeholder);
   - `lectura_min?`;
   - `investigacion?`: `{ autores, afiliacion, publicado, bibtex? }`.

   **No toques** el esquema de `perfil`: lo modifica F2.
5. **Código y fórmulas en el build, sin JS en el cliente:**
   - **Shiki:** `shikiConfig` con el tema `css-variables`. Sus variables `--astro-code-*` se definen en `tokens.css` a partir de **roles nuevos** `--code-*`, con valor en Cosmos y en Dawn tomado de la Maqueta 2. Todos se añaden al test de contraste: AA sobre `--surface` en los dos temas.
   - **KaTeX:** `remark-math` + `rehype-katex`, con el CSS y las fuentes de KaTeX **servidos desde el propio origen**, sin CDN.
6. **Experimento, versión estática:**
   - el panel de controles de 260 px a la izquierda: un control deslizante (44 px de alto en móvil), «Comparar: Modelo A · A y B» y «Restablecer»;
   - todos los controles van `disabled` en esta fase, con el texto i18n «Interactivo próximamente» visualmente oculto;
   - a la derecha, el histograma SVG generado en el build con un generador de **semilla fija** y los valores por defecto de la maqueta (0,7 y A y B), con la leyenda «Datos sintéticos».
7. **Selector de tema (C11):**
   - **en escritorio y tablet**, el segmentado Cosmos · Dawn en el hueco `--theme-slot` de la barra;
   - **en móvil**, dentro de la hoja «Aa» (Cosmos · Dawn · Sistema);
   - guarda en `localStorage['tema']` los mismos valores que ya lee el script de F0;
   - el cambio aplica un fundido de `--dur` en `background-color` y `color`, **sin transición en la carga inicial**;
   - con reduced motion, corte directo.
8. **Progreso de lectura:** 2 px en `--accent` en el borde inferior de la barra, en el hueco reservado. Es `aria-hidden` y se calcula sobre el artículo, no sobre la página.
9. **Barra de artículo en móvil** (< 768):
   - «← Proyectos» (a `/#indice`), «Capítulos n/N ▾» y «Aa», todo con objetivos de 44 px como mínimo;
   - «Capítulos ▾» abre la lista de capítulos (un *disclosure* accesible) y se cierra con Esc o al elegir uno;
   - en tablet, «Capítulos ▾» sustituye al índice lateral.
10. **`HojaInferior.astro`**, un componente genérico que reutilizará F4:
    - radio 20 y asa de 40 × 4;
    - `role="dialog"`, `aria-modal`, trampa de foco, se cierra con Esc y devuelve el foco, y deja el fondo `inert`;
    - sube con `translateY` en `--dur`;
    - con reduced motion, aparece sin animación.

    **Hoja «Aa»:** «Opciones de lectura», con Tema (Cosmos · Dawn · Sistema) y «Reducir movimiento».
    - «Reducir movimiento» pone `data-movimiento="reducido"` en `<html>`, que deja **todas las duraciones de los tokens a 0**, igual que la preferencia del sistema;
    - se guarda en `localStorage['movimiento']` y se aplica antes de pintar, en el mismo script en línea del tema;
    - la maqueta muestra un apartado «Figuras». Si no está claro qué controla, **no lo inventes**: déjalo fuera y pregúntalo en el informe.
11. **Página de nota** (`src/pages/notas/[slug].astro` + `NotaLayout.astro`):
    - solo la columna de lectura y el margen, sin índice lateral;
    - `tema="elegible"`, con la misma barra de artículo;
    - la miga de pan es «Notas»;
    - pruébala con una nota temporal **solo durante la verificación** y no hagas commit de ella. La colección sigue vacía.
12. **Contenido semilla.** Reescribe el cuerpo MDX de tres proyectos con la estructura y los textos placeholder **exactos** de la Maqueta 2:
    - `coordinacion-multiagente` (ing): los 10 capítulos de A, con el diagrama de 7 nodos (Usuario, Orquestador, Agente A, B y C, Memoria y Herramientas, con las aristas de la maqueta), el código de la maqueta (marcado como «fragmento ilustrativo») y la figura de evaluación «de forma, no datos»;
    - `proyecto-02` (inv): los 10 capítulos de B, con la fórmula p(y | x) = softmax(W·h + b), el experimento, los resultados en pequeños múltiplos de 3 columnas y las referencias;
    - `proyecto-03` (hib): A con «Pregunta» y «Referencias» de B.

    Todo sigue marcado `borrador: true`. **No inventes contenido:** donde la maqueta tenga `‹…›`, va `‹…›`.
13. **i18n:** todas las claves nuevas, con el prefijo `articulo.`, **al final** de `es.json` y `en.json`.
14. **Tests:**
    - **unitarios:** el generador de datos sintéticos es determinista, el contraste de los `--code-*` en los dos temas, y el orden de Anterior/Siguiente;
    - **e2e**, en los tres tamaños:
      - axe sin violaciones en los artículos A, B e híbrido, **en Cosmos y en Dawn**;
      - el tema elegido persiste al navegar de un artículo a otro, sin parpadeo: el `data-theme` correcto en `DOMContentLoaded`;
      - la portada sigue en Cosmos aunque el tema guardado sea Dawn;
      - con «Reducir movimiento» de la hoja activado, `--dur` vale 0;
      - el índice lateral marca el capítulo correcto al hacer scroll;
      - «Capítulos ▾» y la hoja «Aa» atrapan el foco y se cierran con Esc;
      - la miga de pan cambia según el tipo;
      - a 360 px no hay scroll horizontal (los bloques de código hacen scroll dentro de su contenedor, no en la página).
15. **Capturas** en `docs/encargos/capturas/F3/`:
    - A en Cosmos y B en Dawn, a 1280, 834 y 390 px, junto a la Maqueta 2;
    - la hoja «Aa» y «Capítulos ▾» en móvil;
    - **las dos decisiones pendientes de Jorge:**
      - **D1:** la etiqueta Ingeniería en Dawn junto a un botón primario, en dos versiones: la actual (`--eng` #7A5824) y la propuesta (#7A6448). Usa un CSS temporal solo para la captura y **no cambies el token**;
      - **D4:** capturas en Dawn de un nodo en hover (`--surface-hover`) y seleccionado (`--selected`) y de una etiqueta `‹pendiente›`.

## No incluye
- Seleccionar nodos del diagrama y su hoja inferior en móvil, resaltar los términos de la fórmula, los controles del experimento, «Copiar» del BibTeX y las View Transitions (F4).
- Las secciones de la portada (F2), que van en paralelo.
- El selector de idioma (F7).

## Coordinación con F2, que va en paralelo
Hay otro Codex trabajando en F2 en otra rama. Para que las dos ramas se fusionen sin conflictos:

- **i18n:** las claves nuevas van **al final** de `es.json` y `en.json`, con el prefijo `articulo.`. No reordenes las existentes.
- **Tokens:** los nuevos van **al final** de cada bloque de `tokens.css`, en ambas copias, bajo `/* F3 · artículos */`.
- **No modifiques** `src/pages/index.astro`, los componentes de portada que cree F2, `src/content/validacion.ts` ni el esquema de `perfil`.
- **Sí puedes modificar** `BaseLayout.astro` (el script en línea para `data-movimiento`), `BarraGlobal.astro` (los huecos del estado `articulo` y la variante móvil) y `[slug].astro`.

## Trampas conocidas
- **El script del tema ya existe** en `BaseLayout`, en línea en el `<head>`. Amplíalo; no crees otro script que llegue tarde.
- **La transición de color no puede activarse al cargar.** Si no, cada página en Dawn «se funde» desde Cosmos. Aplica la clase de transición solo después de un cambio del usuario.
- **Fuentes de KaTeX:** asegúrate de que los `@font-face` apunten a tu propio origen. `grep` en `dist/` no debe encontrar CDNs.
- **Las tablas anchas y el código** hacen scroll dentro de su contenedor, con `tabindex="0"` y `role="region"` + `aria-label`, para que se puedan recorrer con teclado.
- **Nodos del diagrama:** fondo sólido y siempre encima de las aristas (es el bug 1 de `BUGS_CONOCIDOS.md`; no lo repitas).
- **Ningún valor suelto en el CSS**, incluidos los colores de las píldoras de la fórmula y del histograma: van como roles nuevos, con su contraste comprobado.

## Criterios de aceptación
- [x] `npm ci && npm run check && npm test && npm run build && npm run e2e` termina sin errores ni advertencias.
- [x] axe no encuentra violaciones en los artículos A, B e híbrido, en Cosmos y en Dawn, en los tres tamaños.
- [x] El tema persiste entre artículos sin un solo fotograma del tema equivocado, la portada sigue en Cosmos y «Sistema» sigue `prefers-color-scheme`.
- [x] «Reducir movimiento» de la hoja equivale a la preferencia del sistema, persiste y se aplica antes de pintar.
- [x] El resaltado de código y KaTeX se generan en el build: no hay JS de Shiki ni de KaTeX en el cliente y no hay CDNs en `dist/`.
- [x] Los `--code-*` y los colores nuevos pasan AA en los dos temas.
- [x] A 390 y 360 px no hay scroll horizontal de página y los objetivos táctiles miden ≥ 44 px.
- [x] Las capturas de A (Cosmos) y B (Dawn) están junto a la maqueta, y las de D1 y D4 están en `capturas/F3/`.
- [x] La página de nota se probó con una nota temporal, que no se sube.

## Si te bloqueas
Si una fuente se contradice, falta un dato o algo exige rediseñar, **no lo decidas tú**. Implementa lo que no dependa de eso y deja la pregunta en el informe.

## Informe de entrega
Añádelo al final de este archivo, en la sección «Informe»:
1. **Hecho:** la lista de entregables, con sus rutas.
2. **Verificación:** los comandos ejecutados con su resultado real, los e2e por proyecto y las capturas.
3. **Desviaciones:** qué difiere del encargo o de la maqueta, y por qué. Incluye los tokens y las claves i18n nuevas.
4. **Preguntas abiertas**, incluida «Figuras» si sigue sin estar clara.
5. **No verificado:** lo que no pudiste comprobar.

---

## Informe
Entrega de Codex · 2026-10-26. Pendiente de revisión de Claude y aprobación de Jorge. Sin commits ni fusión.

### 1. Hecho

- `src/layouts/ArticuloLayout.astro` y `NotaLayout.astro`: retícula, cabecera, margen, rail sticky, navegación Anterior/Siguiente mediante `ordenarProyectos()`, pie de F1 y página de nota. Se reutilizan `BaseLayout`, `BarraGlobal`, `Boton` y `Enlace`.
- `src/pages/proyectos/[slug].astro`: plantilla B para `inv`, A para `ing`/`hib`, capítulos obtenidos del MDX y adyacentes sin envolver extremos. `src/pages/notas/[slug].astro`: ruta de lectura; la colección final sigue vacía.
- `src/components/articulo/`: EnUnMinuto, Ficha, Capitulo, Figura, NotaMargen, TablaDecisiones, CodigoAnotado, Referencias, Pregunta, Formula, Experimento, Citar y Diagrama. También SelectorTema y envoltorios Codigo/Tabla para Markdown, con regiones desplazables etiquetadas y enfocables.
- `src/components/HojaInferior.astro`, `src/lib/hojas.ts` y `articulo.ts`: diálogos con ciclo Tab/Shift+Tab, Esc, aislamiento inert, bloqueo/restauración del scroll y devolución del foco. Capítulos lleva el foco al encabezado elegido tras liberar inert. Aa incluye Cosmos/Dawn/Sistema y el interruptor de movimiento.
- `BaseLayout.astro`: ampliado el script existente del head para aplicar movimiento antes de pintar, también en portada. Tema persistido sin transición inicial; cambios posteriores con los tokens aprobados. Progreso decorativo calculado sobre el artículo, capítulo activo con IntersectionObserver y conservación de `?tipo=` al regresar o pasar a otro artículo. En `src/lib/navegacion.ts` se añadió únicamente la comprobación de movimiento manual al decidir el scroll: también vuelve a la portada con salto directo; el e2e lo comprueba.
- `src/lib/diagrama.ts`: modelo tipado reutilizable por F4/F5. Siete nodos y aristas de la maqueta; SVG estático con fondos sólidos dibujados después de las aristas y ficha inicial del Orquestador. Diagrama de 440 px en escritorio y miniatura de 250 en móvil.
- `src/lib/datos-sinteticos.ts`: generador reproducible con semilla 7, 32 intervalos y parámetro inicial 0,7. Experimento inicial A y B, controles disabled, aviso i18n oculto y leyendas sintéticas. Fórmula y BibTeX estáticos; botones futuros hidden.
- `src/content/esquemas.ts`: solo campos opcionales del proyecto: fecha, lectura_min e investigacion. El esquema de perfil y `src/content/validacion.ts` permanecen intactos.
- Cuerpos de los tres MDX semilla, cada uno con diez capítulos, y `src/content/articulos/semilla.ts` con textos/placeholder de Maqueta 2. Continúan en borrador. Se conservaron los títulos, resúmenes y herramientas existentes del frontmatter.
- `astro.config.ts`, dependencias y lockfile: Shiki css-variables, pipeline oficial unified con remark-math/rehype-katex y CSS/fuentes locales de KaTeX. La extensión HTML de KaTeX solo autoriza htmlClass para las píldoras estáticas. Override de KaTeX para usar la versión fijada también en las dependencias transitivas: auditoría final sin vulnerabilidades.
- `tests/articulos.test.ts`, `tests/contraste.test.ts` y `tests/e2e/articulos.spec.ts`; adaptaciones mínimas de los tests F1 cuyos huecos y menú de artículo cambian en F3. `scripts/capturar-f3.mjs` permite reproducir las capturas.

### 2. Verificación

| Comando / comprobación | Resultado real final |
| --- | --- |
| `npm ci` inicial | Correcto, cero vulnerabilidades |
| `npm run e2e:instalar` | Chromium, headless shell y FFmpeg instalados en `.cache/ms-playwright` |
| `npm ci --cache .cache/npm` con lockfile actualizado | Correcto: 522 paquetes instalados, cero vulnerabilidades |
| `npm run check` | Correcto: 0 errores, 0 advertencias, 0 hints; ESLint, tokens y Prettier correctos |
| `npm test` | 94 tests aprobados en 8 archivos; determinismo, orden, contraste y regresiones de F0/F1 |
| `npm run build` | Correcto, sin advertencias: 9 páginas; sin nota temporal |
| `E2E_PORT=4331 npm run e2e -- --workers=2` | 78 aprobados (36,1 s): escritorio 26, tablet 26, móvil 26 |
| `git diff --check` | Correcto |

La matriz axe de A (`coordinacion-multiagente`), B (`proyecto-02`) e híbrido (`proyecto-03`) pasa en Cosmos y Dawn a 1280, 834 y 390 px: 18 combinaciones sin violaciones. Se comprueban además tema en DOMContentLoaded al navegar, portada siempre Cosmos, Sistema reaccionando al esquema del sistema, movimiento persistido, ausencia de transición inicial, progreso, miga según tipo, capítulos, foco modal y Esc. A 360 px se verifica ausencia de scroll horizontal de página, scroll interno de tabla/código y objetivos visibles de barra, artículo y pie de al menos 44 × 44 px.

Se construyó una nota temporal en `src/content/notas/es/verificacion-f3.mdx` y se probó en Chromium a 1280, 834, 390 y 360 px, en Dawn: axe sin violaciones, miga Notas, sin rail, KaTeX, dos bloques de código (uno largo), tabla, ausencia de desbordamiento y movimiento persistido. El archivo se retiró antes del build final; solo queda la captura `nota-temporal-390.png` y el `.gitkeep` original.

La inspección de `dist/` no encuentra CDNs de fuentes, jsDelivr ni unpkg. Los e2e verifican cero peticiones a otros orígenes y ausencia de KaTeX/Shiki en los scripts cliente. KaTeX genera HTML/MathML en el build; hay 59 archivos locales de fuentes KaTeX, contando sus formatos.

Las primeras pasadas detectaron contraste insuficiente por doble transparencia de la etiqueta pendiente (4,49:1 Cosmos, 4,47:1 Dawn), reinicio de la animación de Aa al pasar del teclado al puntero y foco prematuro mientras el capítulo seguía inert. Se corrigieron; no se desactivó ninguna regla axe ni se bajaron umbrales de contraste.

Capturas en [`capturas/F3/comparacion.html`](capturas/F3/comparacion.html): A Cosmos y B Dawn a 1280, 834 y 390 junto a la referencia; `Aa-390.png`, `capitulos-390.png`, `B-dawn-390-reduce.png`, `D1-actual.png`, `D1-propuesta.png`, `D4-hover-y-seleccionado.png` y `D4-pendiente.png`. Se abrieron las referencias mediante HTTP local con las conexiones externas bloqueadas. Se inspeccionaron visualmente las capturas; la maqueta solo proporciona lienzos de 1280 y 390: a 834 la comparación usa su lienzo fijo de escritorio, sin inventar una variante tablet.

### 3. Desviaciones y coordinación

- **Git bloqueado:** `git switch -c f3-articulos main` falló al crear `index.lock` con Operation not permitted. Se siguió sin commits, como autoriza AGENTS.md. Este worktree conserva el nombre de rama `F3`; HEAD y main apuntan a `127d2928208c5af0b3d6747f6a94761e787f9fe8`, la base inicial. No se escribió en main ni se fusionó nada. Claude deberá crear/renombrar la rama al revisar fuera del sandbox.
- Los puertos 4321/4322 estaban ocupados; no se detuvieron sus procesos. Se usaron 4331/4332. `E2E_PORT` parametriza servidor/config de Playwright y mantiene 4321 como valor predeterminado.
- Chromium no puede arrancar dentro del sandbox de macOS (MachPortRendezvousServer Permission denied). Las ejecuciones autorizadas de e2e/capturas se hicieron fuera del sandbox. No hubo rechazo del revisor automático. Para npm se utilizó `.cache/npm` tras el bloqueo de escritura de la caché global.
- La prosa que la maqueta representa con barras grises sigue como `‹…›`; no se generaron párrafos ficticios. Por ello cambian las alturas totales. Los encabezados/anclas de Resumen y Ficha de A se mantienen para navegación asistida, sin añadir rótulos visibles que no aparecen en la maqueta.
- En tablet la barra se compacta a marca/miga, selector, CV y Capítulos; los enlaces a secciones se ocultan para conservar la altura de 56 px. Se deja esta distribución explícita para revisión, puesto que no existe lienzo tablet de artículos.
- El rol nuevo `--article-pending-bg` es el compuesto sólido del fondo pendiente sobre bg; evita acumular dos tintes dentro de EnUnMinuto y permite AA. No se alteraron `--pending-*`, `--eng`, `--surface-hover` ni `--selected`. D1 usa CSS temporal de captura. El hover de D4 también se fuerza solo para evidencia; seleccionar nodos sigue reservado a F4.
- Las excepciones de lint se limitan al role=dialog explícito y a tabindex=0 en regiones desplazables, ambos pedidos por el encargo. El resto de las reglas continúa activo.
- No se modificaron `src/pages/index.astro`, componentes de portada, `src/content/validacion.ts` ni el esquema de perfil. Tokens añadidos bajo `/* F3 · artículos */` al final de los bloques de ambas copias; claves i18n añadidas al final sin reordenar las anteriores.

**Tokens nuevos:** `--article-body-leading`, `--article-deck`, `--article-deck-leading`, `--article-deck-mobile`, `--article-gap`, `--article-margin`, `--article-max`, `--article-pending-bg`, `--article-rail`, `--article-reading`, `--article-title`, `--article-title-leading`, `--article-title-mobile`, `--article-title-tracking`, `--astro-code-color-background`, `--astro-code-color-text`, `--astro-code-token-comment`, `--astro-code-token-constant`, `--astro-code-token-function`, `--astro-code-token-keyword`, `--astro-code-token-link`, `--astro-code-token-parameter`, `--astro-code-token-punctuation`, `--astro-code-token-string`, `--astro-code-token-string-expression`, `--chapter-current`, `--chapter-leading`, `--chapter-title`, `--chapter-title-mobile`, `--code-keyword`, `--code-leading`, `--code-muted`, `--code-number`, `--code-size`, `--code-string`, `--code-text`, `--diagram-height`, `--diagram-mobile-height`, `--diagram-panel`, `--edge`, `--formula-hidden`, `--formula-prob`, `--formula-size`, `--formula-weight`, `--minute-bg`, `--plot-a`, `--plot-b`, `--plot-opacity-a`, `--plot-opacity-b`, `--question-bg`, `--sheet-backdrop`, `--sheet-entry`, `--sheet-handle-height`, `--sheet-handle-width`, `--switch-height`, `--switch-inset`, `--switch-thumb`, `--switch-travel`

**Claves nuevas en es/en (63):** `articulo.indice`, `articulo.proyectos`, `articulo.capitulos`, `articulo.opciones`, `articulo.aa`, `articulo.tema`, `articulo.cosmos`, `articulo.dawn`, `articulo.sistema`, `articulo.movimiento`, `articulo.recordar`, `articulo.lectura`, `articulo.anterior`, `articulo.siguiente`, `articulo.minuto`, `articulo.problema`, `articulo.construi`, `articulo.resultado`, `articulo.rol`, `articulo.tecnologias`, `articulo.fecha`, `articulo.recursos`, `articulo.autores`, `articulo.afiliacion`, `articulo.publicado`, `articulo.repositorio`, `articulo.demo`, `articulo.pdf`, `articulo.codigo`, `articulo.figura`, `articulo.sinteticos`, `articulo.decisiones`, `articulo.decision`, `articulo.elegida`, `articulo.alternativa`, `articulo.porque`, `articulo.fragmento`, `articulo.referencias`, `articulo.volverReferencia`, `articulo.citar`, `articulo.copiar`, `articulo.seleccionado`, `articulo.responsabilidad`, `articulo.entradas`, `articulo.cumple`, `articulo.verCodigo`, `articulo.explorar`, `articulo.diagrama`, `articulo.controles`, `articulo.comparar`, `articulo.modeloA`, `articulo.ambos`, `articulo.restablecer`, `articulo.proximamente`, `articulo.pregunta`, `articulo.h1`, `articulo.h0`, `articulo.notas`, `articulo.tabla`, `articulo.codigoRegion`, `articulo.tablaLectura`, `articulo.codigoNumerado`, `articulo.tablaNumerada`

### 4. Preguntas abiertas

- ¿Qué controla exactamente «Figuras» en la hoja Aa? Se omitió ese apartado; el control Reducir movimiento sí está implementado.
- D1: Jorge debe elegir el bronce Dawn actual o la propuesta de la captura. El token actual se conserva.
- D4: Jorge debe revisar hover, seleccionado y etiqueta pendiente en Dawn. No se tomó esa decisión de diseño.
- ¿Se confirma la distribución compacta de la barra a 834 px descrita arriba? No existe referencia tablet específica para contrastarla.

### 5. No verificado

- Dispositivos físicos, VoiceOver y navegadores distintos de Chromium; no se declaran probados.
- No se hizo grabación de cada fotograma del primer pintado. Se verificaron el script síncrono del head, el tema correcto en DOMContentLoaded y la ausencia de clase de transición en cada carga.
- Integración con la rama de F2, rename/commits de git y publicación: quedan a cargo de la revisión, fuera de esta entrega.
- Interacciones de nodos/fórmula/experimento/BibTeX y View Transitions: corresponden a F4 y permanecen inactivas por alcance.

## Revisión
**Claude, 2026-10-26.** Una entrega sólida: los 18 cruces de axe (A, B e híbrido × Cosmos y Dawn × 3 tamaños) pasan, KaTeX y Shiki se generan en el build sin CDNs, y no hay prosa inventada.

### Integración con F2
- Conflictos en `playwright.config.ts`, `scripts/servidor-e2e.mjs` y los JSON de i18n. Se conservan las claves de las dos fases (121, con paridad) y el puerto de F2 (`PORTAFOLIO_E2E_PORT`); `capturar-f3.mjs` se adaptó a esa variable.
- **Verificación sobre `main` integrado:** `check` limpio, 97/97 tests, build sin advertencias y 93/93 e2e.

### Preguntas que pasan a Jorge (`PLAN.md` § Decisiones abiertas)
- **D1** (bronce en Dawn) y **D4** (valores de Dawn): capturas en `capturas/F3/D1-*.png` y `D4-*.png`.
- **«Figuras»** en la hoja «Aa»: se omitió porque ninguna fuente dice qué controla.
- **La barra de artículo a 834 px**, compactada sin los enlaces de sección. No hay maqueta de tablet para contrastarla.

**Recomendación:** aprobada e integrada en `main`.
