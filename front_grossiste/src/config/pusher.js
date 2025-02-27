// src/pusher.js
import Pusher from 'pusher-js';

// Initialise Pusher
const pusher = new Pusher('a8a7ea8b3c692c9f97f7', {
  cluster: 'mt1'
});

// Abonne-toi au canal admin
const channel = pusher.subscribe('admin-channel');

// Fonction pour écouter les notifications de transfert
const listenForTransferNotifications = (callback) => {
  channel.bind('transfert-en-attente', (data) => {
    callback(data);
  });
};

export default listenForTransferNotifications;
