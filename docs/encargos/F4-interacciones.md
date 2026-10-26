# F4 · Interacciones

**Estado:** aprobada
**Rama:** `f4-interacciones` (worktree propio) · **Depende de:** F2 y F3 (en `main`) · **En paralelo con:** F5 · **Escrito por:** Claude · **Fecha:** 2026-10-26

> Cómo lanzarlo en Codex: *«Lee AGENTS.md y docs/encargos/F4-interacciones.md. Implementa solo ese encargo y termina con el informe que pide.»*

## Objetivo
Al terminar, todo lo que en F2 y F3 se veía pero no respondía funciona:

- el filtro del índice;
- la selección de herramientas de Tecnologías (5b) y la animación del acordeón;
- los botones «Copiar»;
- los diagramas de los artículos, con su ficha y, en móvil, la hoja inferior;
- la fórmula, con los términos resaltados;
- el experimento;
- las transiciones entre páginas.

Además, el módulo de interacción del diagrama queda listo para que lo reutilice el relato (F5.1).

## Leer antes
- `AGENTS.md`, completo.
- `design/docs/INTERACCIONES.md` completo, **salvo** § Scrollytelling y § Hero.
- `design/docs/COMPONENTES.md` C5–C8, C12 y la fila «Hoja inferior».
- `design/docs/PAGINAS.md` § 03, § 05, § 07, § Artículo A y § Artículo B (solo las partes interactivas).
- `design/docs/BUGS_CONOCIDOS.md`: aunque es del relato, las reglas 4 y 6 (ficha y nodos atenuados) aplican a cualquier diagrama.
- `design/referencias/maqueta-3-sistema.html` § I (tabla de interacciones) y `maqueta-2-articulos.html` (el diagrama seleccionable de escritorio y la hoja del diagrama en móvil).
- Código que ya existe y que **hay que reutilizar**:
  - `src/components/DiagramaSVG.astro` y `src/lib/diagrama.ts` (`ModeloDiagrama` y `EstadoDiagrama`): el dibujo compartido de los diagramas, que solo pinta estados con `data-estado` en cada nodo;
  - `src/components/articulo/Diagrama.astro`: la figura del artículo, con panel;
  - `src/components/HojaInferior.astro` y `src/lib/hojas.ts`: la hoja genérica, con trampa de foco y Esc;
  - `src/lib/datos-sinteticos.ts`, `src/components/articulo/{Formula,Experimento,Citar}.astro`;
  - en la portada: `FiltroSegmentado`, `FilaIndice`, `Herramienta`, `TarjetaEvidencia`, `Acordeon` y `FilaContacto`;
  - `src/lib/enlaces.ts` (`esPlaceholder()`) y `src/lib/navegacion.ts`.

## Incluye
1. **Filtro del índice (C5):**
   - con JS, los botones filtran por tipo (Todos, Ingeniería, Investigación, Híbridos) y marcan `aria-pressed`;
   - la URL refleja el filtro con `?tipo=ing|inv|hib` (`history.replaceState`) y, al cargar con ese parámetro, la lista ya sale filtrada;
   - las filas que entran lo hacen con un fundido de `--dur`; el contador no se anima;
   - un resumen visualmente oculto con `aria-live="polite"` anuncia «N proyectos»;
   - **el botón atrás** del navegador restaura el filtro y la posición. «← Índice de proyectos» del artículo ya conserva `?tipo=` desde F3: compruébalo de punta a punta;
   - **sin JS**, el filtro sigue en «Todos», como ahora.
2. **Tecnologías (5b, C7):**
   - al pulsar una herramienta quedan `aria-pressed` y la línea «‹Herramienta› · aparece en N proyectos», y la franja de evidencia se actualiza: las tarjetas que no aplican pasan a atenuadas, **con el texto en `--muted`, como dejó F2**;
   - la transición es de `--dur`, y un `aria-live="polite"` anuncia el cambio;
   - por defecto queda seleccionada la primera herramienta del área 1, como ya hace F2.
3. **Acordeón móvil (C12):**
   - la altura se anima en `--dur` sobre los `<details>` existentes, por ejemplo con `interpolate-size` o con `::details-content`, y tiene que funcionar también sin JS;
   - con reduced motion, sin animación de altura.
4. **«Copiar»** (C12, en Contacto y en «Citar» del artículo B):
   - el botón solo se muestra (se quita `hidden`) si existe `navigator.clipboard` **y el valor no es un placeholder** (`esPlaceholder()`);
   - al pulsar, el texto cambia a «Copiado ✓» durante 2 s y se anuncia con `aria-live`;
   - si falla, muestra «No se pudo copiar» y deja el texto seleccionable.
