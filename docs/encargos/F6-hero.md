# F6 · Hero: las dos manos, su entrada y la transición al relato

**Estado:** aprobada
**Rama:** solicitada `f6-hero` (no se pudo crear porque `.git` está fuera de las rutas escribibles; cambios en checkout `F6`, sin commits) · **Depende de:** F5 (en `main`) · **Escrito por:** Claude · **Fecha:** 2026-10-26

> Cómo lanzarlo en Codex: *«Lee AGENTS.md y docs/encargos/F6-hero.md. Implementa solo ese encargo y termina con el informe que pide.»*

> **Este encargo es largo a propósito.** Trae copiadas las fórmulas, las medidas y el orden de trabajo para que no tengas que deducir nada. Si algo de aquí contradice a `design/docs/HERO.md`, **manda este encargo**, porque se escribió leyendo el código fuente de la referencia. Si algo no está ni aquí ni en `HERO.md`, **no lo inventes**: déjalo en el informe como pregunta.

---

## 1. Qué hay que construir (en una frase)
La primera pantalla de la portada (`/`). Una mano humana pintada entra por la derecha, una mano artificial hecha de **26 ventanas de terminal** se arma desde el antebrazo hasta la punta del índice, y las dos puntas quedan a 56 px sin tocarse, como en *La creación de Adán*. Al bajar, la mano artificial **se desarma** en ventanas sueltas («agentes sin coordinación»), la mano humana se va y entra el anticipo del capítulo 1 del primer relato. Al subir, se rearma.

## 2. Cómo trabajar (orden obligatorio)
Hazlo **en este orden**. Al final de cada paso, ejecuta `npm run check && npm test` y **escribe una línea en el Informe** (regla 5 de `AGENTS.md`). Si la sesión se corta, el siguiente agente continúa desde ahí.

1. **Geometría pura** (§ 5): `src/lib/hero/geometria.ts`, con sus tests unitarios. Sin DOM.
2. **Composición** (§ 6): `src/lib/hero/composicion.ts`, que calcula las posiciones según el tamaño de pantalla. Con tests.
3. **Animación pura** (§ 7): `src/lib/hero/animacion.ts`, con las fórmulas de entrada y transición como funciones puras. Con tests.
4. **Marcado estático** (§ 8): `src/components/hero/Hero.astro`, que pinta la composición **final** (t = fin, p = 0) en HTML/CSS. Sin JS, ya se ve el hero completo.
5. **Entrada animada** (§ 9): solo CSS, con retardos calculados en el build.
6. **Fijación y transición** (§ 10): `src/lib/hero/transicion.ts`, un `<script>` que solo actualiza **una variable CSS `--p`** por fotograma.
7. **Reduced motion, sin JS y responsive** (§ 11 y § 12).
8. **Tests e2e y capturas** (§ 14 y § 15).

## 3. Leer antes
- `AGENTS.md`, **completo**, en especial § Reglas, § Forma de trabajar (puntos 5–7) y § Movimiento.
- `design/docs/HERO.md`, completo.
- `design/fuente/hero-arte.dc.html`, **completo** (son 180 líneas). Es el código fuente de la referencia:
  - `CFG`: la configuración por tamaño de pantalla;
  - `base()`: la geometría de la mano;
  - `content()`: los textos de las ventanas;
  - `stars()`: las estrellas;
  - `renderVals()`: **todas** las fórmulas de la animación.

  **No es código para copiar tal cual** (usa un framework propio, `DCLogic`), pero sus números y fórmulas son la verdad: pórtalos a TypeScript.
- `design/referencias/hero-final.html`: sírvelo con `python3 -m http.server 8765` desde `design/referencias/` y ábrelo en `http://127.0.0.1:8765/hero-final.html`. Tiene seis secciones: 1 · Escritorio, 2 · Entrada, 3 · Transición, 4 · Responsive, 5 · Capas y 6 · Provisional. Es la **referencia visual** con la que compararás.
- `design/docs/PENDIENTES.md`: las filas «Mano humana del hero» y «Texto de las terminales».
- Código que ya existe y que **tienes que usar**:
  - `src/pages/index.astro`: la sección con `data-hero` contiene un `<h1 class="visualmente-oculto">` y un `<div data-reservado="F6">`. **Ahí va el hero.**
  - `src/lib/navegacion.ts`: la barra global está en el estado `hero` mientras `[data-hero].getBoundingClientRect().bottom > 0`. No hace falta cambiarlo: si la sección `[data-hero]` crece con la fijación (§ 10), la barra sigue en `hero` durante toda la transición. **Compruébalo.**
  - `src/components/BarraGlobal.astro`: es la navegación del hero (la capa L5). **No dibujes otra navegación dentro del hero.**
  - `src/assets/mano-adan-v2.provisional.png`: la mano humana provisional, de 540 × 320. Sírvela con `astro:assets` (`<Image>` o `getImage`) en WebP/AVIF, como hace Contacto (`src/components/portada/Contacto.astro`).
  - `src/content/perfil/es.json` y `src/content/esquemas.ts` (`perfilSchema`).
  - `src/content/relatos/es/*.json` y `seleccionarDestacados()` (`src/content/validacion.ts`), para el anticipo del capítulo 1 (§ 10.4).
  - `src/components/Estrellas.astro`: las estrellas de Contacto. **No lo modifiques.** El hero tiene sus propias estrellas (§ 8.3).

## 4. Archivos que vas a crear o tocar

