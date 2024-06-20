const connection = require('../../services/storeData');

const User = {
  create: (userData) => {
    return new Promise((resolve, reject) => {
      const query = 'INSERT INTO customers (name, username, email, password) VALUES (?, ?, ?, ?)';
      connection.query(query, [userData.name, userData.username, userData.email, userData.password], (error, results) => {
        if (error) {
          reject(error);
          return;
        }
        //resolve(results);
        resolve({ ...userData, id: results.insertId });
      });
    });
  },

  findByEmail: (email) => {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM customers WHERE email = ?';
      connection.query(query, [email], (error, results) => {
        if (error) {
          reject(error);
          return;
        }
        console.log('Query results:', results); // Logging hasil query
        resolve(results[0]);
      });
    });
  },
};

module.exports = User;