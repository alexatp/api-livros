import request from "supertest";
import app from "./app.js";
import prisma from "./config/prisma.js";

beforeAll(async () => {
  await prisma.book.deleteMany();
  await prisma.category.deleteMany();
});

afterAll(async () => {
  await prisma.book.deleteMany();
  await prisma.category.deleteMany();
  await prisma.$disconnect();
});

describe("CRUD de categorias", () => {
  let idCriada;

  test("deve criar uma categoria com sucesso", async () => {
    const resposta = await request(app)
      .post("/categories")
      .send({ name: "Suspense" });

    expect(resposta.status).toBe(201);
    expect(resposta.body).toHaveProperty("id");
    expect(resposta.body.name).toBe("Suspense");

    idCriada = resposta.body.id;
  });

  test("não deve criar uma categoria com nome já existente", async () => {
    const resposta = await request(app)
      .post("/categories")
      .send({ name: "Suspense" });

    expect(resposta.status).toBe(409);
    expect(resposta.body.message).toBe("Já existe uma categoria com esse nome.");
  });

  test("não deve criar uma categoria com nome repetido mudando maiúsculas e espaços", async () => {
    const resposta = await request(app)
      .post("/categories")
      .send({ name: "  sUSPENSE  " });

    expect(resposta.status).toBe(409);
    expect(resposta.body.message).toBe("Já existe uma categoria com esse nome.");
  });

  test("não deve criar uma categoria com nome vazio", async () => {
    const resposta = await request(app)
      .post("/categories")
      .send({ name: "" });

    expect(resposta.status).toBe(400);
    expect(Array.isArray(resposta.body.errors)).toBe(true);
  });

  test("não deve criar uma categoria com nome só de espaços", async () => {
    const resposta = await request(app)
      .post("/categories")
      .send({ name: "   " });

    expect(resposta.status).toBe(400);
    expect(Array.isArray(resposta.body.errors)).toBe(true);
  });

  test("deve listar as categorias cadastradas", async () => {
    const resposta = await request(app).get("/categories");

    expect(resposta.status).toBe(200);
    expect(Array.isArray(resposta.body)).toBe(true);
    expect(resposta.body.length).toBeGreaterThan(0);
  });

  test("deve buscar uma categoria pelo id", async () => {
    const resposta = await request(app).get(`/categories/${idCriada}`);

    expect(resposta.status).toBe(200);
    expect(resposta.body.id).toBe(idCriada);
  });

  test("deve retornar 404 ao buscar uma categoria inexistente", async () => {
    const resposta = await request(app).get("/categories/999999");

    expect(resposta.status).toBe(404);
    expect(resposta.body.message).toBe("Categoria não encontrada.");
  });

  test("deve permitir atualizar a categoria mantendo o mesmo nome", async () => {
    const resposta = await request(app)
      .put(`/categories/${idCriada}`)
      .send({ name: "Suspense" });

    expect(resposta.status).toBe(200);
    expect(resposta.body.name).toBe("Suspense");
  });

  test("não deve atualizar uma categoria para um nome já usado por outra", async () => {
    const outra = await request(app)
      .post("/categories")
      .send({ name: "Aventura" });

    expect(outra.status).toBe(201);

    const resposta = await request(app)
      .put(`/categories/${idCriada}`)
      .send({ name: "aventura" });

    expect(resposta.status).toBe(409);
    expect(resposta.body.message).toBe("Já existe uma categoria com esse nome.");
  });

  test("deve atualizar uma categoria existente", async () => {
    const resposta = await request(app)
      .put(`/categories/${idCriada}`)
      .send({ name: "Suspense e Mistério" });

    expect(resposta.status).toBe(200);
    expect(resposta.body.name).toBe("Suspense e Mistério");
  });

  test("deve remover uma categoria existente", async () => {
    const resposta = await request(app).delete(`/categories/${idCriada}`);

    expect(resposta.status).toBe(204);
  });

  test("deve retornar 404 ao tentar remover uma categoria já removida", async () => {
    const resposta = await request(app).delete(`/categories/${idCriada}`);

    expect(resposta.status).toBe(404);
  });
});

describe("Proteção na exclusão de categorias", () => {
  let categoriaComLivro;
  let categoriaSemLivro;
  let livro;

  beforeAll(async () => {
    await prisma.book.deleteMany();
    await prisma.category.deleteMany();

    categoriaComLivro = await prisma.category.create({
      data: { name: "Categoria com livro" },
    });

    categoriaSemLivro = await prisma.category.create({
      data: { name: "Categoria sem livro" },
    });

    livro = await prisma.book.create({
      data: {
        title: "Livro de teste",
        isbn: "9780000000002",
        publishedAt: new Date("2000-01-01T00:00:00.000Z"),
        pages: 100,
        priceDigital: 10,
        pricePhysical: 20,
        categoryId: categoriaComLivro.id,
      },
    });
  });

  afterAll(async () => {
    await prisma.book.deleteMany();
    await prisma.category.deleteMany();
  });

  test("não deve remover uma categoria que possui livros associados", async () => {
    const resposta = await request(app).delete(`/categories/${categoriaComLivro.id}`);

    expect(resposta.status).toBe(409);
    expect(resposta.body.message).toBe(
      "Não é possível remover a categoria, pois existem livros associados a ela."
    );

    const categoria = await request(app).get(`/categories/${categoriaComLivro.id}`);
    expect(categoria.status).toBe(200);

    const livroAtual = await request(app).get(`/books/${livro.id}`);
    expect(livroAtual.status).toBe(200);
    expect(livroAtual.body.category.id).toBe(categoriaComLivro.id);
  });

  test("deve remover uma categoria que não possui livros", async () => {
    const resposta = await request(app).delete(`/categories/${categoriaSemLivro.id}`);

    expect(resposta.status).toBe(204);
  });

  test("deve permitir remover a categoria depois que o livro for removido", async () => {
    await prisma.book.delete({ where: { id: livro.id } });

    const resposta = await request(app).delete(`/categories/${categoriaComLivro.id}`);

    expect(resposta.status).toBe(204);
  });
});