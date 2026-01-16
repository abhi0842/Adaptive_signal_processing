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

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

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

  // ---------------- MATLAB-EQUIVALENT LMS ----------------
  const runLMS = (x, mu, M, experiments = 100) => {
    const N = x.length;

    const randn = () =>
      Math.sqrt(-2 * Math.log(Math.random())) *
      Math.cos(2 * Math.PI * Math.random());

    // A = x + noise
    const A = x.map((v) => v + 0.5 * randn());

    let wSum = Array(M).fill(0);

    // Monte-Carlo LMS training
    for (let exp = 0; exp < experiments; exp++) {
      let w = Array(M).fill(0);
      let An = Array(M).fill(0);

      for (let n = 0; n < N; n++) {
        An = [A[n], ...An.slice(0, M - 1)];
        const y = w.reduce((s, wi, i) => s + wi * An[i], 0);
        const e = x[n] - y;

        for (let i = 0; i < M; i++) {
          w[i] += mu * e * An[i];
        }
      }

      for (let i = 0; i < M; i++) {
        wSum[i] += w[i];
      }
    }

    const wFinal = wSum.map((v) => v / experiments);

    // Fixed-weight filtering
    let y = [];
    let e = [];
    let An = Array(M).fill(0);

    for (let n = 0; n < N; n++) {
      An = [A[n], ...An.slice(0, M - 1)];
      const y_n = wFinal.reduce((s, wi, i) => s + wi * An[i], 0);
      y.push(y_n);
      e.push(x[n] - y_n);
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

    const x = await readCSV(selectedCSV);
    const { A, y, e } = runLMS(x, stepSize, M);

    setDesired(x);
    setNoisy(A);
    setOutput(y);
    setError(e);

    setLoading(false);
  };

  // ---------------- GENERATE CODE ----------------
  const handleGenerateCode = () => {
    const jsCode = `// MATLAB-Equivalent LMS Denoising (Node.js)

function randn() {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function lmsDenoise(mu, x, M, experiments = 100) {
  const N = x.length;
  const A = x.map(v => v + 0.5 * randn());

  let wSum = Array(M).fill(0);

  for (let exp = 0; exp < experiments; exp++) {
    let w = Array(M).fill(0);
    let An = Array(M).fill(0);

    for (let n = 0; n < N; n++) {
      An = [A[n], ...An.slice(0, M - 1)];
      const y = w.reduce((s, wi, i) => s + wi * An[i], 0);
      const e = x[n] - y;
      for (let i = 0; i < M; i++) {
        w[i] += mu * e * An[i];
      }
    }

    for (let i = 0; i < M; i++) wSum[i] += w[i];
  }

  return wSum.map(v => v / experiments);
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
        borderWidth: 1.5,
        borderColor: "#6ec1ff",
        pointRadius: 0,
        tension: 0.2,
      },
    ],
  });

  // ---------- INPUT SLIDERS CONFIG ----------
const inputs = [
  {
    id: "mu",
    label: "Step Size ( μ )",
    min: 0.001,
    max: 0.1,
    step: 0.001,
    value: stepSize,
  },
  {
    id: "M",
    label: "Filter Order ( M )",
    min: 2,
    max: 50,
    step: 1,
    value: M,
  },
];

const handleInputChange = (id, value) => {
  const v = Number(value);
  if (id === "mu") setStepSize(v);
  if (id === "M") setM(v);
};

  // ---------------- UI ----------------
  return (
    <div className="flex flex-col space-y-10 p-5 max-w-[1300px] mx-auto">
      <div className="flex gap-6">
        <div className="flex flex-col flex-1">
          <iframe
            srcDoc={codeHtml}
            title="Generated Code"
            width="750"
            height="260"
            className="border-4 p-2 rounded-sm border-blue-500"
          />

          <div className="flex justify-between mt-4">
            <button
              onClick={handleDownloadCode}
              className="bg-blue-button px-3 py-1 rounded-lg hover:bg-blue-hover"
            >
              Download
            </button>

            <button
              onClick={handleRun}
              disabled={loading}
              className="bg-blue-button px-3 py-1 rounded-lg hover:bg-blue-hover disabled:opacity-50"
            >
              Submit & Run
            </button>
          </div>
        </div>

        <div className="flex flex-col flex-1 space-y-6">
          <div>
            <p className="font-bold mb-2">Select CSV file</p>
            <select
              value={selectedCSV}
              onChange={(e) => setSelectedCSV(e.target.value)}
              className="border border-black rounded-lg px-3 py-1"
            >
              {csvFiles.map((file, i) => (
                <option key={i} value={file.file}>
                  {file.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col mt-4 items-center">
  <p className="font-bold">Select the Input Parameters</p>

  <div className="bg-blue-hover px-5 py-3 mt-2 rounded-xl w-full">
    {inputs.map((input) => (
      <div key={input.id} className="flex flex-col items-center mb-4">
        <label htmlFor={input.id} className="block mb-2">
          <pre className="font-serif">
            <span>{input.min} ≤ </span>
            {input.label}
            <span> ≤ {input.max}</span>
          </pre>
        </label>

        <div className="flex flex-row items-center w-full">
          <input
            type="number"
            min={input.min}
            max={input.max}
            step={input.step}
            value={input.value}
            onChange={(e) =>
              handleInputChange(input.id, e.target.value)
            }
            className="w-20 text-center border border-gray-300 rounded-lg py-1 focus:outline-none"
          />

          <input
            type="range"
            min={input.min}
            max={input.max}
            step={input.step}
            value={input.value}
            onChange={(e) =>
              handleInputChange(input.id, e.target.value)
            }
            className="flex-grow ml-3"
          />
        </div>
      </div>
    ))}
  </div>

  <button
    onClick={handleGenerateCode}
    className="bg-blue-button rounded-lg px-3 py-1 hover:bg-blue-hover mt-8"
  >
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
          <Line data={makeData("LMS Error", error)} />
        </div>
      )}
    </div>
  );
}
