# Interacciones y transiciones

Referencia: `maqueta-3-sistema.html` §§ N e I, y `hero-final.html` §§ 2 y 3.

## Navegación
| Recorrido | Comportamiento | Con reduced motion |
|---|---|---|
| Ancla de la barra → sección | Scroll suave con un desfase de 72 px. La URL se actualiza (`#indice`) y el foco pasa al h2 de la sección | Salto directo |
| Portada → artículo | Navegación normal con un fundido de salida de 120 ms y de entrada de 200 ms. Con View Transitions, el título de la fila puede transformarse en el h1 | Sin fundido |
| Artículo → «← Índice de proyectos» | Vuelve a `/#indice` y conserva el filtro (`?tipo=`). El botón atrás restaura la posición | Igual |
| Tecnologías → proyecto | La tarjeta de evidencia abre el artículo | Igual |
| Relato → salidas | En la cabecera: «Leer el proyecto completo», «Siguiente proyecto ↓» y «Saltar relatos ↓» (va a 03) | Igual |
| Menú móvil | Pantalla completa: bloquea el scroll, atrapa el foco y se cierra con ✕, Esc o al elegir una sección | Aparece sin deslizar |
| Saltar al contenido | Primer elemento enfocable de cada página, visible solo con foco de teclado | — |

### Estados de la barra global
1. **Sobre el hero:** sin fondo, con márgenes de 64 px. Texto a 14 px: JORGE · Proyectos · Notas (solo si hay notas) · Sobre mí · Contacto · CV (oro).
2. **Dentro del relato (02):** se oculta y manda la cabecera del scrollytelling, de 56 px.
3. **Desde 03 hasta 07:** queda fija, mide 56 px y usa `--bg` al 94 %. Se oculta al bajar y reaparece al subir (`translateY`, 200 ms). La sección activa va en `--heading` con un subrayado de oro de 2 px.
4. **Artículo:** igual que el estado 3, más la miga de pan, el selector de tema y el progreso de lectura.

## Hover y selección
| Elemento | Hover | Foco / selección | Transición |
|---|---|---|---|
| Botón primario | `--accent-hover` | Contorno de foco; al pulsar, escala 0,98 | Color, 150 ms |
| Enlace de acción | Se aclara | Contorno de foco | 150 ms |
| Enlace en el texto | Pasa a `--text` | Contorno de foco | 150 ms |
| Fila del índice | Fondo `--surface`, subrayado en oro | Contorno en la fila | 150 ms |
| Filtro del índice | Marfil al 4 % | `aria-pressed` | Las filas entran con fundido de 200 ms; el contador no se anima |
| Herramienta (5b) | Pasa a `--text` | Oro con filete de oro; la franja se actualiza | Opacidad, 200 ms |
| Nodo de diagrama | `--surface-hover` | Borde de oro y ficha abierta | Ficha con fundido de 150 ms |

**Foco global:** contorno de 2 px en `--accent` con 2–3 px de separación, solo con `:focus-visible`.

## Scrollytelling
- **Estructura:** cabecera del relato, rail de capítulos, una figura *sticky* y el texto, que avanza por pasos.
- **Activación:** el capítulo activo cambia cuando su paso cruza el **40 % del viewport**. Usar IntersectionObserver.
- **Capítulos:**

  | Capítulo | Estado de la figura |
  |---|---|
  | 1 | Agentes sin coordinación |
  | 2 | Aparece el orquestador |
  | 3 | El recorrido avanza paso a paso |
  | 4 | Barras de resultados |

- **Transiciones:** los nodos se mueven con transform en 240 ms, el recorrido cambia de opacidad en 150 ms y el gráfico entra con un fundido de 200 ms.
- **Modo Diagrama/Texto:**
  - un segmentado de 44 px de alto como mínimo;
  - en modo Texto, el diagrama queda `inert` y fuera del orden de tabulación;
  - la pista de uso («Selecciona un componente… Esc») solo aparece en modo Diagrama.
- **Ficha de componente:**
  - se abre en el lado opuesto al nodo, para no taparlo;
  - el foco entra en la ficha al abrirse y vuelve al nodo al cerrarse con Esc o con ✕.
- **Nodos atenuados:** no se pueden seleccionar.
- **Móvil:** la figura queda *sticky* bajo la cabecera, con alto limitado, y la ficha pasa a una hoja inferior.
- **Reduced motion:** sin elementos fijados (*pinning*). La figura aparece en cada paso, con un corte en cada cambio de estado.

## Diagramas interactivos (artículos)
- Al hacer clic o pulsar Enter/Espacio sobre un nodo, ese nodo queda seleccionado: sus aristas se resaltan y el panel o la hoja muestran Responsabilidad, Entradas/salidas, Cumple Rn y el enlace al código.
- En móvil se recorre con «Componente n de N» y los botones Anterior/Siguiente.
- **Fórmula de investigación:** al seleccionar un término, se resalta también en la figura asociada.
- **Experimento:** el control deslizante y la comparación A, B o A y B recalculan el histograma. Siempre lleva la leyenda «Datos sintéticos» mientras no haya datos reales.

## Cambio de tema (Cosmos ↔ Dawn)
- **Dónde existe:** solo en los artículos. La portada siempre es Cosmos.
- **Opciones:** Cosmos, Dawn y, en móvil, también Sistema, que sigue `prefers-color-scheme`.
- **Persistencia:** la elección se guarda en `localStorage`. Para evitar el parpadeo, el tema se resuelve **antes de pintar** con un script en línea en el `<head>` que pone `data-theme`.
- **Transición:** fundido de color de 200 ms en `background-color` y `color`.

## Hero
- Entrada al cargar y transición al relato: ver `HERO.md`.

## Reduced motion (global)
- Todas las duraciones a 0 y sin scroll suave.
- Sin elementos fijados (*pinning*) ni deriva en el hero; el hero hace scroll como un bloque normal.
- El cursor del hero no parpadea.
- Los estados del relato cambian por corte.
- **El contenido y la información son idénticos en ambos modos.**

## Estado que hay que gestionar
| Estado | Ámbito | Persistencia |
|---|---|---|
| `filtroTipo` | Índice | Query `?tipo=` |
| `herramientaSeleccionada` | 5b | Ninguna (por defecto, la primera del área 1) |
| `areaAbierta` | Acordeón móvil | Ninguna |
| `capituloActivo`, `pasoActivo` y `modoFigura` | Relato | Ninguna |
| `nodoSeleccionado` | Diagramas | Ninguna |
| `tema` | Artículos | `localStorage` |
| `menuAbierto` | Global | Ninguna |
