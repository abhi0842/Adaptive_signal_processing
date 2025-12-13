import React, { useState } from 'react';
import axios from 'axios';
import image from '../../image.png';

const LMS = () => {
  const [inputs, setInputs] = useState([
    { id: 'step-size', label: 'Step-size', min: 0, max: 1, step: 0.0001, value: 0.5 },
    { id: 'order', label: 'Order of Filter (M)', min: 2, max: 100, step: 1, value: 50 },
    { id: 'experiment', label: 'No.of iterations', min: 10, max: 1000, step: 1, value: 50 }
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
function lms_nonstationary(n,M,mu,uniqueIdentifier)
 %n = 1000;
 x = randn(n, 1);
 d = sin(0.01 * (1:n)') + 0.5 * randn(n, 1);
 % non-stationary signal
 % LMS parameters 
%mu = 0.01; 
%M = 4; 
% Initialize variables 
w = zeros(M, 1); 
y = zeros(n, 1);
 e = zeros(n, 1);
 w_hist = zeros(n, M); 
% LMS algorithm 
for i = M:n 
x_vec = x(i:-1:i-M+1);
 y(i) = w' * x_vec; 
e(i) = d(i) - y(i);
 w = w + mu * x_vec * e(i);
 w_hist(i, :) = w'; 
end
 % Plot results 
figure; 
subplot(3, 1, 1); plot(d, 'DisplayName', 'Desired signal'); 
hold on;
 plot(y, 'DisplayName', 'LMS output'); 
legend;
 title('LMS Output vs Desired Signal'); 
subplot(3, 1, 2); plot(e, 'DisplayName', 'Error');
 legend; 
title('Error Signal'); subplot(3, 1, 3); plot(vecnorm(w_hist, 2, 2), 'DisplayName', 'Norm of weight vector');
 legend; 
title('Norm of Weight Vector');
saveas(gcf, sprintf('Outputs/lms_nonstationary_%s.png', uniqueIdentifier));
close(gcf);
end
 `;
    setCode(generatedCode);
    setCodeHtml(`<pre>${generatedCode}</pre>`);
  };

  const handleRun = async () => {
  setLoading(true);  // Start loading
  setShowImages(false);  // Hide images until new ones are loaded
  const data = {
    n:inputs.find(input=>input.id === 'experiment').value,
    M: inputs.find(input => input.id === 'order').value,
    mu: inputs.find(input => input.id === 'step-size').value
  };

  try {
    const response = await axios.post('http://localhost:5000/lms_nonstationary-process', data, {
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
      <div className="flex flex-row gap-5 space-x-5 justify-between"> 
        <div className='flex flex-col'>
          <iframe
            srcDoc={codeHtml}
            title="Generated Code"
            width="650"
            height="232"
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