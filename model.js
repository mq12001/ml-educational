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

async function trainModel(model, points, chart, callback) {
    const xs = tf.tensor2d(
        points.map(({ x, y }) => [x / 400, y / 400]), // Normalize x and y
        [points.length, 2] // Shape: [number of points, 2 features (x and y)]
    );
    const ys = tf.tensor2d(
        points.map(({ color }) => (color === 'red' ? 1 : 0)), // Encode labels as 0 or 1
        [points.length, 1] // Shape: [number of points, 1 output]
    );

    await model.fit(xs, ys, {
        epochs: 200,
        batchSize: 16,
        callbacks: {
            onEpochEnd: async (epoch, logs) => {

                // Update chart data
                chart.data.datasets[0].data.push(logs.loss); // Loss
                chart.data.datasets[1].data.push(logs.acc); // Accuracy
                await chart.update(); // Refresh the chart

                if ((epoch + 1) % 10 === 0) { // Update every 10 epochs
                    updateBackground(Object.values(modelRegistry));
                }
                // Execute additional callback logic
                if (callback) {
                    callback(epoch, logs);
                }
            },
        },
    });

    xs.dispose();
    ys.dispose();
}

function predict(model, input) {
    const prediction = model.predict(tf.tensor2d([input], [1, 2]));
    return prediction.dataSync()[0];
}