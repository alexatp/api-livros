import bookService from "../services/book.service.js";

async function create(req, res, next) {
  try {
    const livro = await bookService.createBook(req.body);
    res.status(201).json(livro);
  } catch (erro) {
    next(erro);
  }
}

async function list(req, res, next) {
  try {
    const page = Number(req.query.page) || 1;
    const perPage = Number(req.query.perPage) || 10;
    const title = req.query.title;

    const resultado = await bookService.listBooks({ page, perPage, title });
    res.status(200).json(resultado);
  } catch (erro) {
    next(erro);
  }
}

async function getById(req, res, next) {
  try {
    const id = Number(req.params.id);
    const livro = await bookService.getBookById(id);
    res.status(200).json(livro);
  } catch (erro) {
    next(erro);
  }
}

async function update(req, res, next) {
  try {
    const id = Number(req.params.id);
    const livro = await bookService.updateBook(id, req.body);
    res.status(200).json(livro);
  } catch (erro) {
    next(erro);
  }
}

async function remove(req, res, next) {
  try {
    const id = Number(req.params.id);
    await bookService.deleteBook(id);
    res.status(204).send();
  } catch (erro) {
    next(erro);
  }
}

export default {
  create,
  list,
  getById,
  update,
  remove,
};