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
    const style = getComputedStyle(canvas);

    const x = ((event.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((event.clientY - rect.top) / rect.height) * canvas.height;
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

function resetChart() {
    chart.data.datasets.forEach((dataset) => {
        dataset.data = []; // Clear dataset values
    });
    chart.update(); // Refresh the chart
}

// Reset button functionality
document.getElementById('reset').addEventListener('click', () => {
    points.length = 0;
    clearCanvas();
    resetChart();
});

// Train button functionality
document.getElementById('train').addEventListener('click', () => {
    console.log('Train button clicked'); // Log to verify button press
    clearCanvas();
    resetChart();
    // Redraw points on top
    points.forEach(({ x, y, color }) => drawPoint(x, y, color));

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

function updateBackground(model) {
    const resolution = 10; // Lower resolution for faster updates
    const cellSize = canvas.width / resolution;

    for (let i = 0; i < resolution; i++) {
        for (let j = 0; j < resolution; j++) {
            const x = i / resolution; // Normalize x to [0, 1]
            const y = j / resolution; // Normalize y to [0, 1]

            // Use a tensor for input
            const inputTensor = tf.tensor2d([[x, y]], [1, 2]);

            // Get the prediction
            const predictionTensor = model.predict(inputTensor);
            const prediction = predictionTensor.dataSync()[0];

            // Clean up tensors
            inputTensor.dispose();
            predictionTensor.dispose();

            // Draw grid cell
            const r = Math.round(prediction * 255);
            const b = Math.round((1 - prediction) * 255);
            ctx.fillStyle = `rgb(${r}, 0, ${b})`;
            ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
        }
    }

    // Redraw points on top
    points.forEach(({ x, y, color }) => drawPoint(x, y, color));
}

const ctx2 = document.getElementById('chartCanvas').getContext('2d');

const chart = new Chart(ctx2, {
    type: 'line',
    data: {
        labels: Array.from({ length: 100 }, (_, i) => i + 1), // Pre-fill labels from 1 to 100
        datasets: [
            {
                label: 'Loss',
                data: [],
                borderColor: 'red', // Line color
                fill: false,        // No area fill
                pointRadius: 0,     // Remove circles
                borderWidth: 2,     // Set line thickness
            },
            {
                label: 'Accuracy',
                data: [],
                borderColor: 'blue', // Line color
                fill: false,         // No area fill
                pointRadius: 0,      // Remove circles
                borderWidth: 2,      // Set line thickness
            },
        ],
    },
    options: {
        animation: false, // Disable animation
        scales: {
            x: {
                title: { display: true, text: 'Epochs' },
                min: 1,
                max: 100, // Fixed x-axis range
            },
            y: {
                title: { display: true, text: 'Value' },
                min: 0,
                max: 1, // Fixed y-axis range
            },
        },
    },
});