# Plan de realización

**Actualizado:** 2026-10-25 · **Estado general:** F0–F7 y F5.1 en `main` · repo público en GitHub con CI verde · F0.5 a falta de conectar Cloudflare Pages · F8 pendiente de contenido
**Stack confirmado:** Astro (estático) + TypeScript + MDX, CSS con tokens y despliegue en Cloudflare Pages. Ver `docs/ARQUITECTURA.md` § Enmiendas.

Este es el mapa de todo el proyecto: qué se construye, en qué orden, qué necesita cada fase de Jorge y cómo se sabe que está terminada. Los encargos detallados (`docs/encargos/Fn-*.md`) se escriben a partir de este plan cuando le llega el turno a cada fase, para incorporar lo aprendido en la anterior.

---

## 1. Qué es «terminado» (v1)
La v1 se publica cuando se cumple todo esto:

- **Portada:** las 7 secciones de la Maqueta 1 en escritorio, tablet y móvil, con el hero animado y los 3 relatos.
- **Artículos:** las plantillas de ingeniería, investigación e híbrido, y la página de nota.
- **Idiomas:** el español completo y el inglés activo, con respaldo al español donde falte traducción.
- **Calidad:**
  - AA en ambos temas;
  - todo se puede usar con teclado y lector de pantalla;
  - reduced motion con el contenido idéntico;
  - Lighthouse ≥ 90 en rendimiento y ≥ 95 en accesibilidad;
  - ≤ 100 KB de JS inicial por página.
- **Contenido:** `npm run contenido:pendientes -- --estricto` sale con 0. No queda ningún `‹…›` ni ningún `borrador: true` publicado.
- **Publicación:** está en el dominio definitivo y cada rama tiene su previsualización.

## 2. Cómo se avanza
1. **Encargo:** Claude escribe `docs/encargos/Fn-*.md` (ver `CLAUDE.md`).
2. **Implementación:** Codex trabaja en la rama `fn-<tema>` y entrega su informe.
3. **Revisión:** Claude comprueba los criterios con comandos y con Playwright a 1280, 834, 390 y 360 px, y escribe la revisión.
4. **Previsualización:** Jorge mira la URL de la rama (disponible desde F0.5) y aprueba o comenta.
5. **Fusión:** Jorge fusiona en `main`. Si hay bloqueantes, Claude escribe un encargo de corrección `Fn.1`.

**Estados de una fase:** `pendiente` → `encargada` → `en revisión` → `aprobada`.

## 3. Hitos

| Hito | Fases | Qué se puede ver al terminar |
|---|---|---|
| **H1 · Esqueleto** | F0, F0.5, F1 | Un sitio publicado en una URL de previsualización, con la barra, el menú, el pie y las anclas funcionando |
| **H2 · Sitio estático completo** | F2, F3 | La portada (sin hero ni relato) y los artículos, completos y responsive, todavía con placeholders |
| **H3 · Sitio interactivo** | F4, F5 | Filtros, 5b, diagramas, experimento y los 3 relatos con scrollytelling |
| **H4 · Arte** | F6 | El hero de las dos manos con su entrada y su transición al relato |
| **H5 · Multilingüe** | F7 | El sitio en español e inglés |
| **H6 · Lanzamiento** | F8 | Contenido real, auditorías y dominio |

## 4. Fases

| Fase | Tema | Depende de | Tamaño | Estado | Encargo |
|---|---|---|---|---|---|
| F0 | Base técnica | — | M | **aprobada** | [F0-base.md](encargos/F0-base.md) |
| F0.5 | Previsualizaciones en Cloudflare Pages | F0, cuentas (D7) | S | **en curso**: repo creado; falta conectar Pages | — |
| F1 | Barra global, menú móvil, pie y anclas | F0 | M | **aprobada** | [F1-navegacion.md](encargos/F1-navegacion.md) |
| F2 | Portada estática: 03–07 | F1 | L | **aprobada** | [F2-portada.md](encargos/F2-portada.md) |
| F3 | Artículos y notas: plantillas, tema y lectura | F1 | L | **aprobada** | [F3-articulos.md](encargos/F3-articulos.md) |
| F4 | Interacciones de la portada y de los artículos | F2, F3 | L | **aprobada** | [F4-interacciones.md](encargos/F4-interacciones.md) |
| F5 | Scrollytelling | F2, F3 (en paralelo con F4) | L | **aprobada** | [F5-relato.md](encargos/F5-relato.md) |
| F5.1 | Selección de nodos dentro del relato (bugs 4, 5 y 6) | F4, F5 | S | **aprobada** | [F5.1-relato-nodos.md](encargos/F5.1-relato-nodos.md) |
| F6 | Hero y transición | F5 | L | **aprobada** | [F6-hero.md](encargos/F6-hero.md) |
| F7 | Segundo idioma (EN) | F6 | L | **aprobada** | [F7-idiomas.md](encargos/F7-idiomas.md) |
| F8 | Pulido UX/UI y lanzamiento | todas, contenido real | L | pendiente | — |

