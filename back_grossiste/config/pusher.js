const Pusher = require('pusher');

const pusher = new Pusher({
  appId: '1949689',  // Ton appId
  key: 'a8a7ea8b3c692c9f97f7',  // Ta clé publique
  secret: '58c772db8be33dca0f2a',  // Ta clé secrète
  cluster: 'mt1',  // Ton cluster
  useTLS: true  // Sécuriser la connexion
});

module.exports = pusher;
