import React, { useState, useEffect } from "react";
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

const AR = () => {
  const [inputs, setInputs] = useState([
    { id: "n_steps", label: "No.of time steps", min: 10, max: 1000, step: 1, value: 500 },
    { id: "p", label: "Order", min: 1, max: 20, step: 1, value: 10 },
    { id: "sigma", label: "Standard deviation", min: 0.01, max: 1, step: 0.001, value: 0.5 }
  ]);

  const [coefficients, setCoefficients] = useState(new Array(10).fill(0.5));
  const [signal, setSignal] = useState([]);
  const [showPlot, setShowPlot] = useState(false);
  const [code, setCode] = useState("");

  /* ---------- Sync coefficients with order ---------- */
  useEffect(() => {
    const p = inputs.find(i => i.id === "p").value;
    setCoefficients(prev => prev.slice(0, p));
  }, [inputs]);

  const handleInputChange = (id, value) => {
    setInputs(prev =>
      prev.map(i => (i.id === id ? { ...i, value: Number(value) } : i))
    );
  };

  const handleCoefficientChange = (index, value) => {
    const updated = [...coefficients];
    updated[index] = Number(value);
    setCoefficients(updated);
  };

  /* ---------- Seeded randn ---------- */
  let seed = 1;
  const randn = () => {
    seed = (seed * 16807) % 2147483647;
    const u1 = seed / 2147483647;
    seed = (seed * 16807) % 2147483647;
    const u2 = seed / 2147483647;
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  };

  /* ---------- Run AR ---------- */
  const handleRun = () => {
     if (!code) {
    alert("Please generate the code first.");
    return;
  }
    const n_steps = inputs.find(i => i.id === "n_steps").value;
    const p = inputs.find(i => i.id === "p").value;
    const sigma = inputs.find(i => i.id === "sigma").value;

    let phi = [...coefficients];

    const sumAbs = phi.reduce((s, v) => s + Math.abs(v), 0);
    if (sumAbs >= 0.99) phi = phi.map(v => v / (sumAbs + 0.01));

    const epsilon = Array.from({ length: n_steps }, () => sigma * randn());
    const X = new Array(n_steps).fill(0);

    for (let t = 0; t < p; t++) X[t] = epsilon[t];

    for (let t = p; t < n_steps; t++) {
      let sum = 0;
      for (let k = 0; k < p; k++) {
        sum += phi[k] * X[t - 1 - k];
      }
      X[t] = sum + epsilon[t];
    }

    setSignal(X);
    setShowPlot(true);
  };

  /* ---------- Generate MATLAB code ---------- */
  const handleGenerateCode = () => {
    
    const matlabCode = `

export function AR_process(n_steps, p, phi, sigma) {

  if (phi.length !== p) {
    throw new Error("The number of AR coefficients must match the specified order p");
  }
  function randn() {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  const epsilon = Array.from({ length: n_steps }, () => sigma * randn());

  const X = Array(n_steps).fill(0);


  for (let t = 0; t < p; t++) {
    X[t] = epsilon[t];
  }

  // ===== Simulate AR(p) process =====
  // MATLAB: for t = (p+1):n_steps
  for (let t = p; t < n_steps; t++) {
    let sum = 0;
    for (let k = 0; k < p; k++) {
      sum += phi[k] * X[t - 1 - k];
    }
    X[t] = sum + epsilon[t];
  }

  // Return data (used for plotting in React / backend)
  return {
    X,        // Simulated AR signal
    epsilon  // White noise
  };
}

`;
    setCode(matlabCode);
  };

  /* ---------- Download MATLAB file ---------- */
  const handleDownload = () => {
     if (!code) {
    alert("Please generate the code first.");
    return;
  }
    const element = document.createElement("a");
    const file = new Blob([code], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "AR_process.m";
    document.body.appendChild(element);
    element.click();
  };

  const chartData = {
    labels: signal.map((_, i) => i + 1),
    datasets: [
      {
        label: "Simulated AR(p) Process",
        data: signal,
        borderWidth: 1.5,
         borderColor: "#4da6ff",
        pointRadius: 0
      }
    ]
  };

  return (
    <div className="flex flex-row gap-6">

      {/* ---------- LEFT ---------- */}
      <div className="flex flex-col space-y-4">
        <iframe
          title="Generated Code"
          srcDoc={`<pre>${code || "Click Generate Code"}</pre>`}
          width="800"
          height="260"
          className="border-4 rounded border-blue-400 p-2"
        />

        <div className="flex justify-between">
          <button  className="bg-blue-button rounded-lg px-3 py-1 hover:bg-blue-hover mt-8 disabled:opacity-50" onClick={handleGenerateCode}>
            Generate Code
          </button>
          <button  className="bg-blue-button rounded-lg px-3 py-1 hover:bg-blue-hover mt-8 disabled:opacity-50" onClick={handleDownload}>
            Download
          </button>
          <button  className="bg-blue-button rounded-lg px-3 py-1 hover:bg-blue-hover mt-8 disabled:opacity-50" onClick={handleRun}>
            Submit & Run
          </button>
        </div>

        {showPlot && (
          <div className="border-4 rounded p-4 w-[800px]">
            <Line data={chartData} />
          </div>
        )}
      </div>

      {/* ---------- RIGHT ---------- */}
      <div className="w-80 space-y-4 text-sm">

        {/* Input Parameters Box */}
        <div className="border-4 border-blue-300 rounded-xl p-4">
          <p className="font-semibold text-center mb-2">Input Parameters</p>
          {inputs.map(input => (
            <div key={input.id} className="mb-3">
              <pre>{input.min} ≤ {input.label} ≤ {input.max}</pre>
              <input
                type="number"
                value={input.value}
                min={input.min}
                max={input.max}
                step={input.step}
                onChange={e => handleInputChange(input.id, e.target.value)}
                className="w-20 text-center border rounded"
              />
              <input
                type="range"
                value={input.value}
                min={input.min}
                max={input.max}
                step={input.step}
                onChange={e => handleInputChange(input.id, e.target.value)}
                className="w-full"
              />
            </div>
          ))}
        </div>

        {/* Coefficients Box */}
        <div className="border-4 border-blue-00 rounded-xl p-4">
          <p className="font-semibold text-center mb-2">AR Coefficients</p>
          {coefficients.map((c, i) => (
            <div key={i} className="mb-2">
              <pre>-1 ≤ Coefficient {i + 1} ≤ 1</pre>
              <input
                type="number"
                step="0.001"
                min="-1"
                max="1"
                value={c}
                onChange={e => handleCoefficientChange(i, e.target.value)}
                className="w-20 text-center border rounded"
              />
              <input
                type="range"
                step="0.001"
                min="-1"
                max="1"
                value={c}
                onChange={e => handleCoefficientChange(i, e.target.value)}
                className="w-full"
              />
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default AR;
