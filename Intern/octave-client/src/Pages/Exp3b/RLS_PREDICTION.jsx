import React, { useState } from 'react'
import image from '../../image.png'
import axios from 'axios';

const RMS = () => {
  const [inputs, setInputs] = useState([
    { id: 'n', label: 'Number of Samples (N)', min: 100, max: 1000, step: 10, value: 500 },
    { id: 'sigma_nu', label: 'Standard Deviation (σₙᵤ)', min: 0, max: 1, step: 0.01, value: 0.5 },
    { id: 'a', label: 'Weight coefficient', min: 0, max: 1, step: 0.01, value: 0.99 },
    { id: 'lambda', label: 'Forgetting Factor (λ)', min: 0.01, max: 1, step: 0.01, value: 0.99 }
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
    function predictor_rls(n, sigma_nu, a, lambda)
    % Initialize variables
    A = -0.98 * ones(1, n);
    mse = zeros(1, n);
    temp = zeros(100, n);
    temp1 = zeros(100, n);

    for k = 1:100
        % Generate the AR(1) process
        u = zeros(1, n);
        nu = sigma_nu * randn(1, n);
        
        for i = 2:n
            u(i) = a * u(i - 1) + nu(i);
        end
        
        % Normalize the input signal
        u = sqrt(1 / var(u)) * u;
        
        % Initialize RLS variables
        w_est = zeros(1, n);  % Filter weights
        P = eye(1) / 0.1;     % Inverse of the covariance matrix
        e = zeros(1, n);      % Error signal
        
        for j = 2:n
            % Regression vector (past values of the input signal)
            phi = u(j - 1);
            
            % Compute the Kalman gain
            k_rls = P * phi / (lambda + phi' * P * phi);
            
            % Calculate the error
            e(j) = u(j) - w_est(j - 1) * phi;
            
            % Update the weights
            w_est(j) = w_est(j - 1) + k_rls' * e(j);
            
            % Update the inverse covariance matrix
            P = (P - k_rls * phi' * P) / lambda;
            
            % Store the squared error
            temp(k, j) = (w_est(j) - a)^2;
            temp1(k, j) = w_est(j);
        end
    end

    % Calculate the mean squared error
    mse = sum(temp) / 100;
    rndwalk = sum(temp1) / 100;

    % Plot desired output
    figure
    stem(1:n, u)
    title('Desired Output')
    xlabel('Number of Samples')
    ylabel('Magnitude')

    % Plot learning curve for RLS
    figure
    plot(1:n, mse, 'r')
    title('Learning curve for RLS')
    xlabel('Number of adaptation cycles, n')
    ylabel('Mean square error')

    % Plot random walk behaviour
    figure
    plot(1:n, A, 'b')
    hold on
    plot(1:n, rndwalk, 'r')
    title('Random Walk behaviour')
    xlabel('Number of adaptation cycles, n')
    ylabel('Tap Weight')
end
% Parameters
n = 200;
sigma_nu = 0.1;
a = -0.98;
lambda = 0.99;  % Forgetting factor for RLS

% Call the function
predictor_rls(n, sigma_nu, a, lambda);
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
    const response = await axios.post('http://localhost:5000/rls_predict', data, {
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
}

export default RMS
