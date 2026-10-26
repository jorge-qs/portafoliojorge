# Páginas y secciones

La referencia visual de cada sección es `maqueta-1-portada.html`, donde cada sección de escritorio tiene notas al margen derecho. Las medidas de esta tabla son las de escritorio a 1280 px.

## Rutas
| Ruta | Página |
|---|---|
| `/` | Portada: una sola página con anclas `#proyectos #indice #sobre-mi #tecnologias #notas #contacto` |
| `/proyectos/‹slug›` | Artículo con plantilla A (ingeniería), B (investigación) o A con bloques de B (híbrido) |
| `/notas/‹slug›` | Nota: solo la columna de lectura y el margen, sin índice lateral |
| `/cv.pdf` · GitHub · LinkedIn | Enlaces externos con ↗, abiertos en una pestaña nueva |

## Portada
| # | Sección | Alto aproximado | Densidad | Clave |
|---|---|---|---|---|
| 01 | Hero | 100 vh (800 en la referencia) | Arte | Ver `HERO.md` |
| 02 | Destacados | 3 relatos × unas 4 pantallas | Alta | Sin encabezado propio: la cabecera del relato hace ese papel |
| 03 | Índice | ~ 900 | Media | 144 px por encima, para marcar el final del relato largo |
| 04 | Sobre mí | ~ 850 | Calma | Sin datos ni interacción: es una pausa |
| 05 | Tecnologías | ~ 800 | Media | Interacción 5b |
| 06 | Notas | ~ 450 | Opcional | Solo se muestra si hay publicaciones |
| 07 | Contacto | 880 | Arte | Retoma las estrellas y el gesto del hero |

### 03 Índice
- **Encabezado:** kicker «03 Todos los proyectos», h2 «Índice» y una entradilla en `--muted` de 560 px como máximo. El filtro segmentado va a la derecha, alineado abajo.
- **Columnas de las filas:**

  | Columna | Ancho |
  |---|---|
  | # | 56 |
  | Proyecto | 1fr |
  | Tipo | 150 |
  | Año | 72 |
  | Herramientas | 230 |
  | Acción | 160 |

- **Fila:** padding vertical de 22 px y filete superior. El título va a 18/500 y el resumen, a 14 en `--muted`.
- **Tablet:** las columnas pasan a 44 / 1fr / 130 / 120 y desaparecen el año y las herramientas.
- **Móvil:** cada fila se apila en este orden: código, punto, tipo y año; título a 17; resumen a 14. Los filtros pasan a fichas de 44 px que se reparten en varias líneas.

### 04 Sobre mí
- **Escritorio:** la figura ocupa las columnas 1–5 en proporción 4:5, con borde punteado mientras sea placeholder. El texto ocupa las columnas 7–12, con 40 px de separación entre bloques, en este orden:
  1. Kicker y h2.
  2. Párrafo a 17.
  3. «Preguntas que me acompañan»: una lista de 3 filas con la etiqueta a 110 px y la pregunta a 18.
  4. Trayectoria: 3 filas a 14, sin filetes.
  5. Botón CV primario, de 48 px de alto, con «Actualizado ‹mes año›».
- **Tablet:** la foto mide 240 px y queda a la izquierda; la trayectoria se pliega.
- **Móvil:** orden h2 → foto 4:3 → texto → preguntas → «Trayectoria 3 ＋» (plegada) → CV a todo el ancho.

### 05 Tecnologías (5b)
- **Escritorio:** las áreas van en 5 columnas; en cada una, el número, el nombre a 16/600 y las herramientas como botones de 40 px con su recuento. Debajo, «‹Herramienta› · aparece en N proyectos» y una franja de evidencia de 7 tarjetas de 96 px de alto como mínimo.
- **Tablet:** las áreas forman una rejilla de 3 + 2 y la franja, una de 4 columnas.
- **Móvil:** acordeón con filas de 56 px. Cada herramienta muestra los códigos de sus proyectos: hasta 4 chips y «+n».

### 06 Notas
- **Escritorio:** filas con columnas de 120 / 1fr / 140 / 120 (fecha, título a 17, tipo y «Leer →»).
- **Referencias:** el borde punteado de las maquetas indica que la sección es condicional. **No va en producción.**

### 07 Contacto
- **Escritorio:** el bloque de texto está en x = 40, y = 208 y mide 560 px de ancho. Las filas de enlace miden 60 px y se reparten en 120 / 1fr / 48. La mano está al 45 % de opacidad con `saturate(.7)`, abajo a la derecha; la terminal mide 120 × 68 y está al 85 %. El pie va a 13 px: © a la izquierda y «Tema · Volver arriba ↑» a la derecha.
- **Móvil:** el fragmento artístico ocupa una franja de 130 px arriba; debajo van filas de 56 px.

## Artículo de ingeniería (plantilla A) · Cosmos por defecto
Referencia: `maqueta-2-articulos.html` § A.
1. **Barra de 56 px:** JORGE, la miga de pan «Proyectos / Ingeniería», la navegación, el selector de tema y CV. Una barra de progreso de 2 px en `--accent` en el borde inferior.
2. **Retícula** 180 / 632 / 260. El índice lateral es *sticky* y marca el capítulo activo con fondo de marfil al 6 %.
3. **Cabecera:** etiqueta, h1 a 52 y entradilla a 20.
4. **«En un minuto»** (fondo `--accent-tint` al 8 %) junto a la ficha (`dl`), con rol, tecnologías, fecha y recursos.
5. **Capítulos:** contexto → requisitos → arquitectura (diagrama interactivo y panel de 280 px) → decisiones (tabla) → implementación (código con marcas numeradas que se explican al margen) → evaluación (figura con leyenda y metodología al margen) → limitaciones → recursos.
6. **Cierre:** tarjetas Anterior/Siguiente y pie de página.
7. **Móvil:**
   - barra con «← Proyectos», «Capítulos 5/10 ▾» y «Aa»;
   - la ficha pasa a una cuadrícula de 2 × 2;
   - el diagrama queda en miniatura con «Explorar componentes» y se abre como hoja inferior, con Anterior/Siguiente.

## Artículo de investigación (plantilla B) · se muestra en Dawn
Referencia: `maqueta-2-articulos.html` § B.
- **Igual que A:** la barra, la retícula y el cierre.
- **Ficha:** horizontal en 4 columnas (autores, afiliación, publicado y recursos: PDF y código).
- **Bloque «Pregunta de investigación»:** fondo `--res` al 8 %, la pregunta a 26/500 y debajo H1 y H0.
- **Fundamentos:** fórmula a 30 px con los términos en píldoras de color. El término seleccionado lleva un contorno de 2 px y se resalta también en la figura correspondiente.
- **Experimento interactivo:**
  - panel de controles de 260 px a la izquierda con un control deslizante y la opción de comparar A, B o A y B;
  - histograma a la derecha.
- **Resultados:** pequeños múltiplos en 3 columnas.
- **Cierre del artículo:** referencias [n] y el bloque «Citar este trabajo · BibTeX · Copiar».
- **Móvil:** la hoja «Aa» permite elegir Tema (Cosmos / Dawn / Sistema) y Reducir movimiento. El control deslizante mide 44 px de alto.

## Navegación global
- **Estados de la barra:** sobre el hero → oculta dentro del relato → fija desde 03 en adelante → versión de artículo. Ver `INTERACCIONES.md` y la Maqueta 3 § N.
- **Menú móvil:** pantalla completa, con las secciones numeradas a 24/600, la sección actual en oro, CV como botón primario y los enlaces externos al pie.
