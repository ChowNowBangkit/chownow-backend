const { makeRecommendation, getMenuItems, getReviewItems } = require('../services/inferenceService');
const connection = require('../services/storeData');
//const axios = require('axios');
require('dotenv').config();

/*const getLocationHandler = async (request, h) => {
    const { latitude, longitude } = request.payload;

    const apiKey = 'YOUR_GOOGLE_MAPS_API_KEY'; // Ganti dengan API Key Anda
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;

    try {
        const response = await axios.get(url);
        const locationData = response.data;
        return h.response(locationData).code(200);
    } catch (error) {
        console.error(error);
        return h.response({ error: 'Unable to fetch location data' }).code(500);
    }
};*/

const getRecommend = async (request, h) => {
    const model = request.server.app.model;
    if (!model) {
      return h.response({ error: 'Model belum dimuat' }).code(500);
    }

    //const { userInput, itemInput } = request.payload;
    const userId = request.params.userId;

    try {
      const recommendation = await makeRecommendation(model, userId);
      return h.response({ recommendation });
    } catch (error) {
      console.error('Gagal membuat rekomendasi:', error);
      return h.response({ error: 'Gagal membuat rekomendasi' }).code(500);
    }
};

const getMenuByRestaurantId = async (request, h) => {
    const restaurantId = request.params.restaurantId;
  
    try {
      const menuItems = await getMenuItems(restaurantId);
      return h.response({ menu: menuItems });
    } catch (error) {
      console.error('Gagal mengambil menu:', error);
      return h.response({ error: 'Gagal mengambil menu' }).code(500);
    }
};

/*const getReviews = async (request, h) => {
    const restaurantId = request.params.restaurantId;
    
    try {
        const [rows] = await connection.query(
            'SELECT comment FROM reviews',
            [restaurantId]
        );
        return h.response(rows).code(200);
    } catch (error) {
        console.error(error);
        return h.response({ error: 'Unable to fetch reviews' }).code(500);
    }
};*/

/*const getReviews = async (request, h) => {
    const restaurantId = request.params.restaurantId;

    try {
        const query = `
            SELECT reviews.comment, reviews.updated_at, customers.name AS customer_name, products.name AS product_name, orders.quantity
            FROM reviews
            JOIN customers ON reviews.customer_id = customers.id
            JOIN orders ON reviews.customer_id = orders.customer_id
            JOIN products ON orders.product_id = products.id
        `;
        const [rows] = await connection.query(query, [restaurantId]);
        return h.response(rows).code(200);
    } catch (error) {
        console.error(error);
        return h.response({ error: 'Unable to fetch reviews' }).code(500);
    }
};*/

const getReviews = async (request, h) => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT reviews.comment, reviews.updated_at, customers.name AS customer_name, products.name AS product_name, orders.quantity
            FROM reviews
            JOIN customers ON reviews.customer_id = customers.id
            JOIN orders ON reviews.customer_id = orders.customer_id
            JOIN products ON orders.product_id = products.id;
        `;
        connection.query(query, (error, results) => {
            if (error) return reject(error);
            resolve(results);
        });
    });
};

const getReviewsByRestaurantId = async (request, h) => {
    const restaurantId = request.params.restaurantId;
  
    try {
      const reviews = await getReviewItems(restaurantId);
      return h.response({ reviews });
    } catch (error) {
      console.error('Gagal mengambil review:', error);
      return h.response({ error: 'Gagal mengambil review' }).code(500);
    }
};

module.exports = {getReviews, getRecommend, getMenuByRestaurantId, getReviewsByRestaurantId};