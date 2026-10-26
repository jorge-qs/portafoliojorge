import { z } from 'astro/zod';

const texto = z.string().trim().min(1);
const placeholder = z.string().regex(/^‹[^‹›]+›$/u);
const enlace = z.union([z.url(), z.string().regex(/‹[^‹›]+›/u)]);
const fecha = z.union([z.iso.date(), placeholder]);

export const proyectoSchema = z
  .object({
    titulo: texto,
    tipo: z.enum(['ing', 'inv', 'hib']),
    anio: z.union([z.number().int(), placeholder]),
    resumen: texto,
    herramientas: z.array(texto).min(1),
    fecha: texto.optional(),
    lectura_min: z.union([z.number().int().positive(), placeholder]).optional(),
    investigacion: z
      .object({
        autores: texto,
        afiliacion: texto,
        publicado: texto,
        bibtex: texto.optional(),
      })
      .optional(),
    rol: texto,
    destacado: z.boolean(),
    orden_destacado: z.number().int().min(1).max(3).optional(),
    enlaces: z.object({
      repo: enlace.optional(),
      demo: enlace.optional(),
      pdf: enlace.optional(),
    }),
    estado: z.enum(['activo', 'terminado', 'archivado']).default('terminado'),
    borrador: z.boolean(),
  })
  .superRefine((proyecto, ctx) => {
    if (proyecto.destacado) {
      for (const campo of ['orden_destacado'] as const) {
        if (proyecto[campo] === undefined) {
          ctx.addIssue({
            code: 'custom',
            path: [campo],
            message: `Un proyecto destacado requiere ${campo}`,
          });
        }
      }
    }
  });

export const notaSchema = z.object({
  titulo: texto,
  fecha,
  tipo: texto,
  borrador: z.boolean(),
});

export const perfilSchema = z.object({
  nombre: texto,
  nombre_corto: texto,
  rol_hero: texto,
  anio_copyright: z.union([z.number().int(), placeholder]),
  frase_hero: texto,
  presentacion: texto,
  foto: z.object({ ruta: texto, alt: texto }).optional(),
  frase_contacto: texto,
  preguntas: z.array(z.object({ tipo: texto, texto })),
  trayectoria: z.array(texto),
  cv: z.object({ url: enlace, fecha }),
  contacto: z.object({
    email: z.union([z.email(), z.string().regex(/‹[^‹›]+›/u)]),
    github: enlace,
    linkedin: enlace,
  }),
  borrador: z.boolean(),
});

export const heroSchema = z.object({
  ventanas: z.array(z.array(texto)).min(1),
  radio: z.array(texto).min(1),
  cubito: z.array(texto).min(1),
  punta: z.array(texto).min(1),
  borrador: z.boolean(),
  ilustrativo: z.boolean(),
});

export const tecnologiasSchema = z.object({
  areas: z
    .array(
      z.object({
        id: texto,
        nombre: texto,
        herramientas: z.array(texto).min(1),
      }),
    )
    .length(5),
  borrador: z.boolean(),
});

export const portadaSchema = z.object({
  indice_entradilla: texto,
  sobre_mi_titulo: texto,
  notas_todas_url: texto,
  borrador: z.boolean(),
});

export type Proyecto = z.infer<typeof proyectoSchema>;
export type Tecnologias = z.infer<typeof tecnologiasSchema>;

// F5 · datos de la figura y cuatro capítulos, en orden editorial fijo.
const punto = z.object({ x: z.number(), y: z.number() });
const arista = z.tuple([texto, texto]);
export const estadoRelatoSchema = z.object({
  seleccionado: texto.optional(),
  recorrido: z.array(texto).optional(),
  atenuados: z.array(texto).optional(),
  aristasResaltadas: z.array(arista).optional(),
  posiciones: z.record(z.string(), punto).optional(),
  aristasVisibles: z.array(arista).optional(),
});
export const relatoSchema = z
  .object({
    diagrama: z.object({
      nodos: z
        .array(
          z.object({
            id: texto,
            etiqueta: texto,
            x: z.number(),
            y: z.number(),
            responsabilidad: texto,
            entradas_salidas: texto,
            cumple: texto,
            codigo: texto.optional(),
          }),
        )
        .min(1),
      aristas: z.array(arista),
    }),
    capitulos: z.tuple([
      z.object({
        titulo: texto,
        leyenda: texto,
        texto,
        nota: texto.optional(),
        estado: estadoRelatoSchema,
      }),
      z.object({
        titulo: texto,
        leyenda: texto,
        texto,
        nota: texto.optional(),
        estado: estadoRelatoSchema,
      }),
      z.object({
        titulo: texto,
        leyenda: texto,
        texto,
        pasos: z.array(z.object({ texto, estado: estadoRelatoSchema })).min(1),
      }),
      z.object({
        titulo: texto,
        leyenda: texto,
        texto,
        nota: texto.optional(),
        resultados: z
          .array(
            z.object({
              etiqueta: texto,
              valor: z.union([z.number().min(0).max(100), placeholder]),
              sintetico: z.boolean(),
            }),
          )
          .min(1),
      }),
    ]),
    equivalente_texto: z.array(texto).min(1),
    borrador: z.boolean(),
  })
  .superRefine((relato, ctx) => {
    const ids = new Set(relato.diagrama.nodos.map((n) => n.id));
    if (ids.size !== relato.diagrama.nodos.length)
      ctx.addIssue({
        code: 'custom',
        path: ['diagrama', 'nodos'],
        message: 'ID de nodo repetido',
      });
    const comprobar = (id: string) => {
      if (!ids.has(id))
        ctx.addIssue({
          code: 'custom',
          path: ['diagrama'],
          message: `Nodo desconocido: ${id}`,
        });
    };
    relato.diagrama.aristas.flat().forEach(comprobar);
    const estados = [
      relato.capitulos[0].estado,
      relato.capitulos[1].estado,
      ...relato.capitulos[2].pasos.map((p) => p.estado),
    ];
    for (const estado of estados) {
      [
        ...(estado.recorrido ?? []),
        ...(estado.atenuados ?? []),
        ...Object.keys(estado.posiciones ?? {}),
        ...(estado.aristasResaltadas ?? []).flat(),
        ...(estado.aristasVisibles ?? []).flat(),
        ...(estado.seleccionado ? [estado.seleccionado] : []),
      ].forEach(comprobar);
    }
  });
export type Relato = z.infer<typeof relatoSchema>;
