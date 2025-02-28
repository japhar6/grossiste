// paymentService.js
const moment = require('moment');
const pusher = require('../config/pusher'); // Assure-toi d'inclure ta config Pusher
const Payment = require('../models/Paiement'); // Remplace par ton modèle Payment

// Fonction pour vérifier si un paiement à crédit dépasse la date limite
const getPaymentsDueForNotification = async () => {
  const payments = await Payment.find({ modePaiement: 'a credit' });
  const today = moment(); // Date actuelle

  payments.forEach(payment => {
    const dateLimite = moment(payment.dateLimiteCredit); // Date limite du paiement
    
    // Si la date limite est dépassée
    if (dateLimite.isBefore(today)) {
      sendNotificationToAdmin(payment);
    }
  });
};

// Fonction pour envoyer une notification à l'admin via Pusher
const sendNotificationToAdmin = (payment) => {
  const { clientName, totalAmount, dateLimiteCredit } = payment;

  // Envoie une notification à l'admin via Pusher
  pusher.trigger('admin-channel', 'payment-due', {
    message: `Le paiement à crédit du client ${clientName} est en retard. Date limite : ${dateLimiteCredit}. Total à payer : ${totalAmount}.`
  });
};

module.exports = { getPaymentsDueForNotification };
