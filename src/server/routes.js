const { getRecommend, getReviews, getMenuByRestaurantId, getReviewsByRestaurantId, getProfile, searchRestaurants, getOrderHistory } = require('../server/handler');
const AuthController = require('../server/controllers/authController');
const authMiddleware = require('../server/middlewares/authMiddleware');

    const routes = [
    {
        method: 'GET',
        path: '/reviews',
        handler: getReviews,
    },
    {
        method: 'POST',
        path: '/recommend/{userId}',
        handler: getRecommend,
    },
    {
        method: 'POST',
        path: '/register',
        handler: AuthController.register,
    },
    {
        method: 'POST',
        path: '/login',
        handler: AuthController.login,
    },
    {
        method: 'GET',
        path: '/user-info',
        handler: AuthController.getUserInfo,
        options: {
            pre: [authMiddleware]
        }
    },
    {
        method: 'GET',
        path: '/menu/{restaurantId}',
        handler: getMenuByRestaurantId,
    },
    {
        method: 'GET',
        path: '/review/{restaurantId}',
        handler: getReviewsByRestaurantId,
    },
    {
        method: 'GET',
        path: '/profile/{userId}',
        handler: getProfile,
    },
    {
        method: 'GET',
        path: '/search',
        handler: searchRestaurants,
    },
    {
        method: 'GET',
        path: '/history-order/{customerId}',
        handler: getOrderHistory
    }
    
  ];
   
module.exports = routes;