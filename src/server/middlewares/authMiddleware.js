const jwt = require('jsonwebtoken');

const authMiddleware = async (request, h) => {
    const authorization = request.headers.authorization;
    if (!authorization) {
        throw new Error('Access denied, no token provided');
    }
    const token = authorization.replace('Bearer ', '');
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        request.user = decoded;
        return h.continue;
    } catch (error) {
        console.error('Invalid token:', error);
        throw new Error('Invalid token');
    }
};

module.exports = authMiddleware;