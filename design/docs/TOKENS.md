# Tokens

Los valores implementables están en `tokens.css`. La vista visual está en la sección **T** de `design/referencias/maqueta-3-sistema.html`.

## Color
| Token | Cosmos | Dawn | Uso |
|---|---|---|---|
| `--bg` | #0A0D14 | #F7F3EA | Fondo de página |
| `--surface` | #10141D | #FFFDF8 | Figuras, hover de fila |
| `--surface-2` | #151A25 | #EFE9DC | Nodos, botones secundarios, controles |
| `--surface-hover` | #1C2230 | #E8E1D2 | Hover de botón secundario y de nodo |
| `--line` | marfil al 8 % | tinta al 12 % | Filetes de 1 px |
| `--text` | #E8DCC4 | #141C30 | Cuerpo |
| `--heading` | #F4F1EA | #0E1424 | Títulos |
| `--muted` | #8C929D | #4E586F | Metadatos y leyendas |
| `--accent` | #C9A06A | #7A5824 | **Solo** acción, activo y foco |
| `--accent-hover` | #D6B07C | #5E4318 | Hover de acción |
| `--on-accent` | #0A0D14 | #FFFDF8 | Texto sobre `--accent` (botón primario). Añadido el 2026-10-25: en Dawn, #0A0D14 no llegaba a AA (3,0:1) |
| `--eng` | #B08C5C | #7A5824 | Etiqueta Ingeniería |
| `--res` / `--link` | #6F9DE3 | #2E5487 | Etiqueta Investigación y enlace en el texto (subrayado) |
| Híbrido | punto bicolor eng/res | — | Etiqueta Híbrido |

**Elevación:** sin sombras en reposo. Se sube de nivel cambiando de superficie: `--surface` → `--surface-2`.

## Tipografía (Geist)
| Rol | Escritorio | Móvil | Peso / interlineado / tracking |
|---|---|---|---|
| Nombre del hero | 96 | 56 | 600 / 1 / −2,5 % |
| h1 de artículo | 52 | 30–32 | 600 / 1,1 / −2,5 % |
| h1 de tablero (solo en las referencias) | 56 | — | — |
| h2 de sección | 40 | 28–30 | 600 / 1,15 / −2 % |
| h3 de capítulo | 26 | 22 | 600 / — / −2 % |
| Entradilla | 20 | 17 | 400 / 1,45 |
| Pregunta de Sobre mí | 18 | 17 | 400 / 1,45 |
| Cuerpo | 16 (17 en Sobre mí) | 16 | 400 / 1,6–1,65 |
| Interfaz | 15 | 15 | 400–600 |
| Metadatos | 14 | 14 | 400 |
| Kicker y leyenda | 13 | 13 | 400 · mínimo absoluto 12 |
| Código y terminales | Geist Mono 13 / 1,75 | — | — |

El **kicker de sección** es el número en `--accent` seguido del nombre en `--muted`, a 13 px, con 12 px de separación y 14 px por encima del h2.

## Espaciado
Escala: 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 144 · 160.

**Entre secciones**

| Pantalla | Espacio |
|---|---|
| Escritorio | 144 px antes del índice y 160 px en las demás |
| Tablet | 128–144 px |
| Móvil | 96 px |

**Dentro de una sección:** 32–48 px.

## Retícula y puntos de corte
| Rango | Columnas | Márgenes | Notas |
|---|---|---|---|
| ≥ 1200 | 12 · máximo 1200 · medianil 24 | 40 (64 en el hero) | Artículo: 180 / 632 / 260 con separación de 40 |
| 768–1199 | 8 | 32 | El artículo pierde el índice lateral y lo sustituye «Capítulos ▾» |
| < 768 | 4 | 20 | Se diseña a 390 y el mínimo es 360 |

## Radios
| Radio | Elementos |
|---|---|
| 4 | Etiqueta `‹pendiente›` |
| 8 | Nodos, chips de índice, elementos del índice de contenidos |
| 10 | Chips de filtro en móvil, tarjetas de evidencia |
| 12 | Botones, figuras, bloques destacados |
| 20 | Hojas inferiores en móvil |
| 28 | Solo el marco del dispositivo en las referencias |

## Movimiento
| Uso | Valor |
|---|---|
| Color y hover | 150 ms |
| Fundidos | 200 ms |
| Reacomodo de diagramas | 240 ms |
| Ventanas del hero | 350 ms por ventana |
| Curva de entrada | ease-out cúbica |
| Curva de cambio de estado | ease-in-out |

Sin rebotes, escalados ni efectos de máquina de escribir. Con reduced motion, todas las duraciones pasan a 0.
