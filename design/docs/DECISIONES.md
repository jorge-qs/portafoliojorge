# Decisiones de diseño

Registro de lo aprobado, con su motivo y lo que se descartó. Si una implementación parece contradecir algo de aquí, gana este documento.

## Identidad
- **Lenguaje:** Kairos, con el tema Cosmos (azul noche, marfil y oro apagado) por defecto y Dawn (papel claro) para leer artículos. La tipografía es Geist y, para el código y las terminales, Geist Mono.
- **Tono:** editorial, con mucho espacio negativo. Las secciones densas se alternan con secciones tranquilas.
- **Industry no se usa.** Estuvo vinculado al proyecto de diseño, pero nunca formó parte de la dirección.

## Hero (Fase 5A)
- **Combinación aprobada:**
  - layout de **Cercano (2c)**;
  - estructura anatómica implícita de **Anatomía (3a)**;
  - variación de escalas y espacio negativo de **Gesto (3c)**.
- **Mano humana:** pictórica y renacentista. Entra por la derecha y no se gira.
- **Mano artificial:** unas 31 ventanas de terminal independientes, **sin una mano sólida debajo**. Se reconocen el antebrazo, el carpo, la palma, los metacarpos y las falanges. La punta del índice es la única ventana más clara, con un punto y un cursor de oro.
- **Punto de encuentro:** al 53 % del ancho y al 43 % del alto en escritorio, con un hueco de 56 px entre las puntas.
- **Relato:** al cargar, la mano se arma desde el antebrazo hasta la punta. Al hacer scroll, se desarma en agentes sueltos, que es el problema que plantea el capítulo 1 del primer proyecto.

## Proyectos destacados (Fase 3)
- Scrollytelling de cuatro capítulos por proyecto: problema → orquestador → recorrido → resultados.
- La figura queda fija en pantalla y el texto avanza a su lado.
- Tiene un modo Diagrama/Texto con una versión textual equivalente.
- Se aprobó como referencia de diseño. Sus bugs **no** se corrigieron en el prototipo y no deben replicarse (ver `BUGS_CONOCIDOS.md`).

## Índice (3a, aprobado)
- Una lista editorial en lugar de una cuadrícula de tarjetas, porque se recorre y se compara más rápido.
- Un solo filtro, por tipo: Todos, Ingeniería, Investigación, Híbridos, con los totales.
- Los destacados llevan además «ver relato ↑».
- El filtro por tecnología llega desde la sección 05.

## Sobre mí (4a + preguntas de 4b)
- Retrato editorial: la foto, opcional, ocupa 5 de 12 columnas y el texto, las columnas 7 a 12. Sin foto, el texto se centra en 8 columnas.
- Las **2–3 preguntas que me acompañan** (Ingeniería, Investigación y una Abierta opcional) sustituyen a las listas de intereses, para que la sección no crezca.
- Trayectoria discreta: tres líneas de 14 px, sin logotipos. En móvil queda plegada.
- Que no parezca LinkedIn ni un CV resumido, ni resulte excesivamente académica.

## Tecnologías (5b, aprobado; 5a descartado)
- Tres capas: las **cinco áreas** (lo primero que se lee) → las herramientas, con el recuento de proyectos → la franja de evidencia, con los 7 proyectos y los que no aplican atenuados al 30 %.
- **Sin barras de porcentaje ni puntuaciones.** El número que se muestra es un recuento que se puede verificar en el índice.
- La matriz 5a se descartó como diseño principal porque no escala más allá de unos 10 proyectos.
- En móvil, las áreas pasan a un acordeón.

## Notas (opcional)
- Usa el mismo patrón de lista que el índice: fecha, título y tipo, con un máximo de 3 notas en la portada y «Todas las notas →».
- **Si no hay publicaciones, la sección no se renderiza** y los números de las secciones siguientes se recalculan.

## Contacto (7a, aprobado como base)
- Fragmento artístico: una terminal y la punta de la mano humana, con un hueco de unos 12 px que repite el del hero.
- **La imagen queda por debajo de los enlaces:** mano al 45 %, terminal pequeña y enlaces con el máximo contraste.
- Las estrellas reaparecen por primera vez desde el hero.
- Cuatro filas: Correo (con «Copiar»), GitHub ↗, LinkedIn ↗ y CV ↓.

## Artículos
- Retícula de 180 / 632 / 260 px: índice lateral, columna de lectura de unos 65 caracteres y margen para notas.
- Ingeniería: bloque «En un minuto», ficha, arquitectura interactiva, decisiones, código anotado y evaluación.
- Investigación: pregunta, fundamentos con fórmulas cuyos términos se resaltan, experimento interactivo, resultados en pequeños múltiplos, referencias y «Citar».
- Los artículos de investigación viven en **Proyectos**, no en Notas. La miga de pan es «Proyectos / Investigación».

## Resueltas en la consolidación
| Tema | Decisión |
|---|---|
| Ingeniería: oro o bronce | Bronce #B08C5C para la etiqueta; el oro solo para acción, activo y foco. Confirmado por Jorge el 2026-10-25 |
| Azul de enlace frente a azul de Investigación | Los enlaces en el texto van subrayados; las etiquetas nunca son clicables |
| Barras dentro del relato | La barra global se oculta en 02 y manda la cabecera del relato |
| Ancho móvil | Se diseña a 390 px y se verifica a 360 px |
| Espacio entre secciones | 144 px antes del índice y 160 px en las demás (tablet 128–144, móvil 96) |
| Radios | 12 px en elementos sueltos y 8–10 px dentro de un grupo |
| Código | Geist Mono 13 / 1,75 |
| Curvas de animación | Las cúbicas de `tokens.css`: ease-out (.215, .61, .355, 1) y ease-in-out (.645, .045, .355, 1). Elegidas por Jorge el 2026-10-25 frente a las del Personal OS |
| «Tema» en el pie de la portada | Se quita: la portada es siempre Cosmos. El control de tema solo existe en los artículos. Confirmado por Jorge el 2026-10-25 |
| Evidencia atenuada (5b) | El texto de las tarjetas que no aplican va en `--muted` y solo el punto decorativo usa el 30 %. Atenuar toda la tarjeta dejaba el texto en 1,6:1 (incumple AA). 2026-10-26 |
| Selector de idioma (D2) | Texto «ES · EN» a 14 px en la barra, a la izquierda de CV, con el activo en `--heading`. En móvil, en el menú y en la hoja «Aa». Sin recordar la elección ni redirigir. Jorge, 2026-10-26 |
| Idiomas de la v1 (D3) | Español + inglés. Más idiomas, después, sin tocar componentes. Jorge, 2026-10-26 |
| Idiomas | Español como base y el sitio preparado para varios idiomas. Ver `docs/ARQUITECTURA.md` § Enmiendas. Decidido el 2026-10-25 |
