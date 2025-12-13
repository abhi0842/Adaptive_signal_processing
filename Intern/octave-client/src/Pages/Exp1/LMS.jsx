import React, { useState } from "react";
import Papa from "papaparse";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

export default function LMS() {
  const [desired, setDesired] = useState([]);
  const [noisy, setNoisy] = useState([]);
  const [output, setOutput] = useState([]);
  const [error, setError] = useState([]);

  const [stepSize, setStepSize] = useState(0.01);
  const [M, setM] = useState(10);
  const [selectedCSV, setSelectedCSV] = useState("/inputs/real.csv");

  const [code, setCode] = useState("");
  const [codeHtml, setCodeHtml] = useState("Code will be generated here!");

  const [loading, setLoading] = useState(false);

  const csvFiles = [
    { label: "Real Signal", file: "/inputs/real.csv" },
    { label: "Simulated 1", file: "/inputs/simulated1.csv" },
  ];

  // ---------------- READ CSV ----------------
  const readCSV = async (filePath) => {
    const response = await fetch(filePath);
    const text = await response.text();
    const parsed = Papa.parse(text, { dynamicTyping: true }).data;
    return parsed.flat().filter((v) => !isNaN(v));
  };

  // ---------------- LMS ALGO ----------------
  const runLMS = (d, x, mu, M) => {
    let w = Array(M).fill(0);
    let y = [];
    let e = [];

    for (let n = 0; n < x.length - M; n++) {
      let x_vec = x.slice(n, n + M);
      let y_n = w.reduce((sum, w_i, i) => sum + w_i * x_vec[i], 0);
      let e_n = d[n] - y_n;

      for (let i = 0; i < M; i++) {
        w[i] = w[i] + mu * e_n * x_vec[i];
      }

      y.push(y_n);
      e.push(e_n);
    }

    return { y, e };
  };

  // ---------------- RUN LMS ----------------
  const handleRun = async () => {
    setLoading(true);
    const d = await readCSV("/inputs/real.csv");
    const x = await readCSV(selectedCSV);

    const { y, e } = runLMS(d, x, stepSize, M);

    setDesired(d);
    setNoisy(x);
    setOutput(y);
    setError(e);
    setLoading(false);
  };

  // ---------------- GENERATE CODE ----------------
  const handleGenerateCode = () => {
    const jsCode = `const fs = require('fs');
const csv = require('csv-parser');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const math = require('mathjs');
const path = require('path');

async function lmsDenoise(mu, inputFile, M, uniqueIdentifier) {
    // Sampling frequency
    const fsRate = 100;

    // Load CSV
    const x = await loadCSV(inputFile);
    const n = x.length;

    // Initialize LMS weight vector
    let w_lms = math.zeros(M)._data;

    // Generate noisy signal
    const D = x;
    const A = D.map(val => val + 0.5 * randn());

    // Initialize arrays
    let B_lms = Array(n).fill(0);
    let Err_lms = Array(n).fill(0);
    let weights_lms = Array.from({ length: M }, () => Array(n).fill(0));

    // Padding signal
    const A_padded = Array(M - 1).fill(0).concat(A);
    const t = Array.from({ length: n }, (_, i) => i / fsRate);

    // LMS algorithm
    for (let i = M - 1; i < n; i++) {
        const A_i = A_padded.slice(i, i - M, -1);
        let y_lms = math.dot(w_lms, A_i);
        Err_lms[i] = D[i] - y_lms;
        w_lms = math.add(w_lms, math.multiply(mu * Err_lms[i], A_i));
        for (let m = 0; m < M; m++) weights_lms[m][i] = w_lms[m];
        B_lms[i] = math.dot(w_lms, A_i);
    }

    // Plot the results
    await plotSignals(t, D, A, B_lms, Err_lms, uniqueIdentifier);
    console.log('Plot saved successfully!');
}

// Helper to read CSV
function loadCSV(filePath) {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(filePath)
            .pipe(csv({ headers: false }))
            .on('data', (data) => results.push(parseFloat(Object.values(data)[0])))
            .on('end', () => resolve(results))
            .on('error', reject);
    });
}

// Gaussian noise generator
function randn() {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

// Plotting function
async function plotSignals(t, D, A, B_lms, Err_lms, id) {
    const width = 800;
    const height = 800;
    const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });

    const configuration = {
        type: 'line',
        data: {
            labels: t,
            datasets: [
                { label: 'Desired Signal', data: D, borderColor: 'blue', fill: false },
                { label: 'Signal with Noise', data: A, borderColor: 'red', fill: false },
                { label: 'LMS Output', data: B_lms, borderColor: 'green', fill: false },
                { label: 'LMS Error', data: Err_lms, borderColor: 'orange', fill: false }
            ]
        },
        options: {
            scales: {
                x: { title: { display: true, text: 'Time (s)' } },
                y: { title: { display: true, text: 'Amplitude' } }
            },
            plugins: { legend: { display: true } }
        }
    };

    const image = await chartJSNodeCanvas.renderToBuffer(configuration);
    const outputDir = path.join(__dirname, 'Outputs');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
    fs.writeFileSync(path.join(outputDir, ), image);
  }
`;
    setCode(jsCode);
    setCodeHtml(`<pre>${jsCode}</pre>`);
  };

  const handleDownloadCode = () => {
    const element = document.createElement("a");
    const file = new Blob([code], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "lms_denoise.js";
    document.body.appendChild(element);
    element.click();
  };

  // ---------------- LOADING ----------------
  const LoadingScreen = () => (
    <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-50">
      <div className="text-lg font-bold">Processing...</div>
    </div>
  );

  // ---------------- CHART DATA ----------------
  const makeData = (label, data) => ({
    labels: data.map((_, i) => i),
    datasets: [
      {
        label,
        data,
        borderColor: "rgba(30,144,255,0.7)",
        borderWidth: 1.5,
        pointRadius: 0,
        tension: 0.2,
      },
    ],
  });

  return (
    <div className="flex flex-col space-y-10 p-5 max-w-[1300px] mx-auto">

      {/* TOP PANEL */}
      <div className="flex flex-row gap-5">

        {/* LEFT PANEL: CODE */}
        <div className="flex flex-col flex-1">
          <iframe
            srcDoc={codeHtml}
            title="Generated Code"
            width="750"
            height="262"
            className="outline border-4 p-2 rounded-sm border-blue-500"
          />
          <div className="flex justify-between mt-4">
            <button onClick={handleDownloadCode} className="bg-blue-button rounded-lg px-3 py-1 hover:bg-blue-hover mt-8">
              Download
            </button>
            <button onClick={handleRun} className="bg-blue-button rounded-lg px-3 py-1 hover:bg-blue-hover mt-8">
              Submit & Run
            </button>
          </div>
        </div>

        {/* RIGHT PANEL: INPUTS */}
        <div className="flex flex-col flex-1 space-y-6">

          <div>
            <p className="mb-2 font-bold">Select CSV file</p>
            <select
              value={selectedCSV}
              onChange={(e) => setSelectedCSV(e.target.value)}
              className="bg-white border border-black rounded-lg px-3 py-1 focus:outline-none focus:border-blue-500"
            >
              {csvFiles.map((file, index) => (
                <option key={index} value={file.file}>{file.label}</option>
              ))}
            </select>
          </div>

          <div className="bg-blue-100 p-4 rounded-xl flex flex-col gap-4">
            <p className="font-bold">Input Parameters</p>

            {[
              { id: "stepSize", label: "Step Size (μ)", min: 0.001, max: 0.1, step: 0.001, value: stepSize, setter: setStepSize },
              { id: "M", label: "Filter Order (M)", min: 2, max: 100, step: 1, value: M, setter: setM }
            ].map((input) => (
              <div key={input.id} className="flex flex-col items-center">
                <label>{input.min} ≤ {input.label} ≤ {input.max}</label>
                <div className="flex items-center w-full">
                  <input
                    type="number"
                    value={input.value}
                    min={input.min}
                    max={input.max}
                    step={input.step}
                    onChange={(e) => input.setter(Number(e.target.value))}
                    className="w-16 text-center border border-gray-300 rounded-lg py-1 mr-2"
                  />
                  <input
                    type="range"
                    value={input.value}
                    min={input.min}
                    max={input.max}
                    step={input.step}
                    onChange={(e) => input.setter(Number(e.target.value))}
                    className="flex-grow"
                  />
                </div>
              </div>
            ))}
          </div>

          <button onClick={handleGenerateCode} className="bg-blue-button rounded-lg px-3 py-1 hover:bg-blue-hover mt-8">
            Generate Code
          </button>

        </div>
      </div>

      {/* GRAPHS */}
      {loading && <LoadingScreen />}
      {!loading && desired.length > 0 && (
        <div className="flex flex-col gap-8">
          {[
            { label: "Desired Signal", data: desired },
            { label: "Noisy Signal", data: noisy },
            { label: "LMS Output", data: output },
            { label: "Error", data: error }
          ].map((plot, index) => (
            <div key={index}>
              <h3 className="font-bold text-blue-700">{plot.label}</h3>
              <div style={{ height: 300 }}>
                <Line data={makeData(plot.label, plot.data)} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
