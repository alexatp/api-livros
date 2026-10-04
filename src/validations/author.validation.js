import { z } from "zod";

const createAuthorSchema = z.object({
  name: z.string().min(1, "O nome do autor é obrigatório."),
  bio: z.string().optional(),
});

const updateAuthorSchema = createAuthorSchema.partial();

export { createAuthorSchema, updateAuthorSchema };
