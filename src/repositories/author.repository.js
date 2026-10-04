import prisma from "../config/prisma.js";

async function create(data) {
  return prisma.author.create({ data });
}

async function findAll({ page, perPage }) {
  const [autores, total] = await Promise.all([
    prisma.author.findMany({
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: { createdAt: "desc" },
    }),
    prisma.author.count(),
  ]);

  return { autores, total };
}

async function findById(id) {
  return prisma.author.findUnique({ where: { id } });
}

async function findManyByIds(ids) {
  return prisma.author.findMany({ where: { id: { in: ids } } });
}

async function update(id, data) {
  return prisma.author.update({ where: { id }, data });
}

async function remove(id) {
  return prisma.author.delete({ where: { id } });
}

export default { create, findAll, findById, findManyByIds, update, remove };
