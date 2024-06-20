const tf = require('@tensorflow/tfjs-node');
const connection = require('../services/storeData');

// Fungsi untuk melakukan One-Hot Encoding
const oneHotEncode = (item, uniqueCategories) => {
    const numCategories = uniqueCategories.length;
    const encoding = new Array(numCategories).fill(0);
    const index = uniqueCategories.indexOf(item);
    if (index !== -1) {
      encoding[index] = 1;
    }
    return encoding;
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

/*const getUserData = (userId) => {
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
        const userData = results[0];
  
        // Pisahkan daftar nama restoran dalam restaurant_history
        const restaurantHistory = userData.restaurant_history.split(',');
  
        // Dapatkan daftar unik gender, jenis makanan, dan nama restoran dari database untuk One-Hot Encoding
      connection.query(`
        SELECT DISTINCT gender FROM customers;
        SELECT DISTINCT kind_of_food FROM products;
        SELECT DISTINCT name FROM restaurants;
      `, (error, results) => {
        if (error) return reject(error);

        const uniqueGenders = results[0].map(res => res.gender);
        const uniqueKindOfFood = results[1].map(res => res.kind_of_food);
        const uniqueRestaurants = results[2].map(res => res.name);

        // Lakukan One-Hot Encoding untuk gender
        const genderEncoded = oneHotEncode(userData.gender, uniqueGenders);

        // Lakukan One-Hot Encoding untuk kind_of_food
        const kindOfFoodEncoded = oneHotEncode(userData.kind_of_food, uniqueKindOfFood);

        // Lakukan One-Hot Encoding untuk restaurant_history
        const oneHotEncodedHistory = restaurantHistory.flatMap(restaurant => oneHotEncode(restaurant, uniqueRestaurants));

        // Konversi data ke tipe numerik jika diperlukan
        const userInput = [
          parseInt(userData.age, 10) || 0,          // Konversi age ke bilangan bulat
          ...genderEncoded,                         // Tambahkan hasil One-Hot Encoding untuk gender
          parseInt(userData.click, 10) || 0,        // Konversi click ke bilangan bulat
          ...kindOfFoodEncoded,                     // Tambahkan hasil One-Hot Encoding untuk kind_of_food
          ...oneHotEncodedHistory                   // Tambahkan hasil One-Hot Encoding untuk restaurant_history
        ];

        resolve(userInput); // Asumsikan hasilnya satu baris
      });
    });
  });
};*/

const getUserData = (userId) => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT age, gender
            FROM customers
            WHERE id = ?;
        `;
        connection.query(query, [userId], (error, results) => {
            if (error) return reject(error);
            const userData = results[0];

            // Dapatkan daftar unik gender dari database untuk One-Hot Encoding
            connection.query(`
                SELECT DISTINCT gender FROM customers;
            `, (error, results) => {
                if (error) return reject(error);

                const uniqueGenders = results.map(res => res.gender);

                // Lakukan One-Hot Encoding untuk gender
                const genderEncoded = oneHotEncode(userData.gender, uniqueGenders);

                // Konversi data ke tipe numerik jika diperlukan
                const userInput = [
                    parseInt(userData.age, 10) || 0,  // Konversi age ke bilangan bulat
                    ...genderEncoded                 // Tambahkan hasil One-Hot Encoding untuk gender
                ];

                resolve(userInput); // Asumsikan hasilnya satu baris
            });
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

/*const getItemData = () => {
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
      /*connection.query(query, (error, results) => {
        if (error) return reject(error);
        const itemInput = results.map(item => [
            parseInt(item.kind_of_food, 10) || 0, // Pastikan kind_of_food numerik
            parseInt(item.restaurant, 10) || 0 // Jika nama restoran juga harus numerik
        ]);
        resolve(itemInput);
      });
    });
};*/

/*const getItemData = () => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT p.kind_of_food, r.name AS restaurant
        FROM products p
        JOIN restaurants r ON p.restaurant_id = r.id;
      `;
      connection.query(query, (error, results) => {
        if (error) return reject(error);
  
        // Dapatkan daftar unik jenis makanan dan nama restoran dari hasil query
        const uniqueKindOfFood = [...new Set(results.map(item => item.kind_of_food))];
        const uniqueRestaurants = [...new Set(results.map(item => item.restaurant))];
  
        // Lakukan One-Hot Encoding untuk setiap item dalam results
        const itemInput = results.map(item => [
          ...oneHotEncode(item.kind_of_food, uniqueKindOfFood), // One-Hot Encoding untuk kind_of_food
          ...oneHotEncode(item.restaurant, uniqueRestaurants)  // One-Hot Encoding untuk restaurant
        ]);
  
        resolve(itemInput);
      });
    });
};*/

