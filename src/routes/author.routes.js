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
 *     AutoresPaginados:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Author'
 *         meta:
 *           $ref: '#/components/schemas/PaginacaoMeta'
 *     NovoAutor:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           example: Machado de Assis
 *         bio:
 *           type: string
 *           description: Biografia resumida (opcional)
 *           example: Escritor brasileiro.
 *     AtualizarAutor:
 *       type: object
 *       description: Todos os campos são opcionais. Envie apenas o que deseja alterar.
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroValidacao'
 */
router.post("/", validate(createAuthorSchema), authorController.create);

/**
 * @openapi
 * /authors:
 *   get:
 *     summary: Lista os autores com paginação
 *     description: Os autores são ordenados do mais recente para o mais antigo.
 *     tags: [Autores]
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
 *     responses:
 *       200:
 *         description: Lista paginada de autores
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AutoresPaginados'
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Author'
 *       404:
 *         description: Autor não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
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
 *             $ref: '#/components/schemas/AtualizarAutor'
 *     responses:
 *       200:
 *         description: Autor atualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Author'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroValidacao'
 *       404:
 *         description: Autor não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.put("/:id", validate(updateAuthorSchema), authorController.update);

/**
 * @openapi
 * /authors/{id}:
 *   delete:
 *     summary: Remove um autor
 *     description: A remoção é recusada se o autor tiver livros associados.
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *       409:
 *         description: Autor possui livros associados e não pode ser removido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.delete("/:id", authorController.remove);

export default router;
