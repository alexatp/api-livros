import categoryRepository from "../repositories/category.repository.js";
import AppError from "../utils/app-error.js";

async function validateUniqueName(name, idAtual) {
  const existente = await categoryRepository.findByName(name);

  if (existente && existente.id !== idAtual) {
    throw new AppError("Já existe uma categoria com esse nome.", 409);
  }
}

async function createCategory(dados) {
  await validateUniqueName(dados.name);
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

  if (dados.name) {
    await validateUniqueName(dados.name, id);
  }

  return categoryRepository.update(id, dados);
}

async function deleteCategory(id) {
  await getCategoryById(id);

  const totalDeLivros = await categoryRepository.countBooks(id);

  if (totalDeLivros > 0) {
    throw new AppError(
      "Não é possível remover a categoria, pois existem livros associados a ela.",
      409
    );
  }

  return categoryRepository.remove(id);
}

export default {
  createCategory,
  listCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};