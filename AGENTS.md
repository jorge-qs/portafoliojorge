# AGENTS.md — Portafolio de Jorge Quenta

Reglas para cualquier agente que implemente en este repositorio (Codex, por defecto). Se leen al empezar cada tarea.

## Roles
- **Jorge** decide y aprueba. Nada llega a `main` sin su visto bueno.
- **Claude** organiza: escribe cada encargo en `docs/encargos/`, revisa la entrega y registra las decisiones.
- **Codex** implementa **un encargo a la vez**, dentro de su alcance, y entrega un informe.

Si no tienes un encargo de `docs/encargos/`, no implementes nada: pide uno.

## Qué es este proyecto
Portafolio público de un AI Engineer / data scientist / investigador. La portada es narrativa:

1. Hero artístico.
2. Tres relatos en scrollytelling.
3. Índice de proyectos.
4. Sobre mí.
5. Tecnologías.
6. Notas (opcional).
7. Contacto.

Además hay dos plantillas de artículo: **ingeniería** e **investigación**. El sitio es **multilingüe con el español como base**.

## Fuentes de verdad, en orden de precedencia
1. **El encargo activo** (`docs/encargos/Fn-*.md`): alcance y criterios de aceptación.
2. **`design/docs/`**: la especificación de diseño aprobada.
   - `DECISIONES.md` gana sobre los demás.
   - Después vienen `TOKENS.md` + `tokens.css`, `PAGINAS.md`, `COMPONENTES.md`, `INTERACCIONES.md`, `HERO.md`, `PENDIENTES.md` y `BUGS_CONOCIDOS.md`.
3. **`design/referencias/*.html`**: las referencias visuales y de comportamiento.
   - Se abren en el navegador, sin conexión. Para Playwright, sírvelas con `python3 -m http.server` desde `design/referencias/` (`file://` está bloqueado).
   - **No son código para copiar**: hay que recrearlas.
   - Si una referencia contradice a `design/docs/`, manda `design/docs/`.
4. **`docs/ARQUITECTURA.md`**: stack, estructura y casuísticas. Sus **Enmiendas** del principio ganan sobre el resto del documento.
5. **`docs/DISENO.md`**: principios heredados de Kairos. Si choca con `design/docs/`, manda `design/docs/`. Las diferencias están en su § Enmiendas.

Si dos fuentes se contradicen y esta lista no resuelve el conflicto, **detente y pregunta** en el informe. No elijas por tu cuenta.

## Reglas que no se negocian
1. **Contenido:**
   - No inventes datos personales, proyectos, métricas, tecnologías, trayectoria ni enlaces.
   - Lo que no exista es un placeholder `‹…›`, en los archivos de `src/content/`, nunca escrito en un componente.
   - Ver `design/docs/PENDIENTES.md`.
2. **Tokens:**
   - En los componentes solo se usan variables semánticas (`--bg`, `--text`, `--accent`…).
   - Nunca hex, `rgb()`, duraciones ni curvas sueltas fuera de `src/styles/tokens.css`.
   - Un color nuevo exige un rol nuevo, con valor en Cosmos y en Dawn, y pasar el test de contraste.
3. **Oro (`--accent`):** solo para acción, estado activo y foco. Ingeniería usa bronce (`--eng`) e Investigación, azul (`--res`). Las etiquetas de tipo nunca son clicables.
4. **Temas:** la portada es siempre Cosmos. El selector Cosmos/Dawn (y Sistema en móvil) solo existe en los artículos. El tema se resuelve antes de pintar, sin parpadeo.
5. **Accesibilidad (WCAG AA):**
   - Contraste AA en ambos temas, verificado por test.
   - `:focus-visible` con 2 px en `--accent` y 2–3 px de separación.
   - Objetivos táctiles de 44 px como mínimo en móvil.
   - Lo oculto es `inert`.
   - Las ilustraciones llevan `aria-hidden` y una descripción alternativa.
   - Enlace «Saltar al contenido» en cada página.
   - Todo se puede usar con el teclado.
6. **`prefers-reduced-motion`:**
   - Duraciones a 0, sin scroll suave, sin *pinning* ni deriva en el hero y sin parpadeo del cursor.
   - **El contenido es idéntico en ambos modos.**
7. **Movimiento:**
   - Solo `opacity` y `transform`, con desplazamientos de 6 a 40 px.
   - Entradas con `--ease-out` y cambios de estado con `--ease-inout`.
   - Sin rebotes, partículas, zoom ni efecto de máquina de escribir.
   - Nada se anima en respuesta al teclado.
8. **Idiomas:**
   - Ningún texto de interfaz se escribe en un componente: va en `src/i18n/<idioma>.json`, empezando por `es.json`.
   - Las rutas se construyen con los helpers de `src/i18n/`.
   - Las fechas y los números se formatean con `Intl` según el idioma.
9. **No rediseñes.** Hero, scrollytelling, índice, Sobre mí, Tecnologías, Contacto y artículos están aprobados. Si algo no se puede implementar tal cual, detente y explícalo en el informe.
10. **Sin emojis** en ninguna parte. Los íconos son de Lucide.
11. **Privacidad:** nunca publiques material del empleador, datos confidenciales ni secretos. Las claves viven en variables de entorno, nunca en el repo.
12. **Los bugs del prototipo de scrollytelling** (`design/docs/BUGS_CONOCIDOS.md`) no se replican.

## Stack
Astro con TypeScript estricto, MDX y colecciones de contenido con esquemas Zod. Los estilos son CSS con tokens y el alcance de Astro, sin Tailwind. La interactividad se hace con TS vanilla en `<script>`; para una isla de React o Preact hace falta que el encargo lo justifique. Se despliega en Cloudflare Pages. El detalle está en `docs/ARQUITECTURA.md`.

## Comandos
> Node ≥ 24.22.1 (la CI usa la versión de `.nvmrc`; en local también sirve Node 26). La telemetría de Astro va desactivada en los propios scripts, porque escribe fuera del repositorio y el sandbox lo bloquea.

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor local |
| `npm run build` | Build estático. Debe terminar sin errores ni advertencias |
| `npm run check` | `astro check` + lint + prueba de tokens sueltos |
| `npm test` | Tests (contraste AA, paridad de claves i18n, esquemas) |
| `npm run preview` | Sirve el build estático local |
| `npm run format` | Formatea el código con Prettier y el plugin de Astro |
| `npm run contenido:pendientes` | Lista placeholders y borradores; con `-- --estricto`, sale con 1 si quedan |

## Forma de trabajar
1. Lee el encargo completo y los documentos que indica en «Leer antes». No leas `design/referencias/` enteras si el encargo te señala una sección.
2. Trabaja en la rama o worktree `fN-<tema>`. Commits pequeños, con mensajes en español y en imperativo.
   - **Si el sandbox no te deja escribir en `.git`** (error `index.lock`), **no te detengas**: sigue implementando y verificando, deja los cambios sin commit y dilo en el informe. Claude hace los commits al revisar.
   - Si un comando necesita escribir fuera del repositorio (cachés, configuración global), busca primero una opción local: variable de entorno, `--cache` o una carpeta dentro del repo ignorada por git. Solo si no hay ninguna, documenta el bloqueo y sigue con lo demás.
3. Respeta el alcance: lo que esté en «No incluye» no se toca, aunque parezca fácil.
4. Antes de entregar:
   - pasa `build`, `check` y `test`;
   - compara con la referencia HTML a **1280, 834 y 390 px** (y verifica a 360);
   - prueba con `prefers-reduced-motion: reduce` activado.
5. **Escribe el informe mientras trabajas, no solo al final.** Al cerrar cada entregable, añade a la sección «Informe» del encargo una línea con lo hecho y lo verificado. Si la sesión se corta (por ejemplo, por capacidad del modelo), el informe parcial permite continuar sin rehacer nada.
6. **Tests robustos:**
   - nada que dependa de tiempos, de la carga de la máquina ni de decisiones opcionales del navegador (por ejemplo, que Chrome ejecute una View Transition);
   - las medidas en píxeles llevan tolerancia de subpíxel (`44 - 0.01`, `56 - 0.5`);
   - antes de dar por buena una prueba nueva, ejecútala varias veces: `npm run e2e -- -g "<nombre>" --repeat-each=5`.
7. **Puertos y procesos:** usa el `PORTAFOLIO_E2E_PORT` que indique el prompt y **cierra al terminar** los servidores que hayas abierto (e2e, capturas, referencias). Otro agente puede estar trabajando en paralelo.
8. Entrega con el informe que pide el encargo: qué se hizo, cómo se verificó (comandos y resultados reales), capturas, desviaciones y preguntas abiertas. **No declares como verificado lo que no comprobaste.**

## Mapa de `design/docs/`
| Archivo | Contenido |
|---|---|
| `DECISIONES.md` | Qué se decidió en cada fase y por qué, con las opciones descartadas |
| `TOKENS.md` + `tokens.css` | Colores de Cosmos y Dawn, tipografía, espaciado, retícula, radios y movimiento |
| `PAGINAS.md` | Cada página y sección: layout, medidas y responsive |
| `COMPONENTES.md` | Inventario C1–C12 con sus estados |
| `INTERACCIONES.md` | Navegación, transiciones, scrollytelling, diagramas, tema, reduced motion y estado |
| `HERO.md` | Especificación artística del hero: capas L0–L6, geometría y animación |
| `PENDIENTES.md` | Recursos y contenido por sustituir, y modelo de contenido |
| `BUGS_CONOCIDOS.md` | Problemas del prototipo de scrollytelling que no deben replicarse |
