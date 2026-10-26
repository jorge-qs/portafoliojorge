# F5 · Scrollytelling (relatos destacados)

**Estado:** aprobada
**Rama:** `f5-relato` (worktree propio) · **Depende de:** F2 y F3 (en `main`) · **En paralelo con:** F4 · **Escrito por:** Claude · **Fecha:** 2026-10-26

> Cómo lanzarlo en Codex: *«Lee AGENTS.md y docs/encargos/F5-relato.md. Implementa solo ese encargo y termina con el informe que pide.»*

## Objetivo
Al terminar, la sección 02 de la portada cuenta los **3 proyectos destacados** como relatos de 4 capítulos (problema → orquestador → recorrido → resultados), con la figura fija mientras el texto avanza, el modo Diagrama/Texto, la cabecera propia del relato y la barra global oculta mientras se recorre.

**No incluye seleccionar nodos dentro del relato.** Eso lo hace F5.1, cuando el módulo de interacción de F4 esté en `main`. Este encargo deja la figura preparada para conectarlo.

## Leer antes
- `AGENTS.md`, completo.
- `design/docs/INTERACCIONES.md` § Scrollytelling, § Estados de la barra global (estado 2) y § Reduced motion (global).
- `design/docs/DECISIONES.md` § Proyectos destacados y § Resueltas en la consolidación (la fila «Barras dentro del relato»).
- `design/docs/PAGINAS.md` § Portada (la fila 02).
- `design/docs/COMPONENTES.md` C8 y C9.
- **`design/docs/BUGS_CONOCIDOS.md`, completo.**
- `design/referencias/scrollytelling-v1.html`: es **la referencia de diseño y de comportamiento**, pero su código tiene los bugs listados y no se copia. Revísala a 1280 y a 390 px.
- `design/referencias/maqueta-1-portada.html` § 02 y `maqueta-3-sistema.html` § N (estado 2 de la barra) y § C (C9).
- Código que ya existe y que **hay que reutilizar**:
  - `src/components/DiagramaSVG.astro` + `src/lib/diagrama.ts` (`ModeloDiagrama` y `EstadoDiagrama`), que pinta los estados `reposo`, `recorrido`, `seleccionado` y `atenuado`, las aristas `resaltada` y las `posiciones` por nodo;
  - `src/pages/index.astro`: la sección `proyectos` con el bloque `data-reservado="F5"` y su h2 visualmente oculto;
  - `BarraGlobal.astro`, que ya admite `data-estado="relato"` sin activarlo, y `src/lib/navegacion.ts`;
  - `src/content/validacion.ts`: `seleccionarDestacados()`.

## Incluye
1. **Modelo de contenido del relato.** Sustituye `capitulos_relato: string[]` por una **colección nueva `relatos`**: `src/content/relatos/es/<slug>.json`, un archivo por proyecto destacado.
   ```ts
   {
     diagrama: ModeloDiagrama,            // nodos y aristas de la figura
     capitulos: [                          // exactamente 4, en este orden
       { titulo, texto, estado: EstadoDiagrama },   // 1 · Problema: agentes sin coordinación
       { titulo, texto, estado: EstadoDiagrama },   // 2 · Orquestador: aparece
       { titulo, texto, pasos: { texto, estado: EstadoDiagrama }[] }, // 3 · Recorrido, paso a paso
       { titulo, texto, resultados: { etiqueta, valor, sintetico: boolean }[] }, // 4 · Barras
     ],
     equivalente_texto: string[],          // versión textual de la figura (modo Texto)
     borrador: boolean
   }
   ```
   - Valida el esquema con Zod.
   - **Validación cruzada:** todo proyecto `destacado: true` necesita su archivo en `relatos/` y todo archivo de `relatos/` corresponde a un destacado. El error debe nombrar el archivo.
   - Quita `capitulos_relato` del esquema de `proyectos`, de los 3 MDX destacados y de los tests que lo usan (`tests/contenido.test.ts`, `tests/orden.test.ts` y `tests/articulos.test.ts`), sustituyéndolo por la nueva regla.
   - **Contenido semilla:** tres JSON con la estructura y los textos **exactos** del prototipo `scrollytelling-v1.html` en el primer relato (el de agentes, orquestador, memoria y herramientas) y `‹…›` en lo que el prototipo no tenga. Los dos relatos placeholder reutilizan la figura del primero con sus textos en `‹…›`. Todo con `borrador: true`. **No inventes contenido ni métricas:** en las barras, `sintetico: true` y la leyenda «Datos sintéticos».
