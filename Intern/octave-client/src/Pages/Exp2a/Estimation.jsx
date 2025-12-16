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

function Estimation() {
  const [inputs, setInputs] = useState([
    { id: "N", label: "No. of time steps", min: 100, max: 1000, step: 1, value: 500 },
    { id: "dt", label: "Sampling time", min: 0.001, max: 0.01, step: 0.001, value: 0.01 },
    { id: "u", label: "U", min: 1, max: 10, step: 1, value: 5 },
    { id: "y0", label: "Initial position", min: 50, max: 100, step: 1, value: 60 },
    { id: "v0", label: "Velocity", min: 0, max: 100, step: 1, value: 10 },
    { id: "R", label: "Variance", min: 2, max: 100, step: 0.1, value: 10 }
  ]);

  const [code, setCode] = useState("");
  const [codeHtml, setCodeHtml] = useState("Code will be generated here.!");
  const [plots, setPlots] = useState(null);

  /* -------- MATLAB randn -------- */
  const randn = () => {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };

  const handleInputChange = (id, value) => {
    setInputs(inputs.map(input =>
      input.id === id
        ? { ...input, value: Math.min(Math.max(value, input.min), input.max) }
        : input
    ));
  };

  /* ================= KALMAN FILTER (MATLAB IDENTICAL) ================= */
  const handleRun = () => {
    const N = inputs.find(i => i.id === "N").value;
    const dt = inputs.find(i => i.id === "dt").value;
    const u = inputs.find(i => i.id === "u").value;
    const y0 = inputs.find(i => i.id === "y0").value;
    const v0 = inputs.find(i => i.id === "v0").value;
    const R = inputs.find(i => i.id === "R").value;

    const t = Array.from({ length: N }, (_, i) => dt * (i + 1));

    const F = [[1, dt], [0, 1]];
    const G = [-0.5 * dt * dt, -dt];

    /* ---- TRUE STATES (xt) ---- */
    let xt = Array.from({ length: N }, () => [0, 0]);
    xt[0] = [y0, v0];

    for (let k = 1; k < N; k++) {
      xt[k] = [
        F[0][0] * xt[k - 1][0] + F[0][1] * xt[k - 1][1] + G[0] * u,
        F[1][1] * xt[k - 1][1] + G[1] * u
      ];
    }

    /* ---- MEASUREMENTS ---- */
    const z = xt.map(s => s[0] + Math.sqrt(R) * randn());

    /* ---- KALMAN FILTER ---- */
    let x = Array.from({ length: N }, () => [0, 0]);
    x[0] = [10, 0];

    let P = [[50, 0], [0, 0.01]];

    for (let k = 1; k < N; k++) {
      // Prediction
      const xp = [
  F[0][0] * x[k - 1][0] + F[0][1] * x[k - 1][1] + G[0] * u,
  F[1][0] * x[k - 1][0] + F[1][1] * x[k - 1][1] + G[1] * u
];


      const Pp = [
  [
    P[0][0] + dt * (P[1][0] + P[0][1]) + dt * dt * P[1][1],
    P[0][1] + dt * P[1][1]
  ],
  [
    P[1][0] + dt * P[1][1],
    P[1][1]
  ]
];

      // Kalman Gain
      const S = Pp[0][0] + R;
      const K = [Pp[0][0] / S, Pp[1][0] / S];

      // Update
      const innovation = z[k] - xp[0];
      x[k] = [
        xp[0] + K[0] * innovation,
        xp[1] + K[1] * innovation
      ];

      // Covariance update
      /* ---- UPDATE COVARIANCE (EXACT MATLAB) ---- */
P = [
  [
    (1 - K[0]) * Pp[0][0],
    (1 - K[0]) * Pp[0][1]
  ],
  [
    -K[1] * Pp[0][0] + Pp[1][0],
    -K[1] * Pp[0][1] + Pp[1][1]
  ]
];

    }

    /* ---- ERRORS (EXACT MATLAB) ---- */
    const posErr = x.map((v, i) => v[0] - xt[i][0]);
    const velErr = x.map((v, i) => v[1] - xt[i][1]);

    setPlots({ t, z, xt, x, posErr, velErr });
  };

  /* -------- MATLAB Code Generator -------- */
  const handleGenerateCode = () => {
    const matlabCode = `
function kalmanFilterEstimation(N, dt, u, y0, v0, R)
...
end
`;
    setCode(matlabCode);
    setCodeHtml(`<pre>${matlabCode}</pre>`);
  };

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([code], { type: "text/plain" }));
    a.download = "kalmanFilterEstimation.m";
    a.click();
  };

  const chart = (datasets) => ({
    labels: plots.t,
    datasets
  });

  /* ================= UI (UNCHANGED) ================= */
  return (
    <div className="flex flex-row gap-5 space-x-5">
      <div className="flex flex-col space-y-10">
        <iframe
          srcDoc={codeHtml}
          title="Generated Code"
          width="750"
          height="300"
          className="outline border-4 p-2 rounded-sm border-blue-hover"
        />

        <div className="flex justify-between text-sm">
          <button className="bg-blue-button rounded-lg px-3 py-1 hover:bg-blue-hover mt-8" onClick={handleDownload}>
            Download
          </button>
          <button className="bg-blue-button rounded-lg px-3 py-1 hover:bg-blue-hover mt-8" onClick={handleRun}>
            Submit & Run
          </button>
        </div>

        {plots && (
          <div className="grid grid-cols-1 gap-6">
            {/* POSITION */}
            <Line data={chart([
              { label: "Measured", data: plots.z, borderColor: "green", pointRadius: 0 },
              { label: "Estimated", data: plots.x.map(v => v[0]), borderColor: "blue", borderDash: [5, 5], pointRadius: 0 },
              { label: "True", data: plots.xt.map(v => v[0]), borderColor: "red", borderDash: [2, 2], pointRadius: 0 }
            ])} />

            {/* VELOCITY */}
            <Line data={chart([
              { label: "Estimated", data: plots.x.map(v => v[1]), borderColor: "blue", pointRadius: 0 },
              { label: "True", data: plots.xt.map(v => v[1]), borderColor: "red", borderDash: [2, 2], pointRadius: 0 }
            ])} />

            {/* POSITION ERROR */}
            <Line data={chart([
              { label: "Position Error", data: plots.posErr, borderColor: "#6ec1ff", pointRadius: 0 }
            ])} />

            {/* VELOCITY ERROR */}
            <Line data={chart([
              { label: "Velocity Error", data: plots.velErr, borderColor: "#6ec1ff", pointRadius: 0 }
            ])} />
          </div>
        )}
      </div>

      <div className="text-sm">
        <p className="font-semibold text-center">Select the input Parameters</p>
        <div className="bg-blue-hover px-5 py-3 mt-2 rounded-xl">
          {inputs.map(input => (
            <div key={input.id} className="flex flex-col items-center">
              <pre>{input.min} ≤ {input.label} ≤ {input.max}</pre>
              <div className="flex flex-row items-center">
                <input
                  type="number"
                  value={input.value}
                  onChange={e => handleInputChange(input.id, Number(e.target.value))}
                  className="w-16 text-center border rounded-lg"
                />
                <input
                  type="range"
                  min={input.min}
                  max={input.max}
                  step={input.step}
                  value={input.value}
                  onChange={e => handleInputChange(input.id, Number(e.target.value))}
                  className="flex-grow ml-2"
                />
              </div>
            </div>
          ))}
        </div>

        <button onClick={handleGenerateCode} className="bg-blue-button rounded-lg px-3 py-1 hover:bg-blue-hover mt-10">
          Generate Code
        </button>
      </div>
    </div>
  );
}

export default Estimation;
