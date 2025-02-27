const Pusher = require('pusher');

const pusher = new Pusher({
  appId: '1949689',
  key: 'a8a7ea8b3c692c9f97f7',
  secret: '58c772db8be33dca0f2a',
  cluster: 'mt1',
  useTLS: true
});

module.exports = pusher;
