function createModel(layers, nodes) {
    const model = tf.sequential();

    // Add the first hidden layer (with implicit input layer with shape [2])
    model.add(tf.layers.dense({ units: nodes, activation: 'relu', inputShape: [2] }));

    // Add hidden layers
    for (let i = 1; i < layers; i++) {
        model.add(tf.layers.dense({ units: nodes, activation: 'relu' }));
    }

    // Add output layer (single output for binary classification)
    model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));

    // Compile the model with an optimizer and loss function
    model.compile({
        optimizer: tf.train.sgd(0.1),
        loss: 'binaryCrossentropy',
        metrics: ['accuracy'],
    });

    return model; // Return the TensorFlow.js model
}

async function trainModel(model, points, callback) {
    const xs = tf.tensor2d(points.map(({ x, y }) => [x / canvas.width, y / canvas.height]));
    const ys = tf.tensor2d(points.map(({ color }) => (color === 'red' ? 1 : 0)), [points.length, 1]);

    await model.fit(xs, ys, {
        epochs: 100,
        batchSize: 8,
        callbacks: {
            onEpochEnd: (epoch, logs) => {
                console.log(`Epoch ${epoch + 1}: Loss = ${logs.loss}`);

                // Update chart data
                chart.data.datasets[0].data.push(logs.loss); // Loss
                chart.data.datasets[1].data.push(logs.acc); // Accuracy
                chart.update(); // Refresh the chart

                if ((epoch + 1) % 10 === 0) { // Update every 10 epochs
                    clearCanvas();
                    updateBackground(model);

                }
            },
        },
    });

    xs.dispose();
    ys.dispose();

    callback();
}

function predict(model, input) {
    const prediction = model.predict(tf.tensor2d([input], [1, 2]));
    return prediction.dataSync()[0];
}