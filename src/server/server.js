const Hapi = require('@hapi/hapi');
const routes = require('../server/routes');
const loadModel = require('../services/loadModel');
require('dotenv').config();

(async () => {
  try {
    // Inisialisasi server Hapi
    const server = Hapi.server({
      port: process.env.PORT || 3000, // Gunakan PORT dari .env jika ada
      host: 'localhost',
      routes: {
        cors: {
          origin: ['*'], // Mengizinkan semua origin
        },
      },
    });

    // Muat model TensorFlow
    const model = await loadModel();
    if (!model) {
      throw new Error('Model gagal dimuat');
    }

    // Menyimpan model dalam konteks server untuk digunakan di handler lain
    server.app.model = model;

    // Menambahkan rute
    server.route(routes);

    // Mulai server
    await server.start();
    console.log(`Server berjalan pada ${server.info.uri}`);
  } catch (error) {
    console.error('Gagal menginisialisasi server:', error);
    process.exit(1); // Keluar dengan status kesalahan
  }
})();
