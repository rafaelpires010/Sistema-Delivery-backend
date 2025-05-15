# 🍔 Sistema de Delivery - Backend

Este é o backend de um sistema de delivery **multitenant**, desenvolvido com **Node.js**, **TypeScript**, **Express** e **Prisma ORM**. Ele permite a gestão de múltiplos restaurantes, produtos, pedidos e usuários, com suporte a tenants identificados por slug na URL.

## 🚀 Tecnologias Utilizadas

- [Node.js](https://nodejs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Express](https://expressjs.com/)
- [Prisma ORM](https://www.prisma.io/)
- [PostgreSQL](https://www.postgresql.org/)
- [Zod](https://zod.dev/) - validação de dados
- [Multer](https://github.com/expressjs/multer) - upload de arquivos
- [JWT](https://jwt.io/) - autenticação
- [Dotenv](https://www.npmjs.com/package/dotenv) - variáveis de ambiente

## 📁 Estrutura do Projeto

src/
├── controllers/ # Lógicas de negócio (ex: products, orders, auth)

├── middlewares/ # Autenticação, multitenant, erros

├── routes/ # Definição de rotas

├── schemas/ # Validações com Zod

├── services/ # Regras de negócio reutilizáveis

├── prisma/ # Arquivos do Prisma (schema e client)

├── utils/ # Funções utilitárias

├── app.ts # Configuração do Express

└── server.ts # Inicialização do servidor



## 🧪 Como Rodar o Projeto

### 1. Clone o repositório

git clone https://github.com/seu-usuario/sistema-delivery-backend.git
cd sistema-delivery-backend

2. Instale as dependências

npm install

3. Configure o ambiente
Crie um arquivo .env com base no .env.example:

PORT=9000

DATABASE_URL="postgresql://postgres:1234@localhost:5432/DELIVERYDBS?schema=public"

DEFAULT_TOKEN="exemple-47287482-35223454"

BASE_URL="localhost:9000"

AWS_ACCESS_KEY_ID=SUA CHAVE AWS

AWS_SECRET_ACCESS_KEY=SUA CHAVE AWS

AWS_REGION=us-east-2 # ou a região do seu bucket

S3_BUCKET_NAME= NOME DO BUCKET NA AWS S3


SMTP_HOST=SEU SERVIDOR DE EMAIL

SMTP_PORT=587

SMTP_USER=EMAIL 

SMTP_PASSWORD=SENHA


4. Gere e aplique as migrations

npx prisma generate
npx prisma migrate dev --name init

5. Inicie o servidor

npm run dev

A API estará disponível em: http://localhost:9000

🔑 Funcionalidades

Autenticação JWT

Isolamento de dados por tenant (via slug na URL)

Cadastro de usuários e restaurantes

Gerenciamento de produtos e categorias

Criação e listagem de pedidos

Upload de imagens de produtos

Middleware global para identificação do tenant

📬 Exemplos de Endpoints
Método	Rota	Descrição
POST	/api/:tenantSlug/auth/register	Registro de usuário
POST	/api/:tenantSlug/auth/login	Login de usuário
GET	/api/:tenantSlug/products	Listar produtos
POST	/api/:tenantSlug/products	Criar produto
POST	/api/:tenantSlug/orders	Criar pedido
GET	/api/:tenantSlug/orders	Listar pedidos do tenant

🔐 Multitenancy
Cada tenant (restaurante) é acessado usando um slug na URL, como por exemplo:


http://localhost:3001/api/pizzaria-bomgosto/products

O middleware identifica o slug e carrega as configurações/dados associados ao tenant.


Desenvolvido com 💻 por Rafael Pires
LinkedIn • GitHub

