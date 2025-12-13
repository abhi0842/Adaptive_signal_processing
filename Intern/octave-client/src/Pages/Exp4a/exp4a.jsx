import React, { useState } from 'react';
import axios from 'axios';
import image from '../../image.png';

const LMSPrediction = () => {
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

  const [code, setCode] = useState('');
  const [codeHtml, setCodeHtml] = useState('Code will be generated here.!');
  const [imageUrls, setImageUrls] = useState(new Array(5).fill(image));
  const [loading, setLoading] = useState(false);
  const [showImages, setShowImages] = useState(false);

  const handleFileChange = (file) => setSelectedFile(file);

  const handleInputChange = (id, value) => {
    const newValue = Math.min(Math.max(Number(value), inputs.find(input => input.id === id).min), inputs.find(input => input.id === id).max);
    setInputs(inputs.map(input => input.id === id ? { ...input, value: newValue } : input));
  };

  const handleGenerateCode = () => {
    const generatedCode = `
import Amplitude_Envelope_Features_Extract as AMPENV
import AMPLITUDE_ENVELOPE_PLOT as AMPPLOT
import librosa
import sys
import argparse
import os

if __name__ == "__main__":
    # Paths
    input_file = os.path.join('inputs' \
    '', args.file)
    output_dir = 'outputs'
    os.makedirs(output_dir, exist_ok=True)
    output_file = os.path.join(output_dir, f'amplitude_envelope_{args.unique_id}.png')

    print(f"\nAudio file selected is :: {args.file}")

    # Load audio file
    input_audio, sr = librosa.load(input_file, sr=args.sr)
    sample_duration = 1 / sr
    tot_samples = len(input_audio)

    print(f"\nSampling Rate used for the audio file {args.file} :: {sr}")
    print(f"\nFrame Length selected for the audio file {args.file} :: {args.frame}")
    print(f"\nHop Length used for the audio file {args.file} :: {args.hop}")
    print(f"\nOne sample lasts for {sample_duration:6f} seconds")
    print(f"\nTotal number of samples in the audio file is::{tot_samples}")
    print(f"\nFeature Selected in the audio file is::{args.feature}")

    # Compute amplitude envelope feature
    amp_env_feat1 = AMPENV.amplitude_envelope(input_audio, args.frame, args.hop, args.feature)

    # Plot and save to the required output file
    AMPPLOT.amplitude_envelope_plot(
    input_signal=input_audio,
    inpaudname=args.file,
    output_signal=amp_env_feat1,
    sampling_rate=args.sr,
    HOP_LENGTH=args.hop,
    feature_name=args.feature,
    output_path='outputs',
    uniqueIdentifier=args.unique_id
    ) `.trim();
    setCode(generatedCode);
    setCodeHtml(`<pre>${generatedCode}</pre>`);
  };

  const handleRun = async () => {
    setLoading(true);
    setShowImages(false);
    const data = {
      audioPath: selectedFile,
      hop:inputs.find(input => input.id === 'hop-length').value,
      frame:inputs.find(input => input.id === 'frame-length').value,
      sr:inputs.find(input => input.id === 'sampling-rate').value,
      feature: selectedFeature.toUpperCase()
    };

    try {
      const response = await axios.post('http://localhost:5000/process_audio', data,{
      headers: {
        // 'Content-Type': 'multipart/form-data'
      }
    });
      console.log("Backend response:", response.data);
      setImageUrls(response.data.images.map(img => `http://localhost:5000${img}`));
    setShowImages(true);
    } catch (error) {
      console.error('Error running the script:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "audio_processor_sample.py";
    a.click();
  };

   const SphereLoading = () => (
  <div className="flex felx-col fixed inset-0 flex items-center justify-center bg-white bg-opacity-50 ">
    <div className="w-24 h-10">
      <div className="relative w-full h-full overflow-hidden p-2 pl-3">
        <p className='text-sm font-bold'>Loading...</p>
        <div className="absolute inset-0 bg-blue-button rounded-lg animate-pulse opacity-0 text-black">
        </div>
        
      </div>
    </div>
  </div>  
);
  return (
    <div className='flex flex-row gap-5 justify-between space-x-5'>
      <div className="flex flex-col  space-y-10">
        <div className='flex flex-col'>
          <iframe
            srcDoc={codeHtml}
            title="Generated Code"
            width="750"
            height="300"
            className='outline border-4 p-2 rounded-sm border-blue-hover'
          ></iframe>
          <div className='flex justify-between'>
            <button className="bg-blue-button rounded-lg px-3 py-1 hover:bg-blue-hover mt-8" onClick={handleDownload}>
              Download
            </button>
            <button className="bg-blue-button rounded-lg px-3 py-1 hover:bg-blue-hover mt-8" onClick={handleRun}>
              Submit & Run
            </button>
          </div>
        </div>
      {loading && <SphereLoading />}
      {!loading && showImages && (
        <div className='flex flex-col items-center mt-5'>
          {imageUrls.map((url, index) => (
            <img key={index} src={url} alt={`Output ${index + 1}`} className="rounded shadow" />
          ))}
        </div>
      )}
        
      </div>
      <div className="text-sm">
          <div className="flex flex-col">
            <p className="mb-2 ml-12 font-bold">Select Audio File (.wav)</p>
            <select
              onChange={(e) => handleFileChange(e.target.value)}
              value={selectedFile}
              className="bg-white border border-black rounded-lg px-3 py-1 focus:outline-none"
            >
              {fileOptions.map((option, index) => (
                <option key={index} value={option.file}>{option.name}</option>
              ))}
            </select>
          </div>

          <div className='flex flex-col mt-8 items-center'>
            <p className='font-bold'>Select the Input Parameters</p>
            <div className='bg-blue-hover px-5 py-3 mt-2 rounded-xl'>
              {inputs.map(input => (
                <div key={input.id} className="flex flex-col items-center mb-4">
                  <label htmlFor={input.id} className="block mb-2">
                    <pre className='font-serif'>
                      <span>{input.min} ≤ </span> {input.label} <span> ≤ {input.max}</span>
                    </pre>
                  </label>
                  <div className="flex flex-row items-center">
                    <input
                      type="number"
                      id={input.id}
                      min={input.min}
                      max={input.max}
                      step={input.step}
                      value={input.value}
                      onChange={(e) => handleInputChange(input.id, e.target.value)}
                      className="w-16 text-center border border-gray-300 rounded-lg py-1 focus:outline-none"
                    />
                    <input
                      type="range"
                      min={input.min}
                      max={input.max}
                      step={input.step}
                      value={input.value}
                      onChange={(e) => handleInputChange(input.id, e.target.value)}
                      className="flex-grow ml-2"
                    />
                  </div>
                </div>
              ))}

              <div className="mt-4 text-center">
                <label htmlFor="feature" className="font-bold block mb-2">Select Feature</label>
                <select
                  id="feature"
                  value={selectedFeature}
                  onChange={(e) => setSelectedFeature(e.target.value)}
                  className="bg-white border border-black rounded-lg px-3 py-1"
                >
                  <option value="MEAN">MEAN</option>
                  <option value="MEDIAN">MEDIAN</option>
                  <option value="MAX">MAX</option>
                  <option value="MIN">MIN</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <button onClick={handleGenerateCode} className="bg-blue-button rounded-lg px-3 py-1 hover:bg-blue-hover mt-10 text-base">
              Generate Code
            </button>
          </div>
        </div>
      
    </div>
  );
};

export default LMSPrediction;
