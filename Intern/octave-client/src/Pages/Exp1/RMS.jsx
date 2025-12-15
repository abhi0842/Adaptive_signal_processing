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

export default function RLSFrontend() {
  // UI state (UNCHANGED)
  const [selectedFile, setSelectedFile] = useState("simulated1.csv");
  const [inputs, setInputs] = useState([
    { id: "lambda", label: "Forgetting factor", min: 0.001, max: 1, step: 0.001, value: 0.98 },
    { id: "M", label: "Filter length", min: 2, max: 50, step: 1, value: 5 },
  ]);
  const [code, setCode] = useState("");
  const [codeHtml, setCodeHtml] = useState("Code will be generated here.!");
  const [loading, setLoading] = useState(false);
  const [showPlots, setShowPlots] = useState(false);

  // Results
  const [desired, setDesired] = useState([]);
  const [noisy, setNoisy] = useState([]);
  const [rlsOutput, setRlsOutput] = useState([]);
  const [rlsError, setRlsError] = useState([]);

  const fileOptions = [
    { name: "simulated.csv", file: "simulated1.csv" },
    { name: "real.csv", file: "real.csv" },
  ];

  /* ---------- helpers ---------- */
  const zerosMat = (n) => Array.from({ length: n }, () => Array(n).fill(0));
  const zerosVec = (n) => Array(n).fill(0);
  const dot = (a, b) => a.reduce((s, v, i) => s + v * b[i], 0);
  const matVec = (M, v) => M.map((r) => dot(r, v));
  const randn = () =>
    Math.sqrt(-2 * Math.log(Math.random())) * Math.cos(2 * Math.PI * Math.random());

  /* ---------- CSV ---------- */
  const readCSV = async (filename) => {
    const res = await fetch(`${process.env.PUBLIC_URL}/inputs/${filename}`);
    const text = await res.text();
    const parsed = Papa.parse(text, { dynamicTyping: true }).data;
    return parsed.flat().map(Number).filter((v) => !isNaN(v));
  };

  /* ---------- RLS (MATLAB-EQUIVALENT) ---------- */
  const rlsProcess = (lambda, D, M) => {
    const delta = 1e-3;
    const n = D.length;

    const A = D.map((d) => d + 0.5 * randn());

    let P = zerosMat(M);
    for (let i = 0; i < M; i++) P[i][i] = 1 / delta;

    let w = zerosVec(M);
    const B = zerosVec(n);
    const E = zerosVec(n);

    for (let i = 0; i < n; i++) {
      const A_i = [];
      for (let k = 0; k < M; k++) A_i.push(i - k >= 0 ? A[i - k] : 0);

      const PA = matVec(P, A_i);
      const denom = lambda + dot(A_i, PA);
      const kVec = PA.map((v) => v / denom);

      const y = dot(w, A_i);
      const e = D[i] - y;

      for (let j = 0; j < M; j++) w[j] += kVec[j] * e;

      const AIP = Array(M).fill(0);
      for (let r = 0; r < M; r++)
        for (let c = 0; c < M; c++) AIP[r] += A_i[c] * P[c][r];

      for (let r = 0; r < M; r++)
        for (let c = 0; c < M; c++)
          P[r][c] = (P[r][c] - kVec[r] * AIP[c]) / lambda;

      B[i] = dot(w, A_i);
      E[i] = e;
    }

    return { desired: D, noisy: A, output: B, error: E };
  };

  /* ---------- RUN ---------- */
  const handleSubmitAndRun = async () => {
    if (!code) {
      alert("Please generate the code first.");
      return;
    }

    setLoading(true);
    setShowPlots(false);

    const d = await readCSV(selectedFile);
    const lambda = inputs.find((i) => i.id === "lambda").value;
    const M = inputs.find((i) => i.id === "M").value;

    const r = rlsProcess(lambda, d, M);
    setDesired(r.desired);
    setNoisy(r.noisy);
    setRlsOutput(r.output);
    setRlsError(r.error);
    setShowPlots(true);
    setLoading(false);
  };

  /* ---------- CODE ---------- */
  const handleGenerateCode = () => {
    const generatedCode = `
import Papa from "papaparse";

export async function rlsDenoise(lambda, inputFile, M) {
  const delta = 1e-3;
  const fs = 100;

  // ===== Read CSV =====
  const csvData = await new Promise((resolve, reject) => {
    Papa.parse(inputFile, {
      dynamicTyping: true,
      complete: (results) => resolve(results.data.flat().filter(v => typeof v === "number")),
      error: reject
    });
  });

  const x = csvData;
  const n = x.length;

  // ===== Initialize =====
  let P = Array.from({ length: M }, (_, i) =>
    Array.from({ length: M }, (_, j) => (i === j ? 1 / delta : 0))
  );

  let w_rls = Array(M).fill(0);
  const D = [...x];
  const A = D.map(v => v + 0.5 * randn());

  const B_rls = Array(n).fill(0);
  const Err_rls = Array(n).fill(0);
  const weights_rls = Array.from({ length: M }, () => Array(n).fill(0));

  const A_padded = Array(M - 1).fill(0).concat(A);
  const t = Array.from({ length: n }, (_, i) => i / fs);

  // ===== RLS Loop =====
  for (let i = M - 1; i < n; i++) {
    const A_i = [];
    for (let k = 0; k < M; k++) {
      A_i.push(A_padded[i + M - 1 - k]);
    }

    const PA = matVecMul(P, A_i);
    const denom = lambda + dot(A_i, PA);
    const k_vec = PA.map(v => v / denom);

    const y_rls = dot(w_rls, A_i);
    Err_rls[i] = D[i] - y_rls;

    w_rls = w_rls.map((w, idx) => w + k_vec[idx] * Err_rls[i]);
    for (let r = 0; r < M; r++) weights_rls[r][i] = w_rls[r];

    const outer = outerProduct(k_vec, A_i);
    P = matScale(matSub(P, matMul(outer, P)), 1 / lambda);

    for (let d = 0; d < M; d++) {
      if (P[d][d] < 1e-10) P[d][d] = 1e-10;
    }

    B_rls[i] = dot(w_rls, A_i);
  }

  return {
    time: t,
    desired: D,
    noisy: A,
    output: B_rls,
    error: Err_rls
  };
}

/* ================= Helper Functions ================= */
function randn() {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function dot(a, b) { return a.reduce((sum, v, i) => sum + v * b[i], 0); }
function matVecMul(M, v) { return M.map(row => dot(row, v)); }
function matMul(A, B) { return A.map(row => B[0].map((_, j) => row.reduce((s, v, i) => s + v * B[i][j], 0))); }
function matSub(A, B) { return A.map((row, i) => row.map((v, j) => v - B[i][j])); }
function matScale(A, s) { return A.map(row => row.map(v => v * s)); }
function outerProduct(a, b) { return a.map(ai => b.map(bj => ai * bj)); }
  `;
  setCode(generatedCode);
  setCodeHtml(`<pre>${generatedCode}</pre>`);
};

  const handleDownloadCode = () => {
    if (!code) {
      alert("Please generate the code first.");
      return;
    }
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([code]));
    a.download = "rls.js";
    a.click();
  };
