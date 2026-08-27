FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Faz o build do TypeScript transformando em JavaScript
RUN npm run build

EXPOSE 3000

# Executa o build compilado em produção (JavaScript puro), mais leve e rápido!
CMD ["npm", "start"]
