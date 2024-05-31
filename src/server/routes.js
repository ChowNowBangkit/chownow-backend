const { getNearbyFood, getAllReviewHandler } = require('../server/handler');

    const routes = [
    {
        method: 'GET',
        path: '/nearby-food',
        handler: getNearbyFood,
    },
    {
        method: 'GET',
        path: '/ulasan',
        handler: getAllReviewHandler,
    },
  ];
   
module.exports = routes;