**Tamaño:** S = una sesión corta del agente · M = una sesión · L = una o dos sesiones, posiblemente con un encargo de corrección.

**En paralelo:**
- F2 y F3 pueden ir en ramas distintas tras F1.
- F7 puede empezar en cuanto F3 esté aprobada, sin esperar a F4–F6.
- La pista de contenido de Jorge (§ 5) avanza en paralelo desde hoy.

---

### F0 · Base técnica
Ver [F0-base.md](encargos/F0-base.md). Incluye:

- Astro con TS estricto y MDX;
- los tokens y Geist autoalojada;
- la infraestructura i18n (solo `es` activo);
- las colecciones con esquema y el contenido semilla placeholder;
- `BaseLayout` con el tema sin parpadeo;
- los tests (contraste, igualdad de tokens, i18n, esquemas) y la CI.

### F0.5 · Previsualizaciones
- **Objetivo:** cada rama y cada PR tienen una URL de Cloudflare Pages, para que Jorge revise visualmente desde F1.
- **Necesita de Jorge:** el repositorio en GitHub (D6) y una cuenta de Cloudflare (D7). Conectarlos le lleva unos 10 minutos, con la guía del encargo.
- **Entregables:**
  - el proyecto de Pages conectado, con build `npm run build` y salida `dist`;
  - `noindex` en las previsualizaciones;
  - la protección de `main` (la CI es obligatoria antes de fusionar).
- **No incluye:** el dominio definitivo ni analytics (F8).

### F1 · Navegación global
- **Leer:** `INTERACCIONES.md` § Navegación y § Estados de la barra global; `PAGINAS.md` § Navegación global; Maqueta 3 § N.
- **Entregables:**
  - **Barra global**, componente con `data-estado`:
    - *1 · sobre el hero:* sin fondo, con márgenes de 64 px y texto a 14: JORGE · Proyectos · Notas (solo si hay notas) · Sobre mí · Contacto · CV en oro;
    - *3 · fija:* mide 56 px, usa `--bg` al 94 % y se oculta al bajar y reaparece al subir (`translateY`, 200 ms); la sección activa va en `--heading` con un subrayado de oro de 2 px;
    - *4 · artículo:* la miga de pan y los huecos para el selector de tema y el progreso, que llegan en F3;
    - *2 · relato:* solo queda preparado, porque se activa en F5.
  - **Detección de la sección activa** con IntersectionObserver.
  - **Anclas:** scroll suave con 72 px de desfase (`scroll-padding-top`), la URL se actualiza y el foco pasa al h2. Con reduced motion, salto directo.
  - **Menú móvil** a pantalla completa:
    - las secciones numeradas a 24/600, la actual en oro, CV como botón primario y los enlaces externos al pie;
    - bloquea el scroll, atrapa el foco y se cierra con ✕, Esc o al elegir una sección;
    - con reduced motion, aparece sin deslizar.
  - **Pie de página:** © a la izquierda y «Volver arriba ↑» a la derecha, a 13 px. El control «Tema» depende de D10.
  - **Tests e2e con Playwright + axe**, que se amplían en cada fase siguiente: foco, Esc, trampa de foco y ausencia de violaciones de axe.
- **Criterios clave:**
  - ninguna violación de axe;
  - el menú se puede usar solo con teclado;
  - a 360 px no se corta nada;
  - la barra no tapa el h2 al saltar a un ancla.
