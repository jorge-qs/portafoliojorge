# Lenguaje de diseño

Cómo diseñamos: de dónde salen los colores, cómo elegimos la tipografía, cómo
encuadramos una pantalla y cuándo algo se mueve. Este documento recoge las
decisiones que ya tomamos juntos en el Personal OS / Kairos y cómo se aplican
al portafolio. Cualquier agente (Claude, Codex u otro) diseña con estas reglas.

**Estado:** referencia viva · **Fecha:** 2026-10-20
**Fuentes:** `personal-os-spec/docs/decisions/ADR-0007-visual-identity.md` (y sus
enmiendas), `docs/design/UX-DECISIONS.md`, `docs/design/kairos/PATRONES.md`,
`frontend/app/globals.css`, `frontend/tailwind.config.ts` y el prototipo
`docs/design/references/portafolio-ui`.

> **Enmiendas del 2026-10-25.** El diseño aprobado del portafolio está ahora en `design/docs/`. Si algo de este documento choca con él, **manda `design/docs/`**. Las diferencias concretas son estas:
> - **Color por zona:** Ingeniería en bronce (`--eng`) e Investigación en azul (`--res`). El oro (`--accent`) solo marca acción, estado activo y foco; ya no es el color de Proyectos. Confirmado por Jorge.
> - **Nombres de tokens:** `--bg`, `--surface`, `--text`, `--heading`, `--muted`, `--accent`… (`design/docs/tokens.css`), en lugar de `background`, `foreground` y `primary`. El hover del oro en Cosmos es #D6B07C, no #E0B574.
> - **Curvas:** las cúbicas del handoff, ease-out (.215, .61, .355, 1) y ease-in-out (.645, .045, .355, 1), en lugar de las del Personal OS. Elegidas por Jorge.
> - **Pulsar un botón:** escala 0,98, no 0,97.
> - **Ritmo vertical:** 144 px antes del índice y 160 px entre las demás secciones en escritorio, 128–144 en tablet y 96 en móvil, en lugar de 6–8rem y 4rem.
> - **Tipografía:** Geist Mono se suma para el código y las terminales.
> - **Hero y encuadres (§ 4):** sustituidos por `design/docs/HERO.md` y `PAGINAS.md`. El índice es una lista editorial, no una grilla de tarjetas.
> - **Glifos (§ 7) y búhos:** fuera de la v1. The Calling queda descartada.

Cada regla lleva una marca:
- **[decidido]**: ya lo aprobaste en el Personal OS y se hereda tal cual.
- **[propuesta]**: adaptación para el portafolio, pendiente de tu visto bueno.

---

## 1. Principios

1. **Calma antes que espectáculo.** Lo atractivo sale del cuidado del detalle,
   no de efectos. Nada parpadea, rebota ni bloquea al usuario. [decidido]
2. **La identidad acompaña y no estorba.** El cosmos, los glifos y los búhos
   aparecen en la marca, los títulos, los estados vacíos y los momentos de
   cierre; **nunca en el texto que hay que leer para trabajar**. [decidido]
3. **Legible de un vistazo.** La jerarquía sale del tamaño y del peso de la
   letra, no de adornos. [decidido]
4. **Lenguaje práctico.** Nombres directos: Proyectos, Notas, CV, Contacto.
   Sin metáforas como "constelaciones" para nombrar secciones. [decidido]
5. **Accesible siempre.** WCAG AA en ambos temas, todo quieto con
   `prefers-reduced-motion` y el texto plano siempre disponible para lectores
   de pantalla. [decidido]
6. **Simple gana.** Cuando dudamos entre detalle y simpleza, ganó la simpleza
   (los búhos de 32×32 contra los de 64×64; una sola tipografía contra dos). [decidido]

## 2. Color

### De dónde sale la paleta
La paleta oscura viene del **grafo de tu vault de Obsidian**: un mapa estelar
plano, con fondo casi negro, estrellas marfil y plata, oro ocasional y
azul noche. No es un "espacio" de neones: **no hay violeta ni cian**. [decidido]

### Tokens semánticos
Nunca se usa un color literal en un componente. Se usan **roles**, y cada tema
le da un valor a cada rol. Así se puede cambiar o iterar un tema completo sin
tocar los componentes. [decidido]