const getItemData = () => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT 
                o.total_spend,
                c.kind_of_food,
                c.restaurant_history,
                c.click,
                c.location,
                rv.comment AS review_category
            FROM orders o
            JOIN customers c ON o.customer_id = c.id
            JOIN reviews rv ON rv.customer_id = c.id;
        `;
        connection.query(query, (error, results) => {
            if (error) return reject(error);

            // Dapatkan daftar unik untuk fitur yang memerlukan One-Hot Encoding
            const uniqueKindOfFood = [...new Set(results.map(item => item.kind_of_food))];
            const uniqueRestaurants = [...new Set(results.map(item => item.restaurant_history))];
            const uniqueLokasiResto = [...new Set(results.map(item => item.location))];
            const uniqueReviewCategory = [...new Set(results.map(item => item.review_category))];

            // Lakukan One-Hot Encoding untuk setiap item dalam results
            const itemInput = results.map(item => [
                parseFloat(item.total_spend) || 0,                      // Konversi harga_beli ke float
                ...oneHotEncode(item.kind_of_food, uniqueKindOfFood),  // One-Hot Encoding untuk kind_of_food
                ...oneHotEncode(item.restaurant_history, uniqueRestaurants),   // One-Hot Encoding untuk restaurant
                parseInt(item.click, 10) || 0,            // Konversi jumlah_klik_produk ke bilangan bulat
                ...oneHotEncode(item.location, uniqueLokasiResto), // One-Hot Encoding untuk lokasi_resto
                ...oneHotEncode(item.review_category, uniqueReviewCategory) // One-Hot Encoding untuk review_category
            ]);

            resolve(itemInput);
        });
    });
};

const getMenuItems = (restaurantId) => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT name, description, price
        FROM products
        WHERE restaurant_id = ?;
      `;
      /*connection.query(query, [restaurantId], (error, results) => {
        if (error) return reject(error);
        resolve(results.map(item => item.name));
      });*/
      connection.query(query, [restaurantId], (error, results) => {
        if (error) return reject(error);
        resolve(results);
      });
    });
};

