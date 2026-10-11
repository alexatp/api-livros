import { Router } from "express";
import categoryController from "../controllers/category.controller.js";
import validate from "../middlewares/validate.js";
import { createCategorySchema, updateCategorySchema } from "../validations/category.validation.js";

const router = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     NovaCategoria:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Nome único, sem diferenciar maiúsculas, minúsculas e espaços nas pontas
 *           example: Fantasia
 *     AtualizarCategoria:
 *       type: object
 *       description: O campo é opcional. Enviar o próprio nome atual é permitido.
 *       properties:
 *         name:
 *           type: string
 *           example: Fantasia
 */

/**
 * @openapi
 * /categories:
 *   post:
 *     summary: Cria uma nova categoria
 *     tags: [Categorias]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NovaCategoria'
 *     responses:
 *       201:
 *         description: Categoria criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       400:
 *         description: Dados inválidos, como nome vazio ou só com espaços
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroValidacao'
 *       409:
 *         description: Já existe uma categoria com esse nome
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.post("/", validate(createCategorySchema), categoryController.create);

/**
 * @openapi
 * /categories:
 *   get:
 *     summary: Lista todas as categorias
 *     description: A listagem de categorias não é paginada.
 *     tags: [Categorias]
 *     responses:
 *       200:
 *         description: Lista de categorias
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 */
router.get("/", categoryController.list);

/**
 * @openapi
 * /categories/{id}:
 *   get:
 *     summary: Busca uma categoria pelo id
 *     tags: [Categorias]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Categoria encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       404:
 *         description: Categoria não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.get("/:id", categoryController.getById);

/**
 * @openapi
 * /categories/{id}:
 *   put:
 *     summary: Atualiza uma categoria existente
 *     tags: [Categorias]
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
 *             $ref: '#/components/schemas/AtualizarCategoria'
 *     responses:
 *       200:
 *         description: Categoria atualizada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroValidacao'
 *       404:
 *         description: Categoria não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *       409:
 *         description: Já existe outra categoria com esse nome
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.put("/:id", validate(updateCategorySchema), categoryController.update);

/**
 * @openapi
 * /categories/{id}:
 *   delete:
 *     summary: Remove uma categoria
 *     description: A remoção é recusada se a categoria tiver livros associados.
 *     tags: [Categorias]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Categoria removida com sucesso
 *       404:
 *         description: Categoria não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *       409:
 *         description: Categoria possui livros associados e não pode ser removida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.delete("/:id", categoryController.remove);

export default router;
