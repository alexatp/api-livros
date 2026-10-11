import { z } from "zod";

const createCategorySchema = z.object({
  name: z.string().min(1, "O nome da categoria é obrigatório."),
});

const updateCategorySchema = createCategorySchema.partial();

export { createCategorySchema, updateCategorySchema };