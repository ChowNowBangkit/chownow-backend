const { getRecommend, getReviews } = require('../server/handler');

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
        path: '/recommend',
        handler: getRecommend,
    },
  ];
   
module.exports = routes;