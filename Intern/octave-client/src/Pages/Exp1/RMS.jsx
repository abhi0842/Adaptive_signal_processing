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
  // UI state (keeps same look & feel as your RMS component)
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

  // ---------- helpers: linear algebra simple utils ----------
  const zerosMatrix = (n, m, fill = 0) => Array.from({ length: n }, () => Array(m).fill(fill));
  const zerosVector = (n, fill = 0) => Array(n).fill(fill);

  // matrix-vector product (MxM)*(M) => M
  const matVec = (A, v) => A.map((row) => row.reduce((s, a, i) => s + a * (v[i] ?? 0), 0));

  // vector-matrix product (1xM)*(MxM) => 1xM (row vector)
  const vecMat = (v, A) => A[0].map((_, col) => v.reduce((s, vi, i) => s + vi * (A[i][col] ?? 0), 0));

  // dot product
  const dot = (a, b) => a.reduce((s, ai, i) => s + ai * (b[i] ?? 0), 0);

  // outer product v (M) and u (M) -> MxM
  const outer = (v, u) => v.map((vi) => u.map((uj) => vi * uj));

  // add two matrices
  const addMat = (A, B) => A.map((row, i) => row.map((val, j) => val + B[i][j]));

  // sub matrices
  const subMat = (A, B) => A.map((row, i) => row.map((val, j) => val - B[i][j]));

  // scalar multiply matrix
  const scaleMat = (A, s) => A.map((row) => row.map((v) => v * s));

  // scalar multiply vector
  const scaleVec = (v, s) => v.map((x) => x * s);

  // add vectors
  const addVec = (a, b) => a.map((x, i) => x + (b[i] ?? 0));

  // ---------- CSV read (first column or single-column) ----------
  const readCSV = async (filename) => {
    const path = `${process.env.PUBLIC_URL || ""}/inputs/${filename}`;
    const res = await fetch(path);
    const text = await res.text();
    const parsed = Papa.parse(text, { dynamicTyping: true }).data;
    // flatten and parse numeric
    const arr = parsed.flat().map((r) => {
      if (Array.isArray(r)) return Number(r[0]);
      return Number(r);
    });
    return arr.filter((v) => !Number.isNaN(v));
  };

  // ---------- RLS algorithm implemented in JS (mirrors MATLAB) ----------
  // Inputs:
  //   lambda (forgetting factor)
  //   D: desired signal array (length n)
  //   M: filter length (order)
  // Returns: {time, desired, noisy, output, error}
  const rlsProcess = (lambda, D, M) => {
    const delta = 1e-3; // same as MATLAB code
    const n = D.length;
    // generate noisy A = D + 0.5 * randn
    const randn = () => Math.sqrt(-2 * Math.log(Math.random())) * Math.cos(2 * Math.PI * Math.random());
    const A = D.map((v) => v + 0.5 * randn());

    // initialize
    let P = zerosMatrix(M, M);
    for (let i = 0; i < M; i++) P[i][i] = 1 / delta;

    let w = zerosVector(M); // column vector
    const B = Array(n).fill(0);
    const Err = Array(n).fill(0);

    // iterate through samples, with zero-padding for initial taps
    for (let idx = 0; idx < n; idx++) {
      // build A_i (Mx1) where A_i = [A[idx]; A[idx-1]; ...] padded with zeros
      const A_i = [];
      for (let k = 0; k < M; k++) {
        const pos = idx - k;
        A_i.push(pos >= 0 ? A[pos] : 0);
      } // A_i is length M

      // compute denominator: lambda + A_i' * P * A_i  (scalar)
      const P_Ai = matVec(P, A_i); // M vector
      const denom = lambda + dot(A_i, P_Ai);

      // compute gain vector k = (P * A_i) / denom
      const k = scaleVec(P_Ai, 1 / denom); // M vector

      // filter output y = w' * A_i
      const y = dot(w, A_i);

      // error
      const e_n = D[idx] - y;

      // update weights: w = w + k * e_n
      for (let i = 0; i < M; i++) w[i] = w[i] + k[i] * e_n;

      // update P: P = (P - k * (A_i' * P)) / lambda
      // compute row r = A_i' * P  => 1xM (vector)
      const r = vecMat(A_i, P); // length M
      // outer product k (M) and r (M) => MxM
      const kron = outer(k, r);
      // P = (P - kron) / lambda
      const P_sub = subMat(P, kron);
      P = scaleMat(P_sub, 1 / lambda);

      // safety: keep P diag not too small
      for (let i = 0; i < M; i++) {
        if (P[i][i] < 1e-12) P[i][i] = 1e-12;
      }

      // store outputs
      B[idx] = dot(w, A_i);
      Err[idx] = e_n;
    }

    const t = Array.from({ length: n }, (_, i) => i);
    return { time: t, desired: D, noisy: A, output: B, error: Err };
  };

  // ---------- Run handler (read CSV and run RLS) ----------
  const handleSubmitAndRun = async () => {
    if (!selectedFile) {
      alert("Please select a file.");
      return;
    }

    setLoading(true);
    setShowPlots(false);

    try {
      // read desired signal from CSV
      const d = await readCSV(selectedFile);
      const lambda = inputs.find((inp) => inp.id === "lambda").value;
      const M = inputs.find((inp) => inp.id === "M").value;

      const result = rlsProcess(lambda, d, M);

      setDesired(result.desired);
      setNoisy(result.noisy);
      setRlsOutput(result.output);
      setRlsError(result.error);
      setShowPlots(true);
    } catch (err) {
      console.error("RLS run failed:", err);
      alert("Failed to run RLS. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  // ---------- Generate code (show JS equivalent) ----------
  const handleGenerateCode = () => {
    const jsSnippet = `// RLS (frontend) JS snippet
function rlsProcess(lambda, D, M) {
  // delta, P init, w init...
  // for idx = 0 .. n-1:
  //   A_i = [A[idx], A[idx-1], ..., 0]
  //   P_Ai = P * A_i
  //   denom = lambda + A_i' * P_Ai
  //   k = P_Ai / denom
  //   y = w' * A_i
  //   e = D[idx] - y
  //   w = w + k * e
  //   P = (P - k * (A_i' * P)) / lambda
  // returns desired, noisy, output, error
}`;
    setCode(jsSnippet);
    setCodeHtml(`<pre>${jsSnippet}</pre>`);
  };

  const handleDownloadCode = () => {
    const element = document.createElement("a");
    const file = new Blob([code], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "rls_frontend.js";
    document.body.appendChild(element);
    element.click();
  };

  // ---------- UI small components ----------
  const SphereLoading = () => (
    <div className="flex felx-col fixed inset-0 flex items-center justify-center bg-white bg-opacity-50 ">
      <div className="w-44 h-14 bg-white rounded shadow flex items-center justify-center">
        <div className="text-sm font-bold">Processing RLS...</div>
      </div>
    </div>
  );

  // chart helper
  const makeData = (label, data) => ({
    labels: data.map((_, i) => i),
    datasets: [
      {
        label,
        data,
        borderColor: "#4da6ff",
        borderWidth: 1.5,
        pointRadius: 0,
      },
    ],
  });

  return (
    <div className="flex flex-col space-y-10">
      <div className="flex flex-row gap-5 space-x-5">
        {/* Left: code frame */}
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

        {/* Right: inputs */}
        <div className="text-sm">
          <div className="flex flex-col">
            <p className="mb-2 ml-12 font-bold">Select CSV file of Input</p>
            <select
              value={selectedFile}
              onChange={(e) => setSelectedFile(e.target.value)}
              className="bg-white border border-black rounded-lg px-3 py-1 focus:outline-none focus:border-blue-500"
            >
              {fileOptions.map((option, index) => (
                <option key={index} value={option.file}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col mt-8 items-center">
            <p className="font-bold">Select the input Parameters</p>
            <div className="bg-blue-hover px-5 py-3 mt-2 rounded-xl">
              {inputs.map((input) => (
                <div key={input.id} className="flex flex-col items-center mb-3">
                  <label htmlFor={input.id} className="block mb-2">
                    <pre className="font-serif">
                      <span>{input.min} ≤ </span> {input.label} <span> ≤ {input.max}</span>
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
                      onChange={(e) =>
                        setInputs((prev) =>
                          prev.map((it) => (it.id === input.id ? { ...it, value: Number(e.target.value) } : it))
                        )
                      }
                      className="w-16 text-center border border-gray-300 rounded-lg py-1 focus:outline-none focus:border-blue-500"
                    />
                    <input
                      type="range"
                      min={input.min}
                      max={input.max}
                      step={input.step}
                      value={input.value}
                      onChange={(e) =>
                        setInputs((prev) =>
                          prev.map((it) => (it.id === input.id ? { ...it, value: Number(e.target.value) } : it))
                        )
                      }
                      className="flex-grow ml-2"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col">
            <button
              onClick={handleGenerateCode}
              className="bg-blue-button rounded-lg px-3 py-1 hover:bg-blue-hover mt-4 text-base"
            >
              Generate Code
            </button>
          </div>
        </div>
      </div>

      {loading && <SphereLoading />}

      {!loading && showPlots && (
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white p-3 rounded">
            <h3 className="font-bold mb-2">Desired Signal</h3>
            <Line data={makeData("Desired", desired)} />
          </div>

          <div className="bg-white p-3 rounded">
            <h3 className="font-bold mb-2">Noisy Signal</h3>
            <Line data={makeData("Noisy", noisy)} />
          </div>

          <div className="bg-white p-3 rounded">
            <h3 className="font-bold mb-2">RLS Output</h3>
            <Line data={makeData("RLS Output", rlsOutput)} />
          </div>

          <div className="bg-white p-3 rounded">
            <h3 className="font-bold mb-2">Error</h3>
            <Line data={makeData("Error", rlsError)} />
          </div>
        </div>
      )}
    </div>
  );
}