- **Trampa:** el «oculta al bajar» no debe activarse con un scroll de teclado ni al saltar a un ancla.

### F2 · Portada estática (secciones 03–07)
- **Leer:** `PAGINAS.md` § Portada, § 03–07; `COMPONENTES.md` C1–C6, C10 y C12; `TOKENS.md` § Espaciado y § Retícula; Maqueta 1 con sus notas de ritmo.
- **Entregables:**
  - la retícula de 12/8/4 columnas y el ritmo entre secciones: 144 px antes del índice y 160 en las demás, 128–144 en tablet y 96 en móvil;
  - **01 y 02:** bloques reservados con su alto (100 vh y el relato), para que el ritmo sea real;
  - **03 Índice:**
    - la lista editorial con las columnas 56 / 1fr / 150 / 72 / 230 / 160 y las variantes de tablet y móvil;
    - el filtro, visible en estado «Todos» (su interacción llega en F4);
    - «ver relato ↑» en los destacados;
    - la fila entera es un único `<a>` (C6) con su hover;
  - **04 Sobre mí:**
    - la figura opcional en las columnas 1–5, o el texto centrado en 8 columnas si no hay foto;
    - las preguntas;
    - la trayectoria (plegada en móvil con `<details>`);
    - el CV primario con «Actualizado ‹mes año›»;
  - **05 Tecnologías:**
    - las 5 áreas, las herramientas con su recuento derivado y la franja de evidencia;
    - la primera herramienta del área 1 seleccionada por defecto;
    - el acordeón móvil con `<details>`, que funciona sin JS;
  - **06 Notas:** solo se renderiza si hay notas; si no, la numeración se recalcula (un test lo comprueba);
  - **07 Contacto:**
    - las 4 filas (Correo con «Copiar», cuya función llega en F4; GitHub ↗; LinkedIn ↗; CV ↓);
    - el fragmento artístico: la mano provisional al 45 % con `saturate(.7)`, la terminal de 120 × 68 al 85 % y las estrellas en SVG con semilla fija;
  - **componentes reutilizables:** `EncabezadoSeccion` (C1), `Boton` (C2), `Enlace` (C3), `EtiquetaTipo` (C4) y `FiltroSegmentado` (C5, visual).
- **Criterios clave:**
  - capturas a 1280, 834 y 390 px junto a la Maqueta 1, sin diferencias de layout;
  - el recuento de herramientas coincide con el contenido;
  - sin notas, el Contacto pasa a 06;
  - todo el texto viene de `src/content` o `src/i18n`.

### F3 · Artículos y notas
- **Leer:** `PAGINAS.md` § Artículo A, § Artículo B y § Rutas; `COMPONENTES.md` C9–C11 y la hoja inferior; `INTERACCIONES.md` § Cambio de tema; Maqueta 2 completa; `DECISIONES.md` § Artículos.
- **Entregables:**
  - `ArticuloLayout` con la retícula 180 / 632 / 260 y la separación de 40;
  - el **índice lateral *sticky*** con el capítulo actual (`aria-current`); en tablet, «Capítulos ▾»; en móvil, la barra con «← Proyectos», «Capítulos n/N ▾» y «Aa»;
  - los **componentes MDX**:
    - comunes: `EnUnMinuto`, `Ficha` (vertical en A y horizontal de 4 columnas en B), `Figura` con leyenda numerada, `NotaMargen`, `TablaDecisiones`, `CodigoAnotado` (Geist Mono 13/1,75, con marcas numeradas explicadas al margen) y `Referencias`;
    - de B: `Pregunta` (H1/H0), `Formula` y `Citar` (BibTeX + Copiar);
  - **resaltado de código en el build** con Shiki y un tema hecho con los tokens, que cambia con Cosmos/Dawn;
  - **fórmulas** con KaTeX en el build, sin JS en el cliente;
  - el **selector de tema** (Cosmos · Dawn, y Sistema en móvil), con persistencia en `localStorage` y fundido de 200 ms en `background-color` y `color`;
  - la **barra de progreso** de lectura (2 px, `aria-hidden`);
  - la **hoja inferior** genérica (radio 20, asa de 40 × 4, trampa de foco y Esc) y la hoja **«Aa»**, con el tema y la opción «Reducir movimiento» (`data-movimiento="reducido"`, que pone a 0 los tokens de duración y se guarda);
  - las tarjetas **Anterior/Siguiente** y el pie;
  - el **diagrama**, la **fórmula interactiva** y el **experimento** en estado estático (su interacción llega en F4);
  - la **página de nota** `/notas/<slug>`: columna de lectura y margen, sin índice lateral;
  - el **contenido semilla:** un artículo de ingeniería y uno de investigación con la estructura de la Maqueta 2, ambos `borrador: true`.
