FROM node:18-alpine

# Instalar dependências do sistema
RUN apk add --no-cache postgresql-client bash

# Instalar PM2 globalmente
RUN npm install -g pm2

WORKDIR /app

# Copiar arquivos de dependências
COPY backend/package*.json ./

# Instalar dependências
RUN npm ci

# Copiar código fonte e scripts
COPY backend/src ./src
COPY backend/.env .env
COPY backend/ecosystem.config.js ./

# Criar diretório de backup e logs
RUN mkdir -p /backups/pacs /app/logs

# Tornar scripts executáveis
RUN chmod +x /app/src/scripts/*.sh

# Configurar backup automático
RUN /app/src/scripts/setup-cron.sh

# Expor porta
EXPOSE 3001

# Comando para iniciar a aplicação com PM2
CMD ["pm2-runtime", "start", "ecosystem.config.js"] 