| Archivo | Acción |
|---|---|
| `src/lib/hero/geometria.ts` | **Crear.** Pura: `azar(semilla)`, `ventanasBase()` y `estrellasBase(n, W, H)` |
| `src/lib/hero/composicion.ts` | **Crear.** Pura: `configuracion(ancho, alto)` y `composicion(ancho, alto)` |
| `src/lib/hero/animacion.ts` | **Crear.** Pura: `entrada(t, ventana)`, `transicion(p, ventana)` y las curvas |
| `src/lib/hero/transicion.ts` | **Crear.** Cliente: fijación, cálculo de `p` y escritura de `--p` |
| `src/components/hero/Hero.astro` | **Crear.** El marcado y el CSS del hero |
| `src/components/hero/VentanaTerminal.astro` | **Crear** (opcional). Una ventana |
| `src/content/hero/es.json` + colección `hero` en `src/content.config.ts` | **Crear.** Los textos de las ventanas (§ 8.5) |
| `src/content/esquemas.ts` | **Añadir** `heroSchema` y, en `perfilSchema`, los campos `nombre_corto` y `rol_hero` |
| `src/content/perfil/es.json` | **Añadir** `nombre_corto` y `rol_hero`, y rellenar `frase_hero` (§ 8.4) |
| `src/pages/index.astro` | **Cambiar** solo la rama `seccion.id === 'hero'`: el h1 oculto y el `data-reservado="F6"` pasan a ser `<Hero …/>` |
| `src/styles/tokens.css` **y** `design/docs/tokens.css` | **Añadir** los tokens nuevos al final, bajo `/* F6 · hero */` |
| `src/i18n/es.json` y `en.json` | **Añadir** las claves `hero.*` al final |
| `tests/hero.test.ts`, `tests/e2e/hero.spec.ts` y `scripts/capturar-hero.mjs` | **Crear** |

**No toques** `navegacion.ts`, `BarraGlobal.astro`, `Relato.astro`, `relato.ts`, `Estrellas.astro` ni los componentes de las demás secciones. Si crees que es imprescindible, explícalo en el informe **antes** de hacerlo.

## 5. Geometría (`geometria.ts`), portada desde `base()`
**Generador aleatorio con semilla fija** (idéntico al de la referencia):
```ts
export function azar(semilla: number) {
  let s = semilla;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}
```

**Segmentos de la mano.** El espacio es de 1000 × 460 y la punta del índice está en (812, 197). La semilla de `ventanasBase()` es **97**, y el orden de llamadas a `R()` debe ser **exactamente** el de `base()`; si no, cambian todas las variaciones.

```ts
const C = {
  radius: [[[-90, 206], [392, 230]], [62]],
  ulna:   [[[-90, 302], [392, 278]], [52]],
  thumbM: [[[470, 204], [548, 160]], [30]],
  thumb:  [[[556, 154], [606, 132], [650, 121]], [28, 22]],
  m2: [[[482, 216], [612, 202]], [38]], m3: [[[484, 243], [617, 238]], [33]],
  m4: [[[484, 269], [607, 274]], [30]], m5: [[[482, 294], [587, 307]], [26]],
  i:  [[[622, 201], [704, 195], [764, 193], [812, 197]], [30, 25, 21]],
  mi: [[[626, 238], [702, 244], [750, 262], [772, 290]], [28, 23, 19]],
  r:  [[[616, 275], [700, 298], [732, 340]], [26, 20]],
  p:  [[[596, 308], [660, 336], [680, 372]], [22, 17]],
};
```

Cada par de puntos consecutivos `(x0, y0) → (x1, y1)` de una parte genera **una ventana**:
- `cx = (x0+x1)/2`, `cy = (y0+y1)/2`;
- `largo = hypot(x1-x0, y1-y0)` y `angulo = atan2(y1-y0, x1-x0)` en grados;
- `w = (largo - 9) * (1 + (R() - 0.5) * 0.1)`;
- `h = grosor[j] * (1 + (R() - 0.5) * 0.12)`;
- `a = angulo + (R() - 0.5) * 2.4`;
- `parte = k`, `punta = (k === 'i' && j === puntos.length - 2)` y `brazo = (k === 'radius' || k === 'ulna')`.

**Carpo**: 7 ventanas pequeñas, en este orden y **después** de los segmentos:
`[[420,222,22,24],[424,250,22,24],[426,278,22,24],[450,212,20,22],[452,240,20,22],[454,266,20,22],[452,292,20,22]]`, cada una con `w = w0 * (1 + (R()-0.5)*0.15)`, `h = h0`, `a = (R()-0.5)*6` y `parte = 'carp'`.

**Total: 19 segmentos + 7 del carpo = 26 ventanas.** `HERO.md` dice «unas 31»; la fuente da 26, y **manda la fuente**. Un test debe comprobar que son 26.

**Textos de cada ventana** (§ 8.5): las ventanas que no son brazo ni punta se ordenan por área (`w*h`) de mayor a menor, y reciben en ese orden las entradas de la lista de textos. Si hay más ventanas que textos, reciben el último. El radio, el cúbito y la punta tienen textos propios. Sin texto en el carpo, si así sale del orden.

**Deriva** (para la transición). Después de asignar los textos, para cada ventana y en el mismo orden:
- `dx0 = cx - 520`, `dy0 = cy - 255`, `n = hypot(dx0, dy0) || 1` y `m = 26 + R() * 60`;
- `dx = dx0/n*m + (R()-0.5)*24`, `dy = dy0/n*m + (R()-0.5)*24` y `dr = (R()-0.5)*16`;
- `ord = clamp((cx + 90) / 902, 0, 1)`: la posición de 0 (antebrazo) a 1 (punta), que ordena la entrada.

**Estrellas** (`estrellasBase`), portadas desde `stars()`, con la semilla **61**: para i en 0..n−1:
- `g = R() < 0.06` (oro) y `z = g ? 2.2 : 1 + R()`;
- `x = R() * W` e `y = R() * H`;
- color: oro si `g`; si no, marfil o gris según `R() < 0.5`;
- `opacidad = 0.15 + R() * 0.3`.

`n`, `W` y `H` vienen de la configuración (§ 6). **Ninguna estrella dentro del círculo de radio `2 × hueco` alrededor de M**: si cae dentro, descártala sin generar otra, para no alterar la secuencia del generador.

