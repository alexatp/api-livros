import bookRepository from "../repositories/book.repository.js";
import authorRepository from "../repositories/author.repository.js";
import categoryRepository from "../repositories/category.repository.js";
import AppError from "../utils/app-error.js";

async function validateAuthorIds(authorIds) {
  const autores = await authorRepository.findManyByIds(authorIds);

  if (autores.length < new Set(authorIds).size) {
    throw new AppError("Um ou mais autores informados não foram encontrados.", 404);
  }
}

async function validateCategoryId(categoryId) {
  const categoria = await categoryRepository.findById(categoryId);

  if (!categoria) {
    throw new AppError("Categoria informada não foi encontrada.", 404);
  }
}

async function createBook(dados) {
  const livroExistente = await bookRepository.findByIsbn(dados.isbn);

  if (livroExistente) {
    throw new AppError("Já existe um livro cadastrado com esse ISBN.", 409);
  }

  await validateAuthorIds(dados.authorIds);
  await validateCategoryId(dados.categoryId);

  return bookRepository.create(dados);
}

async function listBooks({ page = 1, perPage = 10, title } = {}) {
  const { livros, total } = await bookRepository.findAll({ page, perPage, title });

  return {
    data: livros,
    meta: { page, perPage, total, totalPages: Math.ceil(total / perPage) },
  };
}

async function getBookById(id) {
  const livro = await bookRepository.findById(id);

  if (!livro) {
    throw new AppError("Livro não encontrado.", 404);
  }

  return livro;
}

async function updateBook(id, dados) {
  await getBookById(id);

  if (dados.isbn) {
    const livroComMesmoIsbn = await bookRepository.findByIsbn(dados.isbn);

    if (livroComMesmoIsbn && livroComMesmoIsbn.id !== id) {
      throw new AppError("Já existe outro livro cadastrado com esse ISBN.", 409);
    }
  }

  if (dados.authorIds) {
    await validateAuthorIds(dados.authorIds);
  }

  if (dados.categoryId) {
    await validateCategoryId(dados.categoryId);
  }

  return bookRepository.update(id, dados);
}

async function deleteBook(id) {
  await getBookById(id);
  return bookRepository.remove(id);
}

export default { createBook, listBooks, getBookById, updateBook, deleteBook };