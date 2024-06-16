const tf = require('@tensorflow/tfjs-node');

const makeRecommendation = (model, userInput, itemInput) => {
  try {
    const userTensor = tf.tensor2d([userInput]);
    const itemTensor = tf.tensor2d([itemInput]);

    const userPrediction = model.predict(userTensor);
    const itemPrediction = model.predict(itemTensor);

    // Hitung dot product dari dua prediksi
    const dotProduct = tf.matMul(userPrediction, tf.transpose(itemPrediction));

    // Ambil nilai dari hasil dot product
    const recommendation = dotProduct.dataSync()[0];

    return recommendation;
  } catch (error) {
    console.error('Gagal melakukan prediksi:', error);
    throw new Error('Gagal melakukan prediksi');
  }
};

module.exports = { makeRecommendation };
