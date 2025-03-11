console.log("script.js loaded");

const SENSOR_WIDTH = 35.9;
const SENSOR_HEIGHT = 23.9;
const POLARIS_DIST = 0.66;
const REF_TIME = new Date("2025-03-09T20:30:00-07:00");

let focalLength = 85;
let fovWidth, fovHeight, polarisX, polarisY;

function calculateFOV() {
    fovWidth = 2 * (180 / Math.PI) * Math.atan(SENSOR_WIDTH / (2 * focalLength));
    fovHeight = 2 * (180 / Math.PI) * Math.atan(SENSOR_HEIGHT / (2 * focalLength));
    polarisX = fovWidth / 2;
    polarisY = fovHeight / 2;
    console.log(`FOV: ${fovWidth.toFixed(2)}° x ${fovHeight.toFixed(2)}°, Polaris at (${polarisX.toFixed(2)}, ${polarisY.toFixed(2)})`);
}

function getCurrentDateTime() {
    const year = parseInt(document.getElementById("year").value);
    const month = parseInt(document.getElementById("month").value) - 1;
    const day = parseInt(document.getElementById("day").value);
    let hour = parseInt(document.getElementById("hour").value);
    const minute = parseInt(document.getElementById("minute").value);
    const am_pm = document.getElementById("am_pm").value;

    if (am_pm === "PM" && hour !== 12) hour += 12;
    if (am_pm === "AM" && hour === 12) hour = 0;

    const dt = new Date(year, month, day, hour, minute);
    console.log(`Current DateTime: ${dt.toISOString()}`);
    return dt;
}

function plotSky() {
    if (typeof Plotly === 'undefined') {
        console.error("Plotly.js not loaded!");
        alert("Plotly.js failed to load. Check your internet connection and refresh.");
        return;
    }

    calculateFOV();
    const currentTime = getCurrentDateTime();
    const timeDiffHours = (currentTime - REF_TIME) / (1000 * 60 * 60);
    const rotationAngle = timeDiffHours * 15.041;

    const ncpX = polarisX + POLARIS_DIST * Math.cos((45 - rotationAngle) * Math.PI / 180);
    const ncpY = polarisY + POLARIS_DIST * Math.sin((45 - rotationAngle) * Math.PI / 180);

    const kochabDist = 17;
    const kochabAngle = (-135 - rotationAngle) * Math.PI / 180;
    const kochabX = polarisX + kochabDist * Math.cos(kochabAngle);
    const kochabY = polarisY + kochabDist * Math.sin(kochabAngle);

    const pherkadDist = 18;
    const pherkadAngle = (-125 - rotationAngle) * Math.PI / 180;
    const pherkadX = polarisX + pherkadDist * Math.cos(pherkadAngle);
    const pherkadY = polarisY + pherkadDist * Math.sin(pherkadAngle);

    console.log(`NCP: (${ncpX.toFixed(2)}, ${ncpY.toFixed(2)})`);
    console.log(`Kochab: (${kochabX.toFixed(2)}, ${kochabY.toFixed(2)})`);
    console.log(`Pherkad: (${pherkadX.toFixed(2)}, ${pherkadY.toFixed(2)})`);

    const traces = [
        {
            x: [polarisX], y: [polarisY],
            mode: 'markers+text', type: 'scatter',
            marker: { size: 20, color: 'yellow' },
            text: ['Polaris'], textposition: 'bottom right',
            textfont: { size: 10, color: 'white' },
            name: 'Polaris (α UMi)'
        },
        {
            x: [ncpX], y: [ncpY],
            mode: 'markers+text', type: 'scatter',
            marker: { size: 10, color: 'red', symbol: 'x' },
            text: ['NCP'], textposition: 'top right',
            textfont: { size: 12, color: 'white' },
            name: 'North Celestial Pole (NCP)'
        },
        {
            x: [polarisX, ncpX], y: [polarisY, ncpY],
            mode: 'lines', type: 'scatter',
            line: { color: 'white', dash: 'dash', width: 1 },
            showlegend: false
        },
        {
            x: [kochabX], y: [kochabY],
            mode: 'markers+text', type: 'scatter',
            marker: { size: 15, color: 'orange' },
            text: ['Kochab'], textposition: 'bottom right',
            textfont: { size: 12, color: 'white' },
            name: 'Kochab (β UMi)'
        },
        {
            x: [pherkadX], y: [pherkadY],
            mode: 'markers+text', type: 'scatter',
            marker: { size: 12, color: 'orange' },
            text: ['Pherkad'], textposition: 'bottom right',
            textfont: { size: 12, color: 'white' },
            name: 'Pherkad (γ UMi)'
        }
    ];

    const layout = {
        title: {
            text: `Nikon Z6 II ${focalLength}mm View: Polaris & NCP<br>${document.getElementById("location").value}, ${document.getElementById("year").value}-${String(document.getElementById("month").value).padStart(2, '0')}-${String(document.getElementById("day").value).padStart(2, '0')}, ${String(document.getElementById("hour").value).padStart(2, '0')}:${String(document.getElementById("minute").value).padStart(2, '0')} ${document.getElementById("am_pm").value} PDT`,
            font: { color: 'white', size: 16 }
        },
        xaxis: { 
            title: 'Degrees (Right Ascension)', 
            range: [polarisX - fovWidth/2, polarisX + fovWidth/2], 
            color: 'white',
            gridcolor: 'gray',
            zeroline: false
        },
        yaxis: { 
            title: 'Degrees (Declination)', 
            range: [polarisY - fovHeight/2, polarisY + fovHeight/2], 
            color: 'white',
            gridcolor: 'gray',
            zeroline: false
        },
        plot_bgcolor: 'black',
        paper_bgcolor: '#1a1a1a',
        font: { color: 'white' },
        showgrid: true,
        legend: { bgcolor: '#1a1a1a', bordercolor: 'white', font: { color: 'white' } },
        margin: { l: 40, r: 40, t: 60, b: 40 },
        autosize: true
    };

    console.log("Attempting to plot...");
    Plotly.newPlot('plot', traces, layout, { responsive: true }).then(() => {
        console.log("Plot rendered successfully");
    }).catch(err => {
        console.error("Plotly error:", err);
    });
}

