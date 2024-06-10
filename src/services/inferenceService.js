const tf = require('@tensorflow/tfjs-node');

// Handler untuk melakukan prediksi
async function predictionHandler(request, h, model) {
    try {
        const { input1, input2 } = request.payload; // Asumsi input dari client berupa array
        const tensor1 = tf.tensor2d(input1, [1, input1.length]); // Ubah input menjadi tensor
        const tensor2 = tf.tensor2d(input2, [1, input2.length]);

        // Prediksi menggunakan model
        const prediction = model.predict([tensor1, tensor2]);
        const result = await prediction.array();

        return h.response(result).code(200);
    } catch (error) {
        console.error(error);
        return h.response({ error: 'Prediction failed' }).code(500);
    }
}

module.exports = predictionHandler;