## 6. Composición (`composicion.ts`)
**Configuración por tamaño de pantalla.** Copiada de `CFG` y de `HERO.md` § Responsive:

| Clave | Se usa cuando | Lienzo W × H | M (x, y) | Escala `s` | Hueco | Giro | Estrellas | Texto |
|---|---|---|---|---|---|---|---|---|
| `d` | ancho ≥ 1200 | 1280 × 800 | 0,53 · 0,43 | 1,2 | 56 | −4° | 60 | dos esquinas (§ 8.4) |
| `t` | 768 ≤ ancho < 1200 | 834 × 1112 | 0,54 · 0,40 | 0,8 | 40 | −5° | 50 | apilado, nombre 88 |
| `m` | ancho < 768 | 390 × 844 | 0,55 · 0,37 | 0,44 | 24 | −6° | 32 | apilado, nombre 56 |
| `h` | alto < 560 (horizontal) | como `t` | 0,52 · 0,46 | 0,8 | 40 | −5° | 50 | nombre 48 |

La regla `h` tiene prioridad sobre las demás.

**El lienzo real es la pantalla** (`100vw × 100svh`), no el lienzo W × H de la tabla. **La composición se escala desde M, nunca desde una esquina:**
- **M en píxeles:** `Mx = mx × anchoPantalla` y `My = my × altoPantalla`.
- **Mano artificial:** un contenedor absoluto de 1000 × 460 px con `left = Mx − hueco/2 − 812`, `top = My − 197`, `transform: rotate(giro) scale(s)` y `transform-origin: 812px 197px`. Así la punta del índice cae en `(Mx − hueco/2, My)`.
- **Mano humana:** con `k = 1.45 × s / 1.15` (= 1,26 × s), una imagen de `540k × 320k` con `left = Mx + hueco/2 − 14k` y `top = My + 6s − 170k`. Su punta cae en `(Mx + hueco/2, ~My)`. **No se gira.**
- **Estrellas:** se generan sobre el lienzo W × H de la tabla y se escalan al tamaño real con `left = x / W × 100 %` y `top = y / H × 100 %`. Tamaño en px, no escalado. Con eso, en pantallas de otra proporción no se deforman.

**Mínimos** (`HERO.md` § Responsive), comprobados con tests:
- hueco ≥ 20 px;
- la punta (la ventana `punta`) mide ≥ 8 px de alto en pantalla (`h × s ≥ 8`);
- el círculo de centro M y radio `2 × hueco` queda **dentro** de la pantalla y **no se cruza** con el bloque de texto (§ 8.4).

  Si a algún tamaño no se cumple, no muevas M a ojo: documenta en el informe a qué tamaño falla y con cuántos píxeles.

`composicion(ancho, alto)` devuelve todo lo anterior en px. Los tests la llaman, por lo menos, con:
- 1280 × 800, 1440 × 900 y 1920 × 1080;
- 1024 × 768, 834 × 1112 y 768 × 1024;
- 390 × 844 y 360 × 640;
- 844 × 390 (móvil en horizontal).

## 7. Animación (`animacion.ts`), portada desde `renderVals()`
**Curvas:** `clamp(x) = max(0, min(1, x))` y `ease(x) = 1 − (1 − clamp(x))³`, la cúbica de salida, igual que `--ease-out`.

**Variables:**
- `t` son los segundos desde la carga (entrada). La animación de entrada termina hacia t = 2,5; «t final» es cualquier valor ≥ 2,6.
- `p` es el avance de la transición, de 0 a 1 (§ 10).

**Por ventana** (con `ord`, `dx`, `dy`, `dr` y `a` de § 5):
- `e = ease((t − (0.6 + ord × 0.9)) / 0.35)` → cada ventana entra en **0,35 s**, escalonada desde 0,6 s (antebrazo) hasta 1,5 s (punta);
- `opacidad = (0.38 + 0.62 × ord^1.3) × e × (1 − p × 0.92)` → la luz crece del 38 % al 100 % hacia la punta y baja al 8 % al desarmarse;
- `transform = translate(dx × p, dy × p + (1 − e) × 6) rotate(a + dr × p)`, en px y grados.

**Por capa:**

| Capa | Opacidad | Transform |
|---|---|---|
| L1 · estrellas | `clamp(t / 0.6)` | `translateY(−40 × p px)` |
| L2 · mano humana | `ease((t − 0.2) / 0.9) × (1 − p)` | `translateX(((1 − eh) × 28 + p × 110) px)` con `eh = ease((t − 0.2)/0.9)` |
| L4 · cursor ▍ | visible si `t ≥ 1.7`, salvo `1.9 < t < 2.1` y `2.3 < t < 2.5` (dos parpadeos), y solo si `p < 0.5` | — |
| L6 · texto | `eT × (1 − clamp(p × 2))` con `eT = ease((t − 1.8) / 0.5)` | `translateY(((1 − eT) × 8 − p × 30) px)` |
| anticipo del capítulo 1 | `eN = ease((p − 0.5) × 2)` | `translateY(((1 − eN) × 40) px)` |

**Móvil (`m`):** la deriva se reduce a la mitad (`dx` y `dy` × 0,5, `HERO.md` § Transición).

Estas funciones son **puras** y tienen tests con valores concretos. Por ejemplo:
- ventana con `ord = 1`, `t` final y `p = 0` → opacidad 1;
- con `p = 1` → opacidad 0,08;
- cursor con `t = 2.0` → oculto; con `t = 2.2` → visible.

