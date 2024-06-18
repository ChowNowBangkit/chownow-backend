const tf = require('@tensorflow/tfjs-node');
const connection = require('../services/storeData');

const makeRecommendation = async (model, userId) => {
  try {
    // Cek apakah ada rekomendasi yang sudah tersimpan
    const savedRecommendations = await getSavedRecommendations(userId);
    if (savedRecommendations.length > 0) {
      return savedRecommendations;
    }

    // Query data dari database
    const userInput = await getUserData(userId);
    const itemInput = await getItemData();

    // Buat tensor dari data yang di-query
    const userTensor = tf.tensor2d([userInput], [1, userInput.length]);
    const itemTensor = tf.tensor2d(itemInput, [itemInput.length, itemInput[0].length]);

    // Lakukan prediksi
    const predictions = model.predict([userTensor, itemTensor]);
    const recommendation = predictions.arraySync();

    // Simpan hasil rekomendasi
    await saveRecommendation(userId, recommendation);

    // Dapatkan nama restoran dan rating
    const recommendedRestaurants = await getRecommendedRestaurants(recommendation);
    return recommendedRestaurants;
  } catch (error) {
    console.error('Gagal melakukan prediksi:', error);
    throw new Error('Gagal melakukan prediksi');
  }
};

/*const getUserData = (userId) => {
  return new Promise((resolve, reject) => {
    connection.query('SELECT age, gender, click, kind_of_food, restaurant_history FROM customers WHERE id = ?', [userId], (error, results) => {
      if (error) return reject(error);
      resolve(Object.values(results[0])); // Asumsikan hasilnya satu baris
    });
  });
};*/

/*const getUserData = (userId) => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT customers.age, customers.gender, customers.click, customers.kind_of_food, customers.restaurant_history
        FROM customers
        WHERE customers.id = ?;
      `;
      connection.query(query, [userId], (error, results) => {
        if (error) return reject(error);
        resolve(Object.values(results[0])); // Asumsikan hasilnya satu baris
      });
    });
};*/

const getUserData = (userId) => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT customers.age, customers.gender, customers.click, customers.kind_of_food, customers.restaurant_history
        FROM customers
        WHERE customers.id = ?;
      `;
      connection.query(query, [userId], (error, results) => {
        if (error) return reject(error);
        const userData = results[0];
  
        // Konversi data ke tipe numerik jika diperlukan
        const userInput = [
            parseInt(userData.age, 10) || 0,
            parseInt(userData.gender, 10) || 0,
            parseInt(userData.click, 10) || 0,
            parseInt(userData.kind_of_food, 10) || 0,
            parseFloat(userData.restaurant_history) || 0 // Mengasumsikan review bisa dikonversi ke float
        ];
  
        resolve(userInput); // Asumsikan hasilnya satu baris
      });
    });
};  
  

/*const getItemData = () => {
  return new Promise((resolve, reject) => {
    connection.query('SELECT * FROM restaurants', (error, results) => {
      if (error) return reject(error);
      resolve(results.map(item => Object.values(item)));
    });
  });
};*/

const getItemData = () => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT p.kind_of_food, r.name AS restaurant
        FROM products p
        JOIN restaurants r ON p.restaurant_id = r.id;
      `;
      /*connection.query(query, (error, results) => {
        if (error) return reject(error);
        resolve(results.map(item => [item.kind_of_food, item.restaurant]));
      });*/
      connection.query(query, (error, results) => {
        if (error) return reject(error);
        const itemInput = results.map(item => [
            parseInt(item.kind_of_food, 10) || 0, // Pastikan kind_of_food numerik
            parseInt(item.restaurant, 10) || 0 // Jika nama restoran juga harus numerik
        ]);
        resolve(itemInput);
      });
    });
  };
  

/*const getRecommendedRestaurants = (recommendations) => {
  return new Promise((resolve, reject) => {
    const ids = recommendations.map(rec => rec.id); // Asumsikan rekomendasi memiliki ID restoran
    connection.query('SELECT name, rating FROM restaurants WHERE id IN (?)', [ids], (error, results) => {
      if (error) return reject(error);
      resolve(results);
    });
  });
};*/

const getRecommendedRestaurants = (recommendations) => {
    return new Promise((resolve, reject) => {
      const ids = recommendations.map((rec, index) => index); // Asumsikan rekomendasi memiliki ID restoran
      connection.query('SELECT name, rating FROM restaurants WHERE id IN (?)', [ids], (error, results) => {
        if (error) return reject(error);
        resolve(results);
      });
    });
};
  
const saveRecommendation = (userId, recommendations) => {
    return new Promise((resolve, reject) => {
      const query = 'INSERT INTO recommendation (customer_id, recommended_restaurant_id, score) VALUES ?';
      const values = recommendations.map((rec, index) => [userId, index, rec]); // Asumsikan rekomendasi berupa skor

      if (values.length === 0) {
        return reject(new Error('No valid recommendations to save'));
      }
      
      connection.query(query, [values], (error, results) => {
        if (error) return reject(error);
        resolve(results);
      });
    });
};
  
const getSavedRecommendations = (userId) => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT r.*, rest.name, rest.rating 
        FROM recommendation r
        JOIN restaurants rest ON r.recommended_restaurant_id = rest.id
        WHERE r.customer_id = ?;
      `;
      connection.query(query, [userId], (error, results) => {
        if (error) return reject(error);
        resolve(results);
      });
    });
};

module.exports = { makeRecommendation };
