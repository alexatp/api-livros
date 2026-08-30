import bookRepository from "../repositories/book.repository.js";
import AppError from "../utils/app-error.js";

async function createBook(dados) {
  const livroExistente = await bookRepository.findByIsbn(dados.isbn);

  if (livroExistente) {
    throw new AppError("Já existe um livro cadastrado com esse ISBN.", 409);
  }

  return bookRepository.create(dados);
}

async function listBooks({ page = 1, perPage = 10, title } = {}) {
  const { livros, total } = await bookRepository.findAll({ page, perPage, title });

  return {
    data: livros,
    meta: {
      page,
      perPage,
      total,
      totalPages: Math.ceil(total / perPage),
    },
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

  return bookRepository.update(id, dados);
}

async function deleteBook(id) {
  await getBookById(id);

  return bookRepository.remove(id);
}

export default {
  createBook,
  listBooks,
  getBookById,
  updateBook,
  deleteBook,
};