## 8. Marcado estático (`Hero.astro`)
### 8.1 Estructura
```
<div class="hero" data-hero-raiz style="--p: 0">          ← crece con la fijación (§ 10)
  <div class="hero-escena">                                ← sticky, 100svh
    <div class="arte" data-hero-arte aria-hidden="true">
      <div class="estrellas"> … </div>                     ← L1
      <img class="mano-humana" …>                          ← L2 (astro:assets, alt="")
      <div class="mano-artificial"> 26 × .ventana </div>   ← L3 + L4
    </div>
    <p class="visualmente-oculto">{t('hero.descripcion')}</p>
    <div class="texto"> rol · h1 · frase · «Ver proyectos ↓» </div>  ← L6
    <div class="anticipo" aria-hidden="true"> … </div>     ← § 10.4
  </div>
</div>
```
- **La capa de arte es decorativa:** `aria-hidden="true"` y `pointer-events: none`.
- `hero.descripcion`: «Una mano humana pintada y una mano hecha de ventanas de terminal se acercan sin llegar a tocarse.»

### 8.2 Ventana de terminal (L3/L4), portada desde `renderVals()`
Cada ventana es un `div` absoluto, colocado en el espacio de 1000 × 460 de la mano artificial:
- **Caja:** `left = cx − w/2`, `top = cy − h/2`, `width = w` y `height = h`. Fondo `--surface-2`, `border-radius = min(6, h × 0.18)` px y `overflow: hidden`.
- **Fuente:** Geist Mono (`--font-mono`), con `cap = 1.15 / s`:
  - `fs = max(4.5, min(8.5 × cap, h × 0.24))` px e interlineado 1,3;
  - número de líneas: `nl = max(0, floor((h − hh − 4) / (fs × 1.3)))`;
  - **si `fs × s < 3.6`, `nl = 0`**: en móvil las ventanas pierden el texto y conservan cabecera y punto.
- **Cabecera:**
  - alto `hh = max(4, min(12 × cap, h × 0.3))`;
  - fondo marfil al 9 % (`rgba(232,220,196,.09)`, que va a un **token**), o al 14 % en la punta;
  - un punto de `hh × 0.32` en `--muted` (en la punta, `--accent`) y el nombre (el primer texto) solo si `hh × s ≥ 3.5`;
  - color `--muted`, o `--text` en la punta.
- **Cuerpo:** las líneas 2 … 1 + nl del texto, en `--text` (en la punta, `--heading`), con `padding: fs×0.25 fs×0.5`.
- **Antebrazo** (`brazo`): el contenido se alinea a la derecha y la ventana lleva `mask-image: linear-gradient(90deg, transparent 0%, #000 55%)`, para que los registros largos se fundan hacia el codo.
- **Punta:** el fondo lleva además un 7 % de marfil (`linear-gradient` con un token), el punto de oro, y al final del cuerpo el cursor `▍` en `--accent`.
- **Variables CSS por ventana** para animar sin JS por ventana: `--dx`, `--dy`, `--dr`, `--a`, `--luz` (= `0.38 + 0.62 × ord^1.3`) y `--retardo` (= `0.6 + ord × 0.9` s).
  ```css
  .ventana {
    opacity: calc(var(--luz) * (1 - var(--p) * 0.92));
    transform: translate(calc(var(--dx) * var(--p) * var(--deriva) * 1px),
                         calc(var(--dy) * var(--p) * var(--deriva) * 1px))
               rotate(calc((var(--a) + var(--dr) * var(--p)) * 1deg));
  }
  ```
  (`--deriva` vale 1, o 0,5 en móvil). Así la transición solo cambia `--p` en la raíz.

### 8.3 Estrellas (L1)
Sale de `estrellasBase()` con la configuración del tamaño de pantalla. Como el tamaño se conoce en el cliente pero el HTML se genera en el build, **genera en el build los tres conjuntos** (`d`, `t` y `m`) y muestra uno u otro con media queries. Son 60 + 50 + 32 puntos, que pesan poco. Cada estrella es un `<i>` absoluto, redondo, con su color (token: `--text`, `--muted` o `--accent`) y su opacidad. En la transición, el conjunto de estrellas **sube 40 px** con `p` (`translateY(calc(var(--p) * -40px))`).

### 8.4 Texto (L6)
Los textos salen de `perfil` (§ 8.6) y de i18n:
- **`d` (≥ 1200):**
  - abajo a la izquierda, con `left: 64px` y `bottom: 56px`, una columna con 8 px de separación: el rol a 15 px en `--muted` y el **`<h1>` con el nombre corto («Jorge»)** a 96/600, interlineado 1 y tracking −0,025 em, en `--heading`;
  - abajo a la derecha, con `right: 64px`, `bottom: 64px` y `max-width: 300px`, una columna con 14 px de separación: la frase a 17/1,5 en `--text` y el enlace «Ver proyectos ↓» a 15 px en `--accent`, a `#proyectos`.
- **`t`:** un bloque apilado abajo, con `left/right: 40px`, `bottom: 56px` y 12 px de separación: el rol a 15, el nombre a 88, la frase a 18 (`max-width: 440px`) y el enlace con un alto mínimo de 44 px.
- **`m`:** un bloque apilado, con `left/right: 20px`, `bottom: 28px` y 10 px de separación: el rol a 13, el nombre a 56, la frase a 16 y el enlace de 44 px.
- **`h`:** como `t`, con el nombre a 48.
- **El h1** es el nombre corto **visible**. Quita el h1 visualmente oculto actual: solo puede haber un h1. El nombre completo («Jorge Quenta») va en el `<title>`, como ya está.
- **El enlace «Ver proyectos ↓»** usa el patrón de anclas de F1 (`navegacion.ts` ya intercepta `a[href^="#"]`): compruébalo.

### 8.5 Textos de las ventanas (`src/content/hero/es.json`)
Copia **literalmente** los textos de `content()` y los específicos de `base()`:
- radio: `['traza · run 4f2a', '12:04:31 planner.start …']`;
- cúbito: `['memoria · episodios', …]`;
- punta: `['coder', 'edit agent.py']`.

**El JSON lleva `"borrador": true` y `"ilustrativo": true`.** Esos textos y números (por ejemplo `acc 0.874`) **son ilustrativos de Claude Design, no métricas reales**: `PENDIENTES.md` los lista como bloqueantes para publicar. `npm run contenido:pendientes` debe contarlos. **No añadas ni cambies ningún texto.**

