import React, { useState, useRef, useEffect } from 'react';

const LMSPrediction = () => {

  /* ======================= UI STATE ======================= */
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
    { name: 'Violin Solo (Noisy Room)', file: 'voilin.wav' },
    { name: 'Violin Jingle (Noisy Room)', file: 'voilin jingle.wav' }
  ];

  const [selectedFile, setSelectedFile] = useState(fileOptions[0].file);
  const [selectedFeature, setSelectedFeature] = useState('MAX');
  const [isProcessing, setIsProcessing] = useState(false);

  const [inputs, setInputs] = useState([
    { id: 'sampling-rate', label: 'Sampling Rate', unit: 'Hz', min: 8000, max: 48000, step: 1000, value: 16000 },
    { id: 'frame-length', label: 'Frame Length', unit: 'samples', min: 1, max: 10000, step: 1, value: 1024 },
    { id: 'hop-length', label: 'Hop Length', unit: 'samples', min: 1, max: 10000, step: 1, value: 512 }
  ]);

  const [imageUrls, setImageUrls] = useState([]);
  const [showImages, setShowImages] = useState(false);
  const [audioInfo, setAudioInfo] = useState(null);

  const canvasRef = useRef(null);

  /* ======================= HELPERS ======================= */

  const getInput = (id) => inputs.find(i => i.id === id).value;

  const handleInputChange = (id, value) => {
    setInputs(inputs.map(i => i.id === id ? { ...i, value: Number(value) } : i));
  };

  /* ======================= AUDIO LOAD & RESAMPLE ======================= */

  const loadAudio = async () => {
    const res = await fetch(`/inputs/${selectedFile}`);
    const buffer = await res.arrayBuffer();
    const ctx = new AudioContext();
    const decoded = await ctx.decodeAudioData(buffer);
    const originalSR = decoded.sampleRate;
    const targetSR = getInput('sampling-rate');
    
    let audioData = decoded.getChannelData(0);
    
    if (originalSR !== targetSR) {
      audioData = resample(audioData, originalSR, targetSR);
    }
    
    return { data: audioData, sr: targetSR };
  };

  const resample = (data, fromSR, toSR) => {
    const ratio = fromSR / toSR;
    const newLength = Math.floor(data.length / ratio);
    const resampled = new Float32Array(newLength);
    
    for (let i = 0; i < newLength; i++) {
      const srcIndex = i * ratio;
      const index0 = Math.floor(srcIndex);
      const index1 = Math.min(index0 + 1, data.length - 1);
      const frac = srcIndex - index0;
      
      resampled[i] = data[index0] * (1 - frac) + data[index1] * frac;
    }
    
    return resampled;
  };

  /* ======================= DSP ======================= */

  const amplitudeEnvelope = (signal, frame, hop, feature) => {
    const out = [];
    for (let i = 0; i < signal.length; i += hop) {
      const slice = signal.slice(i, i + frame);
      if (!slice.length) continue;

      let v = 0;
      if (feature === 'MAX') {
        v = Math.max(...slice);
      } else if (feature === 'MIN') {
        v = Math.min(...slice);
      } else if (feature === 'MEAN') {
        v = slice.reduce((a, b) => a + b, 0) / slice.length;
      } else if (feature === 'MEDIAN') {
        const s = [...slice].sort((a, b) => a - b);
        v = s[Math.floor(s.length / 2)];
      }
      out.push(v);
    }
    return out;
  };

  /* ======================= DISPLAY DOWNSAMPLING ======================= */
  
  const downsampleForDisplay = (data, targetPoints = 2000) => {
    if (data.length <= targetPoints) {
      return Array.from(data);
    }
    
    const downsampled = [];
    const blockSize = Math.floor(data.length / targetPoints);
    
    for (let i = 0; i < targetPoints; i++) {
      const start = i * blockSize;
      const end = Math.min(start + blockSize, data.length);
      const block = data.slice(start, end);
      
      const maxVal = Math.max(...block);
      const minVal = Math.min(...block);
      
      downsampled.push({ x: i, max: maxVal, min: minVal });
    }
    
    return downsampled;
  };

  /* ======================= PLOTTING WITH GRID ======================= */

  const drawGrid = (ctx, canvasWidth, canvasHeight, plotTop, plotBottom) => {
    const plotHeight = plotBottom - plotTop;
    const plotCenter = plotTop + plotHeight / 2;
    
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    
    // Horizontal grid lines
    for (let i = -1; i <= 1; i += 0.5) {
      const y = plotCenter - (i * plotHeight / 2);
      ctx.beginPath();
      ctx.moveTo(60, y);
      ctx.lineTo(canvasWidth - 20, y);
      ctx.stroke();
    }
    
    ctx.setLineDash([]);
    
    // Center line (y=0) - darker
    ctx.strokeStyle = '#9ca3af';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(60, plotCenter);
    ctx.lineTo(canvasWidth - 20, plotCenter);
    ctx.stroke();
    
    // Y-axis labels
    ctx.fillStyle = '#6b7280';
    ctx.font = '11px system-ui';
    ctx.textAlign = 'right';
    ctx.fillText('1.0', 50, plotTop + 5);
    ctx.fillText('0.5', 50, plotTop + plotHeight / 4 + 5);
    ctx.fillText('0.0', 50, plotCenter + 5);
    ctx.fillText('-0.5', 50, plotBottom - plotHeight / 4 + 5);
    ctx.fillText('-1.0', 50, plotBottom + 5);
  };

  const plotWaveform = (data, title, color, ctx, canvasWidth, canvasHeight) => {
    // Background with subtle gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
    gradient.addColorStop(0, '#fafafa');
    gradient.addColorStop(1, '#f5f5f5');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // Title
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 18px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText(title, 20, 35);
    
    // Subtitle
    ctx.font = '13px system-ui';
    ctx.fillStyle = '#6b7280';
    ctx.fillText('Amplitude vs Time', 20, 55);
    
    const plotTop = 80;
    const plotBottom = canvasHeight - 60;
    const plotHeight = plotBottom - plotTop;
    const plotCenter = plotTop + plotHeight / 2;
    
    // Draw grid
    drawGrid(ctx, canvasWidth, canvasHeight, plotTop, plotBottom);
    
    // Y-axis label
    ctx.save();
    ctx.translate(15, plotCenter);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 12px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Amplitude', 0, 0);
    ctx.restore();
    
    // Draw waveform
    const downsampled = downsampleForDisplay(data, Math.floor(canvasWidth * 1.5));
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.8;
    
    ctx.beginPath();
    downsampled.forEach((point, i) => {
      const x = 60 + ((i / downsampled.length) * (canvasWidth - 80));
      const yMax = plotCenter - (point.max * plotHeight / 2);
      const yMin = plotCenter - (point.min * plotHeight / 2);
      
      ctx.moveTo(x, yMax);
      ctx.lineTo(x, yMin);
    });
    ctx.stroke();
    ctx.globalAlpha = 1.0;
    
    // X-axis label
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 12px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Time', canvasWidth / 2, canvasHeight - 20);
  };

  const plotEnvelopeOverWaveform = (waveform, envelope, hop, title, featureName, ctx, canvasWidth, canvasHeight) => {
    // Background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
    gradient.addColorStop(0, '#fafafa');
    gradient.addColorStop(1, '#f5f5f5');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // Title
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 18px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText(title, 20, 35);
    
    // Subtitle with feature
    ctx.font = '13px system-ui';
    ctx.fillStyle = '#6b7280';
    ctx.fillText(`Feature: ${featureName} Envelope`, 20, 55);
    
    const plotTop = 80;
    const plotBottom = canvasHeight - 60;
    const plotHeight = plotBottom - plotTop;
    const plotCenter = plotTop + plotHeight / 2;
    
    // Draw grid
    drawGrid(ctx, canvasWidth, canvasHeight, plotTop, plotBottom);
    
    // Y-axis label
    ctx.save();
    ctx.translate(15, plotCenter);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 12px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Amplitude', 0, 0);
    ctx.restore();
    
    // Draw waveform background
    const downsampledWave = downsampleForDisplay(waveform, Math.floor(canvasWidth * 1.5));
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.3;
    
    ctx.beginPath();
    downsampledWave.forEach((point, i) => {
      const x = 60 + ((i / downsampledWave.length) * (canvasWidth - 80));
      const yMax = plotCenter - (point.max * plotHeight / 2);
      const yMin = plotCenter - (point.min * plotHeight / 2);
      
      ctx.moveTo(x, yMax);
      ctx.lineTo(x, yMin);
    });
    ctx.stroke();
    ctx.globalAlpha = 1.0;
    
    // Draw envelope on top
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 3;
    ctx.shadowColor = 'rgba(220, 38, 38, 0.3)';
    ctx.shadowBlur = 4;
    
    ctx.beginPath();
    envelope.forEach((v, i) => {
      const x = 60 + ((i / envelope.length) * (canvasWidth - 80));
      const y = plotCenter - (v * plotHeight / 2);
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();
    
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    
    // Legend
    const legendX = canvasWidth - 200;
    const legendY = plotTop + 20;
    
    // Waveform legend
    ctx.fillStyle = '#06b6d4';
    ctx.globalAlpha = 0.3;
    ctx.fillRect(legendX, legendY, 20, 3);
    ctx.globalAlpha = 1.0;
    ctx.fillStyle = '#374151';
    ctx.font = '12px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('Waveform', legendX + 30, legendY + 4);
    
    // Envelope legend
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(legendX, legendY + 20, 20, 3);
    ctx.fillStyle = '#374151';
    ctx.fillText(`${featureName} Envelope`, legendX + 30, legendY + 24);
    
    // X-axis label
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 12px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Time', canvasWidth / 2, canvasHeight - 20);
  };

  /* ======================= RUN ======================= */

  const handleRun = async () => {
    setIsProcessing(true);
    setShowImages(false);
    
    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      // Responsive canvas size
      const canvasWidth = Math.min(1400, window.innerWidth - 100);
      const canvasHeight = 500;
      
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      const { data, sr } = await loadAudio();
      const frame = getInput('frame-length');
      const hop = getInput('hop-length');

      const env = amplitudeEnvelope(data, frame, hop, selectedFeature);

      setAudioInfo({
        samples: data.length,
        duration: (data.length / sr).toFixed(2),
        frames: env.length
      });

      /* Plot 1: Input waveform */
      plotWaveform(
        data,
        `Input Waveform: ${selectedFile}`,
        '#ec4899',
        ctx,
        canvasWidth,
        canvasHeight
      );
      const img1 = canvas.toDataURL('image/png', 1.0);

      /* Plot 2: Envelope overlay */
      plotEnvelopeOverWaveform(
        data,
        env,
        hop,
        `Amplitude Envelope Analysis: ${selectedFile}`,
        selectedFeature,
        ctx,
        canvasWidth,
        canvasHeight
      );
      const img2 = canvas.toDataURL('image/png', 1.0);

      setImageUrls([img1, img2]);
      setShowImages(true);
    } catch (error) {
      console.error('Error processing audio:', error);
      alert('Error processing audio. Please check the file and parameters.');
    } finally {
      setIsProcessing(false);
    }
  };

  /* ======================= UI ======================= */

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-8">
      <canvas ref={canvasRef} width={1400} height={500} className="hidden" />
      
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-2">
          Audio Amplitude Envelope Analyzer
        </h1>
        <p className="text-slate-600 text-lg">
          Extract and visualize amplitude envelope features from audio signals
        </p>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* RIGHT PANEL - Controls */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* File Selection Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-800">Audio File</h3>
            </div>
            
            <select
              onChange={e => setSelectedFile(e.target.value)}
              value={selectedFile}
              className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 text-slate-700 
                       hover:border-blue-400 focus:border-blue-500 focus:outline-none focus:ring-2 
                       focus:ring-blue-200 transition-all cursor-pointer"
            >
              {fileOptions.map((f, i) => (
                <option key={i} value={f.file}>{f.name}</option>
              ))}
            </select>
          </div>

          {/* Parameters Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-800">Parameters</h3>
            </div>

            <div className="space-y-6">
              {inputs.map(input => (
                <div key={input.id} className="space-y-3">
                  <div className="flex justify-between items-baseline">
                    <label className="text-sm font-semibold text-slate-700">
                      {input.label}
                    </label>
                    <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-600">
                      {input.value} {input.unit}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={input.min}
                      max={input.max}
                      step={input.step}
                      value={input.value}
                      onChange={(e) => handleInputChange(input.id, e.target.value)}
                      className="flex-grow h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer
                               accent-blue-500 hover:accent-blue-600"
                      style={{
                        background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((input.value - input.min) / (input.max - input.min)) * 100}%, #e2e8f0 ${((input.value - input.min) / (input.max - input.min)) * 100}%, #e2e8f0 100%)`
                      }}
                    />

                    <input
                      type="number"
                      min={input.min}
                      max={input.max}
                      step={input.step}
                      value={input.value}
                      onChange={(e) => handleInputChange(input.id, e.target.value)}
                      className="w-24 text-center border-2 border-slate-200 rounded-lg py-2 px-3
                               focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 
                               bg-white text-slate-700 font-mono text-sm"
                    />
                  </div>

                  <div className="flex justify-between text-xs text-slate-500">
                    <span>{input.min}</span>
                    <span>{input.max}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Feature Selection Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-800">Feature Type</h3>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {['MAX', 'MIN', 'MEAN', 'MEDIAN'].map(feature => (
                <button
                  key={feature}
                  onClick={() => setSelectedFeature(feature)}
                  className={`py-3 px-4 rounded-xl font-semibold transition-all ${
                    selectedFeature === feature
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg scale-105'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {feature}
                </button>
              ))}
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleRun}
            disabled={isProcessing}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 
                     hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg 
                     hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 
                     disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
          >
            {isProcessing ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Analyze Audio
              </>
            )}
          </button>

          {/* Audio Info */}
          {audioInfo && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200">
              <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Processing Info
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Total Samples:</span>
                  <span className="font-mono font-semibold text-slate-800">{audioInfo.samples.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Duration:</span>
                  <span className="font-mono font-semibold text-slate-800">{audioInfo.duration}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Envelope Frames:</span>
                  <span className="font-mono font-semibold text-slate-800">{audioInfo.frames.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* LEFT PANEL - Results */}
        <div className="lg:col-span-2 space-y-6">
          
          {!showImages ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 border border-slate-200 flex flex-col items-center justify-center min-h-[600px]">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-700 mb-2">Ready to Analyze</h3>
              <p className="text-slate-500 text-center max-w-md">
                Select your audio file, adjust parameters, and click "Analyze Audio" to generate visualizations
              </p>
            </div>
          ) : (
            <>
              {imageUrls.map((url, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-slate-800">
                      {i === 0 ? '📊 Input Waveform' : '📈 Amplitude Envelope Analysis'}
                    </h3>
                    <button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.download = `${selectedFile.split('.')[0]}_${i === 0 ? 'waveform' : 'envelope'}.png`;
                        link.href = url;
                        link.click();
                      }}
                      className="text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 
                               rounded-lg font-semibold transition-all flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download
                    </button>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4 overflow-x-auto">
                    <img 
                      src={url} 
                      alt={`Output ${i}`} 
                      className="w-full h-auto rounded-lg shadow-sm" 
                    />
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LMSPrediction;