const BLUE = "#43a6ecff"; // same blue as LMS

  const makeData = (label, data,color) => ({
    labels: data.map((_, i) => i),
    datasets: [{ label, data,  borderColor: color,borderWidth: 1.5, pointRadius: 0 }],
  });

  return (
    <div className="flex flex-col space-y-10">
      <div className="flex flex-row gap-5 space-x-5">
        <div className="flex flex-col">
          <iframe
            srcDoc={codeHtml}
            title="Generated Code"
            width="750"
            height="262"
            className="outline border-4 p-2 rounded-sm border-blue-hover"
          />
          <div className="flex justify-between mt-2">
            <button
              onClick={handleDownloadCode}
              className="bg-blue-button rounded-lg px-3 py-1 hover:bg-blue-hover mt-4"
            >
              Download
            </button>
            <button
              onClick={handleSubmitAndRun}
              className="bg-blue-button rounded-lg px-3 py-1 hover:bg-blue-hover mt-4"
            >
              Submit & Run
            </button>
          </div>
        </div>

        <div className="text-sm">
          <div className="flex flex-col">
            <p className="mb-2 ml-12 font-bold">Select CSV file of Input</p>
            <select
              value={selectedFile}
              onChange={(e) => setSelectedFile(e.target.value)}
              className="bg-white border border-black rounded-lg px-3 py-1"
            >
              {fileOptions.map((o, i) => (
                <option key={i} value={o.file}>{o.name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col mt-8 items-center">
            <p className="font-bold">Select the input Parameters</p>
            <div className="bg-blue-hover px-5 py-3 mt-2 rounded-xl">
              {inputs.map((input) => (
                <div key={input.id} className="flex flex-col items-center mb-3">
                  <label className="block mb-2">
                    <pre>{input.min} ≤ {input.label} ≤ {input.max}</pre>
                  </label>
                  <div className="flex flex-row items-center">
                    <input
                      type="number"
                      value={input.value}
                      onChange={(e) =>
                        setInputs((p) =>
                          p.map((it) =>
                            it.id === input.id ? { ...it, value: +e.target.value } : it
                          )
                        )
                      }
                      className="w-16 text-center border rounded-lg"
                    />
                    <input
                      type="range"
                      min={input.min}
                      max={input.max}
                      step={input.step}
                      value={input.value}
                      onChange={(e) =>
                        setInputs((p) =>
                          p.map((it) =>
                            it.id === input.id ? { ...it, value: +e.target.value } : it
                          )
                        )
                      }
                      className="ml-2"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerateCode}
            className="bg-blue-button rounded-lg px-3 py-1 hover:bg-blue-hover mt-4"
          >
            Generate Code
          </button>
        </div>
      </div>

      {showPlots && (
        <div className="grid grid-cols-1 gap-6">
          <Line data={makeData("Desired", desired,BLUE)} />
          <Line data={makeData("Noisy", noisy,BLUE)} />
          <Line data={makeData("RLS Output", rlsOutput,BLUE)} />
          <Line data={makeData("Error", rlsError,BLUE)} />
        </div>
      )}
    </div>
  );
}
