// src/api/axios.js
import axios from 'axios';

// Récupère le token d'authentification depuis le stockage local
const token = localStorage.getItem('token');

// Crée une instance Axios avec une configuration par défaut
const instance = axios.create({
  baseURL: 'http://localhost:5000/api', // URL de base pour toutes les requêtes
  headers: {
     // Ajoute le token d'authentification
     'Content-Type': 'application/json', // Spécifie que le contenu est au format JSON
  },
});

// Exporte l'instance pour l'utiliser ailleurs dans l'application
export default instance;
