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


  

exports.envoyerNotificationAdmin = async (req, res) => {
  try {
    const { message } = req.body; // On attend un message dans le corps de la requête

    if (!message || message.trim() === "") {
      return res.status(400).json({ message: 'Le message de la notification est requis.' });
    }

    // Créer la notification dans la base de données
    const notification = new Notification({
      message: message,
      lue: false, // Par défaut, la notification n'est pas lue
    });

    await notification.save();

    // Récupérer l'ObjectId de l'admin
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      return res.status(404).json({ message: 'Utilisateur admin non trouvé.' });
    }

    // Envoyer un message de notification via Pusher
    pusher.trigger('admin-channel', 'nouvelle-notification', {
      message: message,
      notificationId: notification._id
    });

    res.status(201).json({ message: 'Notification envoyée avec succès.', notification });
  } catch (error) {
    console.error("Erreur lors de l'envoi de la notification:", error);
    res.status(500).json({ message: "Erreur lors de l'envoi de la notification", error: error.message });
  }
};
