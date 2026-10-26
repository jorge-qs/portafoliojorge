# Bugs conocidos del prototipo de scrollytelling (no replicar)

`design/referencias/scrollytelling-v1.html` es la referencia de **diseño** aprobada. Su código tiene estos problemas, detectados en el diagnóstico de la Fase 3. La implementación debe resolverlos.

| # | Problema en el prototipo | Comportamiento correcto |
|---|---|---|
| 1 | Las aristas se ven a través de los nodos, porque estos tienen el fondo semitransparente | Fondo sólido en los nodos, que siempre van por encima de las aristas |
| 2 | La leyenda del capítulo 4 se corta a unos 920 px | La leyenda pasa a dos líneas; nunca se desborda |
| 3 | En modo Texto, los botones del diagrama oculto siguen siendo alcanzables con el teclado | El diagrama oculto queda `inert` |
| 4 | La ficha tapa el diagrama y no gestiona el foco | La ficha se abre en el lado opuesto al nodo. El foco entra al abrirla y vuelve al nodo al cerrarla |
| 5 | La pista «Selecciona un componente… Esc» aparece también en modo Texto | Esa pista solo aparece en modo Diagrama |
| 6 | En el capítulo 3 se pueden seleccionar nodos atenuados | Los nodos atenuados son inertes |
| 7 | El segmentado Diagrama/Texto mide 38 px en móvil | 44 px como mínimo |

**Sin verificar en el prototipo:**
- reduced motion con la preferencia del sistema activada;
- «Siguiente proyecto» y «Volver al capítulo 1»;
- pantallas de 1180 px o más;
- lectores de pantalla reales.
