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
  Legend
} from 'chart.js'

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend)

/* ---------- COMPLEX MATH HELPERS ---------- */
const C = (re, im = 0) => ({ re, im })
const cadd = (a, b) => C(a.re + b.re, a.im + b.im)
const csub = (a, b) => C(a.re - b.re, a.im - b.im)
const cmul = (a, b) => C(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re)
const cconj = a => C(a.re, -a.im)
const cabs2 = a => a.re * a.re + a.im * a.im

const randn = () => {
  let u = 0, v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
}

const MVDR = () => {

  /* ---------- UI STATE (UNCHANGED) ---------- */
  const [inputs, setInputs] = useState([
    { id: 'num-antennas', label: 'Number of antennas (N)', min: 8, max: 12, step: 1, value: 10 },
    { id: 'theta-s', label: 'DOA of signal (θ_s)', min: 0, max: 90, step: 1, value: 45 },
    { id: 'theta-i', label: 'DOA of interference (θ_i)', min: -90, max: 0, step: 1, value: -45 },
    { id: 'num-snapshots', label: 'Number of snapshots (ss)', min: 1024, max: 8192, step: 1, value: 4096 },
    { id: 'snr-snr', label: 'SNR (dB)', min: 0, max: 40, step: 1, value: 20 },
    { id: 'snr-inr', label: 'INR (dB)', min: 10, max: 40, step: 1, value: 25 },
    { id: 'num-runs', label: 'Number of Monte Carlo runs (num_runs)', min: 10, max: 100, step: 1, value: 50 }
  ])

  const [codeHtml, setCodeHtml] = useState('')
  const [codeGenerated, setCodeGenerated] = useState(false)
  const [chartData, setChartData] = useState(null)

  const handleInputChange = (id, value) => {
    const input = inputs.find(i => i.id === id)
    const v = Math.min(Math.max(value, input.min), input.max)
    setInputs(inputs.map(i => i.id === id ? { ...i, value: v } : i))
  }

  /* ---------- CORE MATLAB-IDENTICAL LOGIC ---------- */
  const runMVDR = () => {

    /* ---- CONDITION ADDED ---- */
    if (!codeGenerated) {
      alert("Please generate the code first.")
      return
    }

    const N = inputs.find(i => i.id === 'num-antennas').value
    const theta_s = inputs.find(i => i.id === 'theta-s').value * Math.PI / 180
    const theta_i = inputs.find(i => i.id === 'theta-i').value * Math.PI / 180
    const ss = inputs.find(i => i.id === 'num-snapshots').value
    const snr = inputs.find(i => i.id === 'snr-snr').value
    const inr = inputs.find(i => i.id === 'snr-inr').value
    const num_runs = inputs.find(i => i.id === 'num-runs').value

    const phi = Array.from({ length: 180 }, (_, i) => i - 89)
    let Gsum = Array(180).fill(0)

    for (let run = 0; run < num_runs; run++) {

      let S = [
        Array.from({ length: ss }, () => cmul(C(Math.pow(10, snr / 10)), C(randn(), randn()))),
        Array.from({ length: ss }, () => cmul(C(Math.pow(10, inr / 10)), C(randn(), randn())))
      ]

      const As = Array.from({ length: N }, (_, k) =>
        C(Math.cos(-Math.PI * k * Math.sin(theta_s)), Math.sin(-Math.PI * k * Math.sin(theta_s)))
      )

      const Ai = Array.from({ length: N }, (_, k) =>
        C(Math.cos(-Math.PI * k * Math.sin(theta_i)), Math.sin(-Math.PI * k * Math.sin(theta_i)))
      )

      let X = Array.from({ length: ss }, () => Array(N).fill(C(0, 0)))

      for (let t = 0; t < ss; t++) {
        for (let k = 0; k < N; k++) {
          let v = cmul(As[k], S[0][t])
          v = cadd(v, cmul(Ai[k], S[1][t]))
          v = cadd(v, C(randn(), randn()))
          X[t][k] = v
        }
      }

      let Wx = As.map(a => cmul(cconj(a), C(Math.pow(2, 10))))
      const u = Math.pow(2, -15)

      let dataout = Array(ss).fill(C(0, 0))
      dataout[0] = cmul(
        Wx.reduce((s, w, k) => cadd(s, cmul(w, X[0][k])), C(0, 0)),
        C(1 / Math.pow(2, 14))
      )

      for (let i = 0; i < ss - 1; i++) {
        for (let k = 1; k < N; k++) {
          Wx[k] = csub(Wx[k], cmul(C(u), cmul(cconj(X[i][k]), dataout[i])))
        }
        dataout[i + 1] = cmul(
          Wx.reduce((s, w, k) => cadd(s, cmul(w, X[i + 1][k])), C(0, 0)),
          C(1 / Math.pow(2, 15))
        )
      }

      phi.forEach((p, idx) => {
        const ang = p * Math.PI / 180
        let F = C(0, 0)
        for (let k = 0; k < N; k++) {
          const a = C(Math.cos(-Math.PI * k * Math.sin(ang)), Math.sin(-Math.PI * k * Math.sin(ang)))
          F = cadd(F, cmul(Wx[k], a))
        }
        Gsum[idx] += 10 * Math.log10(cabs2(F))
      })
    }

    const Gavg = Gsum.map(v => v / num_runs)
    const maxG = Math.max(...Gavg)
    const GdB = Gavg.map(v => v - maxG)

    setChartData({
  labels: phi,
  datasets: [{
    label: 'd = λ/2',
    data: GdB,

    /* ---- STYLE FIX (THIN + BLUE) ---- */
    borderColor: '#4A90E2',      // light blue
    backgroundColor: 'transparent',
    borderWidth: 1.2,            // thinner line
    pointRadius: 0,              // no dots (MATLAB-like)
    tension: 0                   // straight lines (no smoothing)
  }]
})

  }

  const downloadCode = () => {
    if (!codeGenerated) {
      alert("Please generate the code first.")
      return
    }

    const blob = new Blob([codeHtml], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'mvdr_code.html'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-row gap-5 space-x-5">

      {/* ---------- LEFT PANEL (UNCHANGED UI) ---------- */}
      <div className='flex flex-col space-y-10'>
        <div className='flex flex-col'>
          <iframe
            srcDoc={codeHtml}
            title="Generated Code"
            width="650"
            height="262"
            className='outline border-4 p-2 rounded-sm border-blue-hover'
          />
          <div className='flex justify-between text-sm'>
            <button
              className="bg-blue-button rounded-lg px-3 py-1 hover:bg-blue-hover mt-8"
              onClick={downloadCode}
            >
              Download
            </button>

            <button
              className="bg-blue-button rounded-lg px-3 py-1 hover:bg-blue-hover mt-8"
              onClick={runMVDR}
            >
              Submit & Run
            </button>
          </div>
        </div>

        {chartData && <Line data={chartData} />}
      </div>

      {/* ---------- RIGHT PANEL (UNCHANGED UI) ---------- */}
      <div className="text-sm">
        <div className='flex flex-col items-center'>
          <p className='font-bold'>Select the input Parameters</p>
          <div className='bg-blue-hover px-5 py-3 mt-2 rounded-xl'>
            {inputs.map(input => (
              <div key={input.id} className="flex flex-col items-center">
                <label>
                  <pre className='font-serif'>
                    <span>{input.min} ≤ </span>{input.label}<span> ≤ {input.max}</span>
                  </pre>
                </label>
                <div className="flex flex-row items-center">
                  <input
                    type="number"
                    value={input.value}
                    onChange={e => handleInputChange(input.id, +e.target.value)}
                    className="w-16 text-center border rounded-lg"
                  />
                  <input
                    type="range"
                    min={input.min}
                    max={input.max}
                    step={input.step}
                    value={input.value}
                    onChange={e => handleInputChange(input.id, +e.target.value)}
                    className="ml-2"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => {
            setCodeHtml('<pre>MATLAB-equivalent MVDR + LMS (Frontend)</pre>')
            setCodeGenerated(true)
          }}
          className="bg-blue-button rounded-lg px-3 py-1 hover:bg-blue-hover mt-10"
        >
          Generate Code
        </button>
      </div>
    </div>
  )
}

export default MVDR
