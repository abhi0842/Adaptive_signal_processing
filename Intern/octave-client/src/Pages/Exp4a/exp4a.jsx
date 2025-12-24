import React, { useState, useRef } from 'react';
import image from '../../image.png';
import {
  Chart as ChartJS,
  LineElement,
  LinearScale,
  CategoryScale,
  PointElement
} from 'chart.js';

ChartJS.register(LineElement, LinearScale, CategoryScale, PointElement);

const LMSPrediction = () => {

  /* ======================= UI STATE (UNCHANGED) ======================= */
  const fileOptions = [
    { name: 'Arabian Mystery (Mic Recording)', file: 'arabian_mystery.wav' },
    { name: 'Christmas Tune (Studio)', file: 'christmas.wav' },
    { name: 'Drum Roll (Noisy Room)', file: 'drum roll.wav' },
    { name: 'Echo Effect (Mic Recording)', file: 'echo.wav' },
    { name: 'Guitar Solo (Studio)', file: 'guitar.wav' },
    { name: 'Indian Flute (Noisy Room)', file: 'indian flute.wav' },
    { name: 'Melodical Flute (Mic Recording)', file: 'melodical flute.wav' },
    { name: 'Noise Sample (Studio)', file: 'noise.wav' },
    { name: 'Piano Melody (Noisy Room)', file: 'piano.wav' },
    { name: 'Trumpet Blast (Mic Recording)', file: 'trumpet.wav' },
    { name: 'Voice Recording (Studio)', file: 'voice.wav' },
    { name: 'Violin Solo (Noisy Room)', file: 'violin.wav' },
    { name: 'Violin Jingle (Noisy Room)', file: 'violin jingle.wav' }
  ];

  const [selectedFile, setSelectedFile] = useState(fileOptions[0].file);
  const [selectedFeature, setSelectedFeature] = useState('MAX');

  const [inputs, setInputs] = useState([
    { id: 'sampling-rate', label: 'Sampling Rate (Hz)', min: 8000, max: 48000, step: 1000, value: 16000 },
    { id: 'frame-length', label: 'Frame Length (samples)', min: 1, max: 10000, step: 1, value: 1024 },
    { id: 'hop-length', label: 'Hop Length (samples)', min: 1, max: 10000, step: 1, value: 512 }
  ]);

  const [codeHtml, setCodeHtml] = useState('Code will be generated here.!');
  const [imageUrls, setImageUrls] = useState([image, image]);
  const [showImages, setShowImages] = useState(false);

  const canvasRef = useRef(null);

  /* ======================= HELPERS ======================= */

  const getInput = (id) => inputs.find(i => i.id === id).value;

  const handleInputChange = (id, value) => {
    setInputs(inputs.map(i => i.id === id ? { ...i, value: Number(value) } : i));
  };

  /* ======================= AUDIO LOAD ======================= */

  const loadAudio = async () => {
    const res = await fetch(`/inputs/${selectedFile}`);
    const buffer = await res.arrayBuffer();
    const ctx = new AudioContext();
    const decoded = await ctx.decodeAudioData(buffer);
    return { data: decoded.getChannelData(0), sr: ctx.sampleRate };
  };

  /* ======================= DSP (PYTHON IDENTICAL) ======================= */

  const amplitudeEnvelope = (signal, frame, hop, feature) => {
    const out = [];
    for (let i = 0; i < signal.length; i += hop) {
      const slice = signal.slice(i, i + frame);
      if (!slice.length) continue;

      let v = 0;
      if (feature === 'MAX') v = Math.max(...slice);
      else if (feature === 'MIN') v = Math.min(...slice);
      else if (feature === 'MEAN') v = slice.reduce((a, b) => a + b, 0) / slice.length;
      else if (feature === 'MEDIAN') {
        const s = [...slice].sort((a, b) => a - b);
        v = s[Math.floor(s.length / 2)];
      }
      out.push(v);
    }
    return out;
  };

  /* ======================= CANVAS → IMAGE ======================= */

  const plotToImage = (drawFn) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawFn(ctx);
    return canvas.toDataURL();
  };

  /* ======================= RUN (REPLACES BACKEND) ======================= */

  const handleRun = async () => {

    const { data, sr } = await loadAudio();
    const frame = getInput('frame-length');
    const hop = getInput('hop-length');

    const env = amplitudeEnvelope(data, frame, hop, selectedFeature);

    /* Input waveform plot */
    const img1 = plotToImage(ctx => {
      ctx.strokeStyle = 'magenta';
      ctx.beginPath();
      const canvasWidth = 800;
const step = 1; // or smaller if needed
for (let i = 0; i < data.length; i += step) {
  const x = (i / data.length) * canvasWidth;
  const y = 200 - data[i] * 180;
  ctx.lineTo(x, y);
}

      ctx.stroke();
    });

    /* Envelope plot */
    const img2 = plotToImage(ctx => {
      ctx.strokeStyle = 'red';
      ctx.beginPath();
      env.forEach((v, i) => {
        const x = (i / env.length) * 800;
        const y = 200 - v * 180;
        ctx.lineTo(x, y);
      });
      ctx.stroke();
    });

    setImageUrls([img1, img2]);
    setShowImages(true);
  };

  /* ======================= UI (100% SAME) ======================= */

  return (
    <div className='flex flex-row gap-5 justify-between space-x-5'>
      <canvas ref={canvasRef} width={800} height={400} hidden />

      {/* LEFT */}
      <div className="flex flex-col space-y-10">
        <iframe
          srcDoc={codeHtml}
          title="Generated Code"
          width="750"
          height="300"
          className='outline border-4 p-2 rounded-sm border-blue-hover'
        />

        <div className='flex justify-between'>
          <button className="bg-blue-button rounded-lg px-3 py-1 hover:bg-blue-hover mt-8">
            Download
          </button>
          <button className="bg-blue-button rounded-lg px-3 py-1 hover:bg-blue-hover mt-8" onClick={handleRun}>
            Submit & Run
          </button>
        </div>

        {showImages && (
          <div className='flex flex-col items-center mt-5'>
            {imageUrls.map((url, i) => (
              <img key={i} src={url} alt={`Output ${i}`} className="rounded shadow" />
            ))}
          </div>
        )}
      </div>

      {/* RIGHT */}
      <div className="text-sm">
        <div className="flex flex-col mb-6">
    <p className="mb-2 font-bold">Select Audio File (.wav)</p>
    <select
      onChange={e => setSelectedFile(e.target.value)}
      value={selectedFile}
      className="bg-white border border-black rounded-lg px-3 py-1"
    >
      {fileOptions.map((f, i) => (
        <option key={i} value={f.file}>{f.name}</option>
      ))}
    </select>
  </div>

  {/* Input parameters */}
  <div className='flex flex-col mt-8 items-center'>
    <p className='font-bold'>Select the Input Parameters</p>

    <div className='bg-blue-hover px-5 py-3 mt-2 rounded-xl'>
      {inputs.map(input => (
        <div key={input.id} className="flex flex-col items-center mb-4">

          <label htmlFor={input.id} className="block mb-2">
            <pre className='font-serif text-black'>
              <span>{input.min} ≤ </span>
              {input.label}
              <span> ≤ {input.max}</span>
            </pre>
          </label>

          <div className="flex flex-row items-center gap-2">

            <input
              type="number"
              id={input.id}
              min={input.min}
              max={input.max}
              step={input.step}
              value={input.value}
              onChange={(e) => handleInputChange(input.id, e.target.value)}
              className="w-16 text-center border border-gray-300 rounded-lg py-1
                         focus:outline-none bg-white text-black"
            />

            <input
              type="range"
              min={input.min}
              max={input.max}
              step={input.step}
              value={input.value}
              onChange={(e) => handleInputChange(input.id, e.target.value)}
              className="flex-grow"
            />

          </div>
        </div>
      ))}
    </div>
  </div>

  {/* Feature selector */}
  <div className="mt-6 text-center">
    <label className="font-bold block mb-2">Select Feature</label>
    <select
      value={selectedFeature}
      onChange={e => setSelectedFeature(e.target.value)}
      className="bg-white border border-black rounded-lg px-3 py-1"
    >
      <option>MAX</option>
      <option>MIN</option>
      <option>MEAN</option>
      <option>MEDIAN</option>
    </select>
  </div>

</div>
    </div>
  );
};

export default LMSPrediction;