5. **Módulo de interacción del diagrama** (`src/lib/diagrama-interactivo.ts`), reutilizable por F5.1:
   - **Accesibilidad:** sobre el SVG (que sigue `aria-hidden`), una capa de **botones HTML posicionados** sobre cada nodo, con su etiqueta, foco visible y objetivos de 44 px en móvil. Los nodos `atenuado` son **inertes**: no se pueden enfocar ni seleccionar.
   - **Selección:** con clic, Enter o Espacio, el nodo pasa a `data-estado="seleccionado"`, sus aristas se resaltan (la clase `resaltada` de `DiagramaSVG`) y el panel o la ficha muestran Responsabilidad, Entradas · salidas, Cumple Rn y «Ver el código».
   - **Animación:** la ficha entra con un fundido de `--dur-fast`.
   - **Esc** cierra la ficha y devuelve el foco al nodo.
   - **API:** `activarDiagrama(raiz, { modelo, panel: 'fijo' | 'opuesto', alCambiar? })`.
     - `'fijo'`: el panel lateral de 280 px del artículo;
     - `'opuesto'`: la ficha flotante se abre **en el lado opuesto al nodo** y el foco entra en ella al abrirse. La usará el relato (bug 4 de `BUGS_CONOCIDOS.md`).
   - Hover sobre un nodo: `--surface-hover`, en 150 ms.
6. **Diagrama del artículo:**
   - en escritorio, el panel fijo, con el nodo inicial del modelo seleccionado;
   - en móvil, se muestra «Explorar componentes» (que hoy está `hidden`) y abre `HojaInferior` con «Componente n de N», Anterior/Siguiente y «Cerrar ✕»; recorrer los componentes actualiza también el diagrama en miniatura.
7. **Fórmula (artículo B):**
   - cada término en píldora es un botón; al seleccionarlo, recibe un contorno de 2 px, se muestra su definición y **se resalta también el elemento asociado de la figura 2** (vinculado con `data-termino`);
   - en móvil, la pista es «Toca un término para ver qué significa».
8. **Experimento (artículo B):**
   - activa los controles (quita los `disabled` y el texto «Interactivo próximamente»);
   - el control deslizante y «Comparar: Modelo A · A y B» recalculan el histograma en el cliente con `datos-sinteticos.ts`, con la misma semilla que en el build para que el estado inicial coincida;
   - «Restablecer» vuelve a 0,7 y a A y B;
   - la leyenda «Datos sintéticos» se mantiene siempre;
   - con reduced motion, las barras cambian sin animación.
9. **Transiciones entre páginas:**
   - **View Transitions entre documentos**, solo con CSS (`@view-transition { navigation: auto; }`), **sin** `ClientRouter`: los scripts actuales esperan cargas completas;
   - salida de 120 ms y entrada de 200 ms (`INTERACCIONES.md` § Navegación);
   - **opcional:** el título de la fila del índice se transforma en el h1 del artículo mediante un `view-transition-name` único por slug;
   - con reduced motion, ninguna transición;
   - en navegadores sin soporte, navegación normal.
10. **Correcciones vistas en la revisión de F2 y F3:**
    - **Foco al cargar con un ancla:** al cargar con `#ancla`, el h2 muestra el contorno de foco. El foco al h2 solo debe moverse cuando el usuario activa un ancla (clic o teclado). En una carga directa con hash, la página se alinea pero no muestra el contorno.
    - **Índice lateral del artículo:** arriba del todo marca «2 · Ficha» en vez de «1 · Resumen». Ajusta la detección para que el primer capítulo quede activo hasta que el siguiente cruce su línea.
11. **Tests:**
    - **unitarios:** el filtro (por tipo y por `?tipo=`), el recálculo del histograma (determinista) y la lógica de vecinos o aristas de un nodo;
    - **e2e**, en los tres tamaños y sin violaciones de axe en cada estado:
      - filtrar y volver atrás restaura el filtro;
      - 5b actualiza la franja y su anuncio;
      - «Copiar» no aparece con placeholders: simula un valor real en un fixture del test, nunca en el contenido;
      - el diagrama se puede usar solo con teclado (Tab, Enter, Esc devuelve el foco) y los nodos atenuados no son enfocables: pruébalo con un fixture de modelo con un nodo atenuado;
      - la hoja del diagrama en móvil, con Anterior/Siguiente;
      - la fórmula resalta el término y la figura;
      - el experimento cambia el histograma y «Restablecer» lo devuelve al estado inicial;
      - con reduced motion, todas las duraciones valen 0 y no hay View Transitions;
      - el foco al cargar con un hash no muestra el contorno, y el índice lateral marca «1 · Resumen» arriba del todo.
12. **Capturas** en `docs/encargos/capturas/F4/`:
    - el filtro aplicado;
    - 5b con otra herramienta seleccionada;
    - el diagrama con un nodo seleccionado en escritorio y la hoja en móvil;
    - la fórmula con un término activo;
    - el experimento después de mover el control deslizante.

## No incluye
- El relato (F5) ni conectar `diagrama-interactivo` dentro del relato (F5.1).
- El hero (F6) y el selector de idioma (F7).
- El apartado «Figuras» de la hoja «Aa» (pendiente de Jorge, D10): sigue omitido.
- El listado `/notas/` (D12).

## Coordinación con F5, que va en paralelo
Hay otro Codex trabajando en F5 en otra rama. Para que las dos ramas se fusionen sin conflictos:

