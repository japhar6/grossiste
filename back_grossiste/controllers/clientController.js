const Client = require('../models/Client');
exports.createClient = async (req, res) => {
  try {
    console.log("Données reçues :", req.body);
    console.log("Fichier reçu :", req.file); // Vérifier si le fichier est bien envoyé

    const { nom, telephone, adresse, remises, creerPar } = req.body;

    // Vérification des données
    if (!nom || !telephone || !adresse) {
      return res.status(400).json({ message: "Les informations obligatoires sont manquantes." });
    }

    // Récupération du chemin de l'image téléchargée
    const nifStatImage = req.file ? `/uploads/nifstat/${req.file.filename}` : null;




    // Création du client
    const newClient = new Client({
      nom,
      telephone,
      adresse,
      remises,
      creerPar,  
      nifStatImage
    });

    // Sauvegarde du client dans la base de données
    await newClient.save();

    console.log("Client créé avec succès :", newClient);
    res.status(201).json(newClient);
  } catch (error) {
    console.error("Erreur lors de la création du client :", error);
    res.status(500).json({ message: "Erreur lors de la création du client", error });
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

