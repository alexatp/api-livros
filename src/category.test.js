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

  test("não deve criar uma categoria com nome vazio", async () => {
    const resposta = await request(app)
      .post("/categories")
      .send({ name: "" });

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