- **No modifiques:** `src/components/DiagramaSVG.astro`, el esquema de `proyectos` (`src/content/esquemas.ts`), `src/pages/index.astro`, `BarraGlobal.astro` ni el contenido MDX de los proyectos destacados.
- **`src/lib/diagrama.ts`:** solo puedes **añadir** tipos o funciones al final, no cambiar los existentes.
- **`src/lib/navegacion.ts`:** solo el cambio del punto 10 (foco con hash), en un bloque pequeño y localizado.
- **i18n:** claves nuevas **al final** de `es.json` y `en.json`, con el prefijo `interaccion.`.
- **Tokens:** los nuevos van **al final** de cada bloque de `tokens.css`, en ambas copias, bajo `/* F4 · interacciones */`.
- **e2e:** archivos nuevos (`tests/e2e/interacciones*.spec.ts`). Cambia los specs existentes solo si una interacción nueva rompe una expectativa antigua, y explícalo en el informe.

## Trampas conocidas
- **Las View Transitions entre documentos y el script del tema:** el tema debe resolverse antes del primer fotograma también al navegar con transición. Compruébalo en Dawn.
- **Un `<g>` de SVG enfocable no es fiable entre navegadores.** Por eso la capa de botones HTML.
- **`history.replaceState`** para el filtro, no `pushState`: cada clic no debe añadir una entrada al historial.
- **El histograma** debe dar en el cliente exactamente el mismo resultado que en el build (misma semilla y misma función). Si no, la página «salta» al cargar el JS.
- **Ningún valor suelto en el CSS** (`npm run check`).

## Criterios de aceptación
- [ ] `npm ci && npm run check && npm test && npm run build && npm run e2e` termina sin errores ni advertencias.
- [ ] axe no encuentra violaciones en `/` y en los artículos A, B e híbrido, en Cosmos y en Dawn, también con un nodo seleccionado, la hoja abierta y el filtro aplicado.
- [ ] Todo lo del punto 1 al 9 se puede usar solo con teclado y tiene su e2e.
- [ ] Sin JS (`javaScriptEnabled: false`), la portada y los artículos siguen mostrando todo su contenido: el filtro en «Todos», el acordeón abre y el panel muestra el nodo inicial.
- [ ] Con reduced motion: sin transiciones de página y con todas las duraciones a 0.
- [ ] `diagrama-interactivo.ts` exporta `activarDiagrama` con `panel: 'opuesto'`, y un test lo cubre aunque todavía no lo use ninguna página.
- [ ] Las dos correcciones del punto 10 tienen su test.
- [ ] Las capturas del punto 12 están en `capturas/F4/`.

## Si te bloqueas
Si una fuente se contradice, falta un dato o algo exige rediseñar, **no lo decidas tú**. Implementa lo que no dependa de eso y deja la pregunta en el informe.

## Informe de entrega
Añádelo al final de este archivo, en la sección «Informe»:
1. **Hecho:** la lista de entregables, con sus rutas.
2. **Verificación:** los comandos ejecutados con su resultado real, los e2e por proyecto y las capturas.
3. **Desviaciones:** qué difiere del encargo y por qué. Incluye los tokens y las claves i18n nuevas.
4. **Preguntas abiertas.**
5. **No verificado:** lo que no pudiste comprobar.

---

## Informe
Codex no llegó a escribirlo: la sesión se cortó por capacidad del modelo durante la verificación final. Lo que hizo se reconstruyó desde el diff y está resumido en la revisión.

## Revisión
**Claude, 2026-10-26.** El código de Codex cubre los puntos 1–12: filtro con `?tipo=`, 5b, acordeón, «Copiar» (oculto con placeholders), `diagrama-interactivo.ts` con `panel: 'fijo' | 'opuesto'`, la hoja del diagrama en móvil, la fórmula, el experimento, las View Transitions solo con CSS, la corrección del foco con hash y las capturas.

### Correcciones de Claude
1. **«Capítulos ▾» no llevaba a los capítulos con tilde.** El hash llega codificado (`#8--evaluaci%C3%B3n`) y `getElementById` no lo encontraba, así que la página no se movía. El fallo venía de F3. Ahora se decodifica, en `articulo.ts` y en `hojas.ts`, y hay una prueba de regresión.
2. **El contador de capítulos iba uno por detrás** tras saltar a un ancla. La línea de detección tiene ahora 2 px de tolerancia.
3. **Dos pruebas intermitentes.**
   - La View Transition exigía que Chrome la ejecutara siempre, pero Chrome la omite con la máquina cargada. Ahora solo se exige su ausencia con reduced motion; la activación se comprueba por CSS.
   - El ancla exigía ≥ 56 px exactos y salían 55,8. Ahora usa `BARRA_MIN = 56 - 0.5`.

### Verificación (integrado con F5 en `main`)
`check` limpio, 104/104 tests, build sin advertencias y 153/153 e2e.

**Recomendación:** aprobada e integrada.
