const Servant = require('./servant/client');
const path = require('path');

const servant = new Servant();

servant.run({
  token: process.env.ClientToken,
  paths: {
    commands: { path: path.resolve(__dirname, '../src/commands') },
    events: { path: path.resolve(__dirname, '../src/events') }
  },
}).catch(console.error);
