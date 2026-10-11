import request from "supertest";
import app from "./app.js";
import prisma from "./config/prisma.js";

let authorIds;
let categoryId;

beforeAll(async () => {
  await prisma.book.deleteMany();
  await prisma.author.deleteMany();
  await prisma.category.deleteMany();

  const autores = await prisma.author.createManyAndReturn({
    data: [
      { name: "Machado de Assis" },
      { name: "José de Alencar" },
    ],
  });

  authorIds = autores.map((autor) => autor.id);

  const categoria = await prisma.category.create({
    data: { name: "Romance" },
  });

  categoryId = categoria.id;
});

afterAll(async () => {
  await prisma.book.deleteMany();
  await prisma.author.deleteMany();
  await prisma.category.deleteMany();
  await prisma.$disconnect();
});

describe("CRUD de livros", () => {
  let idCriado;

  test("deve criar um livro com sucesso", async () => {
    const resposta = await request(app)
      .post("/books")
      .send({
        title: "Dom Casmurro",
        authorIds: [authorIds[0]],
        categoryId,
        isbn: "9788525406958",
        publishedAt: "1899-01-01T00:00:00.000Z",
        pages: 256,
      });

    expect(resposta.status).toBe(201);
    expect(resposta.body).toHaveProperty("id");
    expect(resposta.body.title).toBe("Dom Casmurro");
    expect(resposta.body.authors).toHaveLength(1);
    expect(resposta.body.category.id).toBe(categoryId);
    idCriado = resposta.body.id;
  });

  test("não deve criar um livro com ISBN repetido", async () => {
    const resposta = await request(app)
      .post("/books")
      .send({
        title: "Dom Casmurro",
        authorIds: [authorIds[0]],
        categoryId,
        isbn: "9788525406958",
        publishedAt: "1899-01-01T00:00:00.000Z",
        pages: 256,
      });

    expect(resposta.status).toBe(409);
    expect(resposta.body.message).toBe("Já existe um livro cadastrado com esse ISBN.");
  });

  test("não deve criar um livro com autor inexistente", async () => {
    const resposta = await request(app)
      .post("/books")
      .send({
        title: "Livro sem autor",
        authorIds: [999999],
        categoryId,
        isbn: "9781234567890",
        publishedAt: "2000-01-01T00:00:00.000Z",
        pages: 100,
      });

    expect(resposta.status).toBe(404);
    expect(resposta.body.message).toBe("Um ou mais autores informados não foram encontrados.");
  });

  test("não deve criar um livro com categoria inexistente", async () => {
    const resposta = await request(app)
      .post("/books")
      .send({
        title: "Livro sem categoria",
        authorIds: [authorIds[0]],
        categoryId: 999999,
        isbn: "9781234567891",
        publishedAt: "2000-01-01T00:00:00.000Z",
        pages: 100,
      });

    expect(resposta.status).toBe(404);
    expect(resposta.body.message).toBe("Categoria informada não foi encontrada.");
  });

  test("não deve criar um livro com dados inválidos", async () => {
    const resposta = await request(app).post("/books").send({ title: "" });

    expect(resposta.status).toBe(400);
    expect(Array.isArray(resposta.body.errors)).toBe(true);
  });

  test("deve listar os livros cadastrados", async () => {
    const resposta = await request(app).get("/books");

    expect(resposta.status).toBe(200);
    expect(Array.isArray(resposta.body.data)).toBe(true);
    expect(resposta.body.data.length).toBeGreaterThan(0);
    expect(resposta.body.meta).toHaveProperty("total");
  });

  test("deve buscar um livro pelo id", async () => {
    const resposta = await request(app).get(`/books/${idCriado}`);

    expect(resposta.status).toBe(200);
    expect(resposta.body.id).toBe(idCriado);
    expect(resposta.body.authors).toHaveLength(1);
  });

  test("deve retornar 404 ao buscar um livro inexistente", async () => {
    const resposta = await request(app).get("/books/999999");

    expect(resposta.status).toBe(404);
    expect(resposta.body.message).toBe("Livro não encontrado.");
  });

  test("deve atualizar um livro existente", async () => {
    const resposta = await request(app)
      .put(`/books/${idCriado}`)
      .send({ pages: 300, authorIds: [authorIds[1]] });

    expect(resposta.status).toBe(200);
    expect(resposta.body.pages).toBe(300);
    expect(resposta.body.authors[0].id).toBe(authorIds[1]);
  });

  test("deve apagar um livro existente", async () => {
    const resposta = await request(app).delete(`/books/${idCriado}`);

    expect(resposta.status).toBe(204);
  });

  test("deve retornar 404 ao tentar apagar um livro já apagado", async () => {
    const resposta = await request(app).delete(`/books/${idCriado}`);

    expect(resposta.status).toBe(404);
  });
});