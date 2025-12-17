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

function Simulation() {
  /* ================= INPUT STATE ================= */
  const [inputs, setInputs] = useState([
    { id: "A00", label: "state_transition_matrix_00", min: -1, max: 1, step: 0.01, value: 1 },
    { id: "A01", label: "state_transition_matrix_01", min: -1, max: 1, step: 0.01, value: 1 },
    { id: "A10", label: "state_transition_matrix_10", min: -1, max: 1, step: 0.01, value: 0 },
    { id: "A11", label: "state_transition_matrix_11", min: -1, max: 1, step: 0.01, value: 1 },
    { id: "x0", label: "true_state_00", min: -1, max: 1, step: 0.001, value: 0 },
    { id: "x1", label: "true_state_01", min: -1, max: 1, step: 0.001, value: 1 },
    { id: "num_steps", label: "No.of time steps", min: 10, max: 100, step: 1, value: 50 },
    { id: "x0_est_0", label: "initial_state_estimate_00", min: -1, max: 1, step: 0.001, value: 0 },
    { id: "x0_est_1", label: "initial_state_estimate_01", min: -1, max: 1, step: 0.001, value: 0 }
  ]);

  const [plots, setPlots] = useState(null);
  const [codeHtml, setCodeHtml] = useState("Code will be generated here.!");
  const [codeText, setCodeText] = useState("");

  const handleInputChange = (id, value) => {
    setInputs(inputs.map(input =>
      input.id === id
        ? { ...input, value: Math.min(Math.max(value, input.min), input.max) }
        : input
    ));
  };

  /* ================= MATRIX HELPERS (MATLAB IDENTICAL) ================= */
  const matMul = (A, B) => [
    [
      A[0][0]*B[0][0] + A[0][1]*B[1][0],
      A[0][0]*B[0][1] + A[0][1]*B[1][1]
    ],
    [
      A[1][0]*B[0][0] + A[1][1]*B[1][0],
      A[1][0]*B[0][1] + A[1][1]*B[1][1]
    ]
  ];

  const matAdd = (A, B) => [
    [A[0][0]+B[0][0], A[0][1]+B[0][1]],
    [A[1][0]+B[1][0], A[1][1]+B[1][1]]
  ];

  const matSub = (A, B) => [
    [A[0][0]-B[0][0], A[0][1]-B[0][1]],
    [A[1][0]-B[1][0], A[1][1]-B[1][1]]
  ];

  const matTrans = A => [
    [A[0][0], A[1][0]],
    [A[0][1], A[1][1]]
  ];

  const matInv2 = M => {
    const det = M[0][0]*M[1][1] - M[0][1]*M[1][0];
    return [
      [ M[1][1]/det, -M[0][1]/det ],
      [ -M[1][0]/det, M[0][0]/det ]
    ];
  };

  const matVecMul = (A, x) => [
    A[0][0]*x[0] + A[0][1]*x[1],
    A[1][0]*x[0] + A[1][1]*x[1]
  ];

  /* ================= GENERATE CODE ================= */
  const handleGenerateCode = () => {
    const code = `function kalmanFilterSimulation(A, x0, num_steps, x0_est, uniqueIdentifier = "default") {
  // Fixed parameters (same as MATLAB)
  const C = [[1, 0], [0, 1]];           // Measurement matrix: identity
  const Q = [[1e-6, 0], [0, 1e-6]];     // Process noise covariance
  const R = [[0, 0], [0, 0]];           // Measurement noise: zero (noiseless)

  // Initialize arrays
  const x_true = Array(num_steps).fill().map(() => [0, 0]);
  const y_meas = Array(num_steps).fill().map(() => [0, 0]);
  const x_est  = Array(num_steps).fill().map(() => [0, 0]);

  const time = Array.from({ length: num_steps }, (_, i) => i + 1);

  // Initial true state
  x_true[0] = [...x0];
  y_meas[0] = [...x0]; // Though not used in filter loop

  // Simulate true system (unforced: x_k = A * x_{k-1})
  for (let k = 1; k < num_steps; k++) {
    x_true[k] = matVecMul(A, x_true[k - 1]);
    y_meas[k] = matVecMul(C, x_true[k]); // C is identity → same as x_true[k]
  }

  // Kalman filter initialization
  x_est[0] = [...x0_est];
  let P = [[1, 0], [0, 1]]; // Initial error covariance

  // Kalman filter loop
  for (let k = 1; k < num_steps; k++) {
    // Prediction step
    const x_pred = matVecMul(A, x_est[k - 1]);
    const P_pred = matAdd(matMul(matMul(A, P), matTrans(A)), Q);

    // Kalman gain
    const S = matAdd(matMul(matMul(C, P_pred), matTrans(C)), R);
    const K = matMul(matMul(P_pred, matTrans(C)), matInv2x2(S));

    // Innovation (measurement residual)
    const innovation = [
      y_meas[k][0] - x_pred[0],
      y_meas[k][1] - x_pred[1]
    ];

    // Update state estimate
    x_est[k] = [
      x_pred[0] + K[0][0] * innovation[0] + K[0][1] * innovation[1],
      x_pred[1] + K[1][0] * innovation[0] + K[1][1] * innovation[1]
    ];

    // Update covariance
    const I = [[1, 0], [0, 1]];
    P = matMul(matSub(I, matMul(K, C)), P_pred);
  }

  // Return results
  return {
    time,
    x_true,     // True states over time
    x_est,      // Estimated states over time
    uniqueIdentifier
  };
}

// ==================== Matrix Helper Functions ====================

function matMul(A, B) {
  return [
    [
      A[0][0] * B[0][0] + A[0][1] * B[1][0],
      A[0][0] * B[0][1] + A[0][1] * B[1][1]
    ],
    [
      A[1][0] * B[0][0] + A[1][1] * B[1][0],
      A[1][0] * B[0][1] + A[1][1] * B[1][1]
    ]
  ];
}

function matAdd(A, B) {
  return [
    [A[0][0] + B[0][0], A[0][1] + B[0][1]],
    [A[1][0] + B[1][0], A[1][1] + B[1][1]]
  ];
}

function matSub(A, B) {
  return [
    [A[0][0] - B[0][0], A[0][1] - B[0][1]],
    [A[1][0] - B[1][0], A[1][1] - B[1][1]]
  ];
}

function matTrans(A) {
  return [
    [A[0][0], A[1][0]],
    [A[0][1], A[1][1]]
  ];
}

function matVecMul(A, v) {
  return [
    A[0][0] * v[0] + A[0][1] * v[1],
    A[1][0] * v[0] + A[1][1] * v[1]
  ];
}

function matInv2x2(M) {
  const det = M[0][0] * M[1][1] - M[0][1] * M[1][0];
  if (Math.abs(det) < 1e-10) throw new Error("Matrix is singular");
  return [
    [ M[1][1] / det, -M[0][1] / det ],
    [ -M[1][0] / det, M[0][0] / det ]
  ];
}

// ==================== Example Usage ====================

// Example parameters
const A = [
  [1, 1],
  [0, 1]
];
const x0 = [0, 1];
const num_steps = 50;
const x0_est = [0, 0]; // Wrong initial guess
const result = kalmanFilterSimulation(A, x0, num_steps, x0_est, "example1");

// Log some results
console.log("Time:", result.time.slice(0, 5));
console.log("True State (first 5):", result.x_true.slice(0, 5));
console.log("Estimated State (first 5):", result.x_est.slice(0, 5));`;
    setCodeHtml(`<pre>${code}</pre>`);
    setCodeText(code);
  };

  /* ================= DOWNLOAD FUNCTION ================= */
  const handleDownload = () => {
    if (!codeText) {
      alert("Please generate the code first.");
      return;
    }
    const element = document.createElement("a");
    const file = new Blob([codeText], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "kalmanFilterSimulation.m";
    document.body.appendChild(element);
    element.click();
  };

  /* ================= RUN FUNCTION ================= */
  const handleRunChecked = () => {
    if (!codeText) {
      alert("Please generate the code first.");
      return;
    }

    const A = [
      [inputs.find(i=>i.id==="A00").value, inputs.find(i=>i.id==="A01").value],
      [inputs.find(i=>i.id==="A10").value, inputs.find(i=>i.id==="A11").value]
    ];
    const C = [[1,0],[0,1]];
    const Q = [[1e-6,0],[0,1e-6]];
    const R = [[0,0],[0,0]];
    const I = [[1,0],[0,1]];
    const N = inputs.find(i=>i.id==="num_steps").value;

    const xTrue = Array(N).fill(0).map(()=>[0,0]);
    const yMeas = Array(N).fill(0).map(()=>[0,0]);
    const xEst  = Array(N).fill(0).map(()=>[0,0]);

    xTrue[0] = [
      inputs.find(i=>i.id==="x0").value,
      inputs.find(i=>i.id==="x1").value
    ];
    xEst[0] = [
      inputs.find(i=>i.id==="x0_est_0").value,
      inputs.find(i=>i.id==="x0_est_1").value
    ];

    let P = [[1,0],[0,1]];

    // TRUE SYSTEM
    for(let k=1;k<N;k++){
      xTrue[k] = matVecMul(A, xTrue[k-1]);
      yMeas[k] = [...xTrue[k]];
    }

    // KALMAN FILTER
    for(let k=1;k<N;k++){
      const xPred = matVecMul(A, xEst[k-1]);
      const PPred = matAdd(matMul(matMul(A,P), matTrans(A)), Q);
      const S = matAdd(matMul(matMul(C,PPred), matTrans(C)), R);
      const K = matMul(matMul(PPred, matTrans(C)), matInv2(S));
      const innovation = [yMeas[k][0]-xPred[0], yMeas[k][1]-xPred[1]];
      xEst[k] = [
        xPred[0]+K[0][0]*innovation[0]+K[0][1]*innovation[1],
        xPred[1]+K[1][0]*innovation[0]+K[1][1]*innovation[1]
      ];
      P = matMul(matSub(I, matMul(K,C)), PPred);
    }

    setPlots({ xt: xTrue, x: xEst });
  };

  /* ================= UI (UNCHANGED) ================= */
  return (
    <div className="flex flex-row gap-5 space-x-5">
      <div className="flex flex-col space-y1">
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
          <button className="bg-blue-button rounded-lg px-3 py-1 hover:bg-blue-hover mt-8" onClick={handleRunChecked}>
            Submit & Run
          </button>
          <button className="bg-blue-button rounded-lg px-3 py-1 hover:bg-blue-hover mt-8" onClick={handleGenerateCode}>
            Generate Code
          </button>
        </div>

        {plots && (
          <div className="grid grid-cols-1 gap-6">
            <Line
              data={{
                labels: plots.xt.map((_,i)=>i+1),
                datasets: [
                  { label:"True State", data:plots.xt.map(v=>v[0]), borderColor:"green", pointRadius:0 },
                  { label:"Estimated State", data:plots.x.map(v=>v[0]), borderColor:"blue", borderDash:[5,5], pointRadius:0 }
                ]
              }}
            />
            <Line
              data={{
                labels: plots.xt.map((_,i)=>i+1),
                datasets: [
                  { label:"True State", data:plots.xt.map(v=>v[1]), borderColor:"green", pointRadius:0 },
                  { label:"Estimated State", data:plots.x.map(v=>v[1]), borderColor:"blue", borderDash:[5,5], pointRadius:0 }
                ]
              }}
            />
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
                  step={input.step}
                  min={input.min}
                  max={input.max}
                  onChange={e=>handleInputChange(input.id, Number(e.target.value))}
                  className="w-16 text-center border rounded-lg"
                />
                <input
                  type="range"
                  min={input.min}
                  max={input.max}
                  step={input.step}
                  value={input.value}
                  onChange={e=>handleInputChange(input.id, Number(e.target.value))}
                  className="flex-grow ml-2"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Simulation;