2. **`Relato.astro`**, uno por destacado, en el orden de `seleccionarDestacados()`:
   - un `id="relato-<slug>"` por relato;
   - **cabecera *sticky* de 56 px** (`INTERACCIONES.md` § Estados de la barra, estado 2): tipo · «Proyecto n de 3», y las salidas «Leer el proyecto completo» (al artículo), «Siguiente proyecto ↓» (al siguiente relato o, en el último, a `#indice`) y «Saltar relatos ↓» (a `#indice`);
   - **rail de capítulos (C9):** botones con `aria-current` en el capítulo activo (oro sobre `--accent-tint`); un clic lleva al capítulo con scroll suave, o salto directo con reduced motion; en móvil, 44 × 44 px;
   - **figura *sticky*** con `DiagramaSVG` a un lado (escritorio) o arriba (móvil) y el **texto por pasos** al otro;
   - **segmentado Diagrama/Texto** con objetivos de **44 px como mínimo** (bug 7). En modo Texto, la figura queda **`inert` y `aria-hidden`** y se muestra `equivalente_texto` (bug 3);
   - **leyenda del capítulo 4:** pasa a dos líneas si no cabe y **nunca se desborda** (bug 2), comprobado a 920, 1180 y 1440 px.
3. **Motor del relato** (`src/lib/relato.ts`, TS vanilla):
   - el capítulo o paso activo cambia cuando su bloque de texto cruza el **40 % del viewport** (IntersectionObserver con `rootMargin`);
   - **estado de la figura por capítulo:**
     1. agentes sueltos, sin el orquestador o con él atenuado;
     2. aparece el orquestador;
     3. el recorrido avanza **paso a paso** (`recorrido` y `aristasResaltadas` acumulativos);
     4. barras de resultados;
   - **transiciones:** los nodos se mueven con `transform` en `--dur-layout`, el recorrido cambia de opacidad en `--dur-fast` y el gráfico entra con un fundido en `--dur`. Las aristas acompañan el movimiento de los nodos: actualiza sus coordenadas en el mismo fotograma, sin que «salten» después;
   - **barra global:** mientras un relato ocupa el viewport, la barra pasa a `data-estado="relato"` (oculta e `inert`) y manda la cabecera del relato. Al salir hacia 03, vuelve a `fija`; al volver a subir al hero, a `hero`. Reutiliza el mecanismo de `navegacion.ts` en un bloque pequeño y localizado.
4. **Móvil (< 768):**
   - la figura queda *sticky* bajo la cabecera, con un alto limitado (como máximo unos 45 svh, a definir con la referencia), y el texto avanza debajo;
   - los objetivos táctiles miden 44 px como mínimo y no hay scroll horizontal a 360.
5. **Reduced motion y sin JS:**
   - **reduced motion:** sin *pinning*. Cada paso muestra **su propia figura estática** en el estado que le toca, y los cambios son por corte;
   - **sin JS:** el relato es legible entero. El texto completo y una figura estática por capítulo, generados en el build con el mismo `DiagramaSVG`, o bien el modo Texto visible por defecto. Elige una opción y justifícala;
   - **el contenido es idéntico en todos los modos.**
6. **Enlaces «ver relato ↑» del índice:** cambia **solo el `href`** de `FilaIndice.astro` para que apunte a `#relato-<slug>`.
7. **Preparación para F5.1** (selección de nodos dentro del relato):
   - la figura expone un contenedor con `data-relato-figura` y el modelo serializado (`data-modelo` o un `<script type="application/json">`);
   - deja escrito en el informe dónde se conectará `activarDiagrama(raiz, { panel: 'opuesto' })`, que llega con F4.
