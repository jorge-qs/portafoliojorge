# F7 · Segundo idioma (inglés)

**Estado:** aprobada
**Rama solicitada:** `f7-idiomas`, desde `main` · **Checkout de trabajo:** `F7` (Git no permitió crear la rama) · **Depende de:** F6 (en `main`) · **Escrito por:** Claude · **Fecha:** 2026-10-26

> Cómo lanzarlo en Codex: *«Lee AGENTS.md y docs/encargos/F7-idiomas.md. Implementa solo ese encargo y termina con el informe que pide.»*

> **Este encargo es largo a propósito.** Dice qué archivos tocar, en qué orden y cómo comprobar cada cosa. Si algo no está aquí ni en las fuentes que se citan, **no lo inventes**: pregúntalo en el informe.

---

## 1. Qué hay que construir
El sitio completo en **inglés**, en `/en/…`, con el español como base en la raíz (`/…`), que ya existe. Incluye:

- un **selector «ES · EN»**, que lleva a la misma página en el otro idioma;
- el contenido semilla traducido;
- el **respaldo al español** donde falte traducción, con su aviso;
- `hreflang`, canonical y `lang` correctos.

## 2. Decisiones ya tomadas (no las cambies)
| # | Decisión | Fuente |
|---|---|---|
| 1 | Español en la raíz sin prefijo; inglés en `/en/…` | `docs/ARQUITECTURA.md` § Enmiendas A2 |
| 2 | **Sin redirección automática** por idioma del navegador y **sin recordar** el idioma elegido: se cambia solo con el selector | A2 |
| 3 | Solo **ES + EN** en esta fase | Jorge, 2026-10-26 |
| 4 | **Selector «ES · EN» en texto**, a 14 px en la barra, a la izquierda de CV. El activo va en `--heading` con `aria-current`; el otro, en `--muted`. En móvil: en el menú a pantalla completa y en la hoja «Aa» de los artículos | Jorge, 2026-10-26 (D2) |
| 5 | Si un contenido no tiene traducción, se muestra en español con el aviso de la clave existente `idiomaRespaldo` («Available in Spanish only.») (casuística C2) | `docs/ARQUITECTURA.md` § 6.2 |
| 6 | Los **identificadores de sección** (`#indice`, `#sobre-mi`, `#relato-…`) y los **slugs** son iguales en los dos idiomas. Solo cambia el prefijo `/en` | este encargo |

## 3. Orden de trabajo (obligatorio)
Al terminar cada paso: `npm run check && npm test`, y **una línea en el Informe** (regla 5 de `AGENTS.md`).

1. **Idioma en los componentes** (§ 5): ningún componente puede depender de `'es'` fijo.
2. **Contenido con respaldo** (§ 6): helpers genéricos por colección.
3. **Páginas en inglés** (§ 7): vistas compartidas y envoltorios en `src/pages/en/`.
4. **Contenido semilla en inglés** (§ 8).
5. **Selector de idioma** (§ 9).
6. **Aviso de respaldo, `hreflang`, canonical y `lang`** (§ 10).
7. **Tests e2e y capturas** (§ 11 y § 12).

## 4. Leer antes
- `AGENTS.md`, **completo** (reglas 1, 8 y 9; § Forma de trabajar 5–7).
- `docs/ARQUITECTURA.md` § Enmiendas (A2, A8) y § 6.2 (casuísticas I1–I4 y C2).
- `design/docs/COMPONENTES.md` C3 (enlaces) y C11 (selector de tema: el selector de idioma **imita su tipografía y sus estados**, pero es texto, sin segmentado).
- `design/docs/INTERACCIONES.md` § Estados de la barra global y § Menú móvil.
- Código que ya existe:
  - `src/i18n/config.ts`: `IDIOMA_BASE`, `IDIOMAS_ACTIVOS` (hoy `['es']`) e `IDIOMAS_PREPARADOS`;
  - `src/i18n/index.ts`: `t()`, `ruta()` y `formatearFecha()`;
  - `astro.config.ts` § `i18n`: ya lee `IDIOMAS_ACTIVOS`;
  - `src/content/consultas.ts` (`obtenerProyectos` con respaldo) y `src/content/validacion.ts` (`seleccionarProyectos`, `esRespaldo`);
  - `tests/i18n.test.ts`: ya comprueba la paridad de claves y el respaldo con `['es','en']` simulado;
  - `src/components/BarraGlobal.astro`, `MenuMovil.astro`, `PiePagina.astro`, `src/layouts/BaseLayout.astro` y `src/lib/hojas.ts` (la hoja «Aa»).

## 5. Paso 1 · Idioma en los componentes
**Problema real:** hoy, si se renderiza una página en inglés, muchas partes saldrían en español **sin dar error**:
- **14 componentes** de `src/components/articulo/` tienen `idioma = 'es'` como valor por defecto: `Diagrama`, `Citar`, `Formula`, `EnUnMinuto`, `Tabla`, `Pregunta`, `CodigoAnotado`, `Figura`, `Codigo`, `Experimento`, `Referencias`, `Ficha`, `TablaDecisiones` y `Capitulo` (este usa `Astro.currentLocale ?? 'es'`);
- `src/layouts/BaseLayout.astro` lee `getEntry('perfil', 'es')` con el español fijo;
- `src/pages/index.astro`, `proyectos/[slug].astro` y `404.astro` usan `IDIOMA_BASE` como idioma de página.

**Qué hacer:**
1. Crea `src/i18n/actual.ts` con `idiomaDe(astro: { currentLocale?: string })`, que devuelve `Idioma`: `currentLocale` si es un idioma activo y, si no, `IDIOMA_BASE`.
2. En los 14 componentes, **quita el valor por defecto `'es'`**: usa `idioma ?? idiomaDe(Astro)`. Los componentes de MDX no reciben `idioma` desde el MDX, así que **deben** deducirlo de `Astro.currentLocale`.
3. En `BaseLayout`, el perfil se lee con respaldo, mediante el helper del § 6.
4. **Test de guardia** (`tests/idioma-fijo.test.ts`): recorre `src/components`, `src/layouts` y `src/lib` y falla si encuentra `'es'` o `"es"` como literal de idioma (`= 'es'`, `?? 'es'`, `getEntry(…, 'es')`). Solo pueden contenerlo `src/i18n/config.ts` y los tests.

## 6. Paso 2 · Contenido con respaldo
Crea en `src/content/consultas.ts` **un helper genérico** y úsalo en todas partes:
```ts
// Devuelve la entrada del idioma pedido o, si falta, la del español, con esRespaldo.
export async function obtenerConRespaldo<C extends 'perfil' | 'tecnologias' | 'portada' | 'hero'>(
  coleccion: C, idioma: Idioma,
): Promise<{ data: …; esRespaldo: boolean }>
```
- `perfil`, `tecnologias`, `portada` y `hero` tienen un JSON por idioma (`es.json`, `en.json`).
- `relatos` tiene un archivo por slug y por idioma (`relatos/en/<slug>.json`). Crea `obtenerRelato(slug, idioma)` con respaldo.
- `notas`: aplica la misma regla que `obtenerProyectos` (hoy está vacía, pero tiene que funcionar). Crea `obtenerNotas(idioma)`.
- **Validaciones cruzadas por idioma:**
  - las herramientas de `proyectos/en/*.mdx` se comparan con `tecnologias/en.json`, o con la de `es` si falta;
  - cada destacado en inglés debe tener `relatos/en/<slug>.json` **o** su respaldo en español.

  Revisa `validarRelaciones()` y `validarRelatos()`: si dan por supuesto `es`, adáptalas sin cambiar su comportamiento para `es`.

## 7. Paso 3 · Páginas en inglés
Astro, con `prefixDefaultLocale: false`, necesita archivos en `src/pages/en/`. Para no duplicar código:

1. **Mueve el cuerpo** de cada página a una «vista» en `src/vistas/`, que recibe `idioma`:
   - `src/pages/index.astro` → `src/vistas/Portada.astro`;
   - `src/pages/proyectos/[slug].astro` → `src/vistas/Proyecto.astro`; el `getStaticPaths` se queda en la página y pasa `idioma`;
   - `src/pages/notas/[slug].astro` → `src/vistas/Nota.astro`.
2. **Envoltorios** finos:

   | Ruta | Archivo | Idioma |
   |---|---|---|
   | `/` | `src/pages/index.astro` | `es` |
   | `/en/` | `src/pages/en/index.astro` | `en` |
   | `/proyectos/<slug>/` | `src/pages/proyectos/[slug].astro` | `es` |
   | `/en/proyectos/<slug>/` | `src/pages/en/proyectos/[slug].astro` | `en`. **Uno por cada proyecto**, aunque no tenga traducción (respaldo) |
   | `/notas/<slug>/` y `/en/notas/<slug>/` | igual | |

3. **`404.astro`:** Astro genera una sola. Hazla **bilingüe**, con el texto en los dos idiomas (`t('es', …)` y `t('en', …)`, cada bloque con su `lang`), con enlaces a `/` y a `/en/`.
4. En `src/i18n/config.ts`, `IDIOMAS_ACTIVOS = ['es', 'en']`.
5. **Todos los enlaces internos** se construyen con `ruta(idioma, …)`. Busca rutas escritas a mano (`href="/`, `` `/proyectos/ ``, `'/#'`) en `src/` y sustitúyelas. Las anclas de la misma página (`#indice`) se quedan como están.

## 8. Paso 4 · Contenido semilla en inglés
**Regla:** traducir **fielmente** lo que hay, sin añadir ni quitar información. Los placeholders se traducen (`‹una línea›` → `‹one line›`). Los nombres propios, las herramientas y los textos técnicos de las terminales **no** se traducen. **Todo** lo traducido lleva `borrador: true`. Jorge revisará la traducción.

| Origen (ES) | Destino (EN) | Notas |
|---|---|---|
| `perfil/es.json` | `perfil/en.json` | `nombre` y `nombre_corto` iguales; `rol_hero`: «AI Engineer · data scientist · researcher»; traduce la frase y las preguntas |
| `tecnologias/es.json` | `tecnologias/en.json` | Las áreas ya están en inglés; las herramientas, **idénticas** |
| `portada/es.json` | `portada/en.json` | |
| `hero/es.json` | `hero/en.json` | **Copia literal**: son textos técnicos ilustrativos (siguen con `ilustrativo: true`) |
| `relatos/es/*.json` | `relatos/en/*.json` | Los 3. Traduce los títulos, los textos, los pasos, las etiquetas y `equivalente_texto`; los `id` de nodos y los valores, iguales |
| `proyectos/es/*.mdx` | `proyectos/en/*.mdx` | **Traduce 6 de 7.** Deja **`proyecto-07` sin versión inglesa** a propósito, para ejercitar el respaldo (C2). El frontmatter es igual, salvo los textos |
| `src/content/articulos/semilla.ts` | — | Hoy solo tiene textos en español. Conviértelo en `semilla(idioma)` o en un objeto `{ es, en }`, y que los MDX de cada idioma usen el suyo |

`npm run contenido:pendientes` debe contar también los archivos `en`.

## 9. Paso 5 · Selector de idioma
**Componente nuevo** `src/components/SelectorIdioma.astro`:
```html
<div class="selector-idioma" role="group" aria-label="{t(idioma,'idioma.etiqueta')}">
  <a href="/ruta-es" hreflang="es" lang="es" aria-current="true|undefined">ES</a>
  <span aria-hidden="true">·</span>
  <a href="/en/ruta" hreflang="en" lang="en">EN</a>
</div>
```
- **Destino:** la **misma página** en el otro idioma (casuística I2): `/proyectos/x/` ↔ `/en/proyectos/x/` y `/` ↔ `/en/`. Calcúlalo en el servidor a partir de la ruta actual; crea `rutaEquivalente(rutaActual, idiomaDestino)` en `src/i18n/index.ts`, con tests.
- **El hash y la query:** con JS, un pequeño script añade al enlace el `location.hash` y el `location.search` actuales (por ejemplo, cambiar de idioma en `#indice?tipo=ing` conserva los dos). Sin JS, lleva a la página sin hash.
- **Estilo:**
  - 14 px, el activo en `--heading` y el otro en `--muted`, con hover `--text` en `--dur-fast`;
  - el foco, el de siempre;
  - el separador «·» en `--muted`;
  - **sin** fondo, borde ni subrayado en reposo, con el mismo ritmo que los enlaces de la barra.
- **El idioma activo no navega:** lleva `aria-current="true"` y se pinta como texto.
- **Accesibilidad:** cada enlace con su `lang` y su `hreflang`, y el grupo con `aria-label` («Idioma» / «Language»).

**Dónde va:**
1. **Barra global, escritorio y tablet**, en todos sus estados: a la **izquierda de CV**, con la separación de los enlaces de la barra (`--nav-link-gap`).
   - En el estado `relato` la barra está oculta: no hay que hacer nada.
   - En la barra compacta de artículo a 834 px (F3) también va, junto a CV.
   - **Comprueba que la barra no salta de línea ni pasa de 56 px** a 1200, 1024, 834 y 768 px.
2. **Menú móvil** (`MenuMovil.astro`): una fila al pie, debajo de los enlaces externos: «Idioma» / «Language» y el selector, con objetivos de **44 × 44 px**.
3. **Hoja «Aa»** de los artículos (`src/lib/hojas.ts` y su marcado): un apartado «Idioma» / «Language» con el selector, de 44 px.

**No** se guarda la elección y **no** hay redirección (decisión 2).

## 10. Paso 6 · Aviso de respaldo, hreflang, canonical y lang
1. **`<html lang>`** = el idioma de la página.
2. **Contenido de respaldo** (un proyecto o nota en español servido en `/en/…`):
   - arriba del artículo, un aviso con `role="note"`: `t('en','idiomaRespaldo')` → «Available in Spanish only.» (la clave ya existe en los dos JSON: reutilízala). Estilo de nota: 14 px, `--muted` y fondo `--surface`, con el radio de los bloques;
   - el contenedor del artículo lleva **`lang="es"`**, para que los lectores de pantalla pronuncien en español;
   - en el **índice** en inglés, la fila de un proyecto de respaldo lleva `lang="es"` en el título y el resumen, más la etiqueta pequeña «ES» (texto `--muted`, 13 px) junto al tipo.
3. **`hreflang`** en el `<head>` de **cada** página:
   - `<link rel="alternate" hreflang="es" href="https://…/ruta">`, la misma con `en` y `hreflang="x-default"` apuntando a la versión en español;
   - **solo** para las versiones que existen de verdad: un proyecto de respaldo **no** declara una alternativa `en`.
   - La URL absoluta usa `Astro.site`. Si `site` no está configurado en `astro.config.ts`, añade `site: 'https://example.com'` con el comentario `// TODO(F8): dominio real (D5)`, y anótalo en el informe.
4. **Canonical:** cada página apunta a sí misma, **salvo** las de respaldo (`/en/proyectos/proyecto-07/`), que apuntan a su versión en español.
5. **Fechas y números:** se formatean siempre con `formatearFecha(idioma, …)` y `Intl` del idioma de la página. Busca los usos y comprueba que pasan el idioma correcto.

## 11. Tests
**Unitarios:**
- `rutaEquivalente`, en los dos sentidos, con raíz, proyecto, nota, barra final y sin ella;
- `obtenerConRespaldo`, para cada colección;
- `obtenerRelato` con respaldo;
- el test de guardia del § 5;
- la paridad de claves i18n (ya existe).

**e2e** (`tests/e2e/idiomas.spec.ts`), en los tres tamaños:
- `/en/` tiene `lang="en"`, y los textos de la barra, el índice, Sobre mí, Tecnologías, Contacto y el pie están en inglés. Comprueba una muestra de claves i18n concretas: por ejemplo, el h2 del índice y «Skip to content».
- **Rastreador de enlaces:** en `/en/` y en `/en/proyectos/coordinacion-multiagente/`, **todos** los `href` internos empiezan por `/en/` o son anclas (`#…`), salvo el enlace «ES» del selector y los recursos estáticos.
- **Selector:**
  - en `/proyectos/proyecto-02/`, «EN» lleva a `/en/proyectos/proyecto-02/` y «ES» vuelve;
  - en la portada, con `#indice` y `?tipo=ing`, cambiar de idioma conserva los dos;
  - el idioma activo tiene `aria-current`.
- **Respaldo:** `/en/proyectos/proyecto-07/` muestra el aviso, el artículo tiene `lang="es"`, el canonical apunta a `/proyectos/proyecto-07/` y **no** hay `hreflang="en"`.
- **`hreflang`:** en `/` y en `/en/` las alternativas son recíprocas, y `x-default` apunta a la versión en español.
- **Barra:** a 1200, 1024, 834 y 768 px, la barra mide 56 px (±0,5) y no salta de línea, en la portada y en un artículo.
- **Móvil:** el selector del menú y el de la hoja «Aa» miden ≥ 44 × 44 px (con `TACTIL_MIN`), y no hay scroll horizontal a 360 px.
- **Tema:** en `/en/proyectos/…` el tema elegido persiste igual que en español, y `/en/` es siempre Cosmos.
- **axe** sin violaciones en `/en/`, en un artículo en inglés y en el de respaldo, en Cosmos y en Dawn.
- **Todo lo anterior sigue pasando en español:** la suite actual completa, sin regresiones.

Aplica la regla 6 de `AGENTS.md` (pruebas robustas) y, antes de entregar, ejecuta `npm run e2e -- -g "idioma" --repeat-each=5`.

## 12. Capturas (`docs/encargos/capturas/F7/`)
- La barra con el selector, a 1280, 1024 y 834 px, en la portada (estado `fija`) y en un artículo.
- El menú móvil con el selector, a 390 px.
- La hoja «Aa» con el apartado Idioma, a 390 px.
- `/en/` arriba del todo (el hero en inglés) y en el índice, a 1280 px.
- El artículo de respaldo con su aviso, a 1280 y 390 px.
- Un `comparacion.html` que las muestre juntas.

## 13. No incluye
- Portugués u otros idiomas.
- Revisar la calidad de las traducciones: lo hace Jorge.
- `sitemap.xml`, OG por idioma y el dominio real (F8).
- Redirección por idioma del navegador y recordar la elección (decisión 2).
- La selección de nodos del relato (F5.1).

## 14. Trampas conocidas
1. **`Astro.currentLocale` en MDX:** los componentes usados dentro de un `.mdx` no reciben props de idioma. Si `currentLocale` no llega, el componente sale en español **sin error**. Por eso el test de guardia del § 5 y los e2e de textos en inglés.
2. **`getStaticPaths` en inglés debe incluir los proyectos sin traducción** (con respaldo); si no, `/en/proyectos/proyecto-07/` da 404 y el selector rompe.
3. **No dupliques las vistas:** si copias `index.astro` a `en/index.astro` con todo su código, las dos versiones divergirán. Usa las vistas de `src/vistas/`.
4. **La barra a 1024 px es la más justa:** con el selector añadido puede saltar de línea. Mídela. Si no cabe, **no** quites enlaces por tu cuenta: documenta el ancho en el que falla y pregunta.
5. **Las validaciones cruzadas no deben exigir traducción.** La ausencia de `en` es válida (respaldo). Lo único inválido es una herramienta inexistente o un destacado sin relato en ningún idioma.
6. **`lang` en los fragmentos de respaldo:** sin `lang="es"`, axe no se queja, pero VoiceOver lee el español con voz inglesa. Es un requisito, no un adorno.
7. **Claves i18n nuevas** al final de `es.json` y `en.json`, con el prefijo `idioma.`. Las que ya existen (`idiomaRespaldo`) se reutilizan.
8. **Puertos:** usa `PORTAFOLIO_E2E_PORT` del prompt y **cierra** los servidores al terminar.
9. **Ningún valor suelto en el CSS** (`npm run check`).

## 15. Criterios de aceptación
- [ ] `npm ci && npm run check && npm test && npm run build && npm run e2e` termina sin errores ni advertencias.
- [ ] `IDIOMAS_ACTIVOS = ['es','en']`. El build genera `/en/`, `/en/proyectos/<slug>/` para los 7 proyectos y las mismas páginas en español que antes.
- [ ] El test de guardia del § 5 pasa: no hay `'es'` fijo en componentes, layouts ni lib.
- [ ] Los e2e del § 11 pasan, también con `--repeat-each=5` en los de idioma.
- [ ] El selector funciona en la barra, el menú y la hoja «Aa», con `aria-current`, `lang` y `hreflang`, y la barra no pasa de 56 px a ningún ancho.
- [ ] `proyecto-07` en inglés muestra el aviso y `lang="es"`, con su canonical a la versión en español.
- [ ] `hreflang` recíproco y `x-default` en todas las páginas.
- [ ] Las capturas del § 12 están en `capturas/F7/` con su `comparacion.html`.
- [ ] El informe lista **todos** los archivos traducidos, para que Jorge los revise.
- [ ] No quedan servidores abiertos.

## 16. Si te bloqueas
Si una fuente se contradice, falta un dato o algo exige rediseñar, **no lo decidas tú**. Implementa lo que no dependa de eso y deja la pregunta en el informe. Si se te acaba el tiempo, prioriza: componentes sin `'es'` fijo → páginas `/en/` con respaldo → selector en la barra → contenido traducido → selector en el menú y en «Aa» → SEO → capturas.

## Informe de entrega
Ve rellenándolo **durante** el trabajo (una línea por paso del § 3) y complétalo al final:
1. **Hecho:** la lista de entregables, con sus rutas.
2. **Archivos traducidos**, para que Jorge los revise.
3. **Verificación:** los comandos ejecutados con su resultado real, los e2e (incluido `--repeat-each=5`) y las capturas.
4. **Desviaciones:** qué difiere del encargo y por qué. Incluye los tokens y las claves i18n nuevas.
5. **Preguntas abiertas.**
6. **No verificado:** lo que no pudiste comprobar.

---

## Informe
‹Lo escribe Codex, paso a paso.›

- Paso 1: añadí `idiomaDe`, quité el idioma español fijado de los 14 componentes de artículo, cambié el perfil de `BaseLayout` a la locale actual y agregué el test de guardia; `npm run check && npm test` pasó (0 errores/advertencias, 118 tests).
- Paso 2: añadí respaldo genérico para perfil, tecnologías, portada y hero, respaldo por slug para relatos y notas, incorporé la colección tipada de portada y adapté las validaciones por idioma; `npm run check && npm test` pasó (0 errores/advertencias, 120 tests).
- Paso 3: extraje `Portada`, `Proyecto` y `Nota` a vistas compartidas, activé `es/en` y añadí envoltorios en inglés para portada, proyectos y notas; `npm run check && npm test` pasó (0 errores/advertencias, 120 tests).
- Paso 4: añadí contenido inglés borrador para perfil, tecnologías, portada, hero, tres relatos y seis proyectos, y convertí los datos compartidos de artículo en `semilla(idioma)`; `npm run check && npm test` pasó (0 errores/advertencias, 120 tests).
- Paso 5: añadí `SelectorIdioma`, `rutaEquivalente` y tests, e inserté el selector en la barra, menú móvil y hoja «Aa»; `npm run check && npm test` pasó (0 errores/advertencias, 121 tests).
- Paso 6: añadí canonical y alternates `hreflang` absolutos con `Astro.site`, respaldo sin alternativa inglesa, aviso accesible y `lang="es"` en el artículo respaldado y en sus filas; `npm run check && npm test` pasó (0 errores/advertencias, 121 tests).
- Paso 7: añadí `tests/e2e/idiomas.spec.ts`, actualicé la prueba de foco modal para incluir el nuevo enlace EN, y generé 12 capturas más `docs/encargos/capturas/F7/comparacion.html`; la suite completa pasó (192/192) y `npm run e2e -- -g "idioma" --repeat-each=5` pasó (105/105).

### Informe final

**Hecho:** se implementó el sitio inglés bajo `/en/`, las rutas de los 7 proyectos y las vistas compartidas; respaldo español, selector «ES · EN», metadatos SEO por página, idioma del contenido y reportes/capturas.

**Archivos traducidos para revisión de Jorge:**

- `src/content/perfil/en.json`
- `src/content/tecnologias/en.json`
- `src/content/portada/en.json`
- `src/content/hero/en.json` (copia literal del contenido ilustrativo)
- `src/content/relatos/en/coordinacion-multiagente.json`
- `src/content/relatos/en/proyecto-02.json`
- `src/content/relatos/en/proyecto-03.json`
- `src/content/proyectos/en/coordinacion-multiagente.mdx`
- `src/content/proyectos/en/proyecto-02.mdx`
- `src/content/proyectos/en/proyecto-03.mdx`
- `src/content/proyectos/en/proyecto-04.mdx`
- `src/content/proyectos/en/proyecto-05.mdx`
- `src/content/proyectos/en/proyecto-06.mdx`
- Datos compartidos localizados en `src/content/articulos/semilla.ts`.

`proyecto-07` no tiene archivo inglés para ejercitar el respaldo. Todos los archivos de contenido inglés tienen `borrador: true`.

**Verificación ejecutada:**

- `npm ci`: correcto; 522 paquetes instalados, 0 vulnerabilidades.
- `npm run e2e:instalar`: Chromium, FFmpeg y Chromium Headless Shell instalados en `.cache/ms-playwright`.
- `npm run check`: correcto; 0 errores, 0 advertencias, tokens válidos y Prettier correcto.
- `npm test`: correcto; 13 archivos y 121 tests.
- `npm run build`: correcto; 17 páginas generadas, incluidas `/en/` y `/en/proyectos/` para los 7 proyectos; sin errores ni advertencias.
- `PORTAFOLIO_E2E_PORT=4401 npm run e2e`: correcto; 192/192.
- `PORTAFOLIO_E2E_PORT=4401 npm run e2e -- -g "idioma" --repeat-each=5`: correcto; 105/105.
- Verificación enfocada de foco modal y cambio de idioma: 6/6.
- Capturas: 12 PNG en `docs/encargos/capturas/F7/` y su galería `comparacion.html`.
- Comparé visualmente la portada de referencia y las capturas del sitio a 1280, 834 y 390 px; a 360 px la prueba e2e confirma que no hay desplazamiento horizontal. La referencia se inspeccionó en los tres anchos indicados; las capturas de entrega cubren hero, barra, menú, hoja Aa y respaldo.
- Servidores de prueba, capturas y referencia: cerrados; no quedaron escuchas en 4401, 4402 ni 4403.

**Desviaciones:**

- Git negó la escritura de `.git/worktrees/F7/index.lock`, así que no pude crear `f7-idiomas` desde `main` ni hacer commits. El checkout F7 partía del mismo commit que `main`; todos los cambios quedan sin commit en F7 para revisión.
- `astro.config.ts` usa `site: 'https://example.com'` con `// TODO(F8): dominio real (D5)`, tal como indica el encargo.
- Nueva clave i18n: `idioma.etiqueta` en `src/i18n/es.json` y `src/i18n/en.json`. Se reutiliza `idiomaRespaldo`. No añadí tokens de diseño.
- La primera ejecución e2e dentro del sandbox no pudo iniciar Chromium (bloqueo de MachPort de macOS). La ejecución con permiso de Chromium pasó. La primera regresión completa tuvo fallos de foco/selector y otros fallos temporales; corregí el supuesto de foco y la prueba del selector móvil, y la regresión final pasó 192/192.

**Preguntas abiertas:** ninguna. El dominio real se mantiene para F8/D5, fuera del alcance de F7.

**No verificado:** no se probó un contenido real de la colección `notas` porque está vacía; el helper admite notas y respaldo por idioma. La revisión editorial de las traducciones queda pendiente para Jorge.

## Revisión
**Claude, 2026-10-26.** Una entrega completa y fiel al encargo: los 7 pasos registrados, 17 páginas generadas, 192/192 e2e y 105/105 en la prueba de estabilidad.

### Auditoría de Claude (más allá de los tests)
- **Texto en español en las páginas inglesas:** limpio. Solo apareció el proyecto de respaldo sin `lang="es"` en la franja de evidencia de Tecnologías (corregido).
- **Enlaces internos de las 8 páginas en inglés:** ninguno lleva a español, salvo el selector.
- **`hreflang`/canonical:** recíprocos. La página de respaldo apunta su canonical al español y no declara alternativa inglesa. `x-default` → español.
- **404 bilingüe** con enlaces a `/` y a `/en/`; aviso «Available in Spanish only.» con `role="note"`.
- **Barra a 1024 px** (el ancho más justo): 56 px, sin saltar de línea, con «ES · EN» antes de CV.

### Correcciones de Claude
1. **«1 · Summary» visible en inglés.** El CSS ocultaba el título del capítulo 1 por su id en español (`h2[id='1--resumen']`), así que en inglés se veía. Ahora usa un selector estructural (`> h2:first-of-type`), con su prueba de regresión.
2. **El selector del menú móvil quedaba asimétrico** («ES   · EN»): el idioma activo es un `span` y no recibía el ancho táctil de 44 px.
3. **`lang="es"` en la tarjeta de evidencia** de los proyectos de respaldo.

Las capturas `barra-articulo-*.png` y `menu-movil-390.png` son anteriores a las correcciones 1 y 2.

### Para Jorge: revisar las traducciones
Son fieles y no añaden información. Dos sugerencias de naturalidad:
- `perfil.frase_contacto`: «let us talk» → «let's talk»;
- `portada.indice_entradilla`: «the three projects told above» → «featured above».

Lista completa en el Informe.

### Pendiente fuera de F7
- `site: 'https://example.com'` → dominio real en F8 (D5).

**Recomendación:** aprobada.
