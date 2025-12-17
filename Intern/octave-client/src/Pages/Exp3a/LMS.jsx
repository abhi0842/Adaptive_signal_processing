import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

function LMS_AR() {

  /* ================= INPUT STATE ================= */
  const [inputs, setInputs] = useState([
    { id: 'num-samples', label: 'Number of samples (N)', min: 10, max: 1000, step: 1, value: 500 },
    { id: 'u1', label: 'Initial value u1', min: 0, max: 1, step: 0.01, value: 0.5 },
    { id: 'u2', label: 'Initial value u2', min: 0, max: 1, step: 0.01, value: 1 },
    { id: 'step-size', label: 'Step size (mu)', min: 0.001, max: 0.1, step: 0.001, value: 0.1 },
    { id: 'unique-id', label: 'Unique Identifier', min: 0, max: 9999, step: 1, value: 123 }
  ]);

  const [plots, setPlots] = useState(null);
  const [codeHtml, setCodeHtml] = useState('Code will be generated here.!');
  const [code, setCode] = useState('');

  const handleInputChange = (id, value) => {
    const input = inputs.find(input => input.id === id);
    const newValue = Math.min(Math.max(value, input.min), input.max);
    setInputs(inputs.map(input => input.id === id ? { ...input, value: newValue } : input));
  };

  /* ================= RUN LMS AR ================= */
  const handleRun = () => {
    if (!code) {
      alert("Please generate the code first.");
      return;
    }

    const N = inputs.find(i => i.id === 'num-samples').value;
    const u_init = [inputs.find(i => i.id === 'u1').value, inputs.find(i => i.id === 'u2').value];
    const mu = inputs.find(i => i.id === 'step-size').value;
    const uniqueIdentifier = inputs.find(i => i.id === 'unique-id').value;

    // --- Initialize ---
    const v = Array.from({length: N}, () => Math.random()); // noise
    const u = Array(N).fill(0);
    const w_lms = Array.from({length: 2}, () => Array(N).fill(0));
    const e = Array(N).fill(0);

    u[0] = u_init[0];
    u[1] = u_init[1];

    // --- Generate AR process ---
    for (let i = 2; i < N; i++) {
      u[i] = 0.75 * u[i-1] - 0.5 * u[i-2] + v[i];
    }

    // --- Compute R and p ---
    let R = [[0,0],[0,0]];
    let p = [0,0];
    for (let i = 1; i < N; i++) {
      const x = [v[i], v[i-1]];
      R[0][0] += x[0]*x[0]; R[0][1] += x[0]*x[1];
      R[1][0] += x[1]*x[0]; R[1][1] += x[1]*x[1];
      p[0] += x[0]*u[i]; p[1] += x[1]*u[i];
    }
    R = R.map(row => row.map(val => val/(N-1)));
    p = p.map(val => val/(N-1));

    // --- Solve w_opt = R \ p ---
    const det = R[0][0]*R[1][1] - R[0][1]*R[1][0];
    const R_inv = [
      [ R[1][1]/det, -R[0][1]/det ],
      [ -R[1][0]/det, R[0][0]/det ]
    ];
    const w_opt = [
      R_inv[0][0]*p[0] + R_inv[0][1]*p[1],
      R_inv[1][0]*p[0] + R_inv[1][1]*p[1]
    ];

    // --- LMS algorithm ---
    w_lms[0][0] = 0; w_lms[1][0] = 0;
    for (let i = 1; i < N; i++) {
      e[i] = u[i] - (w_lms[0][i-1]*v[i] + w_lms[1][i-1]*v[i-1]);
      w_lms[0][i] = w_lms[0][i-1] + mu * v[i] * e[i];
      w_lms[1][i] = w_lms[1][i-1] + mu * v[i-1] * e[i];
    }

    setPlots({ e, w_lms, w_opt, N });
  };

  const handleGenerateCode = () => {
    const generatedCode = `function lms_ar(N, u_init, mu) {

  /* -------- Random Noise (v = rand(N,1)) -------- */
  const v = Array.from({ length: N }, () => Math.random());

  /* -------- Initialize u -------- */
  const u = Array(N).fill(0);
  u[0] = u_init[0];
  u[1] = u_init[1];

  /* -------- Generate AR process -------- */
  for (let i = 2; i < N; i++) {
    u[i] = 0.75 * u[i - 1] - 0.5 * u[i - 2] + v[i];
  }

  /* -------- Compute R and p -------- */
  let R = [
    [0, 0],
    [0, 0]
  ];
  let p = [0, 0];

  for (let i = 1; i < N; i++) {
    const x = [v[i], v[i - 1]];

    R[0][0] += x[0] * x[0];
    R[0][1] += x[0] * x[1];
    R[1][0] += x[1] * x[0];
    R[1][1] += x[1] * x[1];

    p[0] += x[0] * u[i];
    p[1] += x[1] * u[i];
  }

  R = R.map(row => row.map(val => val / (N - 1)));
  p = p.map(val => val / (N - 1));

  /* -------- Optimal weights (w_opt = inv(R) * p) -------- */
  const det = R[0][0] * R[1][1] - R[0][1] * R[1][0];
  const Rinv = [
    [ R[1][1] / det, -R[0][1] / det ],
    [ -R[1][0] / det, R[0][0] / det ]
  ];

  const w_opt = [
    Rinv[0][0] * p[0] + Rinv[0][1] * p[1],
    Rinv[1][0] * p[0] + Rinv[1][1] * p[1]
  ];

  /* -------- LMS Algorithm -------- */
  const w_lms = [
    Array(N).fill(0),
    Array(N).fill(0)
  ];
  const e = Array(N).fill(0);

  for (let i = 1; i < N; i++) {
    const x = [v[i], v[i - 1]];
    const y = w_lms[0][i - 1] * x[0] + w_lms[1][i - 1] * x[1];
    e[i] = u[i] - y;

    w_lms[0][i] = w_lms[0][i - 1] + mu * x[0] * e[i];
    w_lms[1][i] = w_lms[1][i - 1] + mu * x[1] * e[i];
  }`;
    setCode(generatedCode);
    setCodeHtml(`<pre>${generatedCode}</pre>`);
  };

  const handleDownload = () => {
    if (!code) {
      alert("Please generate the code first.");
      return;
    }
    const element = document.createElement("a");
    const file = new Blob([code], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `lms_ar_${inputs.find(i=>i.id==='unique-id').value}.m`;
    document.body.appendChild(element);
    element.click();
  };

  return (
    <div className='flex flex-col space-y-10'>
      <div className="flex flex-row gap-5 space-x-5">
        <div className='flex flex-col'>
          <iframe srcDoc={codeHtml} title="Generated Code" width="650" height="262" className='outline border-4 p-2 rounded-sm border-blue-hover'/>
          <div className='flex justify-between text-sm'>
            <button className="bg-blue-button rounded-lg px-3 py-1 hover:bg-blue-hover mt-8" onClick={handleDownload}>Download</button>
            <button className="bg-blue-button rounded-lg px-3 py-1 hover:bg-blue-hover mt-8" onClick={handleRun}>Submit and Run</button>
            <button className="bg-blue-button rounded-lg px-3 py-1 hover:bg-blue-hover mt-8" onClick={handleGenerateCode}>Generate Code</button>
          </div>

          {plots && (
            <div className='mt-5 flex flex-col space-y-4'>
              <Line
                data={{
                  labels: Array.from({length: plots.N}, (_,i)=>i+1),
                  datasets: [{ label:"MSE", data: plots.e.map(v=>v*v), borderColor:"rgba(108, 181, 253, 0.7)", pointRadius:0 }]
                }}
              />
              <Line
                data={{
                  labels: Array.from({length: plots.N}, (_,i)=>i+1),
                  datasets: [
                    { label:"w1 LMS", data: plots.w_lms[0], borderColor:"rgba(108, 181, 253, 0.7)", pointRadius:0 },
                    { label:"w1 Optimal", data: Array(plots.N).fill(plots.w_opt[0]), borderColor:"green", pointRadius:0 }
                  ]
                }}
              />
              <Line
                data={{
                  labels: Array.from({length: plots.N}, (_,i)=>i+1),
                  datasets: [
                    { label:"w2 LMS", data: plots.w_lms[1], borderColor:"rgba(108, 181, 253, 0.7)", pointRadius:0 },
                    { label:"w2 Optimal", data: Array(plots.N).fill(plots.w_opt[1]), borderColor:"green", pointRadius:0 }
                  ]
                }}
              />
            </div>
          )}
        </div>

        <div className="text-sm">
          <div className='flex flex-col items-center'>
            <p className='font-bold'>Select Input Parameters</p>
            <div className='bg-blue-hover px-5 py-3 mt-2 rounded-xl'>
              {inputs.map(input => (
                <div key={input.id} className="flex flex-col items-center mb-2">
                  <pre>{input.min} ≤ {input.label} ≤ {input.max}</pre>
                  <input type="number" value={input.value} min={input.min} max={input.max} step={input.step} onChange={(e)=>handleInputChange(input.id, Number(e.target.value))} className="w-16 text-center border rounded-lg mb-1"/>
                  <input type="range" min={input.min} max={input.max} step={input.step} value={input.value} onChange={(e)=>handleInputChange(input.id, Number(e.target.value))} className="flex-grow"/>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LMS_AR;
