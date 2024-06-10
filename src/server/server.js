const Hapi = require('@hapi/hapi');
const routes = require('../server/routes');
const loadModel = require('../services/loadModel');
require('dotenv').config();

(async () => {
  const server = Hapi.server({
    port: 3000,
    host: 'localhost',
    routes: {
        cors: {
          origin: ['*'],
        },
    },
  });

  const model = await loadModel();
  server.app.model = model;

  server.route(routes);

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
})();