import request from "supertest";
import app from "./app.js";
import prisma from "./config/prisma.js";

let authorIds;
let categoryId;

function livroValido(sobrescritas = {}) {
  return {
    title: "Livro de teste",
    isbn: "9780000000011",
    publishedAt: "2000-01-01T00:00:00.000Z",
    pages: 100,
    priceDigital: 29.9,
    pricePhysical: 59.9,
    coverImageUrl: "https://exemplo.com/capa.jpg",
    authorIds,
    categoryId,
    ...sobrescritas,
  };
}

beforeAll(async () => {
  await prisma.book.deleteMany();
  await prisma.author.deleteMany();
  await prisma.category.deleteMany();

  const autores = await prisma.author.createManyAndReturn({
    data: [{ name: "Autor de teste 1" }, { name: "Autor de teste 2" }],
  });
  authorIds = autores.map((autor) => autor.id);

  const categoria = await prisma.category.create({
    data: { name: "Categoria de teste" },
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
  let idSegundoLivro;

  test("deve criar um livro com dois autores, preços e capa", async () => {
    const resposta = await request(app).post("/books").send(livroValido());

    expect(resposta.status).toBe(201);
    expect(resposta.body).toHaveProperty("id");
    expect(resposta.body.authors).toHaveLength(2);
    expect(resposta.body.category.id).toBe(categoryId);
    expect(Number(resposta.body.priceDigital)).toBe(29.9);
    expect(Number(resposta.body.pricePhysical)).toBe(59.9);
    expect(resposta.body.coverImageUrl).toBe("https://exemplo.com/capa.jpg");

    idCriado = resposta.body.id;
  });

  test("deve criar um livro sem capa", async () => {
    const resposta = await request(app)
      .post("/books")
      .send(
        livroValido({
          title: "Livro sem capa",
          isbn: "9780000000012",
          authorIds: [authorIds[0]],
          coverImageUrl: undefined,
        })
      );

    expect(resposta.status).toBe(201);
    expect(resposta.body.coverImageUrl).toBeNull();
    expect(resposta.body.authors).toHaveLength(1);

    idSegundoLivro = resposta.body.id;
  });

  test("não deve criar um livro com ISBN repetido", async () => {
    const resposta = await request(app).post("/books").send(livroValido());

    expect(resposta.status).toBe(409);
    expect(resposta.body.message).toBe("Já existe um livro cadastrado com esse ISBN.");
  });

  test("não deve criar um livro com autor inexistente", async () => {
    const resposta = await request(app)
      .post("/books")
      .send(livroValido({ isbn: "9780000000013", authorIds: [999999] }));

    expect(resposta.status).toBe(404);
    expect(resposta.body.message).toBe("Um ou mais autores informados não foram encontrados.");
  });

  test("não deve criar um livro com categoria inexistente", async () => {
    const resposta = await request(app)
      .post("/books")
      .send(livroValido({ isbn: "9780000000013", categoryId: 999999 }));

    expect(resposta.status).toBe(404);
    expect(resposta.body.message).toBe("Categoria informada não foi encontrada.");
  });

  test("não deve criar um livro com dados inválidos", async () => {
    const resposta = await request(app).post("/books").send({ title: "" });

    expect(resposta.status).toBe(400);
    expect(Array.isArray(resposta.body.errors)).toBe(true);
  });

  test("não deve criar um livro com preço digital de 3 casas decimais", async () => {
    const resposta = await request(app)
      .post("/books")
      .send(livroValido({ isbn: "9780000000013", priceDigital: 29.999 }));

    expect(resposta.status).toBe(400);
    expect(resposta.body.errors).toContain(
      "O preço digital deve ter no máximo 2 casas decimais."
    );
  });

  test("não deve criar um livro com preço físico negativo", async () => {
    const resposta = await request(app)
      .post("/books")
      .send(livroValido({ isbn: "9780000000013", pricePhysical: -5 }));

    expect(resposta.status).toBe(400);
    expect(resposta.body.errors).toContain("O preço físico não pode ser negativo.");
  });

  test("não deve criar um livro com preço acima do máximo permitido", async () => {
    const resposta = await request(app)
      .post("/books")
      .send(livroValido({ isbn: "9780000000013", priceDigital: 100000000 }));

    expect(resposta.status).toBe(400);
    expect(resposta.body.errors).toContain(
      "O preço digital excede o valor máximo permitido."
    );
  });

  test("não deve criar um livro sem o preço digital", async () => {
    const resposta = await request(app)
      .post("/books")
      .send(livroValido({ isbn: "9780000000013", priceDigital: undefined }));

    expect(resposta.status).toBe(400);
    expect(resposta.body.errors.length).toBeGreaterThan(0);
  });

  test("não deve criar um livro com URL de capa de protocolo não permitido", async () => {
    const resposta = await request(app)
      .post("/books")
      .send(livroValido({ isbn: "9780000000013", coverImageUrl: "javascript:alert(1)" }));

    expect(resposta.status).toBe(400);
    expect(resposta.body.errors).toContain(
      "A URL da capa deve começar com http:// ou https://."
    );
  });

  test("não deve criar um livro com URL de capa sem protocolo", async () => {
    const resposta = await request(app)
      .post("/books")
      .send(livroValido({ isbn: "9780000000013", coverImageUrl: "capa.jpg" }));

    expect(resposta.status).toBe(400);
    expect(resposta.body.errors).toContain(
      "A URL da capa deve começar com http:// ou https://."
    );
  });

  test("deve listar os livros cadastrados", async () => {
    const resposta = await request(app).get("/books");

    expect(resposta.status).toBe(200);
    expect(Array.isArray(resposta.body.data)).toBe(true);
    expect(resposta.body.data.length).toBeGreaterThan(0);
    expect(resposta.body.meta).toHaveProperty("total");
  });

  test("deve filtrar livros por título sem diferenciar maiúsculas", async () => {
    const resposta = await request(app).get("/books").query({ title: "SEM CAPA" });

    expect(resposta.status).toBe(200);
    expect(resposta.body.data).toHaveLength(1);
    expect(resposta.body.data[0].title).toBe("Livro sem capa");
  });

  test("deve paginar a listagem de livros", async () => {
    const resposta = await request(app).get("/books").query({ page: 1, perPage: 1 });

    expect(resposta.status).toBe(200);
    expect(resposta.body.data).toHaveLength(1);
    expect(resposta.body.meta.total).toBe(2);
    expect(resposta.body.meta.totalPages).toBe(2);
  });

  test("deve buscar um livro pelo id", async () => {
    const resposta = await request(app).get(`/books/${idCriado}`);

    expect(resposta.status).toBe(200);
    expect(resposta.body.id).toBe(idCriado);
    expect(resposta.body.authors).toHaveLength(2);
    expect(Number(resposta.body.priceDigital)).toBe(29.9);
    expect(Number(resposta.body.pricePhysical)).toBe(59.9);
  });

  test("deve retornar 404 ao buscar um livro inexistente", async () => {
    const resposta = await request(app).get("/books/999999");

    expect(resposta.status).toBe(404);
    expect(resposta.body.message).toBe("Livro não encontrado.");
  });

  test("deve atualizar apenas os preços de um livro", async () => {
    const resposta = await request(app)
      .put(`/books/${idCriado}`)
      .send({ priceDigital: 24.99, pricePhysical: 54.9 });

    expect(resposta.status).toBe(200);
    expect(Number(resposta.body.priceDigital)).toBe(24.99);
    expect(Number(resposta.body.pricePhysical)).toBe(54.9);
    expect(resposta.body.title).toBe("Livro de teste");
  });

  test("deve remover a capa de um livro enviando null", async () => {
    const resposta = await request(app)
      .put(`/books/${idCriado}`)
      .send({ coverImageUrl: null });

    expect(resposta.status).toBe(200);
    expect(resposta.body.coverImageUrl).toBeNull();
  });

  test("deve atualizar a capa de um livro", async () => {
    const resposta = await request(app)
      .put(`/books/${idCriado}`)
      .send({ coverImageUrl: "https://exemplo.com/nova-capa.jpg" });

    expect(resposta.status).toBe(200);
    expect(resposta.body.coverImageUrl).toBe("https://exemplo.com/nova-capa.jpg");
  });

  test("deve substituir a lista de autores de um livro", async () => {
    const resposta = await request(app)
      .put(`/books/${idCriado}`)
      .send({ authorIds: [authorIds[1]] });

    expect(resposta.status).toBe(200);
    expect(resposta.body.authors).toHaveLength(1);
    expect(resposta.body.authors[0].id).toBe(authorIds[1]);
  });

  test("não deve atualizar um livro com preço inválido", async () => {
    const resposta = await request(app)
      .put(`/books/${idCriado}`)
      .send({ priceDigital: -1 });

    expect(resposta.status).toBe(400);
    expect(resposta.body.errors).toContain("O preço digital não pode ser negativo.");
  });

  test("não deve atualizar um livro para o ISBN de outro livro", async () => {
    const resposta = await request(app)
      .put(`/books/${idCriado}`)
      .send({ isbn: "9780000000012" });

    expect(resposta.status).toBe(409);
    expect(resposta.body.message).toBe("Já existe outro livro cadastrado com esse ISBN.");
  });

  test("deve permitir atualizar um livro mantendo o próprio ISBN", async () => {
    const resposta = await request(app)
      .put(`/books/${idCriado}`)
      .send({ isbn: "9780000000011" });

    expect(resposta.status).toBe(200);
    expect(resposta.body.isbn).toBe("9780000000011");
  });

  test("não deve atualizar um livro para uma categoria inexistente", async () => {
    const resposta = await request(app)
      .put(`/books/${idCriado}`)
      .send({ categoryId: 999999 });

    expect(resposta.status).toBe(404);
    expect(resposta.body.message).toBe("Categoria informada não foi encontrada.");
  });

  test("não deve atualizar um livro para um autor inexistente", async () => {
    const resposta = await request(app)
      .put(`/books/${idCriado}`)
      .send({ authorIds: [999999] });

    expect(resposta.status).toBe(404);
    expect(resposta.body.message).toBe("Um ou mais autores informados não foram encontrados.");
  });

  test("deve retornar 404 ao atualizar um livro inexistente", async () => {
    const resposta = await request(app).put("/books/999999").send({ pages: 10 });

    expect(resposta.status).toBe(404);
    expect(resposta.body.message).toBe("Livro não encontrado.");
  });

  test("deve apagar um livro existente", async () => {
    const resposta = await request(app).delete(`/books/${idCriado}`);

    expect(resposta.status).toBe(204);
  });

  test("deve retornar 404 ao tentar apagar um livro já apagado", async () => {
    const resposta = await request(app).delete(`/books/${idCriado}`);

    expect(resposta.status).toBe(404);
  });

  test("deve apagar o segundo livro", async () => {
    const resposta = await request(app).delete(`/books/${idSegundoLivro}`);

    expect(resposta.status).toBe(204);
  });
});