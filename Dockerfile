# Multi-stage build para aplicação Angular
FROM node:18-alpine AS build

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de configuração do npm
COPY frontend-app/package*.json ./

# Instalar dependências (incluindo devDependencies para o build)
RUN npm ci

# Copiar código fonte
COPY frontend-app/ .

# Build da aplicação Angular para produção
RUN npm run build -- --configuration production

# Estágio de produção com Nginx
FROM nginx:alpine

# Copiar configuração customizada do Nginx
COPY frontend-app/nginx.conf /etc/nginx/nginx.conf

# Copiar arquivos buildados para o Nginx
COPY --from=build /app/dist/frontend-app /usr/share/nginx/html

# Expor porta 80
EXPOSE 80

# Comando para iniciar o Nginx
CMD ["nginx", "-g", "daemon off;"]