| Rol | Oscuro "cosmos" | Claro "dawn" | Para qué |
|---|---|---|---|
| `background` | `#0A0D14` | papel cálido `rgb(247 243 234)` | Fondo de página |
| `surface` / `surface-raised` | `#10141D` / `#151A25` | `#FFFDF8` / `#FFFFFF` | Tarjetas / diálogos y menús |
| `foreground` | `#E8DCC4` marfil cálido | `#141C30` azul marino | Texto principal |
| `accent-foreground` | `#F4F1EA` | `#141C30` | Texto fuerte |
| `muted-foreground` | `#8C929D` | `rgb(78 88 111)` | Texto secundario |
| `primary` | `#C9A06A` oro apagado (hover `#E0B574`) | oro oscurecido `rgb(122 88 36)` | Acción principal, glifos, marca |
| `secondary` | `#6F9DE3` azul noche | `rgb(46 84 135)` | Enlaces, anillo de foco |
| `tertiary` | `#B08C5C` bronce | `rgb(118 86 42)` | Detalles |
| `border` | hilo dorado tenue (oro al ~20 %) | azul al ~22 % | Separadores |
| `success` / `at-risk` / `broken` | verde / ámbar / rosa suave | versiones oscurecidas | Estados (formulario, demos) |

Los valores exactos están en `personal-os-spec/frontend/app/globals.css` y se
copian a `src/styles/tokens.css` con una nota de origen.

### Reglas para elegir un color
- **El contraste manda.** Si un color pedido no llega a 4.5:1 como texto, se
  aclara u oscurece hasta llegar, y se anota. Así pasó con el texto secundario
  (`#7F858F` → `#8C929D`) y el bronce (`#8C6E45` → `#B08C5C`). Lo verifica un
  test automático. [decidido]
- **Un color de acento por zona.** En la app, cada sección tiene el suyo (Hoy
  oro, Tareas azul, Finanzas celeste, Salud verde). [decidido]
  En el portafolio **[propuesta]**: Proyectos oro, Notas azul noche, CV bronce
  y Contacto verde. Además, cada tag de proyecto toma un tono de esta familia,
  nunca un color nuevo.
- **Destacar es teñir, no enmarcar.** Una tarjeta destacada lleva un fondo
  teñido con el color de su sección y un tamaño mayor. **Sin bordes de 1 px,
  sin sombras ni brillos en reposo y sin barras de color a un costado.** [decidido]
- **El oro es escaso.** Se reserva para la acción principal, los glifos y la
  marca. Si todo es dorado, nada destaca. [decidido]
- **El emblema mantiene sus colores oficiales** sobre fondo de noche, incluso
  en el tema claro. [decidido]
- **Agregar un color nuevo** implica definir un rol (no un hex suelto), darle
  valor en ambos temas, pasar el test de contraste y justificar por qué ningún
  rol existente sirve.

## 3. Tipografía

- **Una sola familia: Geist** (autoalojada, licencia OFL) para títulos,
  interfaz y números. Cormorant Garamond y Space Grotesk se descartaron el
  2026-10-19, después de comparar cuatro opciones lado a lado: la serif
  chocaba con la letra de la interfaz. [decidido]
- **Jerarquía por tamaño y peso:** títulos en 600 con tracking cerrado
  (-0.02 a -0.025em); cuerpo de 16 px en móvil y 15–16 px en escritorio; texto
  pequeño de 13–14 px. **Nunca mayúsculas diminutas con mucho espaciado.** [decidido]
- **Números tabulares** (`tabular-nums`) en fechas, contadores y cifras. [decidido]
- **Wordmark:** Geist 600 con tracking +0.2em, junto al emblema. [decidido]
- **Portafolio [propuesta]:**
  - El hero puede ir más grande que en la app, con `clamp(2.6rem, 7vw, 5rem)` como en el prototipo.
  - El texto largo de notas y proyectos se limita a ~65 caracteres por línea.
  - Interlineado de 1.6 en el cuerpo y de 1.1 en los títulos.

## 4. Encuadres y composición

### Lo que ya está decidido
- **Contenedor centrado** de máximo 1200 px, con margen lateral de 1.5rem
  (1rem en móvil). [decidido]
