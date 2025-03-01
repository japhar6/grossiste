const express = require('express');
const router = express.Router();
const { getNotifications, sendNotification, markAsRead ,envoyerNotificationAdmin,envoyerNotificationRuptureStock,deleteNotification} = require('../controllers/notificationController');

// Route pour récupérer les notifications non lues
router.get('/notifications', getNotifications);

// Route pour marquer une notification comme lue
router.put('/notif/mark-as-read/:id', markAsRead);  // Assure-toi que le chemin est correct


// Route pour créer une notification (par exemple, après un transfert de produit)
router.post('/notifications/create', sendNotification);

router.post('/rupture-stock', envoyerNotificationRuptureStock);
router.post('/envoie-notifications', envoyerNotificationAdmin);
// Route pour supprimer une notification
router.delete('/supprimer/:id', deleteNotification);  // Route pour supprimer une notification par son ID

module.exports = router;
