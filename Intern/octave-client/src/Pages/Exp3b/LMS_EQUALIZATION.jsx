import React, { useState } from 'react'
import image from '../../image.png'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  LogarithmicScale
} from 'chart.js'

ChartJS.register(LineElement, CategoryScale, LinearScale, LogarithmicScale, PointElement, Tooltip, Legend)

/* ---------- HELPERS ---------- */
const randn = () => {
  let u = 0, v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

const LMS = () => {
  /* ---------- UI STATE (UNCHANGED) ---------- */
  const [inputs, setInputs] = useState([
    { id: 'step-size', label: 'Step-size (µ)', min: 0.001, max: 0.1, step: 0.001, value: 0.01 },
    { id: 'num-samples', label: 'Number of Samples (N)', min: 10, max: 1000, step: 10, value: 500 },
    { id: 'signal-power', label: 'Signal Power', min: 0.005, max: 0.05, step: 0.001, value: 0.01 },
    { id: 'noise-power', label: 'Noise Power', min: 0.001, max: 0.01, step: 0.001, value: 0.001 }
  ])

  const [code, setCode] = useState('')
  const [codeHtml, setCodeHtml] = useState('Code will be generated here.!')
  const [chartData, setChartData] = useState(null)

  const handleInputChange = (id, value) => {
    const input = inputs.find(i => i.id === id)
    const v = Math.min(Math.max(value, input.min), input.max)
    setInputs(inputs.map(i => i.id === id ? { ...i, value: v } : i))
  }

  /* ---------- MATLAB-IDENTICAL LMS ---------- */
  const runLMS = () => {
     if (!code) {
      alert("Please generate the code first.");
      return;
    }
    const N = inputs.find(i => i.id === 'num-samples').value
    const signal_power = inputs.find(i => i.id === 'signal-power').value
    const noise_power = inputs.find(i => i.id === 'noise-power').value
    const mu = inputs.find(i => i.id === 'step-size').value

    const h = [2, 1]

    const x = Array.from({ length: N }, () => Math.sqrt(signal_power) * randn())

    let d = Array(N).fill(0)
    for (let n = 0; n < N; n++) {
      d[n] = h[0] * x[n] + (n > 0 ? h[1] * x[n - 1] : 0)
      d[n] += Math.sqrt(noise_power) * randn()
    }

    let w0 = [0]
    let w1 = [0]
    let y = []
    let e = []

    y[0] = w0[0] * x[0]
    e[0] = d[0] - y[0]
    w0[1] = w0[0] + 2 * mu * e[0] * x[0]
    w1[1] = w1[0]

    for (let n = 1; n < N; n++) {
      y[n] = w0[n] * x[n] + w1[n] * x[n - 1]
      e[n] = d[n] - y[n]
      w0[n + 1] = w0[n] + mu * e[n] * x[n]
      w1[n + 1] = w1[n] + mu * e[n] * x[n - 1]
    }

    const mse = e.map(v => v * v)

    setChartData({
      labels: Array.from({ length: N }, (_, i) => i + 1),
      datasets: [{
        label: 'MSE',
        data: mse,
        borderColor: '#4A90E2',
        borderWidth: 1.2,
        pointRadius: 0
      }]
    })
  }

  const handleGenerateCode = () => {
    const matlabCode = `function lms_equal(N, signal_power, noise_power, mu)

h = [2 1];
x = sqrt(signal_power).*randn(1,N);
d = conv(x,h);
d = d(1:N) + sqrt(noise_power).*randn(1,N);

w0(1)=0; w1(1)=0;
y(1)=w0(1)*x(1);
e(1)=d(1)-y(1);
w0(2)=w0(1)+2*mu*e(1)*x(1);
w1(2)=w1(1);

for n=2:N
 y(n)=w0(n)*x(n)+w1(n)*x(n-1);
 e(n)=d(n)-y(n);
 w0(n+1)=w0(n)+mu*e(n)*x(n);
 w1(n+1)=w1(n)+mu*e(n)*x(n-1);
end

mse=abs(e).^2;
semilogy(1:N,mse);
end`

    setCode(matlabCode)
    setCodeHtml(`<pre>${matlabCode}</pre>`)
  }

  const handleDownload = () => {
    if (!code) {
      alert("Please generate the code first.");
      return;
    }
    
    const element = document.createElement('a')
    const file = new Blob([code], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = 'lms_equal.m'
    document.body.appendChild(element)
    element.click()
  }

  return (
    <div className='flex flex-col space-y-10'>
      <div className='flex flex-row gap-5 space-x-5'>
        <div className='flex flex-col'>
          <iframe
            srcDoc={codeHtml}
            title='Generated Code'
            width='650'
            height='262'
            className='outline border-4 p-2 rounded-sm border-blue-hover'
          />
          <div className='flex justify-between text-sm'>
            <button className='bg-blue-button rounded-lg px-3 py-1 hover:bg-blue-hover mt-8' onClick={handleDownload}>
              Download
            </button>
            <button className='bg-blue-button rounded-lg px-3 py-1 hover:bg-blue-hover mt-8' onClick={runLMS}>
              Submit & Run
            </button>
          </div>
        </div>

        <div className='text-sm'>
          <div className='flex flex-col items-center'>
            <p className='font-bold'>Select the input Parameters</p>
            <div className='bg-blue-hover px-5 py-3 mt-2 rounded-xl'>
              {inputs.map(input => (
                <div key={input.id} className='flex flex-col items-center'>
                  <label><pre className='font-serif'>{input.label}</pre></label>
                  <div className='flex flex-row items-center'>
                    <input type='number' value={input.value} onChange={e => handleInputChange(input.id, +e.target.value)} className='w-16 text-center border rounded-lg'/>
                    <input type='range' min={input.min} max={input.max} step={input.step} value={input.value} onChange={e => handleInputChange(input.id, +e.target.value)} className='ml-2'/>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button onClick={handleGenerateCode} className='bg-blue-button rounded-lg px-3 py-1 hover:bg-blue-hover mt-10'>Generate Code</button>
        </div>
      </div>

      {chartData && (
        <Line
          data={chartData}
          options={{
            responsive: true,
            scales: {
              y: { type: 'logarithmic', title: { display: true, text: 'MSE' } },
              x: { title: { display: true, text: 'Adaptation cycles' } }
            }
          }}
        />
      )}
    </div>
  )
}

export default LMS