import dotenv from "dotenv";

const path = process.env.NODE_ENV === "test" ? ".env.test" : ".env";

dotenv.config({ path, override: true });

if (process.env.NODE_ENV === "test" && !process.env.DATABASE_URL?.includes("_test")) {
  throw new Error(
    'A variável DATABASE_URL não aponta para um banco de dados de teste (o nome do banco deveria conter "_test"). A execução foi interrompida para proteger o banco principal.'
  );
}

console.log(`[ambiente] NODE_ENV="${process.env.NODE_ENV || "development"}", usando arquivo "${path}"`);