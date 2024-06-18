const { getRecommend, getReviews } = require('../server/handler');
const AuthController = require('../server/controllers/authController');
const authMiddleware = require('../server/middlewares/authMiddleware');

    const routes = [
    /*{
        method: 'GET',
        path: '/userlocation',
        handler: getLocationHandler,
    },*/
    {
        method: 'GET',
        path: '/review',
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
    }
  ];
   
module.exports = routes;