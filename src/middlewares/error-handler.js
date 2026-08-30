import AppError from "../utils/app-error.js";

function errorHandler(erro, req, res, next) {
  console.error(erro);

  if (erro instanceof AppError) {
    return res.status(erro.statusCode).json({ message: erro.message });
  }

  return res.status(500).json({ message: "Erro interno no servidor." });
}

export default errorHandler;