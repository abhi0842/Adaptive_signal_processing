import React, { useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend
);

const LMS = () => {
  /* ---------- Inputs ---------- */
  const [inputs, setInputs] = useState([
    { id: "n", label: "No. of iterations", min: 10, max: 1000, step: 1, value: 500 },
    { id: "M", label: "Order of Filter (M)", min: 2, max: 100, step: 1, value: 10 },
    { id: "mu", label: "Step size (μ)", min: 0.001, max: 1, step: 0.001, value: 0.05 }
  ]);

  const [desired, setDesired] = useState([]);
  const [output, setOutput] = useState([]);
  const [error, setError] = useState([]);
  const [weightNorm, setWeightNorm] = useState([]);
  const [showPlot, setShowPlot] = useState(false);
  const [code, setCode] = useState("");

  /* ---------- Input Handler ---------- */
  const handleInputChange = (id, value) => {
    setInputs(prev =>
      prev.map(i => (i.id === id ? { ...i, value: Number(value) } : i))
    );
  };

  /* ---------- Gaussian randn ---------- */
  const randn = () => {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };

  /* ---------- LMS Non-Stationary ---------- */
  const handleRun = () => {
    if (!code) {
    alert("Please generate the code first.");
    return;
  }
    const n = inputs.find(i => i.id === "n").value;
    const M = inputs.find(i => i.id === "M").value;
    const mu = inputs.find(i => i.id === "mu").value;

    const x = Array.from({ length: n }, randn);
    const d = Array.from({ length: n }, (_, i) =>
      Math.sin(0.01 * (i + 1)) + 0.5 * randn()
    );

    let w = Array(M).fill(0);
    let y = Array(n).fill(0);
    let e = Array(n).fill(0);
    let wHist = Array.from({ length: n }, () => Array(M).fill(0));

    for (let i = M - 1; i < n; i++) {
      const xVec = [];
      for (let k = 0; k < M; k++) {
        xVec.push(x[i - k]);
      }

      y[i] = w.reduce((sum, wi, idx) => sum + wi * xVec[idx], 0);
      e[i] = d[i] - y[i];

      for (let k = 0; k < M; k++) {
        w[k] = w[k] + mu * xVec[k] * e[i];
      }

      wHist[i] = [...w];
    }

    const wNorm = wHist.map(wv =>
      Math.sqrt(wv.reduce((s, v) => s + v * v, 0))
    );

    setDesired(d);
    setOutput(y);
    setError(e);
    setWeightNorm(wNorm);
    setShowPlot(true);
  };

  /* ---------- Generate MATLAB Code ---------- */
  const handleGenerateCode = () => {
    const matlabCode = `
function randn() {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  }

  function dot(a, b) {
    return a.reduce((sum, val, i) => sum + val * b[i], 0);
  }

  function norm2(vec) {
    return Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0));
  }

  /* ------------------ Signal Generation ------------------ */
  const x = Array.from({ length: n }, () => randn());

  const d = Array.from({ length: n }, (_, i) =>
    Math.sin(0.01 * (i + 1)) + 0.5 * randn()
  );

  /* ------------------ Initialization ------------------ */
  let w = Array(M).fill(0);
  const y = Array(n).fill(0);
  const e = Array(n).fill(0);
  const w_hist = Array.from({ length: n }, () => Array(M).fill(0));

  /* ------------------ LMS Algorithm ------------------ */
  for (let i = M - 1; i < n; i++) {
    const x_vec = [];
    for (let k = 0; k < M; k++) {
      x_vec.push(x[i - k]);
    }

    y[i] = dot(w, x_vec);
    e[i] = d[i] - y[i];

    for (let k = 0; k < M; k++) {
      w[k] = w[k] + mu * x_vec[k] * e[i];
    }

    w_hist[i] = [...w];
  }

  /* ------------------ Weight Norm ------------------ */
  const w_norm = w_hist.map(wi => norm2(wi));

  /* ------------------ Return Plot Data ------------------ */
  return {
    uniqueIdentifier,
    desiredSignal: d,
    lmsOutput: y,
    errorSignal: e,
    weightNorm: w_norm,
  };
}
`;
    setCode(matlabCode);
  };

  /* ---------- Download ---------- */
  const handleDownload = () => {
    if (!code) {
    alert("Please generate the code first.");
    return;
  }
    const blob = new Blob([code], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "lms_nonstationary.m";
    link.click();
  };

  /* ---------- Chart Config ---------- */
  const makeChart = (label, data) => ({
    labels: data.map((_, i) => i + 1),
    datasets: [
      {
        label,
        data,
        borderColor: "#6ec1ff",
        borderWidth: 1.5,
        pointRadius: 0
      }
    ]
  });

  return (
    <div className="flex flex-row gap-6">

      {/* LEFT */}
      <div className="flex flex-col space-y-4">
        <iframe
          title="Generated Code"
          srcDoc={`<pre>${code || "Click Generate Code"}</pre>`}
          width="800"
          height="260"
          className="border-4 rounded border-blue-400 p-2"
        />

        <div className="flex justify-between">
          <button onClick={handleGenerateCode} className="bg-blue-button px-3 py-1 rounded">
            Generate Code
          </button>
          <button onClick={handleDownload} className="bg-blue-button px-3 py-1 rounded">
            Download
          </button>
          <button onClick={handleRun} className="bg-blue-button px-3 py-1 rounded">
            Submit & Run
          </button>
        </div>

        {showPlot && (
          <>
            <Line data={makeChart("Desired Signal", desired)} />
            <Line data={makeChart("LMS Output", output)} />
            <Line data={makeChart("Error Signal", error)} />
            <Line data={makeChart("Norm of Weight Vector", weightNorm)} />
          </>
        )}
      </div>

      {/* RIGHT */}
     <div className="text-sm">
          <div className='flex flex-col items-center'>
            <p className='font-bold'>
            Select the input Parameters
            </p>
            <div className='bg-blue-hover px-5 py-3 mt-2 rounded-xl'>
              {inputs.map(input => (
                <div key={input.id} className="flex flex-col items-center">
                  <label htmlFor={input.id} className="block mb-2">
                    <pre className='font-serif'>
                      <span>{input.min} ≤ </span> {input.label} <span> ≤  {input.max} </span>
                    </pre>
                  </label>
                  <div className="flex flex-row items-center">
                    <input
                      type="number"
                      id={input.id}
                      min={input.min}
                      max={input.max}
                      step={input.step}
                      value={input.value}
                      onChange={(e) => handleInputChange(input.id, e.target.value)}
                      className="w-16 text-center border border-gray-300 rounded-lg py-1 focus:outline-none focus:border-blue-500"
                    />
                    <input
                      type="range"
                      min={input.min}
                      max={input.max}
                      step={input.step}
                      value={input.value}
                      onChange={(e) => handleInputChange(input.id, e.target.value)}
                      className="flex-grow ml-2 "
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
              </div>
              </div>
  );
};

export default LMS;