function updateTime() {
    console.log("updateTime called");
    plotSky();
}

function setCurrentTime() {
    console.log("setCurrentTime called");
    const now = new Date();
    document.getElementById("year").value = now.getFullYear();
    document.getElementById("month").value = now.getMonth() + 1;
    document.getElementById("day").value = now.getDate();
    const hour = now.getHours() % 12 || 12;
    document.getElementById("hour").value = hour;
    document.getElementById("minute").value = now.getMinutes();
    document.getElementById("am_pm").value = now.getHours() >= 12 ? "PM" : "AM";
    plotSky();
}

function updateFocalLength() {
    console.log("updateFocalLength called");
    focalLength = parseInt(document.getElementById("focal_combo").value);
    document.getElementById("focal_entry").value = focalLength;
    plotSky();
}

function setFocalLength() {
    console.log("setFocalLength called");
    const newFocal = parseInt(document.getElementById("focal_entry").value);
    if (!isNaN(newFocal) && newFocal > 0) {
        focalLength = newFocal;
        plotSky();
    } else {
        document.getElementById("focal_entry").value = focalLength;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM fully loaded");
    document.getElementById("setTimeBtn").addEventListener("click", updateTime);
    document.getElementById("currentTimeBtn").addEventListener("click", setCurrentTime);
    document.getElementById("focal_combo").addEventListener("change", updateFocalLength);
    document.getElementById("setFocalBtn").addEventListener("click", setFocalLength);

    if (typeof Plotly !== 'undefined') {
        console.log("Plotly.js loaded successfully");
        plotSky();
    } else {
        console.error("Plotly.js not loaded");
        alert("Failed to load Plotly.js. Check your internet connection and refresh.");
    }
});
