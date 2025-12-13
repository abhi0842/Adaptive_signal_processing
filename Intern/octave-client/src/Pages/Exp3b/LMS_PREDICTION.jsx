import React, { useState } from 'react';
import axios from 'axios';
import image from '../../image.png';

const LMS = () => {
  const [inputs, setInputs] = useState([
    { id: 'mu1', label: 'Step-size (µ)', min: 0.001, max: 0.1, step: 0.001, value: 0.01 },
    { id: 'mu2', label: 'Step-size (µ)', min: 0.001, max: 0.1, step: 0.001, value: 0.01 },
    { id: 'mu3', label: 'Step-size (µ)', min: 0.001, max: 0.1, step: 0.001, value: 0.01 },
    { id: 'num-samples', label: 'Number of Samples (n)', min: 10, max: 1000, step: 10, value: 500 },
    { id: 'sigma-nu', label: 'Sigma Nu', min: 0, max: 1, step: 0.01, value: 0.1 },
    { id: 'a', label: 'Weight Coeff (a)', min: 0, max: 1, step: 0.01, value: 0.5 }
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
    function adaptive_filter(n, mu, sigma_nu, a)
    w = zeros(1, 2000);
    mse = zeros(length(mu), n);
    A(1, 1:200) = -0.98;

    for l = 1:length(mu)
        weight_e_temp = zeros(100, n);
        temp = zeros(100, n);
        temp1 = zeros(100, 200);

        for k = 1:100
            u = zeros(1, n);
            nu = sigma_nu * randn(1, n);

            for i = 2:n
                u(i) = a * u(i - 1) + nu(i);
            endfor

            u = sqrt(1 / var(u)) * u;
            w_est = zeros(1, n + 1);
            e = zeros(1, n);

            for j = 2:n
                e(j) = u(j) - w_est(j) * u(j - 1);
                w_est(j + 1) = w_est(j) + mu(l) * u(j - 1) * e(j);
                weight_e_temp(k, j) = w_est(j);
                temp(k, j) = (weight_e_temp(k, j) - a)^2;
                temp1(k, j) = w_est(j);
            endfor
        endfor

        mse(l, :) = sum(temp) / 100;
        rndwalk = sum(temp1) / 100;
    endfor

    figure
    stem(1:n, u)
    title('Desired Output')
    xlabel('Number of Samples')
    ylabel('Magnitude')

    figure
    plot(1:n, mse(1, :), 'r')
    hold on
    plot(1:n, mse(2, :), 'g')
    plot(1:n, mse(3, :), 'b')
    title('Learning curve for different step sizes')
    xlabel('Number of adaptation cycles, n')
    ylabel('Mean square error')
    legend('mu=0.01', 'mu=0.05', 'mu=0.1')

    figure
    plot(1:200, A, 'b')
    hold on
    plot(1:n, rndwalk, 'r')
    title('Random Walk behaviour')
    xlabel('Number of adaptation cycles, n')
    ylabel('Tap Weight')
endfunction

% Parameters
n = 200;
mu = [0.01 0.05 0.1];
sigma_nu = 0.1;
a = -0.98;

% Call the function
adaptive_filter(n, mu, sigma_nu, a)
 `;
    setCode(generatedCode);
    setCodeHtml(`<pre>${generatedCode}</pre>`);
  };

  const handleRun = async () => {
  setLoading(true);  // Start loading
  setShowImages(false);  // Hide images until new ones are loaded
  const data = {
    n:inputs.find(input=>input.id === 'num-samples').value,
    mu: [inputs.find(input => input.id === 'mu1').value,inputs.find(input => input.id === 'mu2').value,inputs.find(input => input.id === 'mu3').value],
    sigma_nu: inputs.find(input => input.id === 'sigma-nu').value,
    a:inputs.find(input=>input.id === 'a').value,
  };

  try {
    const response = await axios.post('http://localhost:5000/lms_predict', data, {
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
};

export default LMS;