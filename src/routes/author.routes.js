import { Router } from "express";
import authorController from "../controllers/author.controller.js";
import validate from "../middlewares/validate.js";
import { createAuthorSchema, updateAuthorSchema } from "../validations/author.validation.js";

const router = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     Author:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         bio:
 *           type: string
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     NovoAutor:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *         bio:
 *           type: string
 */

/**
 * @openapi
 * /authors:
 *   post:
 *     summary: Cria um novo autor
 *     tags: [Autores]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NovoAutor'
 *     responses:
 *       201:
 *         description: Autor criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Author'
 *       400:
 *         description: Dados inválidos
 */
router.post("/", validate(createAuthorSchema), authorController.create);

/**
 * @openapi
 * /authors:
 *   get:
 *     summary: Lista todos os autores
 *     tags: [Autores]
 *     responses:
 *       200:
 *         description: Lista de autores
 */
router.get("/", authorController.list);

/**
 * @openapi
 * /authors/{id}:
 *   get:
 *     summary: Busca um autor pelo id
 *     tags: [Autores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Autor encontrado
 *       404:
 *         description: Autor não encontrado
 */
router.get("/:id", authorController.getById);

/**
 * @openapi
 * /authors/{id}:
 *   put:
 *     summary: Atualiza um autor existente
 *     tags: [Autores]
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
 *             $ref: '#/components/schemas/NovoAutor'
 *     responses:
 *       200:
 *         description: Autor atualizado
 *       404:
 *         description: Autor não encontrado
 */
router.put("/:id", validate(updateAuthorSchema), authorController.update);

/**
 * @openapi
 * /authors/{id}:
 *   delete:
 *     summary: Remove um autor
 *     tags: [Autores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Autor removido com sucesso
 *       404:
 *         description: Autor não encontrado
 */
router.delete("/:id", authorController.remove);

export default router;
