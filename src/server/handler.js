const axios = require('axios');
require('dotenv').config();

const getNearbyFood = async (request, h) => {
    const { location, radius } = request.query;

    if (!location || !radius) {
        return h.response({ error: 'Location and radius are required' }).code(400);
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

        return h.response(response.data).code(200);
    } catch (error) {
        console.error(error);
        return h.response({ error: 'An error occurred' }).code(500);
    }
};

const getAllReviewHandler = (request, h) => {
}

module.exports = {getNearbyFood, getAllReviewHandler};