- **Criterios clave:**
  - el tema persiste sin parpadeo al navegar entre artículos;
  - Dawn cumple AA, incluido el código resaltado (se añade al test de contraste);
  - «Reducir movimiento» de la hoja equivale a la preferencia del sistema;
  - la miga de pan de investigación es «Proyectos / Investigación».
- **Necesita de Jorge:** revisar D1 y D4 en la previsualización.

### F4 · Interacciones
- **Leer:** `INTERACCIONES.md` completo, excepto § Scrollytelling y § Hero; `COMPONENTES.md` C5–C8 y C12.
- **Entregables:**
  - **Índice:**
    - filtro por tipo con `?tipo=` y `aria-pressed`, fundido de 200 ms en las filas y el contador sin animar;
    - el botón atrás restaura el filtro y la posición;
  - **5b:**
    - al seleccionar una herramienta se actualiza la franja (opacidad de 200 ms y las tarjetas que no aplican al 30 %);
    - la tarjeta de evidencia abre su artículo;
  - **Contacto:** «Copiar» → «Copiado ✓» durante 2 s, anunciado con `aria-live`;
  - el **componente Diagrama**, que también usará F5:
    - SVG con nodos C8 (reposo, hover, seleccionado, en recorrido, atenuado e inerte) y aristas por debajo de los nodos;
    - se selecciona con clic, Enter o Espacio, y entonces se resaltan sus aristas;
    - el panel de 280 px muestra Responsabilidad, E/S, Cumple Rn y el enlace al código;
    - en móvil, la hoja inferior con «Componente n de N» y Anterior/Siguiente;
  - **Fórmula:** al seleccionar un término se resalta también en su figura;
  - **Experimento:** el control deslizante (44 px en móvil) y la comparación A, B o A y B recalculan el histograma, siempre con «Datos sintéticos»;
  - **Transiciones de página:** View Transitions con salida de 120 ms y entrada de 200 ms (sin ellas con reduced motion), y «← Índice de proyectos» vuelve a `/#indice?tipo=…`.
- **Decisión previa:** D9 (TS vanilla o isla).
- **Criterios clave:**
  - todo se puede usar con teclado;
  - los estados son los de `INTERACCIONES.md` § Estado que hay que gestionar;
  - sin JS, el índice muestra «Todos», el acordeón funciona y el contenido está completo (casuística V4).

### F5 · Scrollytelling
> **Ajuste del 2026-10-26:** F5 se hace en paralelo con F4. La selección de nodos dentro del relato y los bugs 4, 5 y 6 pasan a **F5.1**, que conecta el módulo `diagrama-interactivo` de F4 cuando las dos estén en `main`. La base común (`DiagramaSVG` con estados) la dejó Claude en `main` antes de lanzar las dos fases.

- **Leer:** `INTERACCIONES.md` § Scrollytelling; `DECISIONES.md` § Proyectos destacados; **`BUGS_CONOCIDOS.md` completo**; `scrollytelling-v1.html`; Maqueta 1 § 02.
- **Entregables:**
  - **los 3 relatos**, generados desde `capitulos_relato` de los proyectos destacados:
    - la cabecera de 56 px con «Leer el proyecto completo», «Siguiente proyecto ↓» y «Saltar relatos ↓»;
    - el rail de capítulos (C9);
    - la figura *sticky* y el texto, que avanza por pasos;
  - **la activación** cuando el paso cruza el 40 % del viewport, con IntersectionObserver;
  - **los estados de la figura**, construidos con el componente Diagrama de F4:
    1. agentes sin coordinación;
    2. aparece el orquestador;
    3. el recorrido avanza paso a paso;
    4. barras de resultados.

    Transiciones: 240 ms en los nodos, 150 ms en el recorrido y 200 ms en el gráfico;
  - **el modo Diagrama/Texto** (44 px como mínimo), con el diagrama `inert` en modo Texto;
  - **la ficha** en el lado opuesto al nodo, con gestión del foco;
  - **la barra global**, que pasa al estado 2 dentro del relato;
  - **móvil:** la figura *sticky* bajo la cabecera, con alto limitado, y la ficha como hoja inferior;
  - **reduced motion:** sin *pinning*, con la figura en cada paso y cambios por corte.
