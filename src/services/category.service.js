import categoryRepository from "../repositories/category.repository.js";
import AppError from "../utils/app-error.js";

async function createCategory(dados) {
  return categoryRepository.create(dados);
}

async function listCategories() {
  return categoryRepository.findAll();
}

async function getCategoryById(id) {
  const categoria = await categoryRepository.findById(id);

  if (!categoria) {
    throw new AppError("Categoria não encontrada.", 404);
  }

  return categoria;
}

async function updateCategory(id, dados) {
  await getCategoryById(id);

  return categoryRepository.update(id, dados);
}

async function deleteCategory(id) {
  await getCategoryById(id);

  return categoryRepository.remove(id);
}

export default {
  createCategory,
  listCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};