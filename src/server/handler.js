const predictionHandler = require('../services/inferenceService');
const axios = require('axios');
require('dotenv').config();

const getNearbyFood = async (request, h) => {
    const { location, radius, user_input, kind_of_food } = request.query;

    if (!location || !radius || !user_input || !kind_of_food) {
        return h.response({ error: 'Location, radius, user_input, and kind_of_food are required' }).code(400);
    }

    try {
        const response = await axios.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', {
            params: {
                location,
                radius,
                type: 'restaurant',
                key: process.env.GOOGLE_MAPS_API_KEY
            }
        });

        const restaurants = response.data.results;

        const model = await predictionHandler(); // Load model here
        const predictions = await Promise.all(
            restaurants.map(async (restaurant) => {
                const score = await model.predict(user_input, kind_of_food);
                return { ...restaurant, score };
            })
        );

        predictions.sort((a, b) => {
            const distanceA = a.geometry.location.lat - location.split(',')[0];
            const distanceB = b.geometry.location.lat - location.split(',')[0];
            return distanceA - distanceB || b.score - a.score;
        });

        return h.response(predictions).code(200);
    } catch (error) {
        console.error(error);
        return h.response({ error: 'An error occurred' }).code(500);
    }
};

const getAllReviewHandler = (request, h) => {
}

module.exports = {getNearbyFood, getAllReviewHandler};