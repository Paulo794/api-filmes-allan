FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Usaremos tsx para rodar o TypeScript direto, igual no catálogo
RUN npm install -g tsx

EXPOSE 3000

CMD ["npx", "tsx", "src/server.ts"]
