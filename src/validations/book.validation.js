import { z } from "zod";

const createBookSchema = z.object({
  title: z.string().min(1, "O título é obrigatório."),
  authorIds: z
    .array(z.coerce.number().int().positive("O id do autor deve ser positivo."))
    .min(1, "Informe ao menos um autor."),
  isbn: z.string().min(10, "O ISBN deve ter pelo menos 10 caracteres."),
  publishedAt: z.coerce.date({ message: "A data de publicação é inválida." }),
  pages: z.coerce.number().int().positive("O número de páginas deve ser positivo."),
});

const updateBookSchema = createBookSchema.partial();

export { createBookSchema, updateBookSchema };
