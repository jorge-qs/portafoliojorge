# Inventario de componentes

La referencia visual con todos los estados está en `maqueta-3-sistema.html` § C.

| ID | Componente | Variantes y estados | Notas |
|---|---|---|---|
| C1 | **Encabezado de sección** | — | Kicker (número `--accent` + nombre `--muted`, 13 px) y h2 a 40. La numeración se recalcula si falta Notas |
| C2 | **Botón** | Primario (`--accent`, texto `--on-accent`, 600) · secundario (`--surface-2`) · terciario (solo texto) | Alto 48 y radio 12. Hover a `--accent-hover` o `--surface-hover`. Al pulsar, escala 0,98. **Un solo primario por vista** |
| C3 | **Enlace** | Acción (oro, con →) · en el texto (`--link`, subrayado con 3 px de separación) · externo (↗, pestaña nueva) | Hover: el oro se aclara y el azul pasa a `--text` |
| C4 | **Etiqueta de tipo** | Ingeniería · Investigación · Híbrido (punto bicolor) · `‹pendiente›` | Punto de 8 px y texto a 14. Nunca es clicable por sí sola. `‹pendiente›` no puede llegar a producción |
| C5 | **Filtro segmentado** | Escritorio: grupo con fondo `--surface` y opción activa en `--surface-2` · móvil: chips de 44 px y activa en `--accent-tint` | `aria-pressed` y recuento con `tabular-nums` |
| C6 | **Fila de índice** | Reposo · hover (fondo `--surface`, título subrayado en oro y flecha `--accent-hover`) | La fila entera es un único `<a>` |
| C7 | **Herramienta y evidencia (5b)** | Herramienta: reposo · seleccionada (oro con filete de oro) · tarjeta: activa · atenuada al 30 % | Cambio de opacidad de 200 ms |
| C8 | **Nodo de diagrama** | Reposo · hover (`--surface-hover`) · seleccionado (`--selected` con borde de oro y 600) · en recorrido (`--accent-tint`) · atenuado (40 %, **inerte**) | **Fondo sólido, siempre por encima de las aristas.** Las aristas van a 1 px con `--muted` al 40 %; las resaltadas, a 2 px en oro |
| C9 | **Rail de capítulos** | Reposo · actual (`aria-current`, oro sobre `--accent-tint`) | En móvil, 44 × 44 px |
| C10 | **Figura y bloques** | Figura (`--surface` y radio 12, leyenda numerada debajo) · nota al margen · «En un minuto» (oro al 8 %) · «Pregunta» (`--res` al 8 %) | Leyenda a 13 px. Los datos sintéticos se marcan siempre |
| C11 | **Selector de tema y progreso** | Cosmos · Dawn · (Sistema en móvil) | Solo en artículos. El progreso de lectura es una barra de 2 px, decorativa (`aria-hidden`) |
| C12 | **Acordeón y fila de contacto** | Acordeón: cerrado + / abierto − · fila de contacto con «Copiar» → «Copiado ✓» | Acordeón con filas de 56 px y `aria-expanded`. «Copiado» dura 2 s y se anuncia con `aria-live` |
| — | **Barra global** | Sobre el hero · fija · versión de artículo | Ver `INTERACCIONES.md` |
| — | **Hoja inferior (móvil)** | Diagrama · opciones de lectura «Aa» | Radio 20 y asa de 40 × 4. Atrapa el foco y se cierra con Esc |
| — | **Ventana de terminal (hero)** | Normal · punta | Ver `HERO.md` L3/L4 |
