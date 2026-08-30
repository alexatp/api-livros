# API de Livros

API RESTful para cadastro e gerenciamento de livros, construída com Node.js, Express, PostgreSQL e Prisma ORM. Desenvolvida como projeto de estudo seguindo uma arquitetura em camadas com separação de responsabilidades.

---

## Sumario

- [Visao Geral](#visao-geral)
- [Tecnologias](#tecnologias)
- [Pre-requisitos](#pre-requisitos)
- [Instalacao](#instalacao)
- [Variaveis de Ambiente](#variaveis-de-ambiente)
- [Banco de Dados e Migrations](#banco-de-dados-e-migrations)
- [Executando o Projeto](#executando-o-projeto)
- [Documentacao Interativa](#documentacao-interativa)
- [Endpoints da API](#endpoints-da-api)
- [Arquitetura do Projeto](#arquitetura-do-projeto)
- [Testes](#testes)
- [Scripts Disponiveis](#scripts-disponiveis)

---

## Visao Geral

A API permite realizar operacoes completas de CRUD (Create, Read, Update, Delete) sobre um catalogo de livros. Cada livro possui titulo, autor, ISBN unico, data de publicacao e numero de paginas.

Recursos da API:

- Listagem paginada com filtro por titulo
- Validacao de entrada com mensagens de erro descritivas
- Conflito de ISBN detectado e retornado como erro `409 Conflict`
- Tratamento centralizado de erros
- Documentacao interativa via Swagger UI
- Testes de integracao cobrindo todos os endpoints

---

## Tecnologias

| Categoria         | Tecnologia                  | Versao     |
|-------------------|-----------------------------|------------|
| Runtime           | Node.js                     | >= 18      |
| Framework HTTP    | Express                     | ^5.2.1     |
| ORM               | Prisma                      | ^6.19.3    |
| Banco de dados    | PostgreSQL                  | >= 14      |
| Validacao         | Zod                         | ^4.5.4     |
| Documentacao      | Swagger (swagger-jsdoc + swagger-ui-express) | - |
| Seguranca         | Helmet, CORS                | -          |
| Log de requisicoes| Morgan                      | ^1.12.0    |
| Variaveis de amb. | dotenv                      | ^17.4.2    |
| Testes            | Jest + Supertest            | -          |
| Hot reload        | Nodemon                     | ^3.1.14    |

---

## Pre-requisitos

Antes de iniciar, certifique-se de ter instalado em sua maquina:

- [Node.js](https://nodejs.org/) versao 18 ou superior
- [npm](https://www.npmjs.com/) versao 8 ou superior (incluido com o Node.js)
- [PostgreSQL](https://www.postgresql.org/) versao 14 ou superior, com um banco de dados criado e acessivel

---

## Instalacao

1. Clone o repositorio:

```bash
git clone https://github.com/seu-usuario/api-livros.git
cd api-livros
```

2. Instale as dependencias:

```bash
npm install
```

---

## Variaveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variaveis:

```env
# URL de conexao com o banco de dados PostgreSQL
DATABASE_URL="postgresql://USUARIO:SENHA@HOST:PORTA/NOME_DO_BANCO"

# Porta em que o servidor vai escutar (opcional, padrao: 3000)
PORT=3000

# Origem permitida para requisicoes CORS (opcional, padrao: *)
CORS_ORIGIN=*
```

**Exemplo de DATABASE_URL para ambiente local:**

```
DATABASE_URL="postgresql://postgres:minhasenha@localhost:5432/api_livros"
```

### Ambiente de Testes

Para executar os testes, crie um arquivo `.env.test` separado apontando para um banco de dados diferente. Os testes limpam todas as entradas antes e apos a execucao.

```env
DATABASE_URL="postgresql://postgres:minhasenha@localhost:5432/api_livros_test"
```

> **Atencao:** Nunca comite os arquivos `.env` e `.env.test` no repositorio. Adicione-os ao `.gitignore`.

---

## Banco de Dados e Migrations

O Prisma gerencia o esquema e as migrations do banco de dados.

### Aplicar as migrations no banco de dados:

```bash
npx prisma migrate deploy
```

### Criar uma nova migration apos alterar o schema:

```bash
npx prisma migrate dev --name nome_da_migration
```

### Modelo de dados

A tabela `Book` possui a seguinte estrutura:

| Campo         | Tipo        | Descricao                             |
|---------------|-------------|---------------------------------------|
| `id`          | Int (PK)    | Identificador unico, auto-incremento  |
| `title`       | String      | Titulo do livro                       |
| `author`      | String      | Nome do autor                         |
| `isbn`        | String      | ISBN unico do livro                   |
| `publishedAt` | DateTime    | Data de publicacao                    |
| `pages`       | Int         | Numero de paginas                     |
| `createdAt`   | DateTime    | Data de criacao do registro           |
| `updatedAt`   | DateTime    | Data da ultima atualizacao            |

---

## Executando o Projeto

### Modo desenvolvimento (com hot reload):

```bash
npm run dev
```

### Modo producao:

```bash
npm start
```

O servidor estara disponivel em `http://localhost:3000` (ou na porta definida em `PORT`).

---

## Documentacao Interativa

Com o servidor em execucao, acesse a documentacao Swagger UI em:

```
http://localhost:3000/docs
```

A interface permite visualizar e testar todos os endpoints diretamente pelo navegador, sem necessidade de ferramentas externas.

---

## Endpoints da API

Base URL: `http://localhost:3000`

### Livros

| Metodo   | Rota          | Descricao                          |
|----------|---------------|------------------------------------|
| `POST`   | `/books`      | Cria um novo livro                 |
| `GET`    | `/books`      | Lista todos os livros (paginado)   |
| `GET`    | `/books/:id`  | Busca um livro pelo ID             |
| `PUT`    | `/books/:id`  | Atualiza um livro existente        |
| `DELETE` | `/books/:id`  | Remove um livro                    |

---

### POST /books

Cria um novo livro.

**Corpo da requisicao (JSON):**

```json
{
  "title": "Dom Casmurro",
  "author": "Machado de Assis",
  "isbn": "9788525406958",
  "publishedAt": "1899-01-01T00:00:00.000Z",
  "pages": 256
}
```

**Campos obrigatorios:** `title`, `author`, `isbn`, `publishedAt`, `pages`

**Respostas:**

| Status | Descricao                        |
|--------|----------------------------------|
| `201`  | Livro criado com sucesso         |
| `400`  | Dados invalidos (falha na validacao) |
| `409`  | ISBN ja cadastrado               |

---

### GET /books

Lista todos os livros com suporte a paginacao e filtro por titulo.

**Parametros de query (opcionais):**

| Parametro | Tipo   | Padrao | Descricao                         |
|-----------|--------|--------|-----------------------------------|
| `page`    | Number | `1`    | Numero da pagina                  |
| `perPage` | Number | `10`   | Quantidade de registros por pagina|
| `title`   | String | -      | Filtro parcial por titulo (case-insensitive) |

**Exemplo:** `GET /books?page=1&perPage=5&title=dom`

**Resposta `200`:**

```json
{
  "data": [
    {
      "id": 1,
      "title": "Dom Casmurro",
      "author": "Machado de Assis",
      "isbn": "9788525406958",
      "publishedAt": "1899-01-01T00:00:00.000Z",
      "pages": 256,
      "createdAt": "2026-08-30T00:00:00.000Z",
      "updatedAt": "2026-08-30T00:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "perPage": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

---

### GET /books/:id

Busca um livro especifico pelo seu ID.

**Respostas:**

| Status | Descricao             |
|--------|-----------------------|
| `200`  | Livro encontrado      |
| `404`  | Livro nao encontrado  |

---

### PUT /books/:id

Atualiza parcialmente ou totalmente um livro existente. Todos os campos sao opcionais.

**Corpo da requisicao (JSON) — exemplo de atualizacao parcial:**

```json
{
  "pages": 300
}
```

**Respostas:**

| Status | Descricao                              |
|--------|----------------------------------------|
| `200`  | Livro atualizado com sucesso           |
| `400`  | Dados invalidos                        |
| `404`  | Livro nao encontrado                   |
| `409`  | ISBN ja pertence a outro livro         |

---

### DELETE /books/:id

Remove um livro pelo seu ID.

**Respostas:**

| Status | Descricao             |
|--------|-----------------------|
| `204`  | Livro removido        |
| `404`  | Livro nao encontrado  |

---

## Arquitetura do Projeto

O projeto segue uma arquitetura em camadas que separa as responsabilidades de cada parte do codigo:

```
src/
├── app.js                     # Configuracao do Express (middlewares, rotas)
├── server.js                  # Ponto de entrada, inicializa o servidor
├── book.test.js               # Testes de integracao
├── config/
│   ├── prisma.js              # Instancia singleton do Prisma Client
│   └── swagger.js             # Configuracao do Swagger/OpenAPI
├── controllers/
│   └── book.controller.js     # Recebe requisicoes HTTP e envia respostas
├── services/
│   └── book.service.js        # Regras de negocio (ex: validar ISBN duplicado)
├── repositories/
│   └── book.repository.js     # Acesso ao banco de dados via Prisma
├── routes/
│   └── book.routes.js         # Definicao de rotas e anotacoes OpenAPI
├── middlewares/
│   ├── validate.js            # Middleware de validacao com Zod
│   └── error-handler.js       # Tratamento centralizado de erros
├── validations/
│   └── book.validation.js     # Schemas de validacao Zod
└── utils/
    └── app-error.js           # Classe de erro customizado com statusCode
```

**Fluxo de uma requisicao:**

```
Requisicao HTTP
     |
  Router (routes/)
     |
  Middleware de validacao (middlewares/validate.js)
     |
  Controller (controllers/)
     |
  Service — regras de negocio (services/)
     |
  Repository — acesso a dados (repositories/)
     |
  Banco de dados (PostgreSQL via Prisma)
```

Erros lancados em qualquer camada com `AppError` sao capturados pelo middleware `error-handler.js` e retornados como resposta JSON com o status HTTP apropriado.

---

## Testes

Os testes de integracao cobrem o ciclo completo de cada endpoint, incluindo cenarios de sucesso e de erro.

Cenarios testados:

- Criar um livro com dados validos
- Rejeitar criacao com ISBN duplicado (`409`)
- Rejeitar criacao com dados invalidos (`400`)
- Listar livros com paginacao
- Buscar livro por ID
- Retornar `404` para livro inexistente
- Atualizar um livro existente
- Remover um livro existente
- Retornar `404` ao tentar remover livro ja removido

### Executar os testes:

```bash
npm test
```

Os testes utilizam o banco definido em `.env.test` e limpam todos os registros antes e depois da execucao para garantir isolamento.

---

## Scripts Disponiveis

| Script       | Comando       | Descricao                                               |
|--------------|---------------|---------------------------------------------------------|
| `dev`        | `npm run dev` | Inicia o servidor em modo desenvolvimento com nodemon  |
| `start`      | `npm start`   | Inicia o servidor em modo producao                     |
| `test`       | `npm test`    | Executa os testes de integracao com Jest               |
