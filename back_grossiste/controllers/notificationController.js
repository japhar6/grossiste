// Route pour récupérer les notifications non lues




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

// Fonction pour créer une notification
exports.createNotification = async (userId, message) => {
  try {
    // Créer et sauvegarder la notification dans la base de données
    const notification = new Notification({
      message,
      user: userId,  // Assurez-vous de passer l'ID de l'utilisateur à qui la notification est destinée
      lue: false
    });
    
    await notification.save();

    // Envoyer la notification en temps réel à l'utilisateur via Pusher
    pusher.trigger('notifications-channel', `user-${userId}`, {
      message
    });

    console.log("Notification envoyée avec succès !");
  } catch (error) {
    console.error("Erreur lors de l'ajout de la notification", error);
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


  

  