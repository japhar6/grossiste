const Client = require('../models/Client');

exports.createClient = async (req, res) => {
  try {
    const { nom, telephone, adresse, nif, stat, remises } = req.body;

    // Vérification que le nom est bien fourni
    if (!nom) {
      return res.status(400).json({ message: "Le nom du client est requis." });
    }

    // Récupération du chemin de l'image téléchargée
    const imagePath = req.file ? req.file.path : null;

    // Initialisation des remises
    const clientRemises = remises || {
      remiseGlobale: 0,
      remiseFixe: 0,
      remiseParProduit: 0
    };

    // Création d'un nouveau client
    const newClient = new Client({
      nom,
      telephone,
      adresse,
      nif,
      stat,
      nifStatImage: imagePath, // Stocke le chemin du fichier
      remises: clientRemises
    });

    await newClient.save();
    console.log("✅ Client créé :", newClient);

    res.status(201).json(newClient);
  } catch (error) {
    console.error("❌ Erreur serveur :", error);
    res.status(500).json({ message: "Erreur lors de la création du client", error });
  }
};


exports.countClient = async (req, res) => {
  try {
    const count = await Client.countDocuments();
    res.status(200).json({ totalclient: count });
  } catch (error) {
res.status(500).json({ message: "❌ Erreur lors du comptage des clients", error: error.message });

  }
};

// Récupérer tous les clients
exports.getAllClients = async (req, res) => {
  try {
    const clients = await Client.find()
    .populate('remises')
    res.status(200).json(clients);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des clients', error });
  }
};

// Récupérer un client par ID
exports.getClientById = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ message: 'Client non trouvé' });
    }
    res.status(200).json(client);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération du client', error });
  }
};

// Mettre à jour un client
exports.updateClient = async (req, res) => {
  try {
    const updatedClient = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedClient) {
      return res.status(404).json({ message: 'Client non trouvé' });
    }
    res.status(200).json({ message: 'Client mis à jour avec succès', client: updatedClient });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour du client', error });
  }
};

// Supprimer un client
exports.deleteClient = async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);
    if (!client) {
      return res.status(404).json({ message: 'Client non trouvé' });
    }
    res.status(200).json({ message: 'Client supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression du client', error });
  }
};

// Créer un nouveau client
exports.createClientAdmin = async (req, res) => {
  try {
      const { nom, telephone, adresse, remises } = req.body;

      const newClient = new Client({
          nom,
          telephone,
          adresse,
          remises: remises || undefined
      });

      const savedClient = await newClient.save();
      res.status(201).json(savedClient);
  } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la création du client', error });
  }
};