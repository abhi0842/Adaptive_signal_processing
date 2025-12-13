import axios from 'axios';
import React, { useState, useEffect } from 'react';
import image from '../../image.png';

const AR = () => {
  const [inputs, setInputs] = useState([
    { id: 'n_steps', label: 'No.of time steps', min: 10, max: 1000, step: 1, value: 500 },
    { id: 'p', label: 'Order', min: 1, max: 20, step: 1, value: 10 },
    { id: 'sigma', label: 'Standard deviation', min: 0.01, max: 1, step: 0.0001, value: 0.5 }
  ]);

  const [coefficients, setCoefficients] = useState(new Array(10).fill(0.5));
  const [code, setCode] = useState('');
  const [codeHtml, setCodeHtml] = useState('Code will be generated here.!');
  const [imageUrls, setImageUrls] = useState(new Array(5).fill(image));
  const [loading, setLoading] = useState(false);
  const [showImages, setShowImages] = useState(false);

  useEffect(() => {
    const order = inputs.find(input => input.id === 'p').value;
    setCoefficients(new Array(order).fill(0.5));
  }, [inputs]);

  const handleInputChange = (id, value) => {
    const input = inputs.find(input => input.id === id);
    const newValue = Math.min(Math.max(value, input.min), input.max);
    setInputs(inputs.map(input => input.id === id ? { ...input, value: newValue } : input));
  };

  const handleCoefficientChange = (index, value) => {
    const newCoefficients = [...coefficients];
    newCoefficients[index] = value;
    setCoefficients(newCoefficients);
  };

  const handleGenerateCode = () => {

    const generatedCode = `
function AR_process(n_steps, p, phi, sigma, uniqueIdentifier)
    % Function to simulate an AR(p) stochastic process
    %
    % Parameters:
    %   n_steps: Number of time steps
    %   p: Order of the AR process
    %   phi: AR coefficients (array)
    %   sigma: Standard deviation of the noise

    % Ensure the number of AR coefficients matches the order
    if length(phi) ~= p
        error('The number of AR coefficients must match the specified order p');
    end

    % Generate white noise
    epsilon = normrnd(0, sigma, [n_steps, 1]);

    % Initialize time series
    X = zeros(n_steps, 1);

    % Start with initial values based on noise
    for t = 1:p
        X(t) = epsilon(t);
    end

    % Simulate AR(p) process
    for t = (p+1):n_steps
        X(t) = sum(phi .* X(t-1:-1:t-p)') + epsilon(t);
    end

    % Plot the time series
    figure;
    subplot(2, 1, 1);
    plot(1:n_steps, X, 'b');
    title(['Simulated AR(', num2str(p), ') Stochastic Process']);
    xlabel('Time');
    ylabel('Value');
    saveas(gcf, sprintf('Outputs/simulated_stochastic_process_%s.png', uniqueIdentifier));
    close(gcf);

    % Plot the noise
    subplot(2, 1, 2);
    plot(1:n_steps, epsilon, 'r');
    title('Generated White Noise');
    xlabel('Time');
    ylabel('Noise Value');
    saveas(gcf, sprintf('Outputs/generated_white_noise_%s.png', uniqueIdentifier));
    close(gcf);
end
    `;
    setCode(generatedCode);
    setCodeHtml(`<pre>${generatedCode}</pre>`);
  };

  const handleRun = async () => {
    setLoading(true);
    setShowImages(false);
    const data = {
      n_steps: inputs.find(input => input.id === 'n_steps').value,
      p: inputs.find(input => input.id === 'p').value,
      phi: coefficients.slice(0, inputs.find(input => input.id === 'p').value),
      sigma: inputs.find(input => input.id === 'sigma').value
    };

    try {
      const response = await axios.post('http://localhost:5000/AR-process', data, {
        headers: {
          // 'Content-Type': 'multipart/form-data'
        }
      });

      setImageUrls(response.data.images.map(img => `http://localhost:5000${img}`));
      setShowImages(true);
    } catch (error) {
      console.error('Error running the script:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([code], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = "AR_process.m";
    document.body.appendChild(element);
    element.click();
  };

  const SphereLoading = () => (
    <div className="flex felx-col fixed inset-0 flex items-center justify-center bg-white bg-opacity-50 ">
      <div className="w-20 h-10">
        <div className="relative w-full h-full overflow-hidden p-2 pl-3">
          <p className='font-sans text-sm font-semibold'>Loading...</p>
          <div className="absolute inset-0 bg-blue-button rounded-lg animate-pulse opacity-0 text-black">
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className='flex flex-row gap-5 space-x-5'>
      <div className="flex flex-col space-y-10 ">
        <div className='flex flex-col'>
          <iframe
            srcDoc={codeHtml}
            title="Generated Code"
            width="800"
            height="300"
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
        {loading && <SphereLoading />}
      {!loading && showImages && (
        <div className='grid grid-cols-1 '>
          {imageUrls.map((url, index) => (
            <img key={index} src={url} alt={`Output ${index + 1}`} />
          ))}
        </div>
      )}
        
      </div>
       
        <div className="text-sm">
          <div className='flex flex-col items-center '>
            <p className='font-semibold'>
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
          <div className='bg-blue-hover px-5 py-3 mt-2 rounded-xl'>
            {coefficients.map((coeff, index) => (
              <div key={index} className="flex flex-col items-center">
                <label htmlFor={`coeff-${index}`} className="block mb-2">
                  <pre className='font-serif'>
                    <span>{-1} ≤ </span> {`Coefficient ${index + 1}`} <span> ≤  {1} </span>
                  </pre>
                </label>
                <div className="flex flex-row items-center">
                  <input
                    type="number"
                    id={`coeff-${index}`}
                    min={-1}
                    max={1}
                    step={0.001}
                    value={coeff}
                    onChange={(e) => handleCoefficientChange(index, parseFloat(e.target.value))}
                    className="w-16 text-center border border-gray-300 rounded-lg py-1 focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="range"
                    min={-1}
                    max={1}
                    step={0.001}
                    value={coeff}
                    onChange={(e) => handleCoefficientChange(index, parseFloat(e.target.value))}
                    className="flex-grow ml-2"
                  />
                </div>
              </div>
            ))}
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

export default AR;
