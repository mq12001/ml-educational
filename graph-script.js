// Canvas and context setup
const canvas = document.getElementById('graph');
const ctx = canvas.getContext('2d');

// State
const points = [];
const maxPoints = 30;
const modelRegistry = {}; // Object to store models by ID

// Add point on click
canvas.addEventListener('click', (e) => {
    console.log('Point button clicked'); // Log to verify button press

    if (points.length >= maxPoints) return;

    const rect = canvas.getBoundingClientRect();

    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
    const clampedX = Math.min(Math.max(0, x), canvas.width);
    const clampedY = Math.min(Math.max(0, y), canvas.height);
    const color = points.length % 2 === 0 ? 'red' : 'blue';
    points.push({ x, y, color });
    console.log(`Point added: x=${clampedX}, y=${clampedY}, color=${color}`);

    drawPoint(x, y, color);
});

// Draw a point on the canvas
function drawPoint(x, y, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, 2 * Math.PI);
    ctx.fill();
}

// Clear canvas
function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// // Train button functionality
// document.getElementById('train').addEventListener('click', () => {
//     console.log('Train button clicked'); // Log to verify button press
//     clearCanvas();
//     resetChart();
//     // Redraw points on top
//     points.forEach(({ x, y, color }) => drawPoint(x, y, color));

//     if (points.length === 0) {
//         alert('Add points before training!');
//         return;
//     }

//     const layers = parseInt(document.getElementById('layers').value);
//     const nodes = parseInt(document.getElementById('nodes').value);

//     const model = createModel(layers, nodes);
//     console.log('Model:', model); // Log the model object

//     trainModel(model, points, () => {
//         updateBackground(model);
//     });
// });

function precomputePredictions(models, resolution) {
    const gridPoints = [];
    const step = 1 / resolution;

    // Generate all grid points
    for (let i = 0; i < resolution; i++) {
        for (let j = 0; j < resolution; j++) {
            const x = j * step;
            const y = i * step;
            gridPoints.push([x, y]);
        }
    }

    // Batch the grid points and predict for all models
    const inputTensor = tf.tensor2d(gridPoints);
    const predictions = models.map((model) => model.predict(inputTensor).arraySync());
    inputTensor.dispose();

    return predictions;
}

function updateBackground(models) {
    return new Promise(async (resolve) => {
        const resolution = 50; // Increased resolution for smoother boundaries
        const cellSize = canvas.width / resolution;
        const threshold = 0.1; // Decision boundary threshold

        // Generate grid points
        const gridPoints = [];
        const step = 1 / resolution;
        for (let i = 0; i < resolution; i++) {
            for (let j = 0; j < resolution; j++) {
                gridPoints.push([j * step, i * step]);
            }
        }

        // Use batched predictions for all models
        const inputTensor = tf.tensor2d(gridPoints);
        const predictions = await Promise.all(
            models.map((model) => model.predict(inputTensor).array())
        );
        inputTensor.dispose();

        // Render grid based on predictions
        for (let i = 0; i < resolution; i++) {
            for (let j = 0; j < resolution; j++) {
                const gridIndex = j * resolution + i;
                let r = 0, g = 0, b = 0;

                // Process predictions for each model
                models.forEach((_, modelIndex) => {
                    const prediction = predictions[modelIndex][gridIndex];
                    const boundaryScore = Math.abs(prediction - 0.5);

                    // Highlight boundaries where predictions are close to 0.5
                    if (boundaryScore <= threshold) {
                        const intensity = Math.round((1 - boundaryScore / threshold) * 255);
                        if (modelIndex === 0) r = Math.max(r, intensity); // Red for Model 1
                        if (modelIndex === 1) g = Math.max(g, intensity); // Green for Model 2
                        if (modelIndex === 2) b = Math.max(b, intensity); // Blue for Model 3
                    }
                });
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                // Render color for grid cell
                ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
            }
        }

        // Redraw points
        points.forEach(({ x, y, color }) => drawPoint(x, y, color));

        resolve(); // Signal that rendering is complete
    });
}
// function updateBackground(model) {
//     const resolution = 10; // Lower resolution for faster updates
//     const cellSize = canvas.width / resolution;

//     for (let i = 0; i < resolution; i++) {
//         for (let j = 0; j < resolution; j++) {
//             const x = i / resolution; // Normalize x to [0, 1]
//             const y = j / resolution; // Normalize y to [0, 1]

//             // Use a tensor for input
//             const inputTensor = tf.tensor2d([[x, y]], [1, 2]);

//             // Get the prediction
//             const predictionTensor = model.predict(inputTensor);
//             const prediction = predictionTensor.dataSync()[0];

//             // Clean up tensors
//             inputTensor.dispose();
//             predictionTensor.dispose();

//             // Draw grid cell
//             const r = Math.round(prediction * 255);
//             const b = Math.round((1 - prediction) * 255);
//             ctx.fillStyle = `rgb(${r}, 0, ${b})`;
//             ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
//         }
//     }

//     // Redraw points on top
//     points.forEach(({ x, y, color }) => drawPoint(x, y, color));
// }

// const ctx2 = document.getElementById('chartCanvas').getContext('2d');

// const chart = new Chart(ctx2, {
//     type: 'line',
//     data: {
//         labels: Array.from({ length: 100 }, (_, i) => i + 1), // Pre-fill labels from 1 to 100
//         datasets: [
//             {
//                 label: 'Loss',
//                 data: [],
//                 borderColor: 'red', // Line color
//                 fill: false,        // No area fill
//                 pointRadius: 0,     // Remove circles
//                 borderWidth: 2,     // Set line thickness
//             },
//             {
//                 label: 'Accuracy',
//                 data: [],
//                 borderColor: 'blue', // Line color
//                 fill: false,         // No area fill
//                 pointRadius: 0,      // Remove circles
//                 borderWidth: 2,      // Set line thickness
//             },
//         ],
//     },
//     options: {
//         animation: false, // Disable animation
//         scales: {
//             x: {
//                 title: { display: true, text: 'Epochs' },
//                 min: 1,
//                 max: 100, // Fixed x-axis range
//             },
//             y: {
//                 title: { display: true, text: 'Value' },
//                 min: 0,
//                 max: 1, // Fixed y-axis range
//             },
//         },
//     },
// });