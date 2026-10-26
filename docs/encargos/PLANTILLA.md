# Fn · ‹Tema›

**Estado:** borrador | encargada | en revisión | aprobada
**Rama:** `fn-<tema>` · **Depende de:** ‹fases› · **Escrito por:** Claude · **Fecha:** ‹AAAA-MM-DD›

> Cómo lanzarlo en Codex: *«Lee AGENTS.md y docs/encargos/Fn-<tema>.md. Implementa solo ese encargo y termina con el informe que pide.»*

## Objetivo
‹Una o dos frases: qué existe al terminar que antes no existía.›

## Leer antes
Lee solo estas secciones, con su archivo y su apartado; no hace falta leer todo.
- `design/docs/‹archivo›.md` § ‹apartado›
- `design/referencias/‹archivo›.html` § ‹sección›, a 1280, 834 y 390 px

## Incluye
1. ‹Entregable concreto, con la ruta del archivo cuando se sepa›

## No incluye
- ‹Lo que podría parecer parte de la fase pero va en otra. Indica en cuál›

## Especificación
‹Las medidas, estados y comportamientos que hacen falta para no tener que adivinar. Cita la fuente de cada dato. Si un dato no está en ninguna fuente, dilo y pon qué hacer.›

## Criterios de aceptación
Cada uno se comprueba con un comando, una medida o un estado observable.
- [ ] `npm run build`, `npm run check` y `npm test` terminan sin errores ni advertencias
- [ ] ‹criterio›
- [ ] Con `prefers-reduced-motion: reduce`: ‹qué se ve›
- [ ] A 390 y a 360 px: nada se corta y los objetivos táctiles miden ≥ 44 px

## Trampas conocidas
- ‹Errores probables o bugs del prototipo que no hay que replicar›

## Si te bloqueas
Si una fuente se contradice, falta un dato o algo exige rediseñar, **no lo decidas tú**. Implementa lo que no dependa de eso y deja la pregunta en el informe.

## Informe de entrega
Añádelo al final de este archivo, en la sección «Informe»:
1. **Hecho:** la lista de entregables, con sus rutas.
2. **Verificación:** los comandos ejecutados con su resultado real, y las capturas a 1280, 834 y 390 px en `docs/encargos/capturas/Fn/`.
3. **Desviaciones:** qué difiere del encargo o de la referencia, y por qué.
4. **Preguntas abiertas.**
5. **No verificado:** lo que no pudiste comprobar.

---

## Informe
‹Lo escribe Codex.›

## Revisión
‹Lo escribe Claude: bloqueantes, cosas por corregir, notas y la recomendación para Jorge.›
