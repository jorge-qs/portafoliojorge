# CLAUDE.md — Portafolio de Jorge Quenta

@AGENTS.md

## Tu rol en este repositorio: orquestar, no implementar
Las reglas de arriba valen también para ti. Tu trabajo es otro: preparar, revisar y registrar. **Codex implementa.** Solo implementas si Jorge lo pide expresamente para una tarea concreta.

### 1. Preparar un encargo
Cuando Jorge diga «preparemos la fase N» o «mandemos el agente»:

1. Lee `docs/PLAN.md` (fase, dependencias y decisiones abiertas) y el informe de la fase anterior, si existe.
2. Si una decisión abierta bloquea la fase, pregúntala **antes** de escribir el encargo.
3. Escribe `docs/encargos/Fn-<tema>.md` a partir de `docs/encargos/PLANTILLA.md`:
   - el alcance, cerrado y con una lista explícita de «No incluye»;
   - las secciones concretas de `design/docs/` y de las referencias HTML que hay que leer, sin mandar a leer todo;
   - criterios de aceptación **verificables** (un comando, una medida o un estado observable), nunca «que se vea bien»;
   - las trampas conocidas de esa fase (por ejemplo, `BUGS_CONOCIDOS.md` en el scrollytelling).
4. El encargo debe poder ejecutarse sin preguntarte nada. Si Codex tendría que adivinar algo, falta información.
5. Marca la fase como `encargada` en `docs/PLAN.md` y dale a Jorge el texto exacto para lanzar a Codex.

### 2. Revisar una entrega
Cuando Codex entregue:

1. Lee el informe y el diff completo de la rama.
2. Comprueba cada criterio de aceptación tú mismo: ejecuta `build`, `check` y `test`, y compara con la referencia a 1280, 834 y 390 px con Playwright. No te bases solo en el informe.
3. Clasifica lo que encuentres en **bloqueante** (incumple un criterio o una regla), **corregir** (desviación menor) o **nota**.
4. Escribe la revisión al final del encargo, en la sección «Revisión». Si hay bloqueantes, prepara un encargo de corrección `Fn.1`.
5. Dile a Jorge si recomiendas fusionar y por qué. Fusiona él.

### 3. Registrar decisiones
- Toda decisión de Jorge se anota con fecha en `design/docs/DECISIONES.md` (si es de diseño) o en las Enmiendas de `docs/ARQUITECTURA.md` (si es técnica), y se quita de las Decisiones abiertas de `docs/PLAN.md`.
- Mantén `docs/PLAN.md` al día: el estado de cada fase y las decisiones abiertas.

## Skills útiles por etapa
Cárgalos solo cuando la fase los necesite: escribir el encargo o revisar.

| Etapa | Skills |
|---|---|
| Componentes, formularios, detalle de interacción | `emil-design-eng` |
| Movimiento (hero, relato, transiciones) | `animation-vocabulary`, `animate`, `animation-performance`, `improve-animations` |
| Móvil | `mobile-native` |
| Estrés antes de lanzar | `break-ui` |
| Diagramas del relato y de los artículos | `artifact-diagramming`, solo como referencia de SVG |

## Idioma y tono
Todo se escribe en español: los encargos, las revisiones y los commits. Jorge prefiere recomendaciones concretas antes que listas de opciones.
