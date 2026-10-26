# Evidencia visual F1

Capturas de Chromium sobre el build estático. Cada fila empareja el componente implementado con su referencia, abierta por HTTP local sin conexiones externas. Se capturan los estados finales de las animaciones; los e2e verifican por separado las duraciones y el modo reducido.

| Estado y ancho | Sitio | Maqueta equivalente |
|---|---|---|
| Hero · 1280 | ![Sitio](sitio-hero-1280.png) | ![Maqueta 1](maqueta-hero-1280.png) |
| Hero · 834 | ![Sitio](sitio-hero-834.png) | ![Maqueta 1](maqueta-hero-834.png) |
| Hero · 390 | ![Sitio](sitio-hero-390.png) | ![Maqueta 1](maqueta-hero-390.png) |
| Fija · 1280 | ![Sitio](sitio-fija-1280.png) | ![Maqueta 3 N3](maqueta-fija.png) |
| Fija · 834 | ![Sitio](sitio-fija-834.png) | ![Maqueta 3 N3](maqueta-fija.png) |
| Fija · 390 | ![Sitio](sitio-fija-390.png) | ![Maqueta 3 N3](maqueta-fija.png) |
| Artículo · 1280 | ![Sitio](sitio-articulo-1280.png) | ![Maqueta 2 A](maqueta-articulo.png) |
| Artículo · 834 | ![Sitio](sitio-articulo-834.png) | ![Maqueta 2 A](maqueta-articulo.png) |
| Artículo · 390 | ![Sitio](sitio-articulo-390.png) | ![Maqueta 2 A](maqueta-articulo.png) |
| Menú · 1280 (estado forzado) | ![Sitio](sitio-menu-1280.png) | ![Maqueta 3 N](maqueta-menu.png) |
| Menú · 834 (estado forzado) | ![Sitio](sitio-menu-834.png) | ![Maqueta 3 N](maqueta-menu.png) |
| Menú · 390 | ![Sitio](sitio-menu-390.png) | ![Maqueta 3 N](maqueta-menu.png) |

El menú se ofrece únicamente por debajo de 768 px: la Maqueta 1 mantiene navegación de escritorio a 834. Para documentar el componente a 1280 y 834, el script abre el diálogo directamente; esas dos imágenes no representan un botón disponible a dichos tamaños. Las pruebas de menú de los proyectos escritorio/tablet comprueban primero que el botón está oculto y cambian a 390 px para ejercitarlo.

Las maquetas solo ofrecen versiones de escritorio de la barra fija y la barra de artículo, y una versión de 390 del menú; se conservan sus tamaños originales en las comparaciones, sin inventar maquetas responsive. También se guardan [N1](maqueta-sistema-hero.png) y [N4](maqueta-sistema-articulo.png).

| Pie y ancho | Sitio | Maqueta equivalente |
|---|---|---|
| Portada · 1280 | ![Sitio](sitio-pie-1280.png) | ![Maqueta 1](maqueta-pie-1280.png) |
| Portada · 834 | ![Sitio](sitio-pie-834.png) | ![Maqueta 1](maqueta-pie-834.png) |
| Portada · 390 | ![Sitio](sitio-pie-390.png) | ![Maqueta 1](maqueta-pie-390.png) |
| Artículo · 1280 | ![Sitio](sitio-pie-articulo-1280.png) | ![Maqueta 2](maqueta-pie-articulo.png) |
| Artículo · 834 | ![Sitio](sitio-pie-articulo-834.png) | ![Maqueta 2](maqueta-pie-articulo.png) |
| Artículo · 390 | ![Sitio](sitio-pie-articulo-390.png) | ![Maqueta 2](maqueta-pie-articulo.png) |

Movimiento reducido: [barra fija](sitio-fija-390-reduce.png) y [menú](sitio-menu-390-reduce.png). A 360 px se comprueban ambos tipos de página y el menú mediante e2e.

Diferencias previstas por el encargo: sin Notas ni control de tema en portada; Contacto pasa a 06; selector y progreso de artículo vacíos hasta F3; contenido de hero y secciones reservado. Los números inactivos del menú usan `--muted`, pues el oro queda reservado a acción, activo y foco. En tablet se aplican los márgenes de 32 px de TOKENS.md, por encima de los 40 px que dibuja el hero importado por la Maqueta 1. Los enlaces del pie móvil conservan áreas táctiles de 44 px, aunque la maqueta los representa solo como texto.

Para regenerar, después de `npm run build`:

```sh
PLAYWRIGHT_BROWSERS_PATH=.cache/ms-playwright node scripts/capturar-f1.mjs
```

El script sirve `dist/` en 4321 y las referencias con `python3 -m http.server` en 4322; cierra sus servidores al terminar. También comprueba «Volver arriba» y su foco en los tres anchos.
