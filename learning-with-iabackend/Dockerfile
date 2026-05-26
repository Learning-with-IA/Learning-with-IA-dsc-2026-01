# Estágio de build
FROM node:20-alpine AS builder

WORKDIR /app

# Instala o pnpm
RUN npm install -g pnpm

# Copia os arquivos de dependências
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install

# Copia o resto do código e faz o build
COPY . .
RUN pnpm build

# Estágio de produção (imagem mais leve)
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

CMD ["node", "dist/main.js"]