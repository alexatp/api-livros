import request from "supertest";
import app from "./app.js";
import prisma from "./config/prisma.js";

beforeAll(async () => {
  await prisma.book.deleteMany();
  await prisma.author.deleteMany();
});

afterAll(async () => {
  await prisma.book.deleteMany();
  await prisma.author.deleteMany();
  await prisma.$disconnect();
});

describe("CRUD de autores", () => {
  let idCriado;

  test("deve criar um autor com sucesso", async () => {
    const resposta = await request(app)
      .post("/authors")
      .send({ name: "Machado de Assis", bio: "Escritor brasileiro." });

    expect(resposta.status).toBe(201);
    expect(resposta.body).toHaveProperty("id");
    expect(resposta.body.name).toBe("Machado de Assis");
    idCriado = resposta.body.id;
  });

  test("não deve criar um autor com nome vazio", async () => {
    const resposta = await request(app).post("/authors").send({ name: "" });

    expect(resposta.status).toBe(400);
    expect(Array.isArray(resposta.body.errors)).toBe(true);
  });

  test("deve listar os autores cadastrados", async () => {
    const resposta = await request(app).get("/authors");

    expect(resposta.status).toBe(200);
    expect(Array.isArray(resposta.body.data)).toBe(true);
    expect(resposta.body.data.length).toBeGreaterThan(0);
  });

  test("deve buscar um autor pelo id", async () => {
    const resposta = await request(app).get(`/authors/${idCriado}`);

    expect(resposta.status).toBe(200);
    expect(resposta.body.id).toBe(idCriado);
  });

  test("deve retornar 404 ao buscar um autor inexistente", async () => {
    const resposta = await request(app).get("/authors/999999");

    expect(resposta.status).toBe(404);
    expect(resposta.body.message).toBe("Autor não encontrado.");
  });

  test("deve atualizar um autor existente", async () => {
    const resposta = await request(app)
      .put(`/authors/${idCriado}`)
      .send({ bio: "Romancista brasileiro." });

    expect(resposta.status).toBe(200);
    expect(resposta.body.bio).toBe("Romancista brasileiro.");
  });

  test("deve remover um autor existente", async () => {
    const resposta = await request(app).delete(`/authors/${idCriado}`);

    expect(resposta.status).toBe(204);
  });

  test("deve retornar 404 ao remover um autor já removido", async () => {
    const resposta = await request(app).delete(`/authors/${idCriado}`);

    expect(resposta.status).toBe(404);
    expect(resposta.body.message).toBe("Autor não encontrado.");
  });
});
