import React, { useState } from 'react';
import image from '../../image.png';

import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend
);

const RMS = () => {
  const [inputs, setInputs] = useState([
    { id: 'W', label: 'W', min: 0, max: 15, step: 1, value: 7 },
    { id: 'xi_R', label: 'xi_R', min: 0, max: 15, step: 1, value: 7 },
    { id: 'N', label: 'Number of samples (N)', min: 100, max: 1000, step: 10, value: 500 },
    { id: 'SNR_dB', label: 'SNR (dB)', min: 0, max: 50, step: 1, value: 25 },
    { id: 'L', label: 'Number of taps in the equalizer (L)', min: 10, max: 20, step: 1, value: 15 },
    { id: 'delay', label: 'Delay for desired response', min: 1, max: 15, step: 1, value: 7 }
  ]);

  const [code, setCode] = useState('');
  const [codeHtml, setCodeHtml] = useState('Code will be generated here.!');
  const [loading, setLoading] = useState(false);
  const [showPlot, setShowPlot] = useState(false);
  const [chartData, setChartData] = useState(null);

  const handleInputChange = (id, value) => {
    const input = inputs.find(i => i.id === id);
    const v = Math.min(Math.max(+value, input.min), input.max);
    setInputs(inputs.map(i => i.id === id ? { ...i, value: v } : i));
  };

  /* ===================== GENERATE MATLAB CODE ===================== */
  const handleGenerateCode = () => {
    const matlabCode = `
function eqrls(W, xi_R, N, SNR_dB, L, delay)
num_runs = 100;
delta = 0.04;
MSE_sum = zeros(1, N-delay);

for run = 1:num_runs
    x_n = 2 * randi([0 1], N, 1) - 1;
    d_n = [x_n(delay+1:end); zeros(delay,1)];

    w = zeros(L,1);
    P = (1/delta) * eye(L);
    lambda = 1;

    MSE = zeros(1, N-delay);

    for n = L:N-delay
        u_n = x_n(n:-1:n-L+1);
        k_n = (P*u_n) / (lambda + u_n'*P*u_n);
        e_n = d_n(n) - w'*u_n;
        w = w + k_n*e_n;
        P = (P - k_n*u_n'*P)/lambda;
        MSE(n) = e_n^2;
    end
    MSE_sum = MSE_sum + MSE;
end

MSE_avg = MSE_sum/num_runs;

figure;
plot(10*log10(MSE_avg),'LineWidth',2);
xlabel('Sample Index');
ylabel('MSE (dB)');
title('Adaptive Equalisation RLS');
grid on;
end
`;
    setCode(matlabCode);
    setCodeHtml(`<pre>${matlabCode}</pre>`);
  };

  /* ===================== RUN (FRONTEND RLS) ===================== */
  const runRLS = () => {
    setLoading(true);
    setShowPlot(false);

    const N = inputs.find(i => i.id === 'N').value;
    const L = inputs.find(i => i.id === 'L').value;
    const delay = inputs.find(i => i.id === 'delay').value;

    const numRuns = 100;
    const delta = 0.04;
    const lambda = 1;

    let MSE_sum = new Array(N - delay).fill(0);

    for (let run = 0; run < numRuns; run++) {
      let x = Array.from({ length: N }, () => Math.random() < 0.5 ? -1 : 1);
      let d = x.slice(delay).concat(new Array(delay).fill(0));

      let w = new Array(L).fill(0);
      let P = Array.from({ length: L }, (_, i) =>
        Array.from({ length: L }, (_, j) => (i === j ? 1 / delta : 0))
      );

      let MSE = new Array(N - delay).fill(0);

      for (let n = L; n < N - delay; n++) {
        let u = [];
        for (let i = 0; i < L; i++) u[i] = x[n - i];

        let Pu = P.map(r => r.reduce((s, v, i) => s + v * u[i], 0));
        let denom = lambda + u.reduce((s, v, i) => s + v * Pu[i], 0);
        let k = Pu.map(v => v / denom);

        let y = w.reduce((s, v, i) => s + v * u[i], 0);
        let e = d[n] - y;

        for (let i = 0; i < L; i++) w[i] += k[i] * e;

        let uTP = new Array(L).fill(0);
        for (let j = 0; j < L; j++)
          for (let i = 0; i < L; i++) uTP[j] += u[i] * P[i][j];

        let newP = Array.from({ length: L }, () => Array(L).fill(0));
        for (let i = 0; i < L; i++)
          for (let j = 0; j < L; j++)
            newP[i][j] = (P[i][j] - k[i] * uTP[j]) / lambda;

        P = newP;
        MSE[n] = e * e;
      }

      for (let i = 0; i < MSE.length; i++) MSE_sum[i] += MSE[i];
    }

    const MSE_dB = MSE_sum.map(v => 10 * Math.log10(v / numRuns));

    setChartData({
      labels: MSE_dB.map((_, i) => i),
      datasets: [{
        label: 'Adaptive Equalisation RLS',
        data: MSE_dB,
        borderColor: 'blue',
        borderWidth: 1.5,
        pointRadius: 0
      }]
    });

    setLoading(false);
    setShowPlot(true);
  };

  return (
    <div className="flex flex-row gap-5 space-x-5">
      <div className="flex flex-col space-y-10">
        <iframe
          srcDoc={codeHtml}
          title="Generated Code"
          width="650"
          height="262"
          className="outline border-4 p-2 rounded-sm border-blue-hover"
        />

        <div className="flex justify-between text-sm">
          <button className="bg-blue-button rounded-lg px-3 py-1 hover:bg-blue-hover mt-8">
            Download
          </button>
          <button
            className="bg-blue-button rounded-lg px-3 py-1 hover:bg-blue-hover mt-8"
            onClick={runRLS}
          >
            Submit & Run
          </button>
        </div>

        {loading && <div className="font-bold">Loading...</div>}

        {!loading && showPlot && (
          <Line
            data={chartData}
            options={{
              responsive: true,
              scales: {
                x: { title: { display: true, text: 'Sample Index' } },
                y: { title: { display: true, text: 'MSE (dB)' } }
              }
            }}
          />
        )}
      </div>

      <div className="text-sm">
        <div className="flex flex-col items-center">
          <p className="font-bold">Select the input Parameters</p>
          <div className="bg-blue-hover px-5 py-3 mt-2 rounded-xl">
            {inputs.map(input => (
              <div key={input.id} className="flex flex-col items-center">
                <label className="block mb-2">
                  <pre className="font-serif">
                    {input.min} ≤ {input.label} ≤ {input.max}
                  </pre>
                </label>
                <div className="flex flex-row items-center">
                  <input
                    type="number"
                    value={input.value}
                    onChange={e => handleInputChange(input.id, e.target.value)}
                    className="w-16 text-center border rounded-lg"
                  />
                  <input
                    type="range"
                    min={input.min}
                    max={input.max}
                    step={input.step}
                    value={input.value}
                    onChange={e => handleInputChange(input.id, e.target.value)}
                    className="flex-grow ml-2"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ✅ Generate Code button – SAME PLACE AS PREVIOUS FILES */}
        <div className="flex flex-col mt-10">
          <button
            onClick={handleGenerateCode}
            className="bg-blue-button rounded-lg px-3 py-1 hover:bg-blue-hover"
          >
            Generate Code
          </button>
        </div>
      </div>
    </div>
  );
};

export default RMS;
