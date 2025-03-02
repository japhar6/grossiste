// Route pour récupérer les notifications non lues

const User = require('../models/User');  

const mongoose = require('mongoose');
const Notification = require('../models/Notification'); // Assurez-vous d'importer le modèle Notification
const Pusher = require('pusher');

// Initialisation de Pusher
const pusher = new Pusher({
  appId: "1949689", // Utilisez vos clés
  key: "a8a7ea8b3c692c9f97f7",
  secret: "58c772db8be33dca0f2a",
  cluster: "mt1",
  useTLS: true
});
exports.sendNotification = async (message) => {
  try {
    // Créer la notification dans la base de données
    const notification = new Notification({
      message,
      lue: false,
    });

    await notification.save();

    // Émettre un événement via Pusher
    pusher.trigger('admin-channel', 'transfert-en-attente', {
      message,

    });

    console.log("Notification envoyée avec succès.");

  } catch (error) {
    console.error("Erreur lors de l'envoi de la notification:", error);
  }
};

exports.getNotifications = async (req, res) => {
  try {
    // Récupérer toutes les notifications, sans filtre d'utilisateur
    const notifications = await Notification.find();

    if (!notifications || notifications.length === 0) {
      return res.status(404).json({ message: "Aucune notification trouvée." });
    }

    // Répondre avec les notifications
    res.status(200).json(notifications);
  } catch (error) {
    console.error("Erreur lors de la récupération des notifications:", error);
    res.status(500).json({ message: "Erreur lors de la récupération des notifications.", error: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;  // Récupère l'ID de la notification depuis l'URL
    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({ message: "Notification non trouvée" });
    }

    notification.lue = true; // Mettre la notification en lue
    await notification.save(); // Sauvegarder la notification modifiée

    res.status(200).json({ message: "Notification mise à jour" });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la notification:', error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};


exports.deleteNotification = async (req, res) => {
  try {
    const notificationId = req.params.id;  // Récupérer l'ID de la notification à supprimer
    const deletedNotification = await Notification.findByIdAndDelete(notificationId);  // Suppression de la notification

    if (!deletedNotification) {
      return res.status(404).json({ message: 'Notification non trouvée' });
    }

    return res.status(200).json({ message: 'Notification supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la notification:', error);
    return res.status(500).json({ message: 'Erreur serveur lors de la suppression de la notification' });
  }
};

exports.envoyerNotificationAdmin = async (req, res) => {
  try {
    const { message, idClient } = req.body; // On attend maintenant aussi un idClient dans le corps de la requête

    if (!message || message.trim() === "") {
      return res.status(400).json({ message: 'Le message de la notification est requis.' });
    }

    // Créer la notification dans la base de données
    const notification = new Notification({
      message: message,
      lue: false,
      type: 'remise', // Par défaut, la notification n'est pas lue
      idClient: idClient || null, // Si un idClient est fourni, on l'ajoute à la notification, sinon on le laisse à null
    });

    await notification.save();

    // Récupérer l'ObjectId de l'admin
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      return res.status(404).json({ message: 'Utilisateur admin non trouvé.' });
    }

    // Envoyer un message de notification via Pusher
    pusher.trigger('admin-channel', 'remise', {
      message: message,
      notificationId: notification._id
    });

    res.status(201).json({ message: 'Notification envoyée avec succès.', notification });
  } catch (error) {
    console.error("Erreur lors de l'envoi de la notification:", error);
    res.status(500).json({ message: "Erreur lors de l'envoi de la notification", error: error.message });
  }
};

exports.envoyerNotificationRuptureStock = async (req, res) => {
  try {
    const { produit, quantiteRestante, idClient } = req.body; // On récupère les informations nécessaires depuis le corps de la requête

    if (!produit || !quantiteRestante) {
      return res.status(400).json({ message: 'Le produit et la quantité restante sont requis.' });
    }

    // Créer un message personnalisé pour la notification
    const message = `Alerte : Le produit ${produit} a atteint un stock faible de ${quantiteRestante} unités.`;

    // Créer la notification de rupture de stock dans la base de données
    const notification = new Notification({
      message: message,
      lue: false, // Par défaut, la notification est non lue
      type: 'rupture_stock', // Spécifie que c'est une notification de rupture de stock
      idClient: idClient || null, // Si un idClient est fourni, on l'ajoute à la notification, sinon on laisse null
    });

    await notification.save();

    // Récupérer l'ObjectId de l'admin
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      return res.status(404).json({ message: 'Utilisateur admin non trouvé.' });
    }

    pusher.trigger('admin-channel', 'rupture_stock', {
      message: message,
      notificationId: notification._id,
      produit: produit,
      quantiteRestante: quantiteRestante,
    });

    res.status(201).json({ message: 'Notification de rupture de stock envoyée avec succès.', notification });
  } catch (error) {
    console.error("Erreur lors de l'envoi de la notification de rupture de stock:", error);
    res.status(500).json({ message: "Erreur lors de l'envoi de la notification de rupture de stock", error: error.message });
  }
};