- **Radios:** base `0.75rem`; los elementos internos usan el mismo radio menos
  4 o 6 px para que las esquinas anidadas se vean concéntricas. [decidido]
- **El starfield nunca va detrás de contenido denso.** Vive en el hero y en los
  espacios vacíos, no bajo párrafos ni listas. [decidido]
- **Móvil: nada se corta a la mitad.** Si no cabe, se muestran los elementos
  completos más un "Ver más", nunca una tarjeta cortada. [decidido]
- **El rincón superior izquierdo de un personaje es para su estado**; nada más
  va ahí (regla de los sprites). [decidido]

### Cómo encuadramos el portafolio [propuesta]
| Zona | Encuadre |
|---|---|
| **Hero** | Pantalla completa en altura (`min-height: 100svh`), contenido centrado, starfield de fondo. Nombre en Geist grande; el título en glifos se descifra al acercar el cursor; un subtítulo de una línea y dos acciones como máximo (Ver proyectos · Contacto). |
| **Proyectos destacados** | 2 o 3 tarjetas grandes con fondo teñido, de distinto tamaño (una ancha y dos normales) para romper la monotonía de la grilla. |
| **Lista de proyectos** | Grilla `repeat(auto-fill, minmax(300px, 1fr))` con gap de 1.4rem (como el prototipo); filtros por tag arriba y fijos al hacer scroll en escritorio. |
| **Página de proyecto** | Columna de lectura de ~65ch; ficha lateral (rol, stack, fecha, enlaces) en escritorio, que pasa arriba en móvil; la demo o portada a sangre dentro del contenedor. |
| **Notas** | Lista tipo índice (fecha, título, tags), sin tarjetas; la nota es una columna de lectura con figuras que pueden salir más anchas que el texto. |
| **CV** | Una sola columna, pensada también para imprimir: el mismo encuadre genera el PDF. |
| **Ritmo vertical** | Escala de espaciado en múltiplos de 4 px; entre secciones 6–8rem en escritorio y 4rem en móvil. Mucho aire: el portafolio se recorre, no se opera. |

**Diferencia con la app:** el Personal OS es denso porque se usa muchas veces
al día. El portafolio es una vitrina: más aire, títulos más grandes y menos
elementos por pantalla.

## 5. Movimiento

### Las reglas (de Emil) [decidido]
- Se animan solo `transform` y `opacity`, nunca el tamaño ni la posición del layout.
- Duraciones cortas, con la **salida más rápida que la entrada**.
- **Nada se anima en acciones de teclado.**
- Todo queda quieto con `prefers-reduced-motion`.
- Nunca bloquea lo que el usuario está haciendo.

### Tokens
| Token | Valor | Uso |
|---|---|---|
| `--motion-fast` | 150 ms | Hover, presionar, toggles pequeños, salidas |
| `--motion-base` | 200 ms | Paneles, filas, elementos que se despliegan |
| `--motion-slow` | 240 ms | Superficies grandes |
| `--ease-out` | `cubic-bezier(0.23, 1, 0.32, 1)` | Lo que aparece |
| `--ease-in-out` | `cubic-bezier(0.77, 0, 0.175, 1)` | Lo que cambia de lugar |

> Nota: el texto de ADR-0007 dice 120/180/240 ms, pero el código del Personal
> OS usa 150/200/240 ms y UX-DECISIONS dice "150–250 ms". Este documento sigue
> **lo que está en el código**; habría que corregir el ADR.

### Gestos que ya usamos [decidido]
- **Presionar un botón:** `scale(.97)`.
- **Entrada escalonada** de tarjetas o elementos de una lista: 30–80 ms entre uno y otro.
- **Decodificación de glifos:** un título en glifos se descifra letra por letra, de izquierda a derecha, cuando el cursor se acerca a menos de ~80 px. También al recibir foco de teclado o al tocarlo. El barrido completo dura 240 ms y la letra plana ocupa el mismo espacio que el glifo, así que nada se mueve. Un solo `requestAnimationFrame` compartido para todos los títulos.
- **Starfield sutil:** estrellas marfil y plata, con oro ocasional.
- **Sprites de búho:** 6 fps (ciclo de 2 s) y `image-rendering: pixelated` a escala entera. Es la **única excepción** a las duraciones cortas.

