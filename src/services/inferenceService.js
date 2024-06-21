const tf = require('@tensorflow/tfjs-node');
const connection = require('../services/storeData');

// Fungsi untuk melakukan encoding kategorikal secara manual
const encodeCategorical = (item, uniqueValues) => {
  return uniqueValues.indexOf(item);
};

// Fungsi untuk melakukan scaling data secara manual
const scaleData = (data) => {
  const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
  const stdDev = Math.sqrt(data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length);
  return data.map(val => (val - mean) / stdDev);
};

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

      if (!userData) return reject(new Error('User data not found'));

      connection.query('SELECT DISTINCT gender FROM customers', (error, results) => {
        if (error) return reject(error);

        const uniqueGenders = results.map(res => res.gender);

        const genderEncoded = encodeCategorical(userData.gender, uniqueGenders);

        const userInput = [
          parseInt(userData.age, 10) || 0,
          genderEncoded
        ];

        resolve(userInput);
      });
    });
  });
};  

const getItemData = () => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT 
                o.total_spend,
                c.kind_of_food,
                c.restaurant_history,
                c.click,
                c.location,
                rv.comment AS review_category,
                r.id AS restaurant_id
            FROM orders o
            JOIN customers c ON o.customer_id = c.id
            JOIN reviews rv ON rv.customer_id = c.id
            JOIN restaurants r ON o.restaurant_id = r.id;
        `;
        connection.query(query, (error, results) => {
            if (error) return reject(error);

            /// Dapatkan daftar unik untuk fitur yang memerlukan One-Hot Encoding
            const uniqueKindOfFood = [...new Set(results.map(item => item.kind_of_food))];
            const uniqueRestaurants = [...new Set(results.map(item => item.restaurant_history))];
            const uniqueLocations = [...new Set(results.map(item => item.location))];
            const uniqueReviewCategories = [...new Set(results.map(item => item.review_category))];

            const totalSpendData = results.map(item => parseFloat(item.total_spend) || 0);
            const clickData = results.map(item => parseInt(item.click, 10) || 0);

            const scaledTotalSpend = scaleData(totalSpendData);
            const scaledClick = scaleData(clickData);

            const itemInput = results.map((item, index) => ({
              id: item.restaurant_id,
              values: [
                scaledTotalSpend[index],
                encodeCategorical(item.kind_of_food, uniqueKindOfFood),
                encodeCategorical(item.restaurant_history, uniqueRestaurants),
                scaledClick[index],
                encodeCategorical(item.location, uniqueLocations),
                encodeCategorical(item.review_category, uniqueReviewCategories)
              ]
            }));

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

const fetchRestaurantData = (searchQuery) => {
  return new Promise((resolve, reject) => {
      const query = `
          SELECT id, name, location, rating
          FROM restaurants
          WHERE name LIKE ? OR location LIKE ?
      `;
      const searchPattern = `%${searchQuery}%`;
      connection.query(query, [searchPattern, searchPattern], (error, results) => {
          if (error) return reject(error);

          const restoImage = `https://storage.googleapis.com/restaurant-images-chownow/restaurant.jpg`;
            const restaurants = results.map(restaurant => ({
                ...restaurant,
                restoImage: restoImage
            }));

          resolve(restaurants);
      });
  });
};

const fetchOrderHistory = (customerId) => {
  return new Promise((resolve, reject) => {
      const query = `
          SELECT o.quantity, o.order_date, r.name AS restaurant_name
          FROM orders o
          JOIN restaurants r ON o.restaurant_id = r.id
          WHERE o.customer_id = ?;
      `;
      connection.query(query, [customerId], (error, results) => {
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

      const userTensor = tf.tensor2d([userInput], [1, userInput.length]);
      const itemValues = itemInput.map(item => item.values);
      const itemTensor = tf.tensor2d(itemValues, [itemValues.length, itemValues[0].length]);
  
      // Lakukan prediksi
      const predictions = model.predict([userTensor, itemTensor]);
      const recommendation = predictions.arraySync()[0];

      // Pasangkan setiap skor dengan ID item yang sesuai
      const recommendationWithIds = itemInput.map((item, index) => ({
        recommended_restaurant_id: item.id,
        score: parseFloat(recommendation[index])
      })).filter(rec => !isNaN(rec.score));
  

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

const getRecommendedRestaurants = (recommendations) => {
    return new Promise((resolve, reject) => {
        const ids = recommendations.map(rec => rec.recommended_restaurant_id);
        const query = `
            SELECT id, name, rating
            FROM restaurants
            WHERE id IN (?);
        `;
        connection.query(query, [ids], (error, results) => {
            if (error) return reject(error);
  
        const recommendedRestaurants = recommendations.map(rec => {
          const restaurant = results.find(res => res.id === rec.recommended_restaurant_id);
          const imageUrl = `https://storage.googleapis.com/restaurant-images-chownow/${rec.recommended_restaurant_id}`;
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

const saveRecommendation = (userId, recommendations) => {
    return new Promise((resolve, reject) => {
      // Query semua id restoran yang ada di database
      connection.query('SELECT id FROM restaurants', (error, restaurantIdsResults) => {
        if (error) return reject(error);
  
        const restaurantIds = restaurantIdsResults.map(restaurant => restaurant.id);

        const values = recommendations
          .map((rec) => [userId, rec.recommended_restaurant_id, parseFloat(rec.score)]) // Ensure score is a float
          .filter((value) => {
            const isValid = restaurantIds.includes(value[1]);
            if (!isValid || isNaN(value[2])) {
              console.log('Invalid recommendation:', value);  // Debugging
            }
            return isValid && !isNaN(value[2]);
          });
  
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

module.exports = { makeRecommendation, getMenuItems, getReviewItems, getRecommendedRestaurants, fetchRestaurantData, fetchOrderHistory };
