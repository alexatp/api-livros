import { Router } from "express";
import bookController from "../controllers/book.controller.js";
import validate from "../middlewares/validate.js";
import { createBookSchema, updateBookSchema } from "../validations/book.validation.js";

const router = Router();

/**
 * @openapi
 * components:
 *   schemas:
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
 *         authors:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Author'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     NovoLivro:
 *       type: object
 *       required:
 *         - title
 *         - authorIds
 *         - isbn
 *         - publishedAt
 *         - pages
 *       properties:
 *         title:
 *           type: string
 *         authorIds:
 *           type: array
 *           items:
 *             type: integer
 *         isbn:
 *           type: string
 *         publishedAt:
 *           type: string
 *           format: date-time
 *         pages:
 *           type: integer
 */

/**
 * @openapi
 * /books:
 *   post:
 *     summary: Cria um novo livro
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
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Autor não encontrado
 *       409:
 *         description: ISBN já cadastrado
 */
router.post("/", validate(createBookSchema), bookController.create);

/**
 * @openapi
 * /books:
 *   get:
 *     summary: Lista todos os livros
 *     tags: [Livros]
 *     responses:
 *       200:
 *         description: Lista de livros
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
 *       404:
 *         description: Livro não encontrado
 */
router.get("/:id", bookController.getById);

/**
 * @openapi
 * /books/{id}:
 *   put:
 *     summary: Atualiza um livro existente
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
 *             $ref: '#/components/schemas/NovoLivro'
 *     responses:
 *       200:
 *         description: Livro atualizado
 *       404:
 *         description: Livro ou autor não encontrado
 *       409:
 *         description: ISBN já pertence a outro livro
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
 */
router.delete("/:id", bookController.remove);

export default router;
