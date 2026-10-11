import prisma from "../config/prisma.js";

async function create(data) {
  return prisma.category.create({ data });
}

async function findAll() {
  return prisma.category.findMany();
}

async function findById(id) {
  return prisma.category.findUnique({ where: { id } });
}

async function findByName(name) {
  return prisma.category.findFirst({
    where: { name: { equals: name, mode: "insensitive" } },
  });
}

async function countBooks(id) {
  return prisma.book.count({ where: { categoryId: id } });
}

async function update(id, data) {
  return prisma.category.update({ where: { id }, data });
}

async function remove(id) {
  return prisma.category.delete({ where: { id } });
}

export default {
  create,
  findAll,
  findById,
  findByName,
  countBooks,
  update,
  remove,
};