// Canvas and context setup
const canvas = document.getElementById('graph');
const ctx = canvas.getContext('2d');

// State
const points = [];
const maxPoints = 30;

// Add point on click
canvas.addEventListener('click', (e) => {
    console.log('Point button clicked'); // Log to verify button press

    if (points.length >= maxPoints) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const color = points.length % 2 === 0 ? 'red' : 'blue';
    points.push({ x, y, color });

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

// Reset button functionality
document.getElementById('reset').addEventListener('click', () => {
    points.length = 0;
    clearCanvas();
});

// Train button functionality
document.getElementById('train').addEventListener('click', () => {
    console.log('Train button clicked'); // Log to verify button press

    if (points.length === 0) {
        alert('Add points before training!');
        return;
    }

    const layers = parseInt(document.getElementById('layers').value);
    const nodes = parseInt(document.getElementById('nodes').value);

    const model = createModel(layers, nodes);
    console.log('Model:', model); // Log the model object

    trainModel(model, points, () => {
        updateBackground(model);
    });
});

// Update background grid based on model predictions
function updateBackground(model) {
    const resolution = 20; // Size of each grid cell
    const cellSize = canvas.width / resolution;

    for (let i = 0; i < resolution; i++) {
        for (let j = 0; j < resolution; j++) {
            const x = i / resolution; // Normalize x to [0, 1]
            const y = j / resolution; // Normalize y to [0, 1]

            // Create a tensor for the input (shape [1, 2])
            const inputTensor = tf.tensor2d([[x, y]], [1, 2]);

            // Get the prediction
            const predictionTensor = model.predict(inputTensor);
            const prediction = predictionTensor.dataSync()[0]; // Extract scalar value

            // Clean up tensors
            inputTensor.dispose();
            predictionTensor.dispose();

            // Blend colors based on prediction
            const r = Math.round(prediction * 255);
            const b = Math.round((1 - prediction) * 255);
            ctx.fillStyle = `rgb(${r}, 0, ${b})`;
            ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
        }
    }

    // Redraw points on top
    points.forEach(({ x, y, color }) => drawPoint(x, y, color));
}