### Dónde se mueve el portafolio [propuesta]
- El hero: starfield y decodificación del título.
- La entrada escalonada de las tarjetas al llegar a la sección (una sola vez, no en cada scroll).
- Transiciones de vista entre la lista y la página de un proyecto (la portada "viaja").
- El hover de las tarjetas: un leve aclarado del fondo teñido, sin sombras.
- El formulario: confirmación con un cambio de estado claro, sin confeti.
- **Nada más.** Antes de agregar una animación se usan
  `find-animation-opportunities` y `animation-performance`; si no ayuda a
  entender algo, no va.

## 6. Íconos, imágenes y personajes

- **Íconos:** Lucide (línea fina, la misma familia que usas en Obsidian) y
  marcas geométricas de estado (○ ◐ ● ‖). **Sin emojis en ninguna parte.** [decidido]
- **Búhos de Kairos:** pixel art de 32×32 con las reglas de
  `kairos/PATRONES.md`. Identifican a Kairos actuando, no a la marca. [decidido]
  En el portafolio **[propuesta]**: solo en "Sobre mí" o en la página del
  proyecto Kairos, como detalle y no como decoración general.
- **Portadas de proyecto [propuesta]:** captura real del proyecto sobre fondo
  `surface`; si no hay captura, una portada generada con los tokens y la
  inicial en glifo. Las imágenes van optimizadas (AVIF/WebP) y en tamaños
  responsivos.

## 7. Glifos

- **Sistema:** The Calling Cipher, sustitución letra por letra. Los acentos se
  pliegan (Á→A) y **nunca se mezcla con XK-794**. [decidido]
- **Dónde:** marca, títulos de página, estados vacíos y momentos de cierre.
  Botones, fechas, números y mensajes siempre en texto plano. [decidido]
- **Accesibilidad:** cada título en glifos lleva su texto plano para lectores
  de pantalla. [decidido]
- **Licencia, antes de publicar:** ADR-0007 aprobó The Calling solo para uso
  local, en un repo privado. Su texto dice: *"si alguna vez se publica, hay que
  revisar de nuevo la licencia de la fuente y el uso del cifrado del artista"*.
  **El portafolio es público, así que esto bloquea usar The Calling hasta que
  lo revises.** La alternativa ya existe y no tiene problemas de licencia: tu
  escritura propia (`escriba.js`, del prototipo original).

## 8. Cómo decidimos (el proceso)

Así llegamos a cada decisión anterior, y así seguimos iterando:

1. **Comparar lado a lado, no en abstracto.** Ponemos 2 a 4 opciones reales
   juntas (como el tablero `TypeOptions` para la tipografía, o los bocetos
   v1–v11 de los búhos) y eliges tú.
2. **Anotar lo que no funcionó y por qué.** Por ejemplo: cejas en el búho
   ("se veía enojado"), capas más anchas que el cuerpo ("regordete"), la serif
   con la letra de interfaz ("chocaban"). Evita repetir errores.
3. **Registrar la decisión** como enmienda en el documento correspondiente,
   con la fecha.
4. **Usar los skills por etapa**, sin cargarlos todos:
   - dirección visual: `design-taste-frontend`;
   - interacción y formularios: `emil-design-eng`;
   - movimiento: `animation-vocabulary`, `review-animations` y `animation-performance`;
   - móvil: `mobile-native`;
   - estrés: `break-ui`.
5. **Probar en el dispositivo real** (iPhone y Mac) antes de dar algo por bueno.

### Checklist antes de aprobar un cambio visual
- [ ] Solo usa tokens, sin colores ni duraciones sueltas.
- [ ] Pasa AA en ambos temas.
- [ ] Con `prefers-reduced-motion` todo queda quieto y sigue entendiéndose.
- [ ] Los glifos no aparecen en texto funcional y tienen su texto plano.
- [ ] No hay emojis, bordes de 1 px para destacar, sombras en reposo ni barras laterales de color.
- [ ] En móvil nada queda cortado y las áreas táctiles miden 44 px o más.
- [ ] La animación nueva justifica su existencia.