Esquema (`heroSchema`):
```ts
{ ventanas: string[][], radio: string[], cubito: string[], punta: string[], borrador: boolean, ilustrativo: boolean }
```

### 8.6 Perfil
Añade a `perfilSchema` y a `perfil/es.json` estos campos, copiados de `hero-arte.dc.html`; el perfil sigue con `borrador: true`:
- `nombre_corto`: `"Jorge"`;
- `rol_hero`: `"AI Engineer · data scientist · investigador"`;
- `frase_hero`: `"Construyo sistemas de IA y explico cómo funcionan."` (hoy es `‹…›`).

## 9. Entrada animada (solo CSS)
La entrada se hace con **animaciones CSS** que se ejecutan una vez al cargar, sin JS por fotograma:

| Capa | Animación |
|---|---|
| Estrellas | opacidad de 0 a 1 en 0,6 s |
| Mano humana | de opacidad 0 y `translateX(28px)` a opacidad 1 y `translateX(0)`, en 0,9 s con 0,2 s de retardo |
| Cada ventana | de opacidad 0 y `translateY(6px)` a su estado final, en `var(--dur-hero, 350ms)` con `animation-delay: var(--retardo)` |
| Cursor | `@keyframes` que reproduce: invisible hasta 1,7 s, visible, invisible de 1,9 a 2,1, visible, invisible de 2,3 a 2,5 y visible fijo |
| Texto (L6) | de opacidad 0 y `translateY(8px)` a opacidad 1 y 0, en 0,5 s con 1,8 s de retardo |

- Todas con `animation-fill-mode: both` y la curva `--ease-out`. **Crea los tokens** `--dur-hero: 350ms` y los de los retardos y duraciones de la tabla, para que ninguna duración quede suelta en el CSS.
- **La entrada no debe pelear con la transición.** La animación de entrada controla una propiedad propia (por ejemplo, la opacidad de un envoltorio interno `.ventana-entrada`), y la transición controla la del elemento `.ventana`. Así no hay conflicto entre `animation` y la variable `--p`.
- **La entrada solo se ejecuta una vez por carga.** Al volver atrás desde un artículo (bfcache), no se repite.

## 10. Fijación y transición (`transicion.ts`)
1. **Fijación.**
   - `.hero` mide `100svh + 60vh` (con `--hero-fijacion: 60vh`, y 40 vh en `m`) **solo si hay JS y no hay reduced motion**. Usa una clase `hero--animado` que añade el script.
   - `.hero-escena` es `position: sticky; top: 0; height: 100svh`.
   - Sin la clase, `.hero` mide 100 svh y no hay *sticky*.
2. **Cálculo de `p`.** `p = clamp((scrollY − inicioHero) / alturaFijacion, 0, 1)`, donde `inicioHero` es el `offsetTop` de `.hero` y `alturaFijacion` es el valor en px de `--hero-fijacion`. Se calcula en un listener de `scroll` pasivo, **agrupado con `requestAnimationFrame`** (como mucho una escritura por fotograma), y escribe `raiz.style.setProperty('--p', p)`. Recalcula en `resize`.
3. **El cursor desaparece cuando `p ≥ 0.5`:** pon el atributo `data-fase="anticipo"` en la raíz, y el CSS oculta el cursor.
4. **El anticipo del capítulo 1** (`.anticipo`) es lo que entra entre p = 0,5 y 1 (`HERO.md` § Transición).
   - Contenido, sacado de los datos y nunca escrito a mano:
     - tipo · «Proyecto 1 de 3» (`EtiquetaTipo` + i18n);
     - el título del primer destacado (`seleccionarDestacados()[0]`);
     - el título del capítulo 1 de su relato (`relatos/<slug>.json`).
   - Posición: `left: 64px` y `bottom: 72px`, `max-width: 560px`, con el título a 40/600. En `m`, `left: 20px` y el título a 28.
   - `aria-hidden="true"`: es una anticipación visual de contenido que el relato repite justo debajo.
5. **Al subir, la mano se rearma por el mismo camino.** Sale solo, porque todo depende de `--p`.
6. **Rendimiento:**
   - solo `transform` y `opacity`;
   - `will-change: transform, opacity` en `.mano-artificial`, `.mano-humana` y `.estrellas`, **solo** mientras `0 < p < 1` (añádelo y quítalo con una clase);
   - nada de leer el layout dentro del bucle, salvo `scrollY`;
   - `inicioHero` y `alturaFijacion` se cachean y se recalculan en `resize`.

## 11. Reduced motion y sin JS
- **Reduced motion** (sistema **o** `data-movimiento="reducido"` de la hoja «Aa» de F3):
  - sin entrada (estado final inmediato), sin parpadeo (cursor fijo visible) y **sin fijación** (`.hero` de 100 svh, sin *sticky* y sin la clase `hero--animado`);
  - `--p` se queda en 0, y el anticipo no se muestra;
  - el hero hace scroll como un bloque normal.
- **Sin JS:** se ve la composición final completa (lo que genera el build), sin fijación y sin anticipo. El enlace «Ver proyectos ↓» funciona como ancla normal.
- **El contenido** (h1, rol, frase y enlace) es idéntico en todos los modos.

## 12. Responsive y orientación
Aplica la configuración de § 6 con media queries **y** con el cálculo del cliente, que deben coincidir. Si compones con CSS (`calc` con `vw`/`svh`), el resultado en px debe ser el mismo que el de `composicion()`; los tests e2e lo comparan con una tolerancia de 1 px.

