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

  // ---------------- EXACT MATLAB LMS ----------------
  const runLMS = (d, x, mu, M, experiments = 100) => {
    const N = d.length;

    const randn = () =>
      Math.sqrt(-2 * Math.log(Math.random())) *
      Math.cos(2 * Math.PI * Math.random());

    // Noisy input (same as MATLAB)
    const A = x.map((v) => v + 0.5 * randn());

    // -------- Monte-Carlo training --------
    let wSum = Array(M).fill(0);

    for (let exp = 0; exp < experiments; exp++) {
      let w = Array(M).fill(0);
      let xVec = Array(M).fill(0);

      for (let n = 0; n < N; n++) {
        xVec = [A[n], ...xVec.slice(0, M - 1)];
        const y = w.reduce((s, wi, i) => s + wi * xVec[i], 0);
        const e = d[n] - y;

        for (let i = 0; i < M; i++) {
          w[i] += mu * e * xVec[i];
        }
      }

      for (let i = 0; i < M; i++) {
        wSum[i] += w[i];
      }
    }

    // Average weights
    const wFinal = wSum.map((v) => v / experiments);

    // -------- Fixed-weight filtering --------
    let y = [];
    let e = [];
    let xVec = Array(M).fill(0);

    for (let n = 0; n < N; n++) {
      xVec = [A[n], ...xVec.slice(0, M - 1)];
      const y_n = wFinal.reduce((s, wi, i) => s + wi * xVec[i], 0);
      const e_n = d[n] - y_n;

      y.push(y_n);
      e.push(e_n);
    }

    return { A, y, e };
  };

  // ---------------- RUN LMS ----------------
  const handleRun = async () => {
    if (!code) {
    alert("Please generate the code first.");
    return;
  }
    setLoading(true);

    const d = await readCSV("/inputs/real.csv");
    const x = await readCSV(selectedCSV);

    const { A, y, e } = runLMS(d, x, stepSize, M);

    setDesired(d);
    setNoisy(A);
    setOutput(y);
    setError(e);

    setLoading(false);
  };
// ---------------- GENERATE CODE ----------------
  const handleGenerateCode = () => {
    const jsCode = `// LMS Denoising (Node.js Version)
const fs = require('fs');
const csv = require('csv-parser');

function randn() {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function lmsDenoise(mu, signal, M, experiments = 100) {
  const N = signal.length;
  const A = signal.map(v => v + 0.5 * randn());
  let wSum = Array(M).fill(0);

  for (let exp = 0; exp < experiments; exp++) {
    let w = Array(M).fill(0);
    let xVec = Array(M).fill(0);

    for (let n = 0; n < N; n++) {
      xVec = [A[n], ...xVec.slice(0, M - 1)];
      const y = w.reduce((s, wi, i) => s + wi * xVec[i], 0);
      const e = signal[n] - y;
      for (let i = 0; i < M; i++) w[i] += mu * e * xVec[i];
    }
    for (let i = 0; i < M; i++) wSum[i] += w[i];
  }

  const wFinal = wSum.map(v => v / experiments);
  return wFinal;
}

module.exports = lmsDenoise;
`;
    setCode(jsCode);
    setCodeHtml(`<pre>${jsCode}</pre>`);
  };

  // ---------------- DOWNLOAD CODE ----------------
  const handleDownloadCode = () => {
    if (!code) {
    alert("Please generate the code first.");
    return;
  }
    const element = document.createElement("a");
    const file = new Blob([code], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "lms_denoise.js";
    document.body.appendChild(element);
    element.click();
  };
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

  // ---------------- UI (UNCHANGED) ----------------
  return (
    <div className="flex flex-col space-y-10 p-5 max-w-[1300px] mx-auto">
      <div className="flex flex-row gap-5">
        <div className="flex flex-col flex-1">
          <iframe
            srcDoc={codeHtml}
            title="Generated Code"
            width="750"
            height="262"
            className="outline border-4 p-2 rounded-sm border-blue-500"
          />
          <div className="flex justify-between mt-4">
            <button onClick={handleDownloadCode}  className="bg-blue-button rounded-lg px-3 py-1 hover:bg-blue-hover mt-8">
              Download
            </button>
            <button
              onClick={handleRun}
              disabled={loading}
              className="bg-blue-button rounded-lg px-3 py-1 hover:bg-blue-hover mt-8 disabled:opacity-50"
            >
              Submit & Run
            </button>
          </div>
        </div>

        <div className="flex flex-col flex-1 space-y-6">
          <div>
            <p className="mb-2 font-bold">Select CSV file</p>
            <select
              value={selectedCSV}
              onChange={(e) => setSelectedCSV(e.target.value)}
              className="bg-white border border-black rounded-lg px-3 py-1"
            >
              {csvFiles.map((file, index) => (
                <option key={index} value={file.file}>
                  {file.label}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-blue-100 p-4 rounded-xl flex flex-col gap-4">
            <p className="font-bold">Input Parameters</p>

            <div className="flex flex-col items-center">
              <label>Step Size (μ)</label>
              <input
                type="number"
                value={stepSize}
                step={0.001}
                 className=" text-black border border-black rounded px-2 py-1"
                onChange={(e) => setStepSize(Number(e.target.value))}
              />
            </div>

            <div className="flex flex-col items-center">
              <label>Filter Order (M)</label>
              <input
                type="number"
                value={M}
                 className=" text-black border border-black rounded px-2 py-1"
                onChange={(e) => setM(Number(e.target.value))}
              />
            </div>
            <button onClick={handleGenerateCode} className="bg-blue-button rounded-lg px-3 py-1 hover:bg-blue-hover mt-8">
            Generate Code
          </button>
          </div>
          
        </div>
        
      </div>

      {loading && <div className="text-lg font-bold">Processing...</div>}

      {!loading && desired.length > 0 && (
        <div className="flex flex-col gap-8">
          <Line data={makeData("Desired Signal", desired)} />
          <Line data={makeData("Noisy Signal", noisy)} />
          <Line data={makeData("LMS Output", output)} />
          <Line data={makeData("Error", error)} />
        </div>
      )}
    </div>
  );
}
