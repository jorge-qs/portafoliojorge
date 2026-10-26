# Portafolio

Portafolio público de proyectos de ingeniería e investigación, multilingüe con el español como base.

> **Estado:** F0 parcial, en revisión. La verificación quedó bloqueada por permisos de Astro; consulta `docs/encargos/F0-base.md`.

## Cómo está organizado
| Ruta | Qué es |
|---|---|
| `AGENTS.md` | Reglas para el agente que implementa (Codex) |
| `CLAUDE.md` | Rol de Claude: escribe los encargos, revisa y registra las decisiones |
| `docs/PLAN.md` | Fases F0–F8, su estado y las decisiones abiertas |
| `docs/encargos/` | Un encargo por fase (`PLANTILLA.md` + `Fn-*.md`) |
| `docs/ARQUITECTURA.md` | Stack, estructura, casuísticas y costos |
| `docs/DISENO.md` | Principios de diseño heredados de Kairos |
| `design/` | Handoff de diseño aprobado: especificación (`docs/`), referencias HTML, fuente del hero y recursos |

## Ciclo de trabajo
1. **Preparar la fase:** Jorge le pide a Claude preparar la fase N, y Claude escribe `docs/encargos/Fn-*.md`.
2. **Implementar:** Jorge lanza a Codex con *«Lee AGENTS.md y docs/encargos/Fn-*.md. Implementa solo ese encargo y termina con el informe que pide.»* Codex trabaja en la rama `fn-<tema>` y añade su informe al encargo.
3. **Revisar:** Claude revisa (comandos, diff y comparación con las referencias a 1280, 834 y 390 px) y escribe la revisión.
4. **Fusionar:** Jorge fusiona en `main`, o se prepara un encargo de corrección `Fn.1`.

## Desarrollo
Requiere Node 24.22.1 LTS (`.nvmrc`) y npm. Con nvm:

```sh
nvm install
nvm use
npm ci
npm run dev
```

| Comando | Función |
|---|---|
| `npm run dev` | Servidor de desarrollo de Astro |
| `npm run build` | Generación estática en `dist/` |
| `npm run preview` | Servidor del build |
| `npm run check` | Astro Check, ESLint con accesibilidad y detector de tokens sueltos |
| `npm test` | Vitest: contraste, tokens, i18n, esquemas y respaldo de idioma |
| `npm run format` | Prettier con soporte de Astro |
| `npm run contenido:pendientes` | Informe de placeholders y borradores |
| `npm run contenido:pendientes -- --estricto` | Falla si quedan placeholders o borradores |

Solo el español está activo. Los datos semilla de la maqueta son borradores, no contenido personal confirmado. Las páginas son comprobaciones temporales de las colecciones; las secciones y las plantillas se implementan en fases posteriores.

Las fuentes estáticas de Fontsource están en `public/fonts/`, con sus licencias OFL. No necesitan conexión a un CDN en ejecución.

Estos comandos están definidos pero no se han validado de extremo a extremo: el primer `npm run check` se detuvo con `EPERM` al crear la configuración de telemetría de Astro fuera del repositorio. El informe de F0 detalla las comprobaciones pendientes.
