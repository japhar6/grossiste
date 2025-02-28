const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  message: { type: String, required: true },
  lue: { type: Boolean, default: false },
  type: {
    type: String,
    required: true, // Le type est obligatoire pour définir l'événement
     },
  createdAt: { type: Date, default: Date.now },
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
