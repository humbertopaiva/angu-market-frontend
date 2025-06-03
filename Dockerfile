# Imagem base para construção e execução
FROM node:24-alpine

WORKDIR /app

# Copiar arquivos de package.json primeiro (para aproveitar o cache do Docker)
COPY package*.json ./

# Instalar dependências
RUN npm ci

# Copiar todo o código fonte
COPY . .

# Construir a aplicação
RUN npm run build

# Expor a porta 80 (ou a que você usa no seu script de inicialização)
EXPOSE 80

# Definir a porta como variável de ambiente para o script de inicialização
ENV PORT=80

# Iniciar a aplicação usando o script "preview" do package.json
# Isso é mais próximo do fluxo que você usa localmente
CMD ["npm", "run", "preview", "--", "--port", "80", "--host"]