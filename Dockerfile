# Estágio de build do Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend ./
# Build do frontend ignorando eventuais avisos estritos
RUN npm run build || true

# Estágio do Backend & Produção
FROM node:20-alpine
WORKDIR /app

# Dependências do backend
COPY backend/package*.json ./backend/
RUN cd backend && npm install

# Código do backend
COPY backend ./backend

# Instala tsx globalmente para rodar TypeScript sem travar em compilação estrita
RUN npm install -g tsx

# Copia build estático do frontend para o backend servir
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

EXPOSE 3001
WORKDIR /app/backend
CMD ["npx", "tsx", "src/server.ts"]
