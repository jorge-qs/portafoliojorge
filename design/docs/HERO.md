# Hero — Especificación artística

Referencia: `design/referencias/hero-final.html`. La geometría exacta está en `design/fuente/hero-arte.dc.html`, método `base()`, que es JavaScript legible.

## Composición (escritorio, 1280 × 800)
- **Punto de encuentro** (M): al 53 % del ancho y al 43 % del alto. El hueco entre las puntas es de 56 px.
- **Mano artificial:** se dibuja en su propio espacio de 1000 × 460 con la punta del índice en (812, 197). Ese espacio se coloca de modo que la punta quede en M − hueco/2, y se gira −4° y se escala ×1,2 **desde la punta**.
- **Mano humana:** imagen de 540 × 320 con la punta del índice en (14, 170). Se escala por k = 1,26 × escala y la punta queda en M + hueco/2. No se gira.
- **Texto (layout 2c):**
  - «Jorge» a 96/600, abajo a la izquierda (x 64, a 56 del borde inferior), con el rol a 15 en `--muted` encima;
  - la frase a 17 y «Ver proyectos ↓» en oro, abajo a la derecha (a 64 de ambos bordes), con 300 px de ancho como máximo.
- **Navegación:** arriba, con padding de 28 / 64.

## Anatomía de la mano artificial (unas 31 ventanas)
Cada ventana se define como un segmento: centro, largo − 9 px, grosor y ángulo.

| Parte | Ventanas | Notas |
|---|---|---|
| Antebrazo | 2 (radio y cúbito), 482 × 62 / 52 | Registros largos que se funden: máscara lineal de transparente a opaco hacia la mano |
| Carpo | 7 mínimas, de 20–22 × 22–24 | Sin texto |
| Metacarpos | 4 + el del pulgar | El del índice es la más grande: «kairos · planner» |
| Pulgar | 2 falanges | — |
| Índice | 3 falanges, de 30 → 25 → 21 | La última es la **punta**: «coder» con cursor ▍ |
| Medio, anular y meñique | 3 / 2 / 2 falanges | Se curvan hacia abajo, en reposo |

**Variación orgánica (Gesto 3c):** cada ventana tiene ±5 % de ancho, ±6 % de alto y ±1,2° de giro aleatorios, con semilla fija.

**Ventana:**
- **Cuerpo:** fondo `--surface-2` (#151A25) y radio de hasta 6 px.
- **Cabecera:** marfil al 9 %, de 30 % del alto de la ventana y 12 px como máximo, con un punto y el nombre.
- **Texto interior:** Geist Mono.
- **Luz:** la opacidad crece de **38 %** en el antebrazo a **100 %** en la punta, siguiendo una curva de potencia 1,3 sobre la posición x.
- **Punta:** fondo con un 7 % más de marfil, punto de oro y cursor de oro.
- **Logotipos:** no hay. Si se añaden, serán glifos monocromos de 8 px en 3 o 4 cabeceras como máximo, nunca en la punta.

## Capas (de atrás hacia delante)
| Capa | Elemento | Medio | Movimiento |
|---|---|---|---|
| L0 | Fondo #0A0D14 | Color sólido que continúa sin corte en 02 | — |
| L1 | Estrellas | SVG o canvas con semilla fija: 60 / 50 / 32 puntos de 1–2 px, en marfil o gris al 15–45 %, y un 6 % en oro a 2,2 px. Ninguna dentro del círculo de encuentro | Fundido de 0 a 0,6 s y paralaje de −40 px en la transición |
| L2 | Mano humana | WebP o AVIF a 2× con alfa. Filtro: sepia .18, saturación .85, brillo .96 | Entra de 0,2 a 1,1 s (opacidad y −28 px); en la transición se desplaza +110 px y se apaga |
| L3 | Mano de terminales | HTML con un nodo por ventana | Entrada escalonada de 0,6 a 1,85 s, del antebrazo a la punta: 0,35 s por ventana, opacidad y +6 px |
| L4 | Punta y cursor | Parte de L3 | Visible desde 1,7 s, dos parpadeos (1,9 y 2,3 s) y luego fijo |
| L5 | Navegación | HTML | Fundido de 0 a 0,4 s. Usable desde el primer momento |
| L6 | Nombre, frase y acceso | HTML, con h1 «Jorge» | Entra de 1,8 a 2,3 s (opacidad y +8 px). L1–L4 llevan `aria-hidden` y una descripción alternativa oculta visualmente |

## Transición al scrollytelling
- **Fijación:** el hero queda fijo durante **60 vh** de scroll; en móvil, 40 vh. La variable p va de 0 a 1.
- **Entre p = 0 y 0,5:**
  - el texto se desvanece y sube 30 px;
  - cada ventana deriva entre 26 y 86 px en dirección radial desde la palma (520, 255), ±12 px de ruido, y gira ±8°;
  - la opacidad de las ventanas cae al 8 %;
  - la mano humana se desplaza +110 px y se apaga;
  - las estrellas suben 40 px.
- **Entre p = 0,5 y 1:** el capítulo 1 entra desde abajo, 40 px → 0, con un fundido.
- **Después:** el scroll sigue con normalidad. Al subir, la mano se rearma por el mismo camino.
- **Móvil:** la deriva se reduce a la mitad.
- **Reduced motion:** sin fijación; el hero hace scroll como un bloque normal.

## Responsive
**La composición se escala desde M, nunca desde una esquina.**

| Rango | M (x / y) | Escala | Hueco | Giro | Texto |
|---|---|---|---|---|---|
| ≥ 1200 | 53 / 43 % | 1,2 | 56 | −4° | Layout 2c (dos esquinas) |
| 768–1199 | 54 / 40 % | 0,8 | 40 | −5° | Bloque apilado abajo, nombre a 88 |
| < 768 | 55 / 37 % | 0,44 | 24 | −6° | Apilado, nombre a 56. El antebrazo queda fuera; las ventanas pierden el texto y conservan cabecera y punto. La punta mantiene el cursor |
| Horizontal o alto < 560 | 52 / 46 % | Como tablet | — | — | Nombre a 48 |

**Mínimos:**
- El hueco nunca baja de 20 px.
- La punta nunca mide menos de 8 px de alto.
- El círculo de 2 × hueco alrededor de M queda siempre dentro del encuadre y fuera de la zona de texto.
