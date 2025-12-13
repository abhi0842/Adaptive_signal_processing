import React, { useState } from 'react';
import axios from 'axios';
import image from '../../image.png';

const LMS = () => {
  const [inputs, setInputs] = useState([
    { id: 'num-samples', label: 'Number of samples (N)', min: 10, max: 1000, step: 1, value: 500 },
    { id: 'u1', label: 'Initial value u1', min: 0, max: 1, step: 0.01, value: 0.5 },
    { id: 'u2', label: 'Initial value u2', min: 0, max: 1, step: 0.01, value: 1 },
    { id: 'step-size', label: 'Step size (mu)', min: 0.001, max: 0.1, step: 0.001, value: 0.1 }
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
    function lms_ar(N, u_init, mu)
    % N: Number of samples
    % u_init: Initial values of u [u(1), u(2)]
    % mu: Step size for LMS algorithm

    % Initialize random noise
    v = rand(N, 1);

    % Initialize u with given initial values
    u = zeros(N, 1);
    u(1) = u_init(1);
    u(2) = u_init(2);

    % Generate autoregressive process
    for i = 3:N
        u(i) = 0.75 * u(i-1) - 0.5 * u(i-2) + v(i);
    endfor

    % Calculate autocorrelation matrix R and cross-correlation vector p
    R = zeros(2, 2);
    p = zeros(2, 1);

    for i = 2:N
        x = [v(i); v(i-1)];
        R = R + x * x';
        p = p + x * u(i);
    endfor

    R = R / (N-1);
    p = p / (N-1);
    w_opt = R / p;

    % Initialize LMS weights and error
    w_lms = zeros(2, N);
    e = zeros(N, 1);

    % LMS algorithm
    for i = 2:N
        e(i) = u(i) - w_lms(:, i-1)' * [v(i); v(i-1)];
        w_lms(:, i) = w_lms(:, i-1) + mu * [v(i); v(i-1)] * e(i);
    endfor

    % Plot mean square error
    figure(1)
    plot(e.^2);
    title('Mean Square Error vs Number of Iterations')
    xlabel('Number of Iterations')
    ylabel('Mean Square Error')

    % Plot random walk of w1
    figure(2)
    plot(1:N, w_lms(1, :));
    hold on
    plot(1:N, ones(1, N) * w_opt(1))
    title('Random Walk of w1')
    xlabel('Number of Iterations')
    ylabel('w1')
    legend('Estimated w1', 'Optimal w1')
    hold off

    % Plot random walk of w2
    figure(3)
    plot(1:N, w_lms(2, :));
    hold on
    plot(1:N, ones(1, N) * w_opt(2))
    title('Random Walk of w2')
    xlabel('Number of Iterations')
    ylabel('w2')
    legend('Estimated w2', 'Optimal w2')
    hold off

endfunction
N = 500;
u_init = [0.5, 1];
mu = 0.1;
lms_ar(N, u_init, mu);
 `;
    setCode(generatedCode);
    setCodeHtml(`<pre>${generatedCode}</pre>`);
  };

  const handleRun = async () => {
  setLoading(true);  // Start loading
  setShowImages(false);  // Hide images until new ones are loaded
  const data = {
      N: inputs.find(input => input.id === 'num-samples').value,
      u_init: [inputs.find(input => input.id === 'u1').value, inputs.find(input => input.id === 'u2').value],
      mu: inputs.find(input => input.id === 'step-size').value
  };

  try {
    const response = await axios.post('http://localhost:5000/ar_lms', data, {
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
    <div className='flex flex-col space-y-10'>
      <div className="flex flex-row gap-5 space-x-5"> 
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
       {loading && <SphereLoading/>}
        {!loading && showImages && (
          <div className=' mt-5 flex flex-col space-y-2'>
            {imageUrls.map((url, index) => (
              <img key={index} src={url} alt={`Output ${index + 1}`}/>
            ))}
          </div>
        )}
    </div>
  );
};

export default LMS;