## 13. Tokens e i18n nuevos
- **Tokens**, bajo `/* F6 · hero */`, en **las dos** copias de `tokens.css`:
  - duraciones y retardos de § 9;
  - `--hero-fijacion` y `--hero-fijacion-movil`;
  - los marfiles de la cabecera (9 %, 14 %) y de la punta (7 %);
  - el filtro de la mano humana (`sepia(.18) saturate(.85) brightness(.96)`);
  - el tamaño del nombre por configuración;
  - y cualquier medida nueva.

  En Dawn no hace falta valor distinto, porque la portada siempre es Cosmos, pero **las dos copias tienen que coincidir** (el test de igualdad de F0 lo comprueba).
- **i18n** (`hero.*`, al final de `es.json` y `en.json`): `hero.descripcion`, `hero.verProyectos` («Ver proyectos ↓») y `hero.proyectoNdeM` («Proyecto {n} de {total}»).

## 14. Tests
**Unitarios** (`tests/hero.test.ts`):
- `ventanasBase()` devuelve 26 ventanas y es **determinista**: dos llamadas dan lo mismo;
- la ventana `punta` es la última del índice, tiene `cx = (764+812)/2 = 788` y `cy = (193+197)/2 = 195`, y su texto es `['coder', 'edit agent.py']`;
- el radio y el cúbito tienen sus textos propios;
- `ord` está entre 0 y 1;
- `composicion()` en los 9 tamaños de § 6:
  - la punta de la mano artificial queda en `(Mx − hueco/2, My)` con una tolerancia de 1 px, aplicando la rotación y la escala desde el origen 812/197;
  - se cumplen el hueco ≥ 20 y la punta ≥ 8 px;
- `animacion`: los valores concretos de § 7;
- `estrellasBase()`: ninguna dentro del círculo de M.

**e2e** (`tests/e2e/hero.spec.ts`), en los tres proyectos de Playwright, **más** 844 × 390 y 1440 × 900:
- axe sin violaciones en `/` con el hero visible.
  - Si axe marca el contraste del texto diminuto de las ventanas, ese texto es **decorativo** (WCAG 1.4.3 exime el texto que forma parte de una imagen). Excluye **solo** `[data-hero-arte]` y **solo** de la regla `color-contrast`, con un comentario que lo justifique. No desactives nada más.
- Existe exactamente **un** `h1`, visible, con el texto `nombre_corto`.
- Tras esperar el final de la entrada (o con reduced motion), las 26 ventanas están en el DOM, y la punta muestra el cursor.
- **Transición:** bajar `0,5 × alturaFijacion` deja `--p` ≈ 0,5 (±0,05) y la opacidad del texto ≈ 0; bajar `alturaFijacion` completa la deja en 1 y el anticipo con opacidad ≈ 1; volver a 0 restaura `--p = 0` y el texto visible. **Usa `page.evaluate(() => window.scrollTo(…))`** y espera con `expect.poll`, nunca con `waitForTimeout` fijos.
- La barra global sigue en `data-estado="hero"` durante toda la fijación y pasa a `relato` al entrar en el primer relato.
- **Reduced motion:** `.hero` mide la altura de la pantalla (±1 px), `.hero-escena` no es *sticky*, no hay animaciones activas (`document.getAnimations()` vacío en el hero) y el texto es visible desde el principio.
- **Sin JS** (`javaScriptEnabled: false`): el h1, la frase y las 26 ventanas están presentes; no hay fijación.
- **Mínimos en el navegador:** se miden con `getBoundingClientRect()` el hueco entre la punta artificial y la humana (≥ 20 px) y el alto de la punta (≥ 8 px). El círculo de M no se cruza con el rectángulo del bloque de texto.
- A 360 px y a 844 × 390, sin scroll horizontal.
- **CLS:** con un `PerformanceObserver` de `layout-shift` registrado **antes** de cargar (`addInitScript`), el total tras la entrada es **< 0,01**.
- Aplica la regla 6 de `AGENTS.md`: tolerancias en px y ninguna dependencia de que el navegador «decida» algo. Antes de entregar, ejecuta `npm run e2e -- -g "hero" --repeat-each=5`.

## 15. Capturas (`docs/encargos/capturas/F6/`)
Usa `scripts/capturar-hero.mjs`, siguiendo el estilo de `capturar-f2.mjs` y `capturar-relato.mjs`.

**Para congelar la entrada en un instante**, pausa las animaciones y fija su tiempo:
`document.getAnimations().forEach(a => { a.pause(); a.currentTime = ms; })`.

**Para la transición**, haz scroll a `p × alturaFijacion`.
- La composición final a 1280 × 800, 834 × 1112, 390 × 844 y 844 × 390, cada una junto a la sección equivalente de `hero-final.html` (§ 1 y § 4).
- La entrada en t = 0,3 · 1,0 · 1,8 · 2,6 s, a 1280 × 800, junto a `hero-final.html` § 2.
- La transición en p = 0,25 · 0,5 · 0,75 · 1, a 1280 × 800, junto a `hero-final.html` § 3.
- La composición con reduced motion a 390 × 844.
- `comparacion.html`, que las muestra lado a lado, como en F2 y F3.

## 16. No incluye
- Sustituir la mano provisional ni los textos ilustrativos de las ventanas: es contenido de Jorge (F8).
- Logotipos en las cabeceras (`HERO.md` los deja como posibilidad futura).
- La selección de nodos del relato (F5.1).
- Cambiar el relato, la barra o la navegación.
- El selector de idioma (F7).

