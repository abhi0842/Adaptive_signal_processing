import React, { useState } from 'react'
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  ScatterController,
  Tooltip,
  Legend
} from 'chart.js'
import { Line, Scatter } from 'react-chartjs-2'

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  ScatterController,
  Tooltip,
  Legend
)

const matlabBlue = '#0000FF'

const matlabLineOptions = {
  responsive: true,
  animation: false,
  plugins: { legend: { display: false } },
  elements: {
    line: { tension: 0, borderWidth: 2 },
    point: { radius: 0 }
  },
  scales: {
    x: {
      grid: { display: true, color: '#bfbfbf' },
      border: { display: true }
    },
    y: {
      grid: { display: true, color: '#bfbfbf' },
      border: { display: true }
    }
  }
}

const RMS = () => {
  const [inputs, setInputs] = useState([
    { id: 'n', label: 'Number of Samples (N)', min: 100, max: 1000, step: 10, value: 200 },
    { id: 'sigma_nu', label: 'Standard Deviation (σₙᵤ)', min: 0, max: 1, step: 0.01, value: 0.1 },
    { id: 'a', label: 'Weight coefficient (a)', min: -1, max: 1, step: 0.01, value: -0.98 },
    { id: 'lambda', label: 'Forgetting Factor (λ)', min: 0.01, max: 1, step: 0.01, value: 0.99 }
  ])

  const [plots, setPlots] = useState(null)
  const [codeHtml, setCodeHtml] = useState('Code will be generated here.!')

  const handleInputChange = (id, value) => {
    const input = inputs.find(i => i.id === id)
    const v = Math.min(Math.max(+value, input.min), input.max)
    setInputs(inputs.map(i => i.id === id ? { ...i, value: v } : i))
  }

  /* ---------- MATLAB LOGIC ---------- */
  const runRLS = () => {
    const n = inputs.find(i => i.id === 'n').value
    const sigma = inputs.find(i => i.id === 'sigma_nu').value
    const a = inputs.find(i => i.id === 'a').value
    const lambda = inputs.find(i => i.id === 'lambda').value
    const MC = 100

    const temp = Array.from({ length: MC }, () => Array(n).fill(0))
    const temp1 = Array.from({ length: MC }, () => Array(n).fill(0))

    let u_last = []

    for (let k = 0; k < MC; k++) {
      let u = Array(n).fill(0)
      for (let i = 1; i < n; i++) {
        u[i] = a * u[i - 1] + sigma * Math.random()
      }

      const mean = u.reduce((s, v) => s + v, 0) / n
      const variance = u.reduce((s, v) => s + (v - mean) ** 2, 0) / n
      u = u.map(v => v * Math.sqrt(1 / variance))
      u_last = u

      let w = Array(n).fill(0)
      let P = 1 / 0.1

      for (let j = 1; j < n; j++) {
        const phi = u[j - 1]
        const k_rls = (P * phi) / (lambda + phi * P * phi)
        const e = u[j] - w[j - 1] * phi
        w[j] = w[j - 1] + k_rls * e
        P = (P - k_rls * phi * P) / lambda

        temp[k][j] = (w[j] - a) ** 2
        temp1[k][j] = w[j]
      }
    }

    const mse = Array(n).fill(0)
    const rndwalk = Array(n).fill(0)
    for (let j = 0; j < n; j++) {
      for (let k = 0; k < MC; k++) {
        mse[j] += temp[k][j]
        rndwalk[j] += temp1[k][j]
      }
      mse[j] /= MC
      rndwalk[j] /= MC
    }

    setPlots({
      u: u_last,
      mse,
      rndwalk,
      A: Array(n).fill(a)
    })
  }

  /* ---------- GENERATE MATLAB CODE ---------- */
  const handleGenerateCode = () => {
    setCodeHtml(`<pre>
function predictor_rls(n, sigma_nu, a, lambda)
A = a * ones(1,n);
temp = zeros(100,n);
temp1 = zeros(100,n);

for k=1:100
 u=zeros(1,n);
 nu=sigma_nu*randn(1,n);
 for i=2:n
  u(i)=a*u(i-1)+nu(i);
 end
 u=sqrt(1/var(u))*u;

 w=zeros(1,n);
 P=1/0.1;

 for j=2:n
  phi=u(j-1);
  k_rls=P*phi/(lambda+phi'*P*phi);
  e=u(j)-w(j-1)*phi;
  w(j)=w(j-1)+k_rls'*e;
  P=(P-k_rls*phi'*P)/lambda;

  temp(k,j)=(w(j)-a)^2;
  temp1(k,j)=w(j);
 end
end

mse=sum(temp)/100;
rndwalk=sum(temp1)/100;

figure; stem(u); title('Desired Output')
figure; plot(mse); title('Learning Curve')
figure; plot(A); hold on; plot(rndwalk); title('Random Walk')
end
</pre>`)
  }

  return (
    <div className="flex flex-col space-y-10">
      <div className="flex flex-row gap-5">
        <div>
          <iframe srcDoc={codeHtml} width="650" height="260"
            className="border-4 p-2 rounded-sm border-blue-hover" />
          <div className="flex justify-between mt-6">
            <button className="bg-blue-button px-3 py-1" onClick={handleGenerateCode}>
              Generate Code
            </button>
            <button className="bg-blue-button px-3 py-1" onClick={runRLS}>
              Submit & Run
            </button>
          </div>
        </div>

        <div className="bg-blue-hover p-4 rounded-xl">
          {inputs.map(i => (
            <div key={i.id} className="my-3">
              <label>{i.label}</label>
              <input type="range" {...i}
                onChange={e => handleInputChange(i.id, e.target.value)} />
            </div>
          ))}
        </div>
      </div>

      {plots && (
        <>
          <Scatter
            data={{
              datasets: [{
                data: plots.u.map((y, x) => ({ x, y })),
                backgroundColor: matlabBlue,
                pointRadius: 2
              }]
            }}
            options={{ animation: false }}
          />

          <Line
            data={{ labels: plots.mse.map((_, i) => i),
              datasets: [{ data: plots.mse, borderColor: matlabBlue }] }}
            options={matlabLineOptions}
          />

          <Line
            data={{
              labels: plots.A.map((_, i) => i),
              datasets: [
                { data: plots.A, borderColor: matlabBlue },
                { data: plots.rndwalk, borderColor: matlabBlue }
              ]
            }}
            options={matlabLineOptions}
          />
        </>
      )}
    </div>
  )
}

export default RMS
