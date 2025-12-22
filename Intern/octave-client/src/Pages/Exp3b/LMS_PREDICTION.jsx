import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const LMS = () => {
  
  const [inputs, setInputs] = useState([
    { id: 'mu1', label: 'Step-size (µ)', min: 0.001, max: 0.1, step: 0.001, value: 0.01 },
    { id: 'mu2', label: 'Step-size (µ)', min: 0.001, max: 0.1, step: 0.001, value: 0.05 },
    { id: 'mu3', label: 'Step-size (µ)', min: 0.001, max: 0.1, step: 0.001, value: 0.1 },
    { id: 'num-samples', label: 'Number of Samples (n)', min: 10, max: 1000, step: 10, value: 200 },
    { id: 'sigma-nu', label: 'Sigma Nu', min: 0, max: 1, step: 0.01, value: 0.1 },
    { id: 'a', label: 'Weight Coeff (a)', min: -1, max: 1, step: 0.01, value: -0.98 }
  ]);

  const [code, setCode] = useState('');
  const [codeHtml, setCodeHtml] = useState('Code will be generated here.!');
  const [chartData, setChartData] = useState({ desired: null, learning: null, randomWalk: null });
  const [loading, setLoading] = useState(false);
  const [showCharts, setShowCharts] = useState(false);

  const randn = () => {
    
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };

  const variance = (arr) => {
    const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
    return arr.reduce((s, v) => s + (v - mean) ** 2, 0) / arr.length;
  };

  const adaptiveFilter = (n, muArray, sigma_nu, a) => {
    const MC = 500;

    // Single realization for Desired Output
    let u_display = new Array(n).fill(0);
    for (let i = 1; i < n; i++) {
      u_display[i] = a * u_display[i - 1] + sigma_nu * randn();
    }
    const var_display = variance(u_display);
    u_display = u_display.map(v => v * Math.sqrt(1 / var_display));

    const mseCurves = muArray.map(() => new Array(n).fill(0));
    let rndwalk = new Array(n).fill(0); // Will be overwritten — matches MATLAB behavior

    for (let l = 0; l < muArray.length; l++) {
      const mu = muArray[l];
      const weightErrors = [];
      const weights = []; // Collect weight history for every run (for rndwalk)

      for (let k = 0; k < MC; k++) {
        let u = new Array(n).fill(0);
        for (let i = 1; i < n; i++) {
          u[i] = a * u[i - 1] + sigma_nu * randn();
        }
        const v = variance(u);
        u = u.map(val => val * Math.sqrt(1 / v));

        let w_est = 0;
        const errors = new Array(n).fill(0);
        const wHistory = new Array(n).fill(0);

        for (let j = 1; j < n; j++) {
          const e = u[j] - w_est * u[j - 1];
          w_est += mu * u[j - 1] * e;

          errors[j] = (w_est - a) ** 2;
          wHistory[j] = w_est;
        }
        wHistory[0] = 0;
        errors[0] = errors[1];

        weightErrors.push(errors);
        weights.push(wHistory);
      }

      // Compute MSE for this μ
      for (let j = 0; j < n; j++) {
        let sum = 0;
        for (let k = 0; k < MC; k++) sum += weightErrors[k][j];
        mseCurves[l][j] = sum / MC;
      }

      // Overwrite rndwalk — exactly like MATLAB (last μ wins)
      for (let j = 0; j < n; j++) {
        let sum = 0;
        for (let k = 0; k < MC; k++) sum += weights[k][j];
        rndwalk[j] = sum / MC;
      }
    }

    const trueWeight = new Array(n).fill(a);

    return { u_display, mseCurves, rndwalk, trueWeight };
  };

  const handleInputChange = (id, value) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;
    const input = inputs.find(i => i.id === id);
    const clamped = Math.min(Math.max(numValue, input.min), input.max);
    setInputs(inputs.map(i => i.id === id ? { ...i, value: clamped } : i));
  };

  const handleGenerateCode = () => {
    const matlabCode = `function adaptive_filter(n, mu, sigma_nu, a, uniqueIdentifier)
    % Original MATLAB code...
endfunction`;
    setCode(matlabCode);
    setCodeHtml(`<pre style="background:#f4f4f4;padding:15px;border-radius:8px;overflow:auto;font-size:13px;">${matlabCode}</pre>`);
  };

  const handleRun = () => {
     if (!code) {
      alert("Please generate the code first.");
      return;
    }
    
    setShowCharts(false);

    const n = parseInt(inputs.find(i => i.id === 'num-samples').value);
    const muArray = [
      parseFloat(inputs.find(i => i.id === 'mu1').value),
      parseFloat(inputs.find(i => i.id === 'mu2').value),
      parseFloat(inputs.find(i => i.id === 'mu3').value)
    ];
    const sigma_nu = parseFloat(inputs.find(i => i.id === 'sigma-nu').value);
    const a = parseFloat(inputs.find(i => i.id === 'a').value);

    const { u_display, mseCurves, rndwalk, trueWeight } = adaptiveFilter(n, muArray, sigma_nu, a);

    const labels = Array.from({ length: n }, (_, i) => i + 1); // 1-based like MATLAB

    const desiredChart = {
      labels,
      datasets: [{
        label: 'Desired Output u(n)',
        data: u_display,
        borderColor: '#46a9d6ff',
        backgroundColor: '#53b8fcff',
        pointRadius: 3,
        pointHoverRadius: 5,
        borderWidth: 1.5,
        showLine: true,
        tension: 0,
      }]
    };

    const learningChart = {
      labels,
      datasets: [
        {
          label: `µ = ${muArray[0].toFixed(3)}`,
          data: mseCurves[0],
          borderColor: '#dc2626',
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.1,
        },
        {
          label: `µ = ${muArray[1].toFixed(3)}`,
          data: mseCurves[1],
          borderColor: '#16a34a',
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.1,
        },
        {
          label: `µ = ${muArray[2].toFixed(3)}`,
          data: mseCurves[2],
          borderColor: '#2563eb',
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.1,
        },
      ]
    };

    const rwChart = {
      labels,
      datasets: [
        {
          label: 'True Weight (a)',
          data: trueWeight,
          borderColor: '#2563eb',
          borderWidth: 3,
          pointRadius: 0,
        },
        {
          label: 'Estimated Weight (ensemble average)',
          data: rndwalk,
          borderColor: '#dc2626',
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.2,
        },
      ]
    };

    setChartData({ desired: desiredChart, learning: learningChart, randomWalk: rwChart });
    setLoading(false);
    setShowCharts(true);
  };

  const handleDownload = () => {
     if (!code) {
      alert("Please generate the code first.");
      return;
    }
    const el = document.createElement('a');
    el.href = URL.createObjectURL(new Blob([code], { type: 'text/plain' }));
    el.download = 'adaptive_filter.m';
    el.click();
  };

  const commonOptions = (title, yLabel) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { font: { size: 14 } } },
      title: { display: true, text: title, font: { size: 18, weight: 'bold' } },
      tooltip: { mode: 'index', intersect: false },
    },
    scales: {
      x: {
        title: { display: true, text: 'Number of adaptation cycles, n', font: { size: 14 } },
      },
      y: {
        title: { display: true, text: yLabel, font: { size: 14 } },
      },
    },
  });

  return (
    <div className="flex flex-row gap-5 space-x-5 p-5">
      <div className="flex flex-col space-y-10 flex-1">
        <div className="flex flex-col">
          <iframe
            srcDoc={codeHtml}
            title="Generated Code"
            width="650"
            height="262"
            className="outline border-4 p-2 rounded-sm border-blue-hover"
          />
          <div className="flex justify-between text-sm mt-4">
            <button onClick={handleDownload} className="bg-blue-button rounded-lg px-4 py-2 hover:bg-blue-hover">
              Download
            </button>
            <button onClick={handleRun} disabled={loading} className="bg-blue-button rounded-lg px-4 py-2 hover:bg-blue-hover disabled:opacity-50">
              {loading ? 'Running...' : 'Submit & Run'}
            </button>
          </div>
        </div>

        {loading && <div className="font-bold text-xl text-center my-10">Processing simulation...</div>}

        {showCharts && (
          <div className="flex flex-col gap-16 mt-8">
            <div className="h-96">
              <Line options={commonOptions('Desired Output', 'Magnitude')} data={chartData.desired} />
            </div>

            <div className="h-96">
              <Line options={commonOptions('Learning Curve for Different Step Sizes', 'Mean Square Error')} data={chartData.learning} />
            </div>

            <div className="h-96">
              <Line options={commonOptions('Random Walk Behaviour', 'Tap Weight')} data={chartData.randomWalk} />
            </div>
          </div>
        )}
      </div>

      <div className="text-sm flex flex-col items-center">
        <p className="font-bold text-lg mb-4">Select Input Parameters</p>
        <div className="bg-blue-hover px-6 py-4 rounded-xl shadow-md">
          {inputs.map(input => (
            <div key={input.id} className="flex flex-col items-center my-5">
              <label className="mb-2">
                <pre className="font-serif text-xs">
                  {input.min} ≤ {input.label} ≤ {input.max}
                </pre>
              </label>
              <div className="flex items-center w-80">
                <input
                  type="number"
                  step={input.step}
                  value={input.value}
                  onChange={(e) => handleInputChange(input.id, e.target.value)}
                  className="w-24 text-center border border-gray-400 rounded px-2 py-1 focus:outline-none focus:border-blue-600"
                />
                <input
                  type="range"
                  min={input.min}
                  max={input.max}
                  step={input.step}
                  value={input.value}
                  onChange={(e) => handleInputChange(input.id, e.target.value)}
                  className="mx-4 flex-grow"
                />
                <span className="w-20 text-right font-mono text-sm">{input.value.toFixed(4)}</span>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleGenerateCode}
          className="bg-blue-button rounded-lg px-6 py-3 hover:bg-blue-hover mt-10 font-medium shadow"
        >
          Generate Code
        </button>
      </div>
    </div>
  );
};

export default LMS;