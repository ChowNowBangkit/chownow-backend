const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const AuthController = {
  register: async (request, h) => {
    try {
      const { name, username, email, password } = request.payload;
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = { name, username, email, password: hashedPassword };
      const createdUser = await User.create(newUser);
      return h.response({ 
        message: 'User registered successfully',
        userId: createdUser.id
       }).code(201);
    } catch (error) {
      console.error('Error in register:', error);
      return h.response({ error: error.message }).code(500);
    }
  },
  login: async (request, h) => {
    try {
      const { email, password } = request.payload;
      const user = await User.findByEmail(email);
      if (!user) {
        return h.response({ error: 'Invalid email or password' }).code(400);
      }
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return h.response({ error: 'Invalid email or password' }).code(400);
      }
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      return h.response({ 
        token,
        userId: user.id
       });
    } catch (error) {
      console.error('Error in login:', error);
      return h.response({ error: error.message }).code(500);
    }
  },
  getUserInfo: async (request, h) => {
    try {
      const user = request.user;
      return h.response(user);
    } catch (error) {
      console.error('Error in getUserInfo:', error);
      return h.response({ error: error.message }).code(500);
    }
  }
};

module.exports = AuthController;