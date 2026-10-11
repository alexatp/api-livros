import { Router } from "express";
import bookController from "../controllers/book.controller.js";
import validate from "../middlewares/validate.js";
import { createBookSchema, updateBookSchema } from "../validations/book.validation.js";

const router = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     Erro:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: Registro não encontrado.
 *     ErroValidacao:
 *       type: object
 *       properties:
 *         errors:
 *           type: array
 *           items:
 *             type: string
 *           example:
 *             - O título é obrigatório.
 *     PaginacaoMeta:
 *       type: object
 *       properties:
 *         page:
 *           type: integer
 *           example: 1
 *         perPage:
 *           type: integer
 *           example: 10
 *         total:
 *           type: integer
 *           example: 23
 *         totalPages:
 *           type: integer
 *           example: 3
 *     Book:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         title:
 *           type: string
 *         isbn:
 *           type: string
 *         publishedAt:
 *           type: string
 *           format: date-time
 *         pages:
 *           type: integer
 *         priceDigital:
 *           type: string
 *           description: Preço da versão digital, devolvido como texto decimal
 *           example: "29.90"
 *         pricePhysical:
 *           type: string
 *           description: Preço da versão física, devolvido como texto decimal
 *           example: "59.90"
 *         coverImageUrl:
 *           type: string
 *           nullable: true
 *           description: URL da imagem de capa (http ou https)
 *         authors:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Author'
 *         category:
 *           $ref: '#/components/schemas/Category'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     LivrosPaginados:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Book'
 *         meta:
 *           $ref: '#/components/schemas/PaginacaoMeta'
 *     NovoLivro:
 *       type: object
 *       required:
 *         - title
 *         - isbn
 *         - publishedAt
 *         - pages
 *         - priceDigital
 *         - pricePhysical
 *         - authorIds
 *         - categoryId
 *       properties:
 *         title:
 *           type: string
 *           example: Dom Casmurro
 *         isbn:
 *           type: string
 *           description: ISBN único, com pelo menos 10 caracteres
 *           example: "9788525406958"
 *         publishedAt:
 *           type: string
 *           format: date-time
 *           example: "1899-01-01T00:00:00.000Z"
 *         pages:
 *           type: integer
 *           example: 256
 *         priceDigital:
 *           type: number
 *           description: Preço digital, de 0 a 99999999.99, com no máximo 2 casas decimais
 *           example: 29.9
 *         pricePhysical:
 *           type: number
 *           description: Preço físico, de 0 a 99999999.99, com no máximo 2 casas decimais
 *           example: 49.9
 *         coverImageUrl:
 *           type: string
 *           nullable: true
 *           description: URL da capa, deve começar com http ou https (opcional)
 *           example: https://exemplo.com/capa.jpg
 *         authorIds:
 *           type: array
 *           minItems: 1
 *           description: Ids de autores já cadastrados (ao menos um)
 *           items:
 *             type: integer
 *           example: [1, 2]
 *         categoryId:
 *           type: integer
 *           description: Id de uma categoria já cadastrada
 *           example: 1
 *     AtualizarLivro:
 *       type: object
 *       description: Todos os campos são opcionais. Envie apenas o que deseja alterar.
 *       properties:
 *         title:
 *           type: string
 *         isbn:
 *           type: string
 *         publishedAt:
 *           type: string
 *           format: date-time
 *         pages:
 *           type: integer
 *         priceDigital:
 *           type: number
 *           example: 24.9
 *         pricePhysical:
 *           type: number
 *           example: 54.9
 *         coverImageUrl:
 *           type: string
 *           nullable: true
 *           description: Envie null para remover a capa
 *         authorIds:
 *           type: array
 *           minItems: 1
 *           description: Substitui a lista inteira de autores do livro
 *           items:
 *             type: integer
 *         categoryId:
 *           type: integer
 */

/**
 * @openapi
 * /books:
 *   post:
 *     summary: Cria um novo livro
 *     description: Os autores e a categoria devem existir previamente e são informados pelos ids.
 *     tags: [Livros]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NovoLivro'
 *     responses:
 *       201:
 *         description: Livro criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroValidacao'
 *       404:
 *         description: Um ou mais autores, ou a categoria, não foram encontrados
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *       409:
 *         description: ISBN já cadastrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.post("/", validate(createBookSchema), bookController.create);

/**
 * @openapi
 * /books:
 *   get:
 *     summary: Lista os livros com paginação e filtro por título
 *     tags: [Livros]
 *     parameters:
 *       - in: query
 *         name: page
 *         description: Número da página
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: perPage
 *         description: Quantidade de registros por página
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: title
 *         description: Filtro parcial por título, sem diferenciar maiúsculas e minúsculas
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista paginada de livros, com autores e categoria
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LivrosPaginados'
 */
router.get("/", bookController.list);

/**
 * @openapi
 * /books/{id}:
 *   get:
 *     summary: Busca um livro pelo id
 *     tags: [Livros]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Livro encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       404:
 *         description: Livro não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.get("/:id", bookController.getById);

/**
 * @openapi
 * /books/{id}:
 *   put:
 *     summary: Atualiza um livro existente
 *     description: Atualização parcial. Ao enviar authorIds, a lista de autores do livro é substituída por completo.
 *     tags: [Livros]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AtualizarLivro'
 *     responses:
 *       200:
 *         description: Livro atualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroValidacao'
 *       404:
 *         description: Livro, autor ou categoria não encontrados
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *       409:
 *         description: ISBN já pertence a outro livro
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.put("/:id", validate(updateBookSchema), bookController.update);

/**
 * @openapi
 * /books/{id}:
 *   delete:
 *     summary: Remove um livro
 *     tags: [Livros]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Livro removido com sucesso
 *       404:
 *         description: Livro não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.delete("/:id", bookController.remove);

export default router;
