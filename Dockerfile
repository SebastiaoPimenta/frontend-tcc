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

# Verificar se o build foi criado corretamente
RUN ls -la /app/dist/

# Estágio de produção com Nginx
FROM nginx:alpine

# Remover arquivos padrão do nginx
RUN rm -rf /usr/share/nginx/html/*

# Copiar configuração customizada do Nginx
COPY frontend-app/nginx.conf /etc/nginx/nginx.conf

# Copiar arquivos buildados para o Nginx
COPY --from=build /app/dist/frontend-app/browser /usr/share/nginx/html

# Definir permissões corretas para os arquivos
RUN chmod -R 755 /usr/share/nginx/html

# Verificar se os arquivos foram copiados corretamente
RUN ls -la /usr/share/nginx/html/
RUN ls -la /usr/share/nginx/html/index.html || echo "index.html not found!"

# Expor porta 80
EXPOSE 80

# Comando para iniciar o Nginx
CMD ["nginx", "-g", "daemon off;"]