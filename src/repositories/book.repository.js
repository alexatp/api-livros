import prisma from "../config/prisma.js";

async function create(data) {
  return prisma.book.create({ data });
}

async function findAll({ page, perPage, title }) {
  const where = title
    ? { title: { contains: title, mode: "insensitive" } }
    : {};

  const [livros, total] = await Promise.all([
    prisma.book.findMany({
      where,
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: { createdAt: "desc" },
    }),
    prisma.book.count({ where }),
  ]);

  return { livros, total };
}

async function findById(id) {
  return prisma.book.findUnique({ where: { id } });
}

async function findByIsbn(isbn) {
  return prisma.book.findUnique({ where: { isbn } });
}

async function update(id, data) {
  return prisma.book.update({ where: { id }, data });
}

async function remove(id) {
  return prisma.book.delete({ where: { id } });
}

export default {
  create,
  findAll,
  findById,
  findByIsbn,
  update,
  remove,
};