- **Criterios clave:**
  - un test e2e por cada uno de los **7 bugs** de `BUGS_CONOCIDOS.md` demuestra que no ocurre;
  - quedan verificados los 4 puntos «sin verificar» del prototipo: reduced motion del sistema, «Siguiente proyecto» y «Volver al capítulo 1», pantallas de 1180 px o más, y VoiceOver en Mac e iOS.
- **Necesita de Jorge:** los 3 destacados y el texto de sus 4 capítulos. Si no los hay, el relato se construye con placeholders y se rellena después.

### F6 · Hero
- **Leer:** `HERO.md` completo; `hero-final.html` §§ 1–6; `design/fuente/hero-arte.dc.html`, método `base()`.
- **Entregables:**
  - **las capas L0–L6:**
    - las estrellas con semilla fija;
    - la mano humana (WebP o AVIF a 2× con su filtro);
    - la mano de terminales: unas 31 ventanas portadas desde `base()`, con variación orgánica de semilla fija y la luz de 38 % a 100 %;
    - la punta con su cursor;
    - el h1 «Jorge», con L1–L4 en `aria-hidden` y una descripción alternativa;
  - **la entrada**, con la línea de tiempo de `HERO.md` § Capas;
  - **la transición:** fijación de 60 vh (40 en móvil) con p de 0 a 1, deriva radial desde la palma, la mano humana a +110 px, las estrellas a −40 px, el capítulo 1 entrando y el rearmado al subir;
  - **responsive** desde M (tabla de `HERO.md` § Responsive), respetando los mínimos: hueco ≥ 20 px, punta ≥ 8 px y círculo libre;
  - **reduced motion:** sin fijación ni deriva, y el cursor fijo.
- **Criterios clave:**
  - CLS = 0;
  - solo `transform` y `opacity`, sin tareas largas de más de 50 ms durante el scroll (trazar con `animation-performance`);
  - captura junto a `hero-final.html` en los cuatro rangos.
- **Necesita de Jorge:** el texto real de las terminales (bloqueante para F8, no para F6). La mano definitiva puede llegar después, porque se sustituye un archivo.

### F7 · Segundo idioma
- **Decisiones previas:** D2 (diseño del selector) y D3 (qué idiomas).
- **Entregables:**
  - `en` en `IDIOMAS_ACTIVOS` y rutas `/en/…`;
  - el selector de idioma según D2, en la barra, el menú móvil y la hoja «Aa»;
  - el cambio de idioma lleva a la misma página (casuística I2) y la elección se recuerda;
  - el aviso «Available in Spanish only» donde falte traducción (C2);
  - `hreflang`, `html lang` y fechas con `Intl`;
  - `en.json` completo.
- **Necesita de Jorge:** aprobar la traducción de su contenido. Claude puede proponerla, pero Jorge la revisa antes de publicarla.

### F8 · Pulido UX/UI y lanzamiento
F8 tiene dos partes, en este orden: **primero el pulido y después el lanzamiento.** El pulido convierte una implementación fiel a las maquetas en el producto final, y solo tiene sentido con contenido real.

**Parte A · Pulido UX/UI.** Pedido por Jorge el 2026-10-26.
- **Con contenido real:** se revisa el sitio entero con los textos, los proyectos y las figuras definitivos. Se ajustan el ritmo vertical, la longitud de líneas y resúmenes, la jerarquía tipográfica y los espacios donde el texto real se comporte distinto que los placeholders.
- **Movimiento:** se afinan las duraciones, los retardos y las curvas del hero, el relato y las transiciones, sobre el sitio funcionando, con `animation-vocabulary`, `improve-animations` y `animation-performance`. Se respetan las reglas de `AGENTS.md` (sin rebotes ni zoom). Si Jorge quiere más intensidad en alguna zona, se registra como decisión antes de implementarla.
- **Detalle de interacción:** estados de hover, foco y pulsado, tiempos de respuesta, mensajes, estados vacíos y de error, y objetivos táctiles, con `emil-design-eng`.
- **Dispositivos reales:** un iPhone y un Mac con Safari y Chrome, VoiceOver, el teclado y una conexión lenta (con `mobile-native`).
- **Revisión de diseño:** Claude (o Claude Design) compara con las maquetas y propone una lista priorizada de ajustes. Jorge elige cuáles entran y Codex los implementa en uno o dos encargos cortos.
- **Criterio de salida:** Jorge, mirando el sitio en su teléfono y en su ordenador, lo da por terminado.

**Parte B · Lanzamiento.**
- **Entregables:**
  - **SEO:** título y descripción por página, canonical, `sitemap.xml` con los idiomas y `robots.txt`;
  - el **favicon** y las **imágenes OG** generadas en el build (propuesta: el detalle de la punta con el cursor sobre Cosmos);
  - **`break-ui`:** títulos larguísimos, un proyecto sin imagen, 0 o muchos proyectos, un idioma que falta y 0 notas;
  - **Lighthouse CI** en cada PR, con los umbrales de § 1;
  - auditoría con axe y con VoiceOver;
  - prueba en un iPhone y un Mac reales;
  - `contenido:pendientes --estricto` obligatorio en la CI de `main`;
  - el **dominio** (D5) en Cloudflare Pages, con HTTPS y la redirección de `www`.
- **Necesita de Jorge:** todo el contenido de § 5 y el dominio.

---

## 5. Pista de contenido (Jorge, en paralelo desde hoy)
Nada de esto bloquea el desarrollo hasta la fase indicada, porque mientras tanto se trabaja con placeholders. Cuanto antes esté, antes se ve el sitio con su contenido real.

| Contenido | Necesario para ver real en | Bloquea lanzar | Formato |
|---|---|---|---|
| **Lista de proyectos**: título, tipo, año, resumen, herramientas, rol y enlaces | F2 | Sí | Un `.mdx` por proyecto, o una lista que Claude convierte |
| **Los 3 destacados** y el texto de sus 4 capítulos (problema → orquestador → recorrido → resultados) | F5 | Sí | Texto. Claude ayuda a estructurarlo |
| **Inventario de tecnologías** por área | F2 | Sí | Lista |
| Textos personales: la frase del hero, la presentación, las 2–3 preguntas y la frase de contacto | F2 | Sí | Texto |
| Trayectoria y formación | F2 | Sí | 3 líneas |
| Enlaces: correo, GitHub y LinkedIn, más el CV en PDF y su fecha | F2 | Sí | Archivos y URL |
| Texto de las terminales del hero: agentes y comandos reales | F6 | Sí | Unos 31 nombres cortos |
| **Mano del hero:** reproducción con licencia verificada (≥ 2400 px) o ilustración propia | F6 | Sí | PNG con alfa |
| Métricas y figuras verificables, o marcarlas como sintéticas | F5 | Sí | Datos |
| Investigación: coautores, afiliación, DOI o PDF y referencias | F3 | Solo si hay artículos B | Texto y BibTeX |
| Fotografía personal (4:5) | F2 | No: es opcional | Imagen |
| Notas publicadas | F2 | No: si no hay, la sección 06 no aparece | `.mdx` |

**Primer paso recomendado:** la lista de proyectos y los 3 destacados. Condicionan el índice, Tecnologías, los relatos y los artículos.

## 6. Pista de cuentas e infraestructura (Jorge)

| Tarea | Para | Cuándo |
|---|---|---|
| Crear el repositorio en GitHub y decidir si es público o privado (D6) | CI y previsualizaciones | Antes de F0.5, idealmente ya |
| Crear la cuenta de Cloudflare (D7) | F0.5 | Tras F0 |
| Elegir y comprar el dominio (D5) | F8 | Antes de F8 |

