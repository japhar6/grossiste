const mongoose = require('mongoose');

const refacturationSchema = new mongoose.Schema({
  montant: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  raison: {
    type: String,
    required: true,
  }
});

module.exports = mongoose.model('Refacturation', refacturationSchema);
