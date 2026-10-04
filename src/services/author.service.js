import authorRepository from "../repositories/author.repository.js";
import AppError from "../utils/app-error.js";

async function createAuthor(dados) {
  return authorRepository.create(dados);
}

async function listAuthors({ page = 1, perPage = 10 } = {}) {
  const { autores, total } = await authorRepository.findAll({ page, perPage });

  return {
    data: autores,
    meta: { page, perPage, total, totalPages: Math.ceil(total / perPage) },
  };
}

async function getAuthorById(id) {
  const autor = await authorRepository.findById(id);

  if (!autor) {
    throw new AppError("Autor não encontrado.", 404);
  }

  return autor;
}

async function updateAuthor(id, dados) {
  await getAuthorById(id);
  return authorRepository.update(id, dados);
}

async function deleteAuthor(id) {
  await getAuthorById(id);
  return authorRepository.remove(id);
}

export default { createAuthor, listAuthors, getAuthorById, updateAuthor, deleteAuthor };
