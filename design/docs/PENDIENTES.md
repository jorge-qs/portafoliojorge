# Recursos y contenido pendientes

**Regla:** nada de esta lista se inventa. Mientras falte, se muestra como placeholder `‹…›`, cargado desde los archivos de contenido.

| Recurso | Qué se necesita | Dónde | Prioridad |
|---|---|---|---|
| Mano humana del hero | Fuente de alta resolución (≥ 2400 px de ancho) con la **licencia de la reproducción fotográfica verificada** (la pintura es de dominio público, la foto puede no serlo), un recorte limpio y la gradación final. Alternativa: una ilustración propia. La actual, `mano-adan-v2.provisional.png`, mide 540 × 320 y es solo provisional | Hero L2 · Contacto | **Bloqueante** |
| Texto de las terminales | Nombres y comandos de los agentes y herramientas reales, sin métricas inventadas | Hero L3 | **Bloqueante** |
| Proyectos | Título, tipo, año, resumen de una línea, herramientas, rol y enlaces. Además, cuáles son los 3 destacados | Índice, 5b, relatos y artículos | **Bloqueante** |
| Métricas y figuras | Resultados verificables y diagramas reales. Si no, marcarlos como sintéticos | Capítulo 4 del relato · Evaluación y Resultados | Alta |
| Inventario de tecnologías | La lista real por área y su relación con los proyectos | 05 | Alta |
| Textos personales | La frase del hero, la presentación, las 2–3 preguntas y la frase de contacto. Ahora son borradores | Hero, 04 y 07 | Alta |
| Trayectoria y formación | Roles, organizaciones y fechas | 04 | Alta |
| CV en PDF | El archivo y la fecha de actualización | Barra, 04, 07 y menú | Alta |
| Enlaces de contacto | Correo, usuario de GitHub y URL de LinkedIn | 07 y pies de página | Alta |
| Investigación | Coautores, afiliación, DOI o PDF y referencias | Plantilla B | Media |
| Favicon e imagen para redes | Sin diseñar. Propuesta: el detalle de la punta y el cursor sobre Cosmos | Metadatos | Media |
| Fotografía personal | Retrato a 4:5 con luz lateral sobre fondo oscuro y tonos cálidos. **Opcional**: la composición funciona sin ella | 04 | Opcional |
| Notas publicadas | Si no hay, la sección 06 no se renderiza | 06 | Opcional |
| Fuente The Calling | Descartada. Si vuelve, hay que verificar su licencia | — | Opcional |

## Modelo de contenido sugerido
- `content/proyectos/*.mdx`
  - **Frontmatter:** `slug`, `titulo`, `tipo` (ing / inv / hib), `anio`, `resumen`, `herramientas[]`, `rol`, `destacado` (bool), `orden_destacado`, `enlaces{repo, demo, pdf}` y `capitulos_relato[]`, solo si es destacado.
- `content/perfil.json`
  - `frase_hero`, `presentacion`, `preguntas[{tipo, texto}]`, `trayectoria[]`, `cv{url, fecha}` y `contacto{email, github, linkedin}`.
- `content/tecnologias.json`
  - `areas[{nombre, herramientas[]}]`.
  - La relación herramienta → proyectos se **deriva** de `proyectos.herramientas`, no se duplica.
- `content/notas/*.mdx`
  - La sección 06 solo existe si esta carpeta tiene notas.
