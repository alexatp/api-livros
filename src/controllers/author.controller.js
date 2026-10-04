import authorService from "../services/author.service.js";

async function create(req, res, next) {
  try {
    const autor = await authorService.createAuthor(req.body);
    res.status(201).json(autor);
  } catch (erro) {
    next(erro);
  }
}

async function list(req, res, next) {
  try {
    const page = Number(req.query.page) || 1;
    const perPage = Number(req.query.perPage) || 10;
    const resultado = await authorService.listAuthors({ page, perPage });
    res.status(200).json(resultado);
  } catch (erro) {
    next(erro);
  }
}

async function getById(req, res, next) {
  try {
    const id = Number(req.params.id);
    const autor = await authorService.getAuthorById(id);
    res.status(200).json(autor);
  } catch (erro) {
    next(erro);
  }
}

async function update(req, res, next) {
  try {
    const id = Number(req.params.id);
    const autor = await authorService.updateAuthor(id, req.body);
    res.status(200).json(autor);
  } catch (erro) {
    next(erro);
  }
}

async function remove(req, res, next) {
  try {
    const id = Number(req.params.id);
    await authorService.deleteAuthor(id);
    res.status(204).send();
  } catch (erro) {
    next(erro);
  }
}

export default { create, list, getById, update, remove };
