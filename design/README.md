# Handoff: Portafolio de Jorge Quenta — Portada y artículos

## Overview
Portafolio editorial de un AI Engineer, data scientist e investigador. La portada cuenta una historia en este orden:

1. **Hero artístico:** inspirado en *La creación de Adán*. La mano artificial está hecha de terminales.
2. **Tres proyectos destacados:** narrados en scrollytelling de cuatro capítulos.
3. **Índice de todos los proyectos.**
4. **Sobre mí.**
5. **Tecnologías.**
6. **Notas:** opcional.
7. **Contacto.**

Cada proyecto tiene su artículo, con plantilla de **ingeniería** o de **investigación**.

## About the Design Files
Los archivos de `design/referencias/` son **referencias de diseño hechas en HTML**: muestran el aspecto y el comportamiento esperados, pero **no son código de producción**.

La tarea es **recrearlos** con el stack elegido. Si todavía no hay ninguno, se recomienda un generador estático con componentes e islas interactivas (por ejemplo Astro + MDX, o Next.js con SSG), con el contenido en MDX o JSON.

Cada HTML funciona sin conexión: basta con abrirlo en el navegador. Los enlaces entre ellos no funcionan fuera del proyecto de diseño, así que hay que abrir cada uno por separado.

## Fidelity
**Alta fidelidad** en colores, tipografía, espaciado, layout, estados y movimiento. Hay que recrearlos con precisión.

**Baja fidelidad** solo en el **contenido**: todo lo marcado `‹…›`, «borrador» o «datos sintéticos» es un placeholder. Ver `docs/PENDIENTES.md`.

## Cómo se usa en este repositorio
El paquete ya está instalado: las reglas para los agentes están en `AGENTS.md` y `CLAUDE.md`, en la raíz, y el plan por fases, en `docs/PLAN.md`. Este directorio (`design/`) es la especificación de diseño y no se modifica sin una decisión registrada en `design/docs/DECISIONES.md`.

## Archivos
| Ruta | Qué es |
|---|---|
| `design/docs/*.md`, `design/docs/tokens.css` | Especificación completa (ver el mapa en `AGENTS.md`) |
| `design/referencias/maqueta-1-portada.html` | Portada en escritorio (1280), tablet (834) y móvil (390), con notas de ritmo |
| `design/referencias/maqueta-2-articulos.html` | Artículo de ingeniería (Cosmos) y de investigación (Dawn), en escritorio y móvil |
| `design/referencias/maqueta-3-sistema.html` | Navegación, tokens, componentes, interacciones, consistencia y pendientes |
| `design/referencias/hero-final.html` | Hero final: composición, entrada, transición, responsive, capas y recursos provisionales |
| `design/referencias/scrollytelling-v1.html` | Prototipo del relato de cuatro capítulos (ver `docs/BUGS_CONOCIDOS.md`) |
| `design/fuente/hero-arte.dc.html` | Fuente legible de la geometría del hero (método `base()`: segmentos de la mano) |
| `assets/mano-adan-v2.provisional.png` | Mano humana **provisional**, de 540 × 320 px. Debe sustituirse |

## Screens / Views
El detalle de cada pantalla está en `docs/PAGINAS.md`. Los tokens están en `docs/TOKENS.md`, y las interacciones y el estado, en `docs/INTERACCIONES.md`.