## 7. Calidad en todas las fases
Cada encargo hereda estos criterios, además de los suyos:

- `build`, `check` y `test`, más los e2e desde F1, pasan sin advertencias;
- capturas a 1280, 834, 390 y 360 px junto a su referencia;
- reduced motion verificado, con el contenido idéntico;
- axe sin violaciones y todo usable con teclado;
- ningún valor suelto (`verificar-tokens`) y ningún texto escrito en un componente;
- nada inventado: lo que falte va como `‹…›`.

## 8. Decisiones abiertas
Cada una indica qué fase bloquea y se resuelve antes de escribir ese encargo.

| # | Decisión | Bloquea | Propuesta |
|---|---|---|---|
| D1 | **Bronce de Ingeniería en Dawn.** En `tokens.css`, `--eng` de Dawn es igual a `--accent` (#7A5824), así que en Dawn la etiqueta y las acciones tienen el mismo color | F3 | #7A6448, un bronce más apagado (5,1:1 sobre `--bg`). Conviene verlo junto a un botón |
| D4 | **Valores de Dawn sin validar visualmente**: `--surface-hover`, `--selected` y el tinte de `‹pendiente›` | F3 | Revisarlos en la previsualización de F3 |
| D5 | **Dominio** | F8 | — |
| D7 | **Cuentas de GitHub y Cloudflare** | F0.5 | Las crea Jorge |
| D8 | **Contenido real** | F8 | Ver § 5 |
| D10 | **«Figuras» en la hoja «Aa».** La maqueta muestra un apartado sin especificar | F4 | Quitarlo, salvo que controle Diagrama/Texto en todas las figuras |
| D11 | **Barra de artículo en tablet (834 px).** F3 la compactó sin los enlaces de sección; no hay maqueta de tablet | F4 | Aceptarla |
| D12 | **Listado `/notas/`** para «Todas las notas →». No está en ningún encargo | Cuando haya más de 3 notas | Añadirlo a F4 o a F8: lista con el patrón del índice |
| D9 | **Isla de React o TS vanilla** para diagramas y relato | F4 | TS vanilla con SVG |

## 9. Riesgos

| Riesgo | Mitigación |
|---|---|
| El hero (F6) es la pieza más difícil y la que más se ve | Va después del relato porque depende de él, pero puede adelantarse un prototipo de la geometría si F5 se alarga. Se mide con `animation-performance` |
| El contenido real llega tarde y el sitio queda listo sin nada que mostrar | La pista de contenido (§ 5) arranca hoy. El lanzamiento solo depende de F8 |
| Codex se sale del alcance o «mejora» el diseño | Encargos con «No incluye» explícito, revisión contra los criterios y la regla 9 de `AGENTS.md` |
| La licencia de la mano de *La creación de Adán* | Bloqueante explícito: o una reproducción con licencia verificada, o una ilustración propia |
| Publicar algo privado | La regla 11 de `AGENTS.md`, `borrador` y la revisión del diff antes de fusionar |
| Que `src/styles/tokens.css` y `design/docs/tokens.css` diverjan | Lo detecta el test de igualdad de F0 |

## 10. Después de la v1
Están en `docs/ARQUITECTURA.md` y quedan fuera de la v1 porque el diseño aprobado no los incluye:

- el CV generado desde YAML, con su página `/cv`;
- la importación de notas desde Obsidian con `publish: true`;
- el formulario de contacto con Turnstile y Resend;
- las demos interactivas;
- Cloudflare Web Analytics.

## 11. Correcciones hechas al instalar el handoff (2026-10-25)
- Se añadió el token `--on-accent`: el botón primario en Dawn no llegaba a AA (3,0:1, y 2,1:1 en hover).
- `hero-final.html` buscaba `assets/mano-adan-v2.png` a su lado y mostraba las 13 manos rotas. Se añadió una copia en `design/referencias/assets/`. Las 5 referencias se abrieron con Playwright (vía `python3 -m http.server`, porque `file://` está bloqueado) y cargan sin errores.
- Las referencias se renombraron sin espacios y se actualizaron las rutas.
- Quedaron registradas en `design/docs/DECISIONES.md` las decisiones del bronce de Ingeniería, las curvas del handoff y el multilingüe.
