import prisma from "../config/prisma.js";

async function create(data) {
  const { authorIds, ...bookData } = data;

  return prisma.book.create({
    data: {
      ...bookData,
      authors: { connect: authorIds.map((id) => ({ id })) },
    },
    include: { authors: true, category: true },
  });
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
      include: { authors: true, category: true },
    }),
    prisma.book.count({ where }),
  ]);

  return { livros, total };
}

async function findById(id) {
  return prisma.book.findUnique({
    where: { id },
    include: { authors: true, category: true },
  });
}

async function findByIsbn(isbn) {
  return prisma.book.findUnique({
    where: { isbn },
    include: { authors: true, category: true },
  });
}

async function update(id, data) {
  const { authorIds, ...bookData } = data;
  const authors = authorIds
    ? { authors: { set: authorIds.map((authorId) => ({ id: authorId })) } }
    : {};

  return prisma.book.update({
    where: { id },
    data: { ...bookData, ...authors },
    include: { authors: true, category: true },
  });
}

async function remove(id) {
  return prisma.book.delete({ where: { id } });
}

export default { create, findAll, findById, findByIsbn, update, remove };