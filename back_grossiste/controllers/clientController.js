const Client = require('../models/Client');

// Créer un nouveau client
exports.createClient = async (req, res) => {
  try {
    const { nom, telephone, adresse } = req.body;

    const newClient = new Client({
      nom,
      telephone,
      adresse,
    });

    await newClient.save();
    res.status(201).json({ message: 'Client créé avec succès', client: newClient });
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