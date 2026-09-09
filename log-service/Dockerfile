FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Compila de TypeScript para JavaScript
RUN npm run build

# SEM EXPOSE (não teremos portas expostas, apenas uso interno na rede Docker)

CMD ["npm", "start"]
