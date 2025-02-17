# Étape 1 : Build de l'application React avec Vite
FROM node:18-alpine AS build

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers package.json et package-lock.json, puis installer les dépendances
COPY package*.json ./
RUN npm install

# Copier le reste du projet et construire l'application
COPY . .
RUN npm run build

# Étape 2 : Configuration de Nginx pour servir l'application
FROM nginx:alpine

# Créer un répertoire pour les fichiers SSL
RUN mkdir -p /etc/nginx/ssl

# Copier les fichiers générés par Vite dans le répertoire de Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Supprimer la configuration par défaut de Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copier la configuration Nginx personnalisée
COPY nginx/default.conf /etc/nginx/conf.d

# Copier les fichiers SSL (clé et certificat) dans le conteneur
COPY nginx/ssl /etc/nginx/ssl

# Exposer les ports 80 (HTTP) et 443 (HTTPS)
EXPOSE 80 443

# Lancer Nginx en mode non-démon
CMD ["nginx", "-g", "daemon off;"]
