# Usar uma imagem base do Node.js mais recente
FROM node:20-alpine

# Criar diretório de trabalho
WORKDIR /app

# Copiar arquivos de configuração do npm
COPY package*.json ./
COPY tsconfig.json ./

# Instalar dependências
RUN npm ci

# Copiar código fonte
COPY src/ ./src/

# Compilar TypeScript
RUN npm run build

# Remover dependências de desenvolvimento
RUN npm ci --production

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs && \
    adduser -S mcpserver -u 1001

# Mudar ownership dos arquivos
RUN chown -R mcpserver:nodejs /app
USER mcpserver

# Expor porta (opcional, para uso futuro com HTTP transport)
EXPOSE 3000

# Comando para executar o servidor
ENTRYPOINT ["node", "build/index.js"]