const getReviewItems = (restaurantId) => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT reviews.comment, customers.name AS customer_name, products.name AS product_name, orders.quantity, orders.order_date
        FROM reviews
        JOIN customers ON reviews.customer_id = customers.id
        JOIN orders ON reviews.customer_id = orders.customer_id AND reviews.restaurant_id = orders.restaurant_id
        JOIN products ON orders.product_id = products.id
        WHERE reviews.restaurant_id = ?;
      `;
      connection.query(query, [restaurantId], (error, results) => {
        if (error) return reject(error);
        resolve(results);
      });
    });
};

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
      /*const predictions = model.predict([userTensor, itemTensor]);
      const recommendation = predictions.arraySync();*/
      const predictions = model.predict([userTensor, itemTensor]);
      const recommendation = predictions.arraySync()[0];

      // Pasangkan setiap skor dengan ID item yang sesuai
      const recommendationWithIds = itemInput.map((item, index) => ({
        recommended_restaurant_id: item.id,
        score: recommendation[index]
      }));

      // Urutkan rekomendasi berdasarkan skor (desc)
      const sortedRecommendations = recommendationWithIds.sort((a, b) => b.score - a.score);

      // Simpan hasil rekomendasi
      await saveRecommendation(userId, sortedRecommendations);
  
      // Dapatkan nama restoran dan rating
      const recommendedRestaurants = await getRecommendedRestaurants(sortedRecommendations);
      return recommendedRestaurants;
    } catch (error) {
      console.error('Gagal melakukan prediksi:', error);
      throw new Error('Gagal melakukan prediksi');
    }
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

/*const getRecommendedRestaurants = (recommendations) => {
    return new Promise((resolve, reject) => {
      const ids = recommendations.map((rec, index) => index); // Asumsikan rekomendasi memiliki ID restoran
      connection.query('SELECT name, rating FROM restaurants WHERE id IN (?)', [ids], (error, results) => {
        if (error) return reject(error);
        resolve(results);
      });
    });
};*/

/*const getRecommendedRestaurants = (recommendations) => {
    return new Promise((resolve, reject) => {
        const ids = recommendations.map(rec => rec.recommended_restaurant_id);
        connection.query('SELECT id, name, rating FROM restaurants WHERE id IN (?)', [ids], (error, results) => {
            if (error) return reject(error);

            const recommendedRestaurants = recommendations.map(rec => {
                const restaurant = results.find(res => res.id === rec.recommended_restaurant_id);
                return {
                    id: rec.id,
                    customer_id: rec.customer_id,
                    recommended_restaurant_id: rec.recommended_restaurant_id,
                    score: rec.score,
                    created_at: rec.created_at,
                    name: restaurant ? restaurant.name : 'Unknown',
                    rating: restaurant ? restaurant.rating : 0
                };
            });

            resolve(recommendedRestaurants);
        });
    });
};*/

const getRecommendedRestaurants = (recommendations) => {
    return new Promise((resolve, reject) => {
      /*const ids = recommendations.map(rec => rec[1]); // Ambil recommended_restaurant_id dari hasil prediksi
      connection.query('SELECT id, name, rating FROM restaurants WHERE id IN (?)', [ids], (error, results) => {
        if (error) return reject(error);*/
        const ids = recommendations.map(rec => rec.recommended_restaurant_id);
        const query = `
            SELECT id, name, rating
            FROM restaurants
            WHERE id IN (?);
        `;
        connection.query(query, [ids], (error, results) => {
            if (error) return reject(error);
  
        const recommendedRestaurants = recommendations.map(rec => {
          //const restaurant = results.find(res => res.id === rec[1]);
          const restaurant = results.find(res => res.id === rec.recommended_restaurant_id);
          const imageUrl = `https://storage.googleapis.com/restaurant-images-chownow/${rec.recommended_restaurant_id}`;
          /*return {
            recommended_restaurant_id: rec[1],
            score: rec[2],
            name: restaurant ? restaurant.name : 'Unknown',
            rating: restaurant ? restaurant.rating : 0,
            image_url: imageUrl
          };*/
          return {
            ...rec,
            name: restaurant ? restaurant.name : 'Unknown',
            rating: restaurant ? restaurant.rating : 0,
            image_url: imageUrl
          };
        });
  
        resolve(recommendedRestaurants);
      });
    });
};

  
/*const saveRecommendation = (userId, recommendations) => {
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
};*/

/*const saveRecommendation = (userId, recommendations) => {
    return new Promise((resolve, reject) => {
        // Query semua id restoran yang ada di database
        connection.query('SELECT id FROM restaurants', (error, restaurantIdsResults) => {
            if (error) return reject(error);

            const restaurantIds = restaurantIdsResults.map(restaurant => restaurant.id);

            // Filter rekomendasi agar hanya memasukkan yang valid
            const values = recommendations
                .map((rec, index) => [userId, restaurantIds[index], rec])
                .filter((value) => restaurantIds.includes(value[1]));

            if (values.length === 0) {
                return reject(new Error('No valid recommendations to save'));
            }

            const query = 'INSERT INTO recommendation (customer_id, recommended_restaurant_id, score) VALUES ?';
            connection.query(query, [values], (error, results) => {
                if (error) return reject(error);
                resolve(results);
            });
        });
    });
};*/

const saveRecommendation = (userId, recommendations) => {
    return new Promise((resolve, reject) => {
      // Query semua id restoran yang ada di database
      connection.query('SELECT id FROM restaurants', (error, restaurantIdsResults) => {
        if (error) return reject(error);
  
        const restaurantIds = restaurantIdsResults.map(restaurant => restaurant.id);
  
        // Filter rekomendasi agar hanya memasukkan yang valid
        const values = recommendations
          .map((rec, index) => [userId, restaurantIds[index], rec])
          .filter((value) => restaurantIds.includes(value[1]));
  
        if (values.length === 0) {
          return reject(new Error('No valid recommendations to save'));
        }
  
        const query = 'INSERT INTO recommendation (customer_id, recommended_restaurant_id, score) VALUES ?';
        connection.query(query, [values], (error, results) => {
          if (error) return reject(error);
          resolve(results);
        });
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

module.exports = { makeRecommendation, getMenuItems, getReviewItems, getRecommendedRestaurants };
