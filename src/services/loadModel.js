const tf = require('@tensorflow/tfjs-node');
const loadModel = () => {
    try {
      const model = tf.loadLayersModel(process.env.MODEL_URL);
      return model;
    } catch (error) {
      console.error('Gagal memuat model:', error);
      return null;
    }
  }
module.exports = loadModel;