8. **Tests:**
   - **unitarios:** el esquema y la validación cruzada de `relatos`, y el cálculo del estado acumulado de los pasos del capítulo 3;
   - **e2e**, en los tres tamaños y sin violaciones de axe en cada capítulo y en modo Texto:
     - el capítulo activo cambia al hacer scroll y el rail marca `aria-current`;
     - un clic en el rail lleva al capítulo;
     - la barra global queda oculta e `inert` dentro del relato y vuelve a `fija` en 03;
     - «Siguiente proyecto ↓» y «Saltar relatos ↓» llegan a su destino, y el último relato lleva a `#indice`;
     - en modo Texto, la figura es `inert` y ningún elemento de la figura es enfocable (bug 3);
     - el segmentado mide ≥ 44 px (bug 7);
     - la leyenda del capítulo 4 no se desborda a 920, 1180 y 1440 px (bug 2);
     - con reduced motion, no hay `position: sticky` en la figura y cada paso tiene su figura;
     - sin JS, el texto completo está presente;
     - a 360 px no hay scroll horizontal.
9. **Capturas** en `docs/encargos/capturas/F5/`:
   - cada capítulo del primer relato a 1280 y 390 px, junto a `scrollytelling-v1.html`;
   - el modo Texto;
   - la cabecera del relato con la barra global oculta;
   - el capítulo 4 a 920 px.

## No incluye
- Seleccionar nodos dentro del relato, la ficha en el lado opuesto, la pista «Selecciona un componente… Esc» (bug 5) y los nodos atenuados inertes al interactuar (bug 6). Van en **F5.1**, después de integrar F4. Aun así, los nodos atenuados ya deben tener `data-estado="atenuado"`.
- La transición desde el hero, en la que el capítulo 1 entra mientras la mano se desarma (F6). Deja el relato funcionando sin hero.
- Las interacciones de F4 (filtro, 5b, diagramas de los artículos).

## Coordinación con F4, que va en paralelo
Hay otro Codex trabajando en F4 en otra rama. Para que las dos ramas se fusionen sin conflictos:

- **No modifiques:** `src/components/DiagramaSVG.astro`, `src/components/articulo/*` ni los componentes de portada de F2, **salvo el `href` de «ver relato»** en `FilaIndice.astro`.
- **`src/lib/diagrama.ts`:** solo puedes **añadir** tipos o funciones al final, no cambiar los existentes. Si `DiagramaSVG` necesita algo que no tiene, **no lo cambies**: compón por fuera (un envoltorio) y explícalo en el informe.
- **`src/lib/navegacion.ts` y `BarraGlobal.astro`:** solo lo necesario para el estado `relato`, en bloques pequeños y localizados.
- **i18n:** claves nuevas **al final** de `es.json` y `en.json`, con el prefijo `relato.`.
- **Tokens:** los nuevos van **al final** de cada bloque de `tokens.css`, en ambas copias, bajo `/* F5 · relato */`.
- **e2e:** archivos nuevos (`tests/e2e/relato*.spec.ts`). Si un spec antiguo deja de valer porque la sección 02 ya no está vacía (por ejemplo la altura reservada o el estado de la barra), ajústalo y explícalo.

## Trampas conocidas
- **Los 7 bugs del prototipo** (`BUGS_CONOCIDOS.md`): 2, 3 y 7 son de esta fase; el 1 ya está resuelto en `DiagramaSVG`; el 4, el 5 y el 6 son de F5.1.
- **`position: sticky` deja de funcionar** si algún ancestro tiene `overflow` distinto de `visible`. Revisa la sección y la retícula.
- **IntersectionObserver con pasos cortos:** si dos pasos cruzan el 40 % en el mismo fotograma, gana el último en orden del documento. No dejes que el estado parpadee.
- **Las aristas y los nodos se mueven juntos:** si los nodos usan `transform` con transición y las líneas no, las aristas se ven despegadas durante 240 ms. Usa la misma transición, o actualiza las líneas con `requestAnimationFrame` durante la transición.
- **El estado `relato` de la barra no se puede quedar pegado:** al saltar con un ancla desde el relato a 03, o al recargar a mitad de un relato, la barra tiene que quedar en el estado correcto.
- **Ningún valor suelto en el CSS** (`npm run check`).

## Criterios de aceptación
- [ ] `npm ci && npm run check && npm test && npm run build && npm run e2e` termina sin errores ni advertencias.
- [ ] axe no encuentra violaciones en `/` con el relato en cada capítulo y en modo Texto, en los tres tamaños.
- [ ] Hay un e2e por cada bug de esta fase (2, 3 y 7) que demuestra que no ocurre.
- [ ] Verificado lo que el prototipo dejó sin verificar: reduced motion del sistema, «Siguiente proyecto», pantallas de 1180 px o más, y la navegación del relato solo con teclado.
- [ ] Sin JS y con reduced motion, el contenido del relato es idéntico y legible.
- [ ] `destacado` sin su JSON en `relatos/`, y un JSON en `relatos/` sin destacado, hacen fallar el build con un mensaje claro. Pega la salida en el informe y deshaz el cambio.
- [ ] Las capturas del punto 9 están en `capturas/F5/`.

## Si te bloqueas
Si una fuente se contradice, falta un dato o algo exige rediseñar, **no lo decidas tú**. Implementa lo que no dependa de eso y deja la pregunta en el informe.

## Informe de entrega
Añádelo al final de este archivo, en la sección «Informe»:
1. **Hecho:** la lista de entregables, con sus rutas.
2. **Verificación:** los comandos ejecutados con su resultado real, los e2e por proyecto y las capturas.
3. **Desviaciones:** qué difiere del encargo o de la referencia, y por qué. Incluye los tokens y las claves i18n nuevas.
4. **Preguntas abiertas.**
5. **No verificado:** lo que no pudiste comprobar.
6. **Para F5.1:** dónde y cómo se conecta la interacción de nodos.

---

## Informe
Codex no llegó a escribirlo: la sesión se cortó por capacidad del modelo. Lo que hizo se reconstruyó desde el diff y está resumido en la revisión.

## Revisión
**Claude, 2026-10-26.** Una entrega completa:
- la colección `relatos` con su validación cruzada y los tres JSON semilla, el primero con los textos exactos del prototipo y los otros dos con `‹…›`;
- `Relato.astro` + `FiguraRelato.astro` y el motor `relato.ts` (activación al 40 %);
- el rail C9, el segmentado Diagrama/Texto de 44 px y la barra global en estado `relato`;
- reduced motion sin *pinning* y contenido completo sin JS;
- «ver relato ↑» apunta a `#relato-<slug>`;
- e2e para los bugs 2, 3 y 7, y capturas de los 4 capítulos junto al prototipo.

Las barras del capítulo 4 están marcadas «Datos sintéticos · solo demostrativos».

### Integración con F4
- Conflictos en i18n (147 claves, con paridad), `diagrama.ts` (se conservan las funciones de vecinos de F4 y `EstadoFiguraRelato` de F5) y `navegacion.spec.ts`.
- Una prueba del relato esperaba foco al cargar con hash. Con la regla de F4 (alinear sin enfocar) ahora comprueba que el capítulo esté visible y sin foco.
- **Verificación sobre `main`:** `check` limpio, 104/104 tests, build sin advertencias y 153/153 e2e.

### Pendiente para F5.1
Conectar `activarDiagrama(raiz, { panel: 'opuesto' })` en la figura del relato (`data-relato-figura`): selección de nodos, la pista «Selecciona un componente… Esc» solo en modo Diagrama (bug 5) y los nodos atenuados inertes (bug 6). El bug 4 lo cubre ya el modo `'opuesto'`.

**Recomendación:** aprobada e integrada.
