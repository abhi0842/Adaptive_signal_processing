import React, { useState } from "react";
import image from "../../image.png";
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

const RMS = () => {
  /* ---------- Inputs ---------- */
  const [inputs, setInputs] = useState([
    { id: "forgetting-factor", label: "Forgetting factor (λ)", min: 0, max: 1, step: 0.0001, value: 0.99 },
    { id: "order", label: "Order of Filter (M)", min: 2, max: 100, step: 1, value: 4 },
    { id: "experiment", label: "No. of iterations", min: 10, max: 1000, step: 1, value: 500 }
  ]);

  const [code, setCode] = useState("");
  const [codeHtml, setCodeHtml] = useState("Code will be generated here.!");
  const [plots, setPlots] = useState(null);

  /* ---------- Input Handler ---------- */
  const handleInputChange = (id, value) => {
    const input = inputs.find(i => i.id === id);
    const newValue = Math.min(Math.max(value, input.min), input.max);
    setInputs(inputs.map(i => (i.id === id ? { ...i, value: newValue } : i)));
  };

  /* ---------- Gaussian randn ---------- */
  const randn = () => {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };

  /* ---------- RUN RLS (PURE JS) ---------- */
  const handleRun = () => {
    if (!code) {
    alert("Please generate the code first.");
    return;
  }
    const n = inputs.find(i => i.id === "experiment").value;
    const lambda = inputs.find(i => i.id === "forgetting-factor").value;
    const N = inputs.find(i => i.id === "order").value;

    const x = Array.from({ length: n }, randn);
    const d = Array.from({ length: n }, (_, i) =>
      Math.sin(0.01 * (i + 1)) + 0.5 * randn()
    );

    let w = Array(N).fill(0);
    let P = Array.from({ length: N }, (_, i) =>
      Array.from({ length: N }, (_, j) => (i === j ? 1000 : 0))
    );

    let y = Array(n).fill(0);
    let e = Array(n).fill(0);
    let wHist = Array.from({ length: n }, () => Array(N).fill(0));

    for (let i = N - 1; i < n; i++) {
      const xVec = [];
      for (let k = 0; k < N; k++) {
        xVec.push(x[i - k]);
      }

      // pi = P * x_vec
      const pi = P.map(row =>
        row.reduce((sum, val, idx) => sum + val * xVec[idx], 0)
      );

      // gain k
      const denom = lambda + xVec.reduce((s, v, idx) => s + v * pi[idx], 0);
      const kGain = pi.map(v => v / denom);

      // output
      y[i] = w.reduce((s, wi, idx) => s + wi * xVec[idx], 0);
      e[i] = d[i] - y[i];

      // weight update
      w = w.map((wi, idx) => wi + kGain[idx] * e[i]);

      // P update
      const Px = xVec.map((_, r) =>
        P[r].reduce((s, v, c) => s + v * xVec[c], 0)
      );
      P = P.map((row, r) =>
        row.map((val, c) => (val - kGain[r] * Px[c]) / lambda)
      );

      wHist[i] = [...w];
    }

    const wNorm = wHist.map(v =>
      Math.sqrt(v.reduce((s, x) => s + x * x, 0))
    );

    setPlots({ d, y, e, wNorm });
  };

  /* ---------- MATLAB Code ---------- */
  const handleGenerateCode = () => {
    const matlabCode = `
function rls_nonstationary(n, lambda, N)

x = randn(n,1);
d = sin(0.01*(1:n)') + 0.5*randn(n,1);

w = zeros(N,1);
P = eye(N)*1000;
y = zeros(n,1);
e = zeros(n,1);
w_hist = zeros(n,N);

for i = N:n
    x_vec = x(i:-1:i-N+1);
    pi = P*x_vec;
    k = pi/(lambda + x_vec'*pi);
    y(i) = w'*x_vec;
    e(i) = d(i) - y(i);
    w = w + k*e(i);
    P = (P - k*x_vec'*P)/lambda;
    w_hist(i,:) = w';
end

figure; plot(d); hold on; plot(y);
figure; plot(e);
figure; plot(vecnorm(w_hist,2,2));
end
`;
    setCode(matlabCode);
    setCodeHtml(`<pre>${matlabCode}</pre>`);
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
    link.download = "rls_nonstationary.m";
    link.click();
  };

  /* ---------- Chart Helper ---------- */
  const chart = (label, data) => ({
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
    <div className="flex flex-col space-y-10">
      <div className="flex flex-row gap-5">
        <div className="flex flex-col">
          <iframe
            srcDoc={codeHtml}
            title="Generated Code"
            width="650"
            height="232"
            className="border-4 p-2 rounded border-blue-hover"
          />
          <div className="flex justify-between text-sm mt-6">
            <button className="bg-blue-button px-3 py-1 rounded" onClick={handleDownload}>
              Download
            </button>
            <button className="bg-blue-button px-3 py-1 rounded" onClick={handleRun}>
              Submit & Run
            </button>
          </div>
        </div>

        <div className="text-sm">
          <p className="font-bold text-center">Select the input Parameters</p>
          <div className="bg-blue-hover px-5 py-3 mt-2 rounded-xl">
            {inputs.map(input => (
              <div key={input.id} className="flex flex-col items-center">
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
          <button
            onClick={handleGenerateCode}
            className="bg-blue-button px-3 py-1 rounded mt-6"
          >
            Generate Code
          </button>
        </div>
      </div>

      {plots && (
        <div className="space-y-4">
          <Line data={chart("Desired vs RLS Output", plots.d.map((v, i) => v))} />
          <Line data={chart("Error Signal", plots.e)} />
          <Line data={chart("Norm of Weight Vector", plots.wNorm)} />
        </div>
      )}
    </div>
  );
};

export default RMS;
