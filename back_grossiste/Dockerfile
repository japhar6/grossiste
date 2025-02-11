# Utilisation de l'image officielle Node.js comme base
FROM node:18

# Définition du répertoire de travail dans le conteneur
WORKDIR /app

# Copie des fichiers package.json et package-lock.json avant d'installer les dépendances
COPY package*.json ./

# Installation des dépendances
RUN npm install

# Copie du reste de l'application
COPY . .

# Exposition du port utilisé par l'application
EXPOSE 5000

# Commande pour démarrer l'application
CMD ["npm", "start"]
