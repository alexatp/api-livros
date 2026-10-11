import categoryService from "../services/category.service.js";

async function create(req, res, next) {
  try {
    const categoria = await categoryService.createCategory(req.body);
    res.status(201).json(categoria);
  } catch (erro) {
    next(erro);
  }
}

async function list(req, res, next) {
  try {
    const categorias = await categoryService.listCategories();
    res.status(200).json(categorias);
  } catch (erro) {
    next(erro);
  }
}

async function getById(req, res, next) {
  try {
    const id = Number(req.params.id);
    const categoria = await categoryService.getCategoryById(id);
    res.status(200).json(categoria);
  } catch (erro) {
    next(erro);
  }
}

async function update(req, res, next) {
  try {
    const id = Number(req.params.id);
    const categoria = await categoryService.updateCategory(id, req.body);
    res.status(200).json(categoria);
  } catch (erro) {
    next(erro);
  }
}

async function remove(req, res, next) {
  try {
    const id = Number(req.params.id);
    await categoryService.deleteCategory(id);
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