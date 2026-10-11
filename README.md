# API de Livros

API RESTful para cadastro e gerenciamento de livros, autores e categorias, construida com Node.js, Express, PostgreSQL e Prisma ORM. Desenvolvida como projeto de estudo seguindo uma arquitetura em camadas com separacao de responsabilidades.

---

## Sumario

- [Visao Geral](#visao-geral)
- [Tecnologias](#tecnologias)
- [Pre-requisitos](#pre-requisitos)
- [Instalacao](#instalacao)
- [Variaveis de Ambiente](#variaveis-de-ambiente)
- [Banco de Dados e Migrations](#banco-de-dados-e-migrations)
- [Modelo de Dados](#modelo-de-dados)
- [Executando o Projeto](#executando-o-projeto)
- [Documentacao Interativa](#documentacao-interativa)
- [Arquivo de Requisicoes](#arquivo-de-requisicoes)
- [Endpoints da API](#endpoints-da-api)
- [Regras de Negocio](#regras-de-negocio)
- [Arquitetura do Projeto](#arquitetura-do-projeto)
- [Testes](#testes)
- [Scripts Disponiveis](#scripts-disponiveis)
- [Proximos Passos](#proximos-passos)

---

## Visao Geral

A API permite realizar operacoes completas de CRUD (Create, Read, Update, Delete) sobre um catalogo de livros, autores e categorias. Um livro possui titulo, ISBN unico, data de publicacao, numero de paginas, preco digital, preco fisico, URL de capa (opcional), um ou mais autores e uma categoria.

Recursos da API:

- CRUD completo de Livros, Autores e Categorias
- Relacionamento muitos-para-muitos entre Livro e Autor (um livro pode ter varios autores)
- Relacionamento muitos-para-um entre Livro e Categoria (um livro pertence a uma categoria, uma categoria tem varios livros)
- Preco do livro em dois formatos (digital e fisico), com validacao de valor e de casas decimais
- URL da imagem de capa, restrita aos protocolos http e https
- Listagem paginada de livros (com filtro por titulo) e de autores
- Validacao de entrada com mensagens de erro descritivas
- Conflito de ISBN detectado e retornado como erro `409 Conflict`
- Nome de categoria unico, sem diferenciar maiusculas, minusculas e espacos nas pontas
- Protecao de integridade: autor ou categoria com livros associados nao podem ser removidos (`409 Conflict`)
- Validacao de existencia de autores e categoria antes de associar a um livro
- Tratamento centralizado de erros, sem exposicao de detalhes internos
- Documentacao interativa via Swagger UI
- Testes de integracao cobrindo todos os endpoints dos tres modulos
- Banco de dados de testes isolado, com script de sincronizacao de migrations

---

## Tecnologias

| Categoria         | Tecnologia                                   | Versao     |
|-------------------|-----------------------------------------------|------------|
| Runtime           | Node.js                                      | >= 18      |
| Framework HTTP    | Express                                      | ^5.2.1     |
| ORM               | Prisma                                       | ^6.19.3    |
| Banco de dados    | PostgreSQL                                   | >= 14      |
| Validacao         | Zod                                          | ^4.5.4     |
| Documentacao      | Swagger (swagger-jsdoc + swagger-ui-express) | -          |
| Seguranca         | Helmet, CORS                                 | -          |
| Log de requisicoes| Morgan                                       | ^1.12.0    |
| Variaveis de amb. | dotenv, dotenv-cli                           | ^17.4.2    |
| Testes            | Jest + Supertest                             | -          |
| Utilitario de CLI | cross-env                                    | -          |
| Hot reload        | Nodemon                                      | ^3.1.14    |

---

## Pre-requisitos

Antes de iniciar, certifique-se de ter instalado em sua maquina:

- [Node.js](https://nodejs.org/) versao 18 ou superior
- [npm](https://www.npmjs.com/) versao 8 ou superior (incluido com o Node.js)
- [PostgreSQL](https://www.postgresql.org/) versao 14 ou superior, com **dois** bancos de dados criados e acessiveis: um principal e um dedicado a testes (ver secao [Variaveis de Ambiente](#variaveis-de-ambiente))

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
# URL de conexao com o banco de dados PostgreSQL principal
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

Para executar os testes, crie um arquivo `.env.test` separado, apontando para um banco de dados **diferente** do principal. O nome do banco de testes deve conter o sufixo `_test`; o projeto recusa a execucao dos testes caso a `DATABASE_URL` carregada nao contenha esse sufixo, como protecao contra a execucao acidental dos testes contra o banco principal.

```env
DATABASE_URL="postgresql://postgres:minhasenha@localhost:5432/api_livros_test"
CORS_ORIGIN=*
```

O carregamento do arquivo de ambiente correto (`.env` ou `.env.test`) e feito de forma centralizada pelo modulo `src/config/load-env.js`, carregado antes de qualquer outro modulo da aplicacao, tanto ao iniciar o servidor (`server.js`) quanto ao rodar os testes (configurado via `setupFiles` no Jest, em `package.json`).

> **Atencao:** Nunca comite os arquivos `.env` e `.env.test` no repositorio. Eles ja estao listados no `.gitignore`. Use o arquivo `.env.example` como referencia dos valores esperados.

---

## Banco de Dados e Migrations

O Prisma gerencia o esquema e as migrations do banco de dados. Como o projeto usa dois bancos (principal e de testes), as migrations precisam ser aplicadas nos dois.

### Aplicar as migrations no banco principal:

```bash
npx prisma migrate deploy
```

### Aplicar as migrations no banco de testes:

```bash
npm run migrate:test
```

### Criar uma nova migration apos alterar o schema:

```bash
npx prisma migrate dev --name nome_da_migration
npm run migrate:test
```

O primeiro comando cria e aplica a migration no banco principal. O segundo aplica a mesma migration, ja existente, no banco de testes, usando `prisma migrate deploy` por tras dos panos (que apenas aplica migrations existentes, sem criar novas). Sempre rode os dois comandos juntos ao alterar o schema, para manter os dois bancos sincronizados.

---

## Modelo de Dados

### Book

| Campo           | Tipo            | Descricao                                          |
|-----------------|-----------------|-----------------------------------------------------|
| `id`            | Int (PK)        | Identificador unico, auto-incremento                |
| `title`         | String          | Titulo do livro                                     |
| `isbn`          | String          | ISBN unico do livro                                 |
| `publishedAt`   | DateTime        | Data de publicacao                                  |
| `pages`         | Int             | Numero de paginas                                   |
| `priceDigital`  | Decimal(10, 2)  | Preco da versao digital (obrigatorio)               |
| `pricePhysical` | Decimal(10, 2)  | Preco da versao fisica (obrigatorio)                |
| `coverImageUrl` | String?         | URL da imagem de capa, http ou https (opcional)     |
| `categoryId`    | Int (FK)        | Referencia a categoria do livro                     |
| `authors`       | Author[]        | Lista de autores associados (muitos-para-muitos)    |
| `createdAt`     | DateTime        | Data de criacao do registro                         |
| `updatedAt`     | DateTime        | Data da ultima atualizacao                          |

> **Nota sobre os precos:** o tipo `Decimal` e serializado como **texto** no JSON de resposta (por exemplo, `"29.90"`), para nao perder precisao. Na entrada, os precos sao enviados como numero (por exemplo, `29.9`).

### Author

| Campo       | Tipo     | Descricao                                 |
|-------------|----------|--------------------------------------------|
| `id`        | Int (PK) | Identificador unico, auto-incremento       |
| `name`      | String   | Nome do autor                              |
| `bio`       | String?  | Biografia resumida (opcional)              |
| `books`     | Book[]   | Livros associados a esse autor             |
| `createdAt` | DateTime | Data de criacao do registro                |
| `updatedAt` | DateTime | Data da ultima atualizacao                 |

### Category

| Campo       | Tipo     | Descricao                                        |
|-------------|----------|---------------------------------------------------|
| `id`        | Int (PK) | Identificador unico, auto-incremento              |
| `name`      | String   | Nome da categoria (unico)                         |
| `books`     | Book[]   | Livros pertencentes a essa categoria              |
| `createdAt` | DateTime | Data de criacao do registro                       |
| `updatedAt` | DateTime | Data da ultima atualizacao                        |

**Relacionamentos:**

- Um livro pode ter **varios** autores, e um autor pode ter **varios** livros (muitos-para-muitos, relacao implicita do Prisma).
- Um livro pertence a **uma unica** categoria, e uma categoria pode ter **varios** livros (muitos-para-um, via chave estrangeira `categoryId`).

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

O servidor estara disponivel em `http://localhost:3000` (ou na porta definida em `PORT`). Ao iniciar, o terminal exibe uma linha confirmando o ambiente e o arquivo de variaveis carregado, por exemplo:

```
[ambiente] NODE_ENV="development", usando arquivo ".env"
```

---

## Documentacao Interativa

Com o servidor em execucao, acesse a documentacao Swagger UI em:

```
http://localhost:3000/docs
```

A interface permite visualizar e testar todos os endpoints de Livros, Autores e Categorias diretamente pelo navegador, sem necessidade de ferramentas externas.

---

## Arquivo de Requisicoes

O arquivo `requests.http`, na raiz do projeto, reune requisicoes prontas para a extensao [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) do VS Code, cobrindo categorias, autores e livros, incluindo os cenarios de erro e de protecao de exclusao.

As requisicoes marcadas com `# @name` guardam a resposta, e as seguintes reaproveitam os ids automaticamente, sem copiar nada manualmente. Execute as secoes na ordem e nao reenvie as requisicoes de criacao nomeadas: reenviar uma criacao duplicada devolve `409` e substitui a resposta guardada, o que quebra os ids usados pelas requisicoes seguintes.

---

## Endpoints da API

Base URL: `http://localhost:3000`

### Livros

| Metodo   | Rota          | Descricao                          |
|----------|---------------|-------------------------------------|
| `POST`   | `/books`      | Cria um novo livro                 |
| `GET`    | `/books`      | Lista todos os livros (paginado)   |
| `GET`    | `/books/:id`  | Busca um livro pelo ID             |
| `PUT`    | `/books/:id`  | Atualiza um livro existente        |
| `DELETE` | `/books/:id`  | Remove um livro                    |

### Autores

| Metodo   | Rota            | Descricao                             |
|----------|-----------------|-----------------------------------------|
| `POST`   | `/authors`      | Cria um novo autor                     |
| `GET`    | `/authors`      | Lista os autores (paginado)            |
| `GET`    | `/authors/:id`  | Busca um autor pelo ID                 |
| `PUT`    | `/authors/:id`  | Atualiza um autor existente            |
| `DELETE` | `/authors/:id`  | Remove um autor sem livros associados  |

### Categorias

| Metodo   | Rota              | Descricao                                    |
|----------|-------------------|------------------------------------------------|
| `POST`   | `/categories`     | Cria uma nova categoria                       |
| `GET`    | `/categories`     | Lista todas as categorias                     |
| `GET`    | `/categories/:id` | Busca uma categoria pelo ID                   |
| `PUT`    | `/categories/:id` | Atualiza uma categoria existente              |
| `DELETE` | `/categories/:id` | Remove uma categoria sem livros associados    |

---

### POST /books

Cria um novo livro. Os autores e a categoria devem ja existir previamente (criados via `/authors` e `/categories`); a API referencia-os pelos seus IDs.

**Corpo da requisicao (JSON):**

```json
{
  "title": "Dom Casmurro",
  "authorIds": [1, 2],
  "categoryId": 1,
  "isbn": "9788525406958",
  "publishedAt": "1899-01-01T00:00:00.000Z",
  "pages": 256,
  "priceDigital": 29.9,
  "pricePhysical": 49.9,
  "coverImageUrl": "https://exemplo.com/capa.jpg"
}
```

**Campos obrigatorios:** `title`, `isbn`, `publishedAt`, `pages`, `priceDigital`, `pricePhysical`, `authorIds` (lista com ao menos um ID), `categoryId`. O campo `coverImageUrl` e opcional.

**Regras de validacao dos novos campos:**

- `priceDigital` e `pricePhysical`: numero maior ou igual a zero, com no maximo 2 casas decimais e valor maximo de `99999999.99`.
- `coverImageUrl`: deve comecar com `http://` ou `https://`; pode ser omitido ou enviado como `null`. Outros protocolos (por exemplo `javascript:`) sao recusados.

**Respostas:**

| Status | Descricao                                             |
|--------|--------------------------------------------------------|
| `201`  | Livro criado com sucesso                                |
| `400`  | Dados invalidos (falha na validacao)                    |
| `404`  | Um ou mais autores informados, ou a categoria, nao foram encontrados |
| `409`  | ISBN ja cadastrado                                      |

---

### GET /books

Lista todos os livros com suporte a paginacao e filtro por titulo. Cada livro retornado inclui seus autores e sua categoria.

**Parametros de query (opcionais):**

| Parametro | Tipo   | Padrao | Descricao                                    |
|-----------|--------|--------|------------------------------------------------|
| `page`    | Number | `1`    | Numero da pagina                               |
| `perPage` | Number | `10`   | Quantidade de registros por pagina             |
| `title`   | String | -      | Filtro parcial por titulo (case-insensitive)   |

**Exemplo:** `GET /books?page=1&perPage=5&title=dom`

**Resposta `200`:**

```json
{
  "data": [
    {
      "id": 1,
      "title": "Dom Casmurro",
      "isbn": "9788525406958",
      "publishedAt": "1899-01-01T00:00:00.000Z",
      "pages": 256,
      "priceDigital": "29.9",
      "pricePhysical": "49.9",
      "coverImageUrl": "https://exemplo.com/capa.jpg",
      "authors": [
        { "id": 1, "name": "Machado de Assis", "bio": null }
      ],
      "category": { "id": 1, "name": "Romance" },
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

Busca um livro especifico pelo seu ID, com autores e categoria inclusos.

**Respostas:**

| Status | Descricao             |
|--------|-------------------------|
| `200`  | Livro encontrado        |
| `404`  | Livro nao encontrado    |

---

### PUT /books/:id

Atualiza parcialmente ou totalmente um livro existente. Todos os campos sao opcionais. Ao enviar `authorIds`, a lista de autores do livro e **substituida** integralmente pela nova lista enviada. Para remover a capa, envie `"coverImageUrl": null`.

**Corpo da requisicao (JSON) - exemplo de atualizacao parcial:**

```json
{
  "pages": 300,
  "priceDigital": 24.9,
  "authorIds": [2]
}
```

**Respostas:**

| Status | Descricao                                               |
|--------|-----------------------------------------------------------|
| `200`  | Livro atualizado com sucesso                               |
| `400`  | Dados invalidos                                            |
| `404`  | Livro, autor(es) ou categoria nao encontrados              |
| `409`  | ISBN ja pertence a outro livro                             |

---

### DELETE /books/:id

Remove um livro pelo seu ID.

**Respostas:**

| Status | Descricao             |
|--------|-------------------------|
| `204`  | Livro removido          |
| `404`  | Livro nao encontrado    |

---

### POST /authors

Cria um novo autor.

**Corpo da requisicao (JSON):**

```json
{
  "name": "Machado de Assis",
  "bio": "Escritor brasileiro, considerado um dos maiores nomes da literatura nacional."
}
```

**Campos obrigatorios:** `name`. O campo `bio` e opcional.

**Respostas:**

| Status | Descricao                   |
|--------|-------------------------------|
| `201`  | Autor criado com sucesso      |
| `400`  | Dados invalidos               |

---

### GET /authors

Lista os autores com paginacao, do mais recente para o mais antigo.

**Parametros de query (opcionais):**

| Parametro | Tipo   | Padrao | Descricao                          |
|-----------|--------|--------|--------------------------------------|
| `page`    | Number | `1`    | Numero da pagina                     |
| `perPage` | Number | `10`   | Quantidade de registros por pagina   |

**Resposta `200`:**

```json
{
  "data": [
    { "id": 1, "name": "Machado de Assis", "bio": null }
  ],
  "meta": { "page": 1, "perPage": 10, "total": 1, "totalPages": 1 }
}
```

### GET /authors/:id

Busca um autor especifico pelo ID.

| Status | Descricao             |
|--------|-------------------------|
| `200`  | Autor encontrado        |
| `404`  | Autor nao encontrado    |

---

### PUT /authors/:id

Atualiza um autor existente. Todos os campos sao opcionais.

| Status | Descricao                 |
|--------|-----------------------------|
| `200`  | Autor atualizado            |
| `400`  | Dados invalidos             |
| `404`  | Autor nao encontrado        |

### DELETE /authors/:id

Remove um autor. A remocao e **recusada** se o autor tiver livros associados.

| Status | Descricao                                                    |
|--------|----------------------------------------------------------------|
| `204`  | Autor removido                                                 |
| `404`  | Autor nao encontrado                                           |
| `409`  | Autor possui livros associados e nao pode ser removido         |

---

### POST /categories

Cria uma nova categoria.

**Corpo da requisicao (JSON):**

```json
{
  "name": "Romance"
}
```

**Campos obrigatorios:** `name`. O nome e unico: a comparacao ignora maiusculas, minusculas e espacos no comeco e no fim (`"Romance"`, `"romance"` e `"  ROMANCE "` contam como o mesmo nome).

**Respostas:**

| Status | Descricao                                |
|--------|---------------------------------------------|
| `201`  | Categoria criada com sucesso                |
| `400`  | Dados invalidos (nome vazio ou so espacos)  |
| `409`  | Ja existe uma categoria com esse nome       |

---

### GET /categories e GET /categories/:id

Lista todas as categorias, ou busca uma categoria especifica pelo ID.

**Respostas (`GET /categories/:id`):**

| Status | Descricao                 |
|--------|------------------------------|
| `200`  | Categoria encontrada         |
| `404`  | Categoria nao encontrada     |

---

### PUT /categories/:id

Atualiza uma categoria existente. Enviar o proprio nome atual e permitido; enviar o nome de **outra** categoria e recusado.

| Status | Descricao                                |
|--------|---------------------------------------------|
| `200`  | Categoria atualizada                        |
| `400`  | Dados invalidos                             |
| `404`  | Categoria nao encontrada                    |
| `409`  | Ja existe outra categoria com esse nome     |

### DELETE /categories/:id

Remove uma categoria. A remocao e **recusada** se a categoria tiver livros associados.

| Status | Descricao                                                         |
|--------|---------------------------------------------------------------------|
| `204`  | Categoria removida                                                  |
| `404`  | Categoria nao encontrada                                            |
| `409`  | Categoria possui livros associados e nao pode ser removida          |

---

## Regras de Negocio

Resumo das regras aplicadas na camada de servico e das respostas de erro correspondentes:

| Regra                                                                 | Resposta |
|-----------------------------------------------------------------------|----------|
| ISBN de livro deve ser unico (na criacao e na atualizacao)            | `409`    |
| Todos os autores informados em `authorIds` devem existir              | `404`    |
| A categoria informada em `categoryId` deve existir                    | `404`    |
| Nome de categoria deve ser unico (sem diferenciar caixa e espacos)    | `409`    |
| Autor com livros associados nao pode ser removido                     | `409`    |
| Categoria com livros associados nao pode ser removida                 | `409`    |
| Registro inexistente em consulta, atualizacao ou remocao              | `404`    |
| Dados de entrada invalidos                                            | `400`    |
| Erro inesperado (sem detalhes internos na resposta)                   | `500`    |

---

## Arquitetura do Projeto

O projeto segue uma arquitetura em camadas que separa as responsabilidades de cada parte do codigo, replicada de forma consistente nos tres modulos (Livro, Autor, Categoria):

```
src/
├── app.js                       # Configuracao do Express (middlewares, rotas)
├── server.js                    # Ponto de entrada, carrega o ambiente e inicializa o servidor
├── book.test.js                 # Testes de integracao de livros
├── author.test.js               # Testes de integracao de autores
├── category.test.js             # Testes de integracao de categorias
├── config/
│   ├── load-env.js              # Carregamento centralizado de variaveis de ambiente
│   ├── prisma.js                # Instancia singleton do Prisma Client
│   └── swagger.js               # Configuracao do Swagger/OpenAPI
├── controllers/
│   ├── book.controller.js       # Recebe requisicoes HTTP e envia respostas (livros)
│   ├── author.controller.js     # Recebe requisicoes HTTP e envia respostas (autores)
│   └── category.controller.js   # Recebe requisicoes HTTP e envia respostas (categorias)
├── services/
│   ├── book.service.js          # Regras de negocio de livros (ISBN duplicado, existencia de autores/categoria)
│   ├── author.service.js        # Regras de negocio de autores (protecao de exclusao)
│   └── category.service.js      # Regras de negocio de categorias (nome unico, protecao de exclusao)
├── repositories/
│   ├── book.repository.js       # Acesso ao banco de dados de livros via Prisma
│   ├── author.repository.js     # Acesso ao banco de dados de autores via Prisma
│   └── category.repository.js   # Acesso ao banco de dados de categorias via Prisma
├── routes/
│   ├── book.routes.js           # Rotas e anotacoes OpenAPI de livros
│   ├── author.routes.js         # Rotas e anotacoes OpenAPI de autores
│   └── category.routes.js       # Rotas e anotacoes OpenAPI de categorias
├── middlewares/
│   ├── validate.js              # Middleware de validacao com Zod
│   └── error-handler.js         # Tratamento centralizado de erros
├── validations/
│   ├── book.validation.js       # Schemas de validacao Zod de livros (precos, URL da capa)
│   ├── author.validation.js     # Schemas de validacao Zod de autores
│   └── category.validation.js   # Schemas de validacao Zod de categorias
└── utils/
    └── app-error.js             # Classe de erro customizado com statusCode
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
  Service - regras de negocio (services/)
     |
  Repository - acesso a dados (repositories/)
     |
  Banco de dados (PostgreSQL via Prisma)
```

Erros lancados em qualquer camada com `AppError` sao capturados pelo middleware `error-handler.js` e retornados como resposta JSON com o status HTTP apropriado. Erros nao previstos (por exemplo, falhas do proprio banco de dados) retornam sempre `500`, sem expor detalhes internos como stack traces ou caminhos de arquivo.

---

## Testes

Os testes de integracao cobrem o ciclo completo de cada endpoint dos tres modulos, incluindo cenarios de sucesso e de erro. A suite atual tem **57 testes** (30 de livros, 16 de categorias e 11 de autores).

Cenarios testados em `book.test.js`:

- Criar um livro com dois autores, precos e capa
- Criar um livro sem capa
- Rejeitar criacao com ISBN duplicado (`409`)
- Rejeitar criacao com autor ou categoria inexistente (`404`)
- Rejeitar criacao com dados invalidos (`400`)
- Rejeitar precos com 3 casas decimais, negativos, acima do maximo ou ausentes (`400`)
- Rejeitar URL de capa com protocolo nao permitido ou sem protocolo (`400`)
- Listar livros, filtrar por titulo e paginar
- Buscar livro por ID e retornar `404` para livro inexistente
- Atualizar precos, remover e trocar a capa, substituir a lista de autores
- Rejeitar atualizacao com preco invalido, ISBN de outro livro, categoria ou autor inexistente
- Permitir atualizar mantendo o proprio ISBN
- Remover um livro e retornar `404` ao remover de novo

Cenarios testados em `author.test.js`:

- CRUD completo, incluindo listagem paginada e erros `400` e `404`
- Recusar a remocao de autor com livros associados (`409`), verificando que o autor e o vinculo com o livro permanecem
- Remover autor sem livros e autor cujo livro foi removido antes

Cenarios testados em `category.test.js`:

- CRUD completo, incluindo erros `400` e `404`
- Recusar nome duplicado, inclusive variando maiusculas e espacos (`409`), na criacao e na atualizacao
- Permitir atualizar mantendo o mesmo nome
- Recusar a remocao de categoria com livros associados (`409`), verificando que a categoria e o livro permanecem
- Remover categoria sem livros e categoria cujo livro foi removido antes

### Executar os testes:

```bash
npm test
```

Para rodar apenas alguns arquivos: `npm test -- author category`.

Os testes utilizam o banco definido em `.env.test` e limpam todos os registros das tabelas envolvidas antes e depois da execucao, para garantir isolamento entre as execucoes. Antes de rodar os testes por primeira vez, certifique-se de que o banco de testes esta com as migrations sincronizadas (`npm run migrate:test`). Alguns testes dependem da ordem em que aparecem no arquivo (por exemplo, a listagem espera uma quantidade exata de livros), entao evite reordena-los.

---

## Scripts Disponiveis

| Script         | Comando              | Descricao                                                        |
|----------------|-----------------------|-------------------------------------------------------------------|
| `dev`          | `npm run dev`         | Inicia o servidor em modo desenvolvimento com nodemon            |
| `start`        | `npm start`           | Inicia o servidor em modo producao                                |
| `test`         | `npm test`            | Executa os testes de integracao com Jest, contra o banco de testes|
| `migrate:test` | `npm run migrate:test`| Aplica as migrations pendentes no banco de dados de testes       |

---

## Proximos Passos

Melhorias planejadas para versoes futuras do projeto:

- Filtros na listagem de livros por autor, categoria, ano de publicacao e faixa de preco, para suportar a pesquisa do futuro front-end
- Validacao do parametro `:id` das rotas (hoje, um id nao numerico como `/books/abc` resulta em `500`; o ideal e responder `400`)
- Autenticacao e autorizacao com JWT, protegendo rotas de escrita
- Restringir `CORS_ORIGIN` ao dominio do front-end quando ele existir
- Containerizacao com Docker (incluindo `docker-compose.yml` com PostgreSQL)
- Deploy em servico com banco PostgreSQL gerenciado (Render, Railway ou Fly.io)
- Rate limiting para proteger a API contra excesso de requisicoes
- Logs estruturados em producao com `pino` ou `winston`

### Limitacao conhecida

As protecoes de exclusao (autor e categoria com livros) sao verificadas na camada de servico, antes da remocao. Em uso concorrente muito intenso, um livro poderia ser vinculado entre a verificacao e a remocao. Para a categoria, o proprio banco ainda recusa a remocao por causa da chave estrangeira. Para o autor, uma garantia absoluta no banco exigiria tornar a tabela de ligacao explicita, com `onDelete: Restrict`.
