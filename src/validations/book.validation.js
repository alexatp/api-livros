import { z } from "zod";

function isHttpUrl(valor) {
  try {
    const url = new URL(valor);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

const priceSchema = (nomeDoCampo) =>
  z.coerce
    .number({ message: `O preço ${nomeDoCampo} deve ser um número.` })
    .min(0, `O preço ${nomeDoCampo} não pode ser negativo.`)
    .max(99999999.99, `O preço ${nomeDoCampo} excede o valor máximo permitido.`)
    .refine(
      (valor) => Math.round(valor * 100) / 100 === valor,
      `O preço ${nomeDoCampo} deve ter no máximo 2 casas decimais.`
    );

const createBookSchema = z.object({
  title: z.string().min(1, "O título é obrigatório."),
  isbn: z.string().min(10, "O ISBN deve ter pelo menos 10 caracteres."),
  publishedAt: z.coerce.date({ message: "A data de publicação é inválida." }),
  pages: z.coerce.number().int().positive("O número de páginas deve ser positivo."),
  priceDigital: priceSchema("digital"),
  pricePhysical: priceSchema("físico"),
  coverImageUrl: z
    .string()
    .refine(isHttpUrl, "A URL da capa deve começar com http:// ou https://.")
    .nullable()
    .optional(),
  authorIds: z
    .array(z.coerce.number().int().positive())
    .min(1, "Informe ao menos um autor."),
  categoryId: z.coerce.number().int().positive("Informe uma categoria válida."),
});

const updateBookSchema = createBookSchema.partial();

export { createBookSchema, updateBookSchema };