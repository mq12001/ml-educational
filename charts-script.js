// Function to initialize a new Chart.js chart
function createChart(canvasId) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array.from({ length: 200 }, (_, i) => i + 1), // Pre-fill labels from 1 to 100
            datasets: [
                { label: 'Loss', data: [], borderColor: 'red', fill: false, pointRadius: 0, borderWidth: 2 },
                { label: 'Accuracy', data: [], borderColor: 'blue', fill: false, pointRadius: 0, borderWidth: 2 },
            ],
        },
        options: {
            animation: false,
            scales: {
                x: {
                    title: { display: true, text: 'Epochs', color: 'white' }, min: 1, max: 200, ticks: {
                        color: 'white', // X-axis tick color
                    },
                },
                y: {
                    title: { display: true, text: 'Value', color: 'white' }, min: 0, max: 1, ticks: {
                        color: 'white', // X-axis tick color
                    },
                },

            },

            plugins: {
                legend: {
                    labels: {
                        color: 'white', // Legend text color
                    },
                },
            },
        },
    });
}

// Function to reset a chart
function resetChart(chart) {
    chart.data.datasets.forEach((dataset) => {
        dataset.data = [];
    });
    chart.update();
}

// Function to train a model for a specific chart
function trainModelForChart(layersInputId, nodesInputId, points, chart, modelId) {
    const layers = parseInt(document.getElementById(layersInputId).value);
    const nodes = parseInt(document.getElementById(nodesInputId).value);

    const model = createModel(layers, nodes); // Assume createModel is already defined
    modelRegistry[modelId] = model; // Store the model in the registry

    // Pass the chart to trainModel
    return trainModel(model, points, chart, (epoch, logs) => {
        console.log(`Epoch ${epoch + 1} for ${layersInputId}: Loss = ${logs.loss}, Accuracy = ${logs.acc}`);
    });
}

// Initialize charts
const chart1 = createChart('chart1');
const chart2 = createChart('chart2');
const chart3 = createChart('chart3');



// Train all models concurrently
document.getElementById('trainAll').addEventListener('click', async () => {
    console.log('Training all models...');

    // Reset all charts
    resetChart(chart1);
    resetChart(chart2);
    resetChart(chart3);

    // Train all models concurrently
    await Promise.all([
        trainModelForChart('layers1', 'nodes1', points, chart1, 1),
        trainModelForChart('layers2', 'nodes2', points, chart2, 2),
        trainModelForChart('layers3', 'nodes3', points, chart3, 3),
    ]);
    updateBackground(Object.values(modelRegistry)); // Pass models as an array
    console.log('All models trained successfully!');
});



function resetChart(chart) {
    chart.data.datasets.forEach((dataset) => {
        dataset.data = []; // Clear dataset values
    });
    chart.update(); // Refresh the chart
}

// Reset button functionality
document.getElementById('reset').addEventListener('click', () => {
    points.length = 0;
    clearCanvas();
    resetChart(chart1);
    resetChart(chart2);
    resetChart(chart3);
});