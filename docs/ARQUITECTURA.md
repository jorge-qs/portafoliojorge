# Portafolio web — Arquitectura y casuísticas

**Estado:** base aprobada, con las enmiendas de abajo · **Fecha:** 2026-10-20 · **Enmendado:** 2026-10-25
**Roles:** Claude diseña la arquitectura, escribe los encargos y revisa cada entrega · Codex implementa · Jorge decide y aprueba.
**Nada de este documento está implementado todavía.** El plan por fases está en `docs/PLAN.md`.

## Enmiendas (2026-10-25)
Llegó el handoff de diseño (`design/`) y Jorge tomó varias decisiones. Estas enmiendas **ganan** sobre el resto del documento.

| # | Tema | Antes | Ahora | Motivo |
|---|---|---|---|---|
| A1 | Fuente de diseño | `DISENO.md` y el prototipo `portafolio-ui` | `design/docs/` y `design/referencias/`. `DISENO.md` queda como principios heredados | El diseño aprobado en Claude Design es más reciente y más concreto |
| A2 | Idiomas | ES/EN desde el inicio, con `/es` y `/en`, y redirección por idioma del navegador (I1) | **El español es la base y vive en la raíz, sin prefijo.** Los demás idiomas llevan prefijo (`/en/…`). Sin redirección automática: el idioma se elige con un selector (pendiente de diseño, D2 en `PLAN.md`). La infraestructura i18n existe desde F0 y el inglés se activa en F7 | Decisión de Jorge: «varios idiomas tomando como base el español». Las redirecciones por `Accept-Language` en un sitio estático perjudican al SEO y a la caché |
| A3 | Estilos | Tailwind + tokens | **CSS con tokens + estilos con alcance de Astro**, sin Tailwind | El handoff entrega `tokens.css` como fuente; Tailwind solo añadía otra capa que mantener sincronizada |
| A4 | Interactividad | Islas de React para las demos, la constelación y el formulario | TS vanilla en `<script>`, y React solo cuando un encargo lo justifique (demos futuras) | No hay constelación ni formulario en el diseño aprobado |
| A5 | Identidad | Starfield, glifos The Calling con decodificación y constelación | Hero de las dos manos (`design/docs/HERO.md`), con estrellas como capa L1. **The Calling queda descartada**, y los glifos y los búhos no están en la v1 | Diseño aprobado en la Fase 5A |
| A6 | Contacto | Formulario con Turnstile y Resend (§ 6.5) | La v1 son 4 filas de enlaces: Correo con «Copiar», GitHub, LinkedIn y CV. El formulario pasa a después de la v1 | Diseño aprobado 7a |
| A7 | CV | `/cv` + PDF generado desde YAML en el build | La v1 enlaza un PDF estático (`/cv.pdf`). El generador pasa a después de la v1 | El diseño solo enlaza el PDF |
| A8 | Rutas | `pages/[lang]/...` | `/`, `/proyectos/<slug>` y `/notas/<slug>`, con el español sin prefijo (A2) | `design/docs/PAGINAS.md` § Rutas |
| A9 | Modelo de contenido | `title`, `summary`, `date`, `tags[]`, `stack[]`… | El modelo de `design/docs/PENDIENTES.md` (`titulo`, `tipo`, `anio`, `herramientas[]`, `destacado`…), más `estado` (C5) y `borrador`. Los detalles están en `docs/encargos/F0-base.md` | Coincide con lo que muestran las maquetas |
| A10 | Instrucciones de los agentes | `AGENTS.md`, que se escribía al aprobar | `AGENTS.md` con las reglas para Codex y `CLAUDE.md` con el rol de orquestador de Claude, que importa `AGENTS.md` | Decisión de Jorge: Claude organiza la iteración y Codex implementa |
| A11 | Plan | Etapas E0–E7 (§ 10) | Fases F0–F8 en `docs/PLAN.md` | Junta este plan con el orden del handoff |
| A13 | Repositorio | Por decidir (D6) | **Público** en `github.com/jorge-qs/portafolio`. Los commits van solo a nombre de Jorge Quenta, sin atribuciones | Decisión de Jorge, 2026-10-26: CI gratis y el código como muestra |
| A12 | Framework y hosting | Astro y Cloudflare Pages, en propuesta | **Astro confirmado por Jorge** frente a Next.js. Cloudflare Pages sigue siendo la propuesta, con previsualizaciones desde F0.5. Se descartó Railway: cobra por un servidor encendido, innecesario para un sitio estático | Es un sitio de contenido: HTML estático, JS solo donde hay interacción, y MDX, i18n y colecciones incluidos |

Siguen abiertas: el dominio, si el repo es público o privado y las cuentas (D5–D7 en `PLAN.md`). La pregunta de § 11.2 sobre los glifos queda resuelta por A5.

---

## 1. Objetivo

Un portafolio personal bilingüe (ES/EN) que muestre proyectos, notas técnicas,
CV y demos interactivas, con la identidad visual de Kairos. Debe costar casi
nada, cargar rápido, ser fácil de mantener (agregar un proyecto = agregar un
archivo) y poder iterarse en el diseño sin rehacer la base.

**Fuera de alcance por ahora:** login, comentarios, base de datos, panel de
administración, tienda o pagos.

## 2. Punto de partida

| Activo | Dónde | Uso |
|---|---|---|
| Prototipo original del portafolio (HTML/CSS/JS puro: starfield, constelación, escritura propia, `projects.json`) | `personal-os-spec/docs/design/references/portafolio-ui` | Versión 0: inspiración visual y de interacción; se migra, no se copia tal cual |
| Tokens de color, movimiento y radios (oscuro "cosmos" + claro "dawn", AA verificado) | `personal-os-spec/frontend/app/globals.css`, `tailwind.config.ts` | Se copian como base del sistema de diseño |
| Reglas de identidad (glifos solo como identidad, nunca en texto funcional; sin emojis; Lucide; movimiento calmado; `prefers-reduced-motion`) | `personal-os-spec/docs/decisions/ADR-0007-visual-identity.md` | Se adoptan como reglas del portafolio |
| Glifos The Calling Cipher | `personal-os-spec/docs/design/references/the-calling-font`, `thefatrat-cipher-pack` | Títulos y marca, con texto plano accesible |
| Kit de skills de frontend (31 skills) | `agent-skills/frontend/*/SKILL.md` | Guía de diseño para Claude y Codex (ver §5) |

## 3. Decisiones de arquitectura (propuestas)

| Tema | Propuesta | Por qué | Alternativa descartada |
|---|---|---|---|
| Framework | **Astro** (última versión estable al iniciar, fijada en el lockfile) | Sitio de contenido: HTML estático por defecto, JS solo donde hace falta ("islas"), colecciones de contenido tipadas, i18n incluido | Next.js: lo conoces del Personal OS, pero agrega JS y servidor que un portafolio no necesita |
| Interactividad | Islas **React** solo para demos, constelación y formulario; starfield en JS/canvas vanilla | Reutiliza lo que sabes de React sin cargarlo en todas las páginas | SPA completa |
| Estilos | **Tailwind** + tokens CSS semánticos (`--background`, `--primary`…) heredados de Kairos | Cambiar de tema o iterar el diseño se hace en un solo archivo | CSS suelto sin tokens |
| Contenido | Markdown/MDX en el repo (`src/content/`) con esquema validado (Zod) | Gratis, versionado, editable por agentes, sin CMS | CMS hospedado (Sanity, Contentful): costo y complejidad innecesarios hoy |
| Hosting | **Cloudflare Pages** (plan gratis) | Ancho de banda sin límite en el plan gratis, CDN global, uso comercial permitido, funciones serverless para el formulario | Vercel Hobby (prohíbe uso comercial); GitHub Pages (no tiene funciones) |
| Formulario | Función de Cloudflare Pages + **Turnstile** (antispam) + **Resend** (envío de correo) | Todo gratis en el volumen de un portafolio; sin servidor propio | Formspree (límite bajo en el plan gratis y marca de terceros) |
| CV | Datos en un archivo YAML → página `/cv` + **PDF generado en el build** (Playwright imprime `/cv`) | Una sola fuente de verdad; el PDF nunca queda desactualizado | PDF hecho a mano |
| Analytics | **Cloudflare Web Analytics** | Gratis, sin cookies, no requiere banner de consentimiento | Google Analytics |
| Fuentes | Autoalojadas (sin CDN de fuentes) | Rendimiento y privacidad, igual que en el Personal OS | Google Fonts en tiempo de ejecución |
| CI/CD | GitHub Actions: lint, tipos, tests, build, Lighthouse; Cloudflare despliega cada push a `main` y crea previsualizaciones por rama | Cada worktree de Deska tiene su URL de previsualización | Despliegue manual |

> **Infraestructura:** al ser un sitio estático en un CDN, **no necesita la Mac
> prendida ni un servidor 24/7**. Solo hace falta crear cuentas en GitHub y
> Cloudflare, comprar el dominio y verificarlo en Resend (registros DNS).

## 4. Estructura propuesta

```
portafolio/
├── AGENTS.md                 # reglas para Codex (se escribe al aprobar este doc)
├── docs/ARQUITECTURA.md      # este documento
├── src/
│   ├── content/
│   │   ├── projects/{es,en}/<slug>.mdx
│   │   ├── posts/{es,en}/<slug>.mdx
│   │   └── cv/{es,en}.yaml
│   ├── content.config.ts     # esquemas Zod de cada colección
│   ├── i18n/{es,en}.json     # textos de interfaz
│   ├── styles/tokens.css     # tokens Kairos (oscuro + dawn)
│   ├── components/           # Astro (estáticos) e islas React (interactivos)
│   ├── demos/<slug>/         # demos interactivas, cargadas solo al hacerse visibles
│   ├── layouts/
│   └── pages/[lang]/...      # /es/... y /en/...
├── functions/api/contact.ts  # función de Cloudflare para el formulario
├── public/fonts/, public/og/
└── scripts/                  # generar PDF del CV, importar notas de Obsidian
```

**Modelo de un proyecto** (frontmatter): `title`, `summary`, `date`, `tags[]`,
`stack[]`, `role`, `status` (`activo | terminado | archivado`), `featured`,
`cover`, `links[]` (`repo`, `demo`, `paper`…), `demo?` (slug de demo interna o
URL externa), `translationOf?`. El esquema rechaza el build si falta un campo
obligatorio.

## 5. Diseño e iteración con los skills

El diseño parte de los tokens de Kairos y se itera por capas. Cada etapa usa
solo los skills pertinentes (se leen desde `agent-skills/frontend/<skill>/SKILL.md`):

| Etapa | Skills | Resultado |
|---|---|---|
| Dirección visual | `design-taste-frontend`, `refero-styles` (opcional, como referencia) | Composición de inicio, jerarquía y ritmo tipográfico |
| Componentes e interacción | `emil-design-eng`, `pick-ui-library`, `skiper-ui-components` (solo si se necesita una interacción concreta) | Tarjetas de proyecto, navegación, formulario, estados de foco |
| Movimiento | `animation-vocabulary`, `find-animation-opportunities`, `animate`, `animation-performance` | Starfield, decodificación de glifos, transiciones de vista; todo estático con `prefers-reduced-motion` |
| Móvil | `mobile-native` | Áreas táctiles, áreas seguras, teclado en el formulario |
| Imágenes | `imagegen-frontend-web` | Imágenes OG y portadas, solo con el proveedor que autorices |
| Estrés y calidad | `break-ui` | Títulos larguísimos, proyecto sin imagen, 0 o 60 proyectos, idioma faltante |

**Bucle de iteración:** Claude propone el cambio de diseño → Codex lo
implementa en un worktree de Deska → URL de previsualización → Jorge mira y
comenta → se fusiona o se descarta. Para decisiones visuales grandes, se pueden
lanzar 2 o 3 agentes en paralelo con el mismo encargo y elegir el mejor.

## 6. Casuísticas

### 6.1 Contenido

| # | Caso | Comportamiento esperado |
|---|---|---|
| C1 | Agregar un proyecto | Crear un `.mdx` en `projects/es/` (y `en/`). El build valida el esquema; aparece en la lista, en los filtros por tag y con su página propia. Sin tocar código. |
| C2 | Proyecto sin traducción al inglés | Se muestra en `/en` con la versión en español y un aviso "Available in Spanish only"; nunca una página 404 ni texto vacío. |
| C3 | Proyecto sin imagen de portada | Portada generada con los tokens (fondo, glifo de la inicial); la tarjeta mantiene la misma altura. |
| C4 | Proyecto privado o con código cerrado (UTEC, trabajo, cliente) | Se puede publicar solo una descripción, sin enlace al repo. **Nunca** se publica material del empleador ni datos confidenciales; ante la duda, no se publica. |
| C5 | Proyecto archivado o viejo | `status: archivado`: queda fuera de los destacados y sigue accesible por URL. |
| C6 | Muchos proyectos (más de 30) | Filtros por tag y por stack, más destacados en el inicio; la lista no carga todas las imágenes de golpe (lazy loading). |
| C7 | Cambiar el slug de un proyecto | Se agrega una redirección 301 en `_redirects` para no romper enlaces ya compartidos. |
| C8 | Publicar una nota desde Obsidian | El script de importación solo toma notas con `publish: true` en el frontmatter, las copia a `posts/` y quita enlaces internos del vault que no se publiquen. **Nada del vault se publica por defecto.** Jorge revisa el diff antes de fusionar. |
| C9 | Nota con matemáticas o código | KaTeX y resaltado de código en tiempo de build (sin JS en el cliente). |
| C10 | Actualizar el CV | Editar `cv/es.yaml` y `cv/en.yaml`; el build regenera `/cv` y los PDF. Si el PDF falla, el build falla: nunca se publica un PDF desactualizado. |
| C11 | Datos personales en el CV | El PDF público no incluye teléfono ni dirección; solo el correo de contacto y los enlaces que elijas. |

### 6.2 Idiomas y navegación

| # | Caso | Comportamiento esperado |
|---|---|---|
| I1 | Primera visita a `/` | Redirige a `/es` o `/en` según el idioma del navegador; si no se puede detectar, `/es`. |
| I2 | Cambio de idioma en una página | Lleva a la misma página en el otro idioma si existe (C2 si no). La elección se recuerda localmente. |
| I3 | SEO bilingüe | `hreflang` entre versiones, `sitemap.xml` con ambos idiomas, URL canónica por página. |
| I4 | Compartir en LinkedIn o WhatsApp | Cada proyecto y nota tiene su imagen OG generada en el build con el título y la identidad visual. |

### 6.3 Identidad visual y accesibilidad

| # | Caso | Comportamiento esperado |
|---|---|---|
| V1 | Tema del sistema claro u oscuro | Sigue al sistema; el usuario puede cambiarlo y se recuerda. Sin destello del tema equivocado al cargar. |
| V2 | `prefers-reduced-motion` | Starfield estático, glifos sin animación de decodificación, transiciones instantáneas. |
| V3 | Lector de pantalla y títulos en glifos | Siempre recibe el texto plano; los glifos son solo visuales (regla de ADR-0007). |
| V4 | JavaScript desactivado | Todo el contenido (proyectos, notas, CV) se lee y navega; solo se pierden las demos y el formulario, que muestran un correo alternativo. |
| V5 | Móvil lento o de gama baja | El starfield se reduce o se apaga si el dispositivo es lento o tiene ahorro de datos; las demos no se cargan hasta que se tocan. |
| V6 | Contraste | WCAG AA en ambos temas, verificado con un test automático (como `contrast.test.ts` del Personal OS). |
| V7 | Navegación con teclado | Foco visible en todo, "saltar al contenido", orden lógico, sin trampas de foco. |

### 6.4 Demos interactivas

| # | Caso | Comportamiento esperado |
|---|---|---|
| D1 | Demo liviana (visualización, widget) | Isla React dentro de `src/demos/`, que se carga cuando entra en pantalla (`client:visible`). |
| D2 | Demo pesada (modelo, app completa, notebook) | Se aloja aparte (otro proyecto de Pages, Hugging Face Spaces, etc.) y se embebe con `iframe` diferido o se enlaza. Nunca infla el sitio principal. |
| D3 | La demo externa se cae | El contenedor muestra una captura estática y el enlace al repo; la página del proyecto sigue funcionando. |
| D4 | Demo que necesita una API key | **No se embebe la key en el cliente.** Si hace falta, se usa un proxy con límite de uso, o la demo se reemplaza por un video o GIF. |

### 6.5 Formulario de contacto

| # | Caso | Comportamiento esperado |
|---|---|---|
| F1 | Mensaje válido | Turnstile se valida en el servidor y Resend te reenvía el correo; el visitante ve una confirmación clara. |
| F2 | Spam o bots | Turnstile, un campo trampa oculto y un límite de 5 envíos por IP por hora. Los mensajes rechazados no generan correo. |
| F3 | Resend caído o sin cuota | Mensaje honesto ("no se pudo enviar, escríbeme a …") con el correo visible; el error se registra en la función. |
| F4 | Datos del visitante | No se guardan en ninguna base de datos; solo viajan en el correo. Aviso de privacidad breve bajo el formulario. |
| F5 | Secretos | Las keys de Resend y Turnstile viven en las variables de entorno de Cloudflare, nunca en el repo; la CI falla si detecta un secreto. |

### 6.6 Operación, costos y escala

| # | Caso | Comportamiento esperado |
|---|---|---|
| O1 | Pico de tráfico (un post se viraliza) | Sitio estático en CDN: sin costo extra ni caída. Solo el formulario tiene límites, y están lejos de alcanzarse. |
| O2 | Se rompe el build | Cloudflare mantiene publicada la última versión buena; la rama `main` está protegida por la CI. |
| O3 | Revertir un despliegue | Un clic en Cloudflare Pages (cada despliegue es inmutable) o `git revert`. |
| O4 | Cambiar de proveedor de hosting | El sitio es HTML estático más una función pequeña: migrar a Netlify o Vercel es mover la función y el DNS. No hay dependencia fuerte del proveedor. |
| O5 | El dominio está por vencer | Renovación automática activada y recordatorio en el Personal OS 30 días antes. |
| O6 | Dependencias desactualizadas o vulnerables | Dependabot o Renovate semanal; Codex aplica las actualizaciones en un worktree y la CI las valida. |
| O7 | Rendimiento se degrada | La CI corre Lighthouse en cada PR; falla si el rendimiento baja de 90 o si el JS inicial de una página supera ~100 KB. |
| O8 | Agentes trabajando en paralelo (Deska) | Cada agente en su worktree y rama; cada rama tiene su URL de previsualización; se fusiona una a la vez, después de la revisión. |

## 7. Escalabilidad

- **Tráfico:** no es un problema; un CDN estático sirve millones de visitas sin cambios.
- **Contenido:** las colecciones tipadas escalan a cientos de proyectos o notas. Si algún día la edición desde el navegador se vuelve necesaria, se puede agregar un CMS basado en git (p. ej. Keystatic o Decap) sin migrar el contenido.
- **Funcionalidad:** si en el futuro hace falta backend (newsletter, contador de visitas, chat con Kairos sobre tus proyectos), se agrega como funciones de Cloudflare más D1 o KV en el plan gratis, sin cambiar la arquitectura.
- **Diseño:** gracias a los tokens semánticos, se puede rediseñar el tema completo sin tocar los componentes.

## 8. Costos estimados

| Concepto | Costo | Nota |
|---|---|---|
| Hosting (Cloudflare Pages) | 0 USD | Plan gratis: ancho de banda sin límite, ~500 builds al mes |
| Función del formulario | 0 USD | Incluida en el plan gratis de Workers (~100 000 solicitudes al día) |
| Correo (Resend) | 0 USD | Plan gratis: ~3000 correos al mes y 100 al día |
| Antispam (Turnstile) y analytics | 0 USD | Gratis |
| CI (GitHub Actions) | 0 USD | Gratis en un repo público; el plan gratis incluye minutos para repos privados |
| Dominio (`.dev` / `.com`) | ~10–15 USD al año | Al costo en Cloudflare Registrar |
| **Total** | **~1 USD al mes** | |

> Límites y precios según los planes conocidos a la fecha; **verificarlos al
> crear cada cuenta**, porque los proveedores los cambian.

## 9. Riesgos

| Riesgo | Mitigación |
|---|---|
| Publicar algo privado del vault o del trabajo | Publicación opt-in (`publish: true`), revisión humana del diff y un test que bloquea rutas o palabras sensibles definidas por ti |
| El sitio se vuelve pesado por el starfield o las demos | Presupuesto de JS por página en la CI (O7) y carga diferida (D1/D2) |
| Divergencia de identidad con Kairos | Los tokens se copian con una nota de origen; sincronizarlos es una decisión explícita, no automática |
| Agentes que pisan el trabajo del otro en paralelo | Una tarea por worktree y fusión secuencial con revisión (O8) |

## 10. Plan por etapas (para después de aprobar este documento)

1. **E0 — Base:** proyecto Astro, tokens, fuentes, layout bilingüe, CI y despliegue en Cloudflare.
2. **E1 — Proyectos:** colección, lista con filtros y página de proyecto; migrar `projects.json` del prototipo.
3. **E2 — Identidad:** starfield, glifos con decodificación y constelación, respetando V2–V5.
4. **E3 — CV:** página `/cv` y PDF generado en el build.
5. **E4 — Notas:** colección de posts e importación opt-in desde Obsidian.
6. **E5 — Contacto:** función, Turnstile y Resend.
7. **E6 — Demos:** la primera demo liviana y la primera externa.
8. **E7 — Pulido:** OG, SEO, `break-ui`, Lighthouse y el dominio definitivo.

Cada etapa: Claude escribe el encargo con criterios de aceptación → Codex
implementa → Claude revisa → Jorge aprueba.

## 11. Decisiones abiertas para Jorge

1. ~~**Tipografía**~~ — resuelta: **Geist** (enmienda 2026-10-19 de ADR-0007). Ver `DISENO.md` §3.
2. **Glifos:** ¿The Calling Cipher (como Kairos) o tu escritura propia del prototipo original? Ojo: ADR-0007 exige **revisar la licencia de The Calling antes de publicarla**, y el portafolio es público (`DISENO.md` §7).
3. **Dominio:** ¿qué nombre? (p. ej. `jorge….dev`)
4. **Repo:** ¿público (CI gratis sin límite y además sirve como muestra de código) o privado?
5. **Proyectos iniciales:** ¿cuáles entran en la primera versión y cuáles se destacan?
