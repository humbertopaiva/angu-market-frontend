# Cubos Movies 🎬

![Cubos Movies Logo](/frontend/public/logo-horizontal.svg)

Uma aplicação web fullstack para gerenciamento de filmes, desenvolvida como parte do desafio técnico da Cubos Tecnologia.

## 🌟 Visão Geral

Cubos Movies é uma plataforma responsiva para cadastro, edição, visualização e exclusão de filmes. A aplicação oferece funcionalidades de autenticação, busca avançada e filtros personalizados.

![Screenshot da aplicação](/frontend/public/screenshot.png)

## ✨ Funcionalidades

### Autenticação e Segurança

- 🔐 Cadastro e login de usuários
- 🔑 Recuperação de senha via email
- 🛡️ Proteção de rotas com JWT

### Gerenciamento de Filmes

- 📝 Cadastro completo de informações de filmes
- 🏷️ Categorização por gêneros
- 📅 Notificação automática por email no dia de lançamento
- 🔍 Busca por texto e filtros avançados
- 📊 Visualização detalhada com métricas

### Upload de Imagens

- 🖼️ Suporte para imagens de pôster e backdrop
- ☁️ Armazenamento na nuvem com AWS S3
- 🔄 Pré-visualização e edição

### Interface

- 📱 Design responsivo para todos os dispositivos
- 🌓 Modo claro e escuro
- 📊 Componentes interativos e dinâmicos

## 🛠️ Tecnologias Utilizadas

### Backend

- **Framework**: NestJS
- **Linguagem**: TypeScript
- **Banco de Dados**: PostgreSQL
- **ORM**: TypeORM
- **API**: GraphQL
- **Autenticação**: JWT, Passport
- **Armazenamento**: AWS S3
- **Email**: Resend API
- **Agendamento**: NestJS Schedule

### Frontend

- **Framework**: React
- **Roteamento**: TanStack Router
- **Gerenciamento de Estado**: React Query, Apollo Client
- **Estilização**: TailwindCSS
- **Formulários**: React Hook Form, Zod
- **UI/UX**: Design System personalizado
- **Animações**: CSS Transitions

## 🚀 Como Executar o Projeto

### Pré-requisitos

- Node.js (v18+)
- npm ou yarn
- PostgreSQL
- Conta AWS (para o S3) ou serviço de armazenamento compatível

### Configuração do Backend

1. Clone o repositório:

   ```bash
   git clone https://github.com/seu-usuario/cubos-movies.git
   cd cubos-movies
   ```

2. Crie um arquivo `.env` na pasta backend com as seguintes variáveis:

   ```env
   # Database
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=postgres
   DB_DATABASE=cubos_movies

   # JWT
   JWT_SECRET=sua_chave_secreta_aqui
   JWT_EXPIRATION=1d

   # Email
   RESEND_API_KEY=sua_chave_resend_api
   MAIL_FROM=seu_email@exemplo.com
   FRONTEND_URL=http://localhost:3000

   # AWS S3
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY=sua_access_key
   AWS_SECRET_KEY=sua_secret_key
   S3_BUCKET=seu_bucket_name

   # App
   NODE_ENV=development
   PORT=4000
   NOTIFICATION_DEV_MODE=true
   ```

3. Instale as dependências e execute o backend:

   ```bash
   cd backend
   npm install
   npm run start:dev
   ```

4. Execute as migrações para criar o banco de dados:

   ```bash
   npm run migration:run
   ```

5. Popule o banco com os dados iniciais:
   ```bash
   npm run seed
   ```

### Configuração do Frontend

1. Crie um arquivo `.env` na pasta frontend:

   ```env
   VITE_API_URL=http://localhost:4000/graphql
   ```

2. Instale as dependências e execute o frontend:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. Acesse o aplicativo em `http://localhost:3000`

## 🐳 Implantação com Docker

O projeto está configurado para fácil implantação usando Docker e Docker Compose, sendo compatível com Dokploy.

### Pré-requisitos

- Docker
- Docker Compose

### Configuração para Docker

1. Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

   ```env
   # Database Configuration
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=postgres
   POSTGRES_DB=cubos_movies
   DB_HOST=postgres
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=postgres
   DB_DATABASE=cubos_movies

   # JWT Configuration
   JWT_SECRET=sua_chave_secreta_aqui
   JWT_EXPIRATION=1d

   # Email Configuration
   RESEND_API_KEY=sua_chave_resend_api
   MAIL_FROM=seu_email@exemplo.com
   FRONTEND_URL=http://localhost:3000

   # S3 Configuration
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY=sua_access_key
   AWS_SECRET_KEY=sua_secret_key
   S3_BUCKET=seu_bucket_name

   # App Configuration
   NODE_ENV=development
   BACKEND_PORT=4000
   FRONTEND_PORT=3000
   NOTIFICATION_DEV_MODE=true

   # Frontend Configuration
   VITE_API_URL=http://localhost:4000/graphql
   ```

### Passos para implantação local

1. Clone o repositório:

   ```bash
   git clone https://github.com/seu-usuario/cubos-movies.git
   cd cubos-movies
   ```

2. Inicie os contêineres:

   ```bash
   docker-compose up -d
   ```

3. Acesse a aplicação:
   - Frontend: http://localhost:3000
   - API GraphQL: http://localhost:4000/graphql

### Implantação com Dokploy

Para implantar com Dokploy, você pode usar os Dockerfiles incluídos no projeto:

1. Configure as variáveis de ambiente no painel Dokploy
2. Aponte para o repositório Git
3. Selecione o serviço e o Dockerfile correspondente
4. Implante

### Serviços disponíveis

- **Frontend**: Aplicação React rodando no Vite
- **Backend**: API GraphQL NestJS
- **Postgres**: Banco de dados PostgreSQL

### Comandos úteis

```bash
# Ver logs de todos os contêineres
docker-compose logs -f

# Ver logs de um serviço específico
docker-compose logs -f backend

# Parar todos os contêineres
docker-compose down

# Reconstruir e reiniciar serviços
docker-compose up -d --build
```

## 📝 Recursos Adicionais

### Testes

```bash
# Backend
cd backend
npm run test

# Frontend
cd frontend
npm run test
```

### Documentação da API

A documentação GraphQL está disponível em:

- Playground: http://localhost:4000/graphql

## 👨‍💻 Autor

Criado com 💜 por Seu Nome - [GitHub](https://github.com/seu-usuario) | [LinkedIn](https://linkedin.com/in/seu-perfil)

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
