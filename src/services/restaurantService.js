const connection = require('../services/storeData');

const getRestaurants = () => {
  return new Promise((resolve, reject) => {
    connection.query('SELECT * FROM restaurants', (error, results) => {
      if (error) return reject(error);
      resolve(results);
    });
  });
};

module.exports = { getRestaurants };