## 17. Trampas conocidas
1. **El orden de las llamadas a `R()` es sagrado.** Si cambias el orden (por ejemplo, calculas la deriva antes de asignar los textos), toda la mano sale distinta. Sigue el orden de `base()` línea a línea.
2. **El orden del transform importa.** `rotate(giro) scale(s)` con `transform-origin: 812px 197px` sobre un contenedor de 1000 × 460: si lo inviertes o cambias el origen, la punta se aleja de M.
3. **`animation` y la transición sobre la misma propiedad se pisan.** Separa la entrada (envoltorio interno) de la transición (elemento externo), como dice § 9.
4. **`position: sticky` deja de funcionar** si un ancestro tiene `overflow` distinto de `visible`. La sección de `index.astro` tiene `.interior` con `padding`: el hero debe ocupar todo el ancho de la pantalla, así que sácalo del `.interior` o anula su padding **solo** en esa sección, sin tocar las demás.
5. **`100vh` frente a `100svh`:** usa `svh` para el alto de la escena (las barras del navegador móvil). La fijación se mide en `vh`, según el diseño.
6. **Imagen de la mano:** `loading="eager"`, `decoding="async"` y `width`/`height` explícitos, para que no haya CLS. **No** le pongas `fetchpriority="high"`: el LCP debería ser el h1.
7. **No leas el layout en el bucle de scroll** (`getBoundingClientRect` por fotograma en 26 ventanas = jank). Solo `scrollY` y valores cacheados.
8. **Los textos de las ventanas son ilustrativos.** No los presentes como datos reales en ningún otro sitio.
9. **Ningún valor suelto en el CSS** (`npm run check` lo comprueba): los colores, las duraciones, los retardos, los filtros y las opacidades fijas van como tokens. Los valores calculados por ventana van como variables CSS en línea (`style="--dx: …"`), que es lo correcto; no son literales de diseño. Si `verificar-tokens` los marca, explica el caso en el informe en lugar de desactivar la comprobación.
10. **Puertos:** usa el `PORTAFOLIO_E2E_PORT` del prompt y **cierra al terminar** todos los servidores que abras, incluido el de las referencias.

## 18. Criterios de aceptación
- [ ] `npm ci && npm run check && npm test && npm run build && npm run e2e` termina sin errores ni advertencias.
- [ ] Los tests unitarios de § 14 pasan: 26 ventanas deterministas, la punta en M − hueco/2 en los 9 tamaños y las fórmulas con valores concretos.
- [ ] Los e2e de § 14 pasan, también con `--repeat-each=5`.
- [ ] axe no encuentra violaciones (con la única exclusión justificada de § 14, si hace falta).
- [ ] Con reduced motion y sin JS, el hero se ve completo y estático, sin fijación, con el mismo contenido.
- [ ] CLS < 0,01 en la carga, y durante el scroll de la transición solo cambian `transform`/`opacity` (lo comprueban los tests o una traza descrita en el informe).
- [ ] Las capturas de § 15 están en `capturas/F6/` con su `comparacion.html`, y el informe lista las diferencias visibles con `hero-final.html`.
- [ ] `npm run contenido:pendientes` cuenta los textos ilustrativos de `hero/es.json` y los campos nuevos del perfil.
- [ ] No quedan servidores abiertos al terminar.

## 19. Si te bloqueas
Si una fuente se contradice, falta un dato o algo exige rediseñar, **no lo decidas tú**. Implementa lo que no dependa de eso y deja la pregunta en el informe. Si se te acaba el tiempo, prioriza en este orden: geometría y composición correctas → composición estática final → reduced motion y sin JS → entrada → transición → capturas.

## Informe de entrega
Ve rellenándolo **durante** el trabajo (una línea por paso de § 2) y complétalo al final:
1. **Hecho:** la lista de entregables, con sus rutas.
2. **Verificación:** los comandos ejecutados con su resultado real, los e2e por proyecto (incluido `--repeat-each=5`) y las capturas.
3. **Desviaciones:** qué difiere del encargo o de `hero-final.html`, y por qué. Incluye los tokens y las claves i18n nuevas.
4. **Preguntas abiertas.**
5. **No verificado:** lo que no pudiste comprobar.

---

## Informe
- Paso 1 — Implementé `azar`, `ventanasBase` y `estrellasBase` en `src/lib/hero/geometria.ts`, con 26 ventanas deterministas y textos de fuente; `npm run check` pasó (0 errores, advertencias ni hints) y `npm test` pasó (107 pruebas). No se modificó el orden de consumo de la semilla.
- Paso 2 — Implementé `configuracion` y `composicion` en `src/lib/hero/composicion.ts`, incluyendo M, ambas manos, lienzo de estrellas y fijación por viewport; `npm run check` pasó (0 errores, advertencias ni hints) y `npm test` pasó (116 pruebas, incluidos los 9 tamaños solicitados).
- Paso 3 — Implementé `clamp`, `ease`, `entrada`, `transicion`, `cursorVisible` y las fórmulas por capa en `src/lib/hero/animacion.ts`; `npm run check` pasó (0 errores, advertencias ni hints) y `npm test` pasó (117 pruebas, con valores concretos de entrada, transición, móvil y cursor).
- Paso 4 — Añadí la colección y el esquema del hero, los datos ilustrativos, campos de perfil, claves i18n, tokens iguales en las dos hojas e integré el marcado estático en `Hero.astro` y `index.astro`; `npm run check` pasó (0 errores, advertencias ni hints) y `npm test` pasó (117 pruebas). La composición está en HTML inicial y usa la mano vía `astro:assets`.
- Paso 5 — Añadí la entrada CSS de estrellas, mano, ventanas, texto y cursor, con envoltorios separados de las propiedades de transición y respeto a las preferencias de movimiento reducido; `npm run check` pasó (0 errores, advertencias ni hints) y `npm test` pasó (117 pruebas). La clase que activa la entrada se añadirá en el paso 6.
- Paso 6 — Añadí `src/lib/hero/transicion.ts` y el arranque del controlador: fijación de 60/40 vh, scroll pasivo agrupado por `requestAnimationFrame`, cacheo de medidas, fase del anticipo y `will-change` solo durante la transición. `npm run check` pasó (0 errores, advertencias ni hints) y `npm test` pasó (117 pruebas); queda validar el comportamiento real con e2e.
- Paso 7 — Dejé el HTML en su composición final sin JS ni movimiento reducido, desactivé la fijación y las animaciones en ambos modos reducidos, y ajusté las reglas responsive para escritorio, tableta, móvil y horizontal. Amplié `contenido:pendientes` para listar y contar los textos ilustrativos; `npm run check` pasó (0 errores, advertencias ni hints) y `npm test` pasó (117 pruebas).
- Paso 8 — Añadí los e2e y capturas en `tests/e2e/hero.spec.ts`, `tests/e2e/axe-hero.ts` y `scripts/capturar-hero.mjs`; las ventanas decorativas solo se filtran de la regla `color-contrast` de Axe. Ajusté la prueba de transición para comprobar el paso real del borde del hero en tablet. Tras esos cambios, `npm run check` pasó (0 errores, advertencias ni hints), `npm test` pasó (117 pruebas), `npm run build` pasó (9 páginas, sin advertencias), `PORTAFOLIO_E2E_PORT=4381 npm run e2e` pasó (168/168) y `PORTAFOLIO_E2E_PORT=4381 npm run e2e -- -g "hero" --repeat-each=5` pasó (90/90). Generé las capturas solicitadas en `docs/encargos/capturas/F6/`; `npm run contenido:pendientes` lista el contenido ilustrativo y reporta 287 pendientes totales. Cerré los servidores de 4381, 4382 y 8765.

### Hecho
- Geometría determinista, composición responsive y fórmulas de animación en `src/lib/hero/`.
- Marcado, imagen provisional y estilos en `src/components/hero/Hero.astro`; integración en `src/pages/index.astro`.
- Esquemas y textos ilustrativos, campos de perfil, claves i18n y tokens en ambas hojas.
- Control de fijación y transición, soporte responsive, reduced motion y sin JavaScript.
- Tests unitarios, e2e y capturas comparativas en `tests/` y `docs/encargos/capturas/F6/comparacion.html`.

### Verificación
- `npm ci`: completó, 522 paquetes instalados, 0 vulnerabilidades. `npm run e2e:instalar`: completó tras reintentos por timeout de descarga de FFmpeg.
- `npm run check`: pasó; 115 archivos, 0 errores, advertencias ni hints; tokens y formato correctos.
- `npm test`: pasó; 12 archivos, 117 pruebas.
- `npm run build`: pasó; 9 páginas estáticas, sin errores ni advertencias.
- `PORTAFOLIO_E2E_PORT=4381 npm run e2e`: pasó; 168 pruebas.
- `PORTAFOLIO_E2E_PORT=4381 npm run e2e -- -g "hero" --repeat-each=5`: pasó; 90 pruebas.
- Capturas: composiciones de 1280×800, 834×1112, 390×844 y 844×390; entrada en cuatro tiempos; transición en cuatro avances; reduced motion. No quedó ningún servidor escuchando en 4381, 4382 ni 8765.

### Desviaciones
- La rama `f6-hero` no se pudo crear: el sandbox permite leer `.git`, pero no escribir allí. El checkout sigue en `F6`, cuyo HEAD coincide con `main`; no se creó ningún commit ni se movió `main`.
- En 844×390 no hay una captura horizontal equivalente en `hero-final.html`; se comparó con la sección responsive H4. El bloque de texto horizontal usa un ajuste de un píxel hacia el lado seguro para evitar la superposición detectada por el e2e.
- Tokens añadidos bajo `/* F6 · hero */` en las dos hojas: geometría de fijación, tiempos y retardos, superficies marfil, filtro de la mano y medidas tipográficas. Claves añadidas en ambos idiomas: `hero.descripcion`, `hero.verProyectos` y `hero.proyectoNdeM`.
- Se conservaron la mano provisional y los textos marcados `borrador`/`ilustrativo`, como pide el alcance.

### Preguntas abiertas
- Ninguna sobre implementación. Al revisar visualmente la comparación horizontal, tener en cuenta que su referencia es la sección H4 responsive, no un diseño horizontal dedicado.

### No verificado
- No se creó ni verificó una rama Git separada por la restricción de escritura en `.git`; todas las verificaciones listadas sí se ejecutaron en el checkout actual.

## Revisión
**Claude, 2026-10-26.** Una entrega excelente para el modelo usado: siguió el orden de § 2 y fue registrando en el informe cada paso con su verificación. Geometría, composición y animación son puras y tienen tests, y la composición final coincide con `hero-final.html` casi al píxel.

### Correcciones de Claude
1. **Nombres de las ventanas ocultos en escritorio.** Las reglas `data-nombre-t='false'` y `data-nombre-m='false'` habían quedado fuera de sus media queries, así que ocultaban también en escritorio el nombre de todas las ventanas pequeñas, incluida la punta «coder». Se quitaron del ámbito global.
2. **Límite de líneas (`nl` de la referencia) sin aplicar**, con las líneas encogidas una encima de otra (`flex-shrink`). Ahora cada línea lleva `data-linea-d/t/m` según la fórmula de `renderVals()` (`calcularLineas`) y `flex: none`.
3. **Cabecera del antebrazo** alineada a la derecha (`justify-content: flex-end`), como en la referencia: ahora se leen «traza · run 4f2a» y «memoria · episodios».
4. **El anticipo repetía el título del proyecto.** Ahora usa la clave `hero.capitulo` («Capítulo 1 · Varios agentes, nadie coordina»), como en el diseño.
5. **Prueba de regresión:** las 26 ventanas muestran su nombre en escritorio y ninguna línea visible se desborda.

Las capturas se regeneraron con las correcciones.

### Verificación
`check` limpio, 117/117 tests, build sin advertencias, 169/169 e2e y `-g "hero" --repeat-each=3` estable. Revisión visual en el navegador a 1280 × 800, en reposo y a p = 1: la barra sigue en `hero` durante toda la fijación.

### Para Jorge
- **Los textos de las terminales son ilustrativos** (por ejemplo `acc 0.874`): `contenido:pendientes` los cuenta y bloquean el lanzamiento hasta que se sustituyan (F8).
- **La mano sigue siendo la provisional** de 540 × 320 (licencia pendiente, F8).

**Recomendación:** aprobada.
