import React, { useState } from 'react'
import image from '../../image.png'
import axios from 'axios';

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
  const [imageUrls, setImageUrls] = useState(new Array(1).fill(image));
  const [loading, setLoading] = useState(false);
  const [showImages, setShowImages] = useState(false);


  const handleInputChange = (id, value) => {
    const input = inputs.find(input => input.id === id);
    const newValue = Math.min(Math.max(value, input.min), input.max);
    setInputs(inputs.map(input => input.id === id ? { ...input, value: newValue } : input));
  };


  const handleGenerateCode = () => {
    const generatedCode = `
    function eqrls(W, xi_R, N, SNR_dB,L,delay)
    num_runs=100;
    delta=0.04;
     % Preallocate for Mean Squared Error
     MSE_sum = zeros(1, N-delay);
 
 
     for run = 1:num_runs
         % Generate Bernoulli sequence x_n for this run
         x_n = 2 * randi([0 1], N, 1) - 1;
 
         % Desired response
         d_n = [x_n(delay+1:end); zeros(delay, 1)]; % Delayed version of input signal
 
         % Initialize RLS algorithm
         w = zeros(L, 1);
         P = (1/delta) * eye(L);
         lambda = 1; % Forgetting factor (not used here but included for completeness)
 
         % Preallocate for Mean Squared Error for this run
         MSE = zeros(1, N-delay);
 
         for n = L:N-delay
             % Input vector for predictor
             u_n = x_n(n:-1:n-L+1);
 
             % RLS algorithm
             k_n = (P * u_n) / (lambda + u_n' * P * u_n);
             e_n = d_n(n) - w' * u_n;
             w = w + k_n * e_n;
             P = (P - k_n * u_n' * P) / lambda;
 
             % Mean Squared Error
             MSE(n) = e_n^2;
         end
 
         % Accumulate MSE for this run
         MSE_sum = MSE_sum + MSE;
     end
 
     % Ensemble average MSE
     MSE_avg = MSE_sum / num_runs;
 
     % Plot results
     figure;
     plot(10*log10(MSE_avg));
     xlabel('Sample Index');
     ylabel('MSE (dB)');
     title(sprintf('Adaptive Equalisation RLS'));
     grid on;
 end
 
 % Example usage:
 W = 3.1;
 xi_R = 11.124;
 N = 1000;
 SNR_dB = 30;
  L = 11; % Number of taps in the equalizer
  delay = 7; % Delay for desired response
 eqrls(W, xi_R, N, SNR_dB,L,delay);
 `;
    setCode(generatedCode);
    setCodeHtml(`<pre>${generatedCode}</pre>`);
  };

  const handleRun = async () => {
  setLoading(true);  // Start loading
  setShowImages(false);  // Hide images until new ones are loaded
  const data = inputs.reduce((acc, input) => {
    acc[input.id] = input.value;
    return acc;
  }, {});
  try {
    const response = await axios.post('http://localhost:5000/rls_equ', data, {
      headers: {
        // 'Content-Type': 'multipart/form-data'
      }
    });
    
    setImageUrls(response.data.images.map(img => `http://localhost:5000${img}`));
    setShowImages(true);  // Show images after loading
  } catch (error) {
    console.error('Error running the script:', error);
  } finally {
    setLoading(false);  // Stop loading
  }
};
  
  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([code], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = "rls_denoise.m";
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
  };

  const SphereLoading = () => (
  <div className="flex felx-col fixed inset-0 flex items-center justify-center bg-white bg-opacity-50 ">
    <div className="w-20 h-10">
      <div className="relative w-full h-full overflow-hidden p-2 pl-3">
        <p className='font-sans text-sm font-bold'>Loading...</p>
        <div className="absolute inset-0 bg-blue-button rounded-lg animate-pulse opacity-0 text-black">
        </div>
        
      </div>
    </div>
  </div>  
);

  return (
      <div className="flex flex-row gap-5 space-x-5"> 
    <div className='flex flex-col space-y-10'>
        <div className='flex flex-col'>
          <iframe
            srcDoc={codeHtml}
            title="Generated Code"
            width="650"
            height="262"
            className='outline border-4 p-2 rounded-sm border-blue-hover'
          ></iframe>
          <div className='flex justify-between text-sm'>
            <button 
              className="bg-blue-button rounded-lg px-3 py-1 hover:bg-blue-hover mt-8"
              onClick={handleDownload}
            >
              Download
            </button>
            <button 
              className="bg-blue-button rounded-lg px-3 py-1 hover:bg-blue-hover mt-8"
              onClick={handleRun}
            >
              Submit & Run
            </button>
          </div>
        </div>
        {loading && <SphereLoading/>}
        {!loading && showImages && (
          <div className=' mt-5 flex flex-col space-y-2'>
            {imageUrls.map((url, index) => (
              <img key={index} src={url} alt={`Output ${index + 1}`}/>
            ))}
          </div>
        )}
        
      </div>
       <div className="text-sm">
          <div className='flex flex-col items-center'>
            <p className='font-bold'>
            Select the input Parameters
            </p>
            <div className='bg-blue-hover px-5 py-3 mt-2 rounded-xl'>
              {inputs.map(input => (
                <div key={input.id} className="flex flex-col items-center">
                  <label htmlFor={input.id} className="block mb-2">
                    <pre className='font-serif'>
                      <span>{input.min} ≤ </span> {input.label} <span> ≤  {input.max} </span>
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
                      className="w-16 text-center border border-gray-300 rounded-lg py-1 focus:outline-none focus:border-blue-500"
                    />
                    <input
                      type="range"
                      min={input.min}
                      max={input.max}
                      step={input.step}
                      value={input.value}
                      onChange={(e) => handleInputChange(input.id, e.target.value)}
                      className="flex-grow ml-2 "
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col">
            <button onClick={handleGenerateCode} className="bg-blue-button rounded-lg px-3 py-1 hover:bg-blue-hover mt-10">
              Generate Code
            </button>
          </div>
        </div>
    </div>
  );
}

export default RMS
