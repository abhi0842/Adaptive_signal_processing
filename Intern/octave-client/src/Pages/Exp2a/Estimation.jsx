import axios from 'axios';
import React, { useState } from 'react';
import image from '../../image.png';

function Estimation() {
  const [inputs, setInputs] = useState([
    { id: 'N', label: 'No. of time steps', min: 100, max: 1000, step: 1, value: 500 },
    { id: 'dt', label: 'Sampling time', min: 0.001, max: 0.01, step: 0.001, value: 0.01 },
    { id: 'u', label: 'U', min: 1, max: 10, step: 1, value: 5 },
    { id: 'y0', label: 'Initial position', min: 50, max: 100, step: 1, value: 60 },
    { id: 'v0', label: 'Velocity', min: 0, max: 100, step: 1, value: 10 },
    { id: 'R', label: 'Variance', min: 2, max: 100, step: 0.1, value: 10 },
    { id: 'p', label: 'Order', min: 1, max: 10, step: 1, value: 1 }
  ]);

  const [code, setCode] = useState('');
  const [codeHtml, setCodeHtml] = useState('Code will be generated here.!');
  const [imageUrls, setImageUrls] = useState(new Array(5).fill(image));
  const [loading, setLoading] = useState(false);
  const [showImages, setShowImages] = useState(false);



  const handleInputChange = (id, value) => {
    setInputs(inputs.map(input => 
      input.id === id ? { ...input, value: Math.min(Math.max(value, input.min), input.max) } : input
    ));
  };


  const handleGenerateCode = () => {
    const generatedCode = `
function kalmanFilterEstimation(N, dt, u, y0, v0, R)
    t = dt * (1:N); % Time vector
    I = eye(2);
    
    % Define matrices within the function
    F = [1 dt; 0 1];
    G = [-1/2*dt^2; -dt];
    H = [1 0];
    Q = [0 0; 0 0];  % No noise assumed
    x0 = [10; 0];  % Initial estimated state vector
    P0 = [50 0; 0 0.01];  % Initial covariance matrix

    % Initialize state vectors
    xt = zeros(2, N);
    xt(:, 1) = [y0; v0]; % Initial position and velocity
    
    % Generate true states using prediction equations
    for k = 2:N
        xt(:, k) = F * xt(:, k-1) + G * u; % Position and velocity using law of physics
    end
    
    % Generate noisy measurements from the true states
    v = sqrt(R) * randn(1, N);
    z = H * xt + v;
    
    % Perform the Kalman estimation
    x = zeros(2, N);
    x(:, 1) = x0; % Initial estimated state vector
    
    P = P0; % Initial covariance matrix
    
    for k = 2:N
        % Predict the state vector
        x(:, k) = F * x(:, k-1) + G * u; % Finding x_k/k-1
        
        % Predict the covariance matrix
        P = F * P * F' + Q;
        
        % Calculate Kalman filter gain
        K = P * H' / (H * P * H' + R);
        
        % Update and correct the state vector
        x(:, k) = x(:, k) + K * (z(k) - H * x(:, k));
        
        % Update covariance matrix
        P = (I - K * H) * P;
    end
    
    % Plot the states
    figure;
    subplot(2, 1, 1);
    plot(t, z, 'g-', t, x(1, :), 'b--', 'LineWidth', 2);
    hold on;
    plot(t, xt(1, :), 'r:', 'LineWidth', 1.5);
    legend('Measured', 'Estimated', 'True');
    title('Position');
    
    subplot(2, 1, 2);
    plot(t, x(2, :), 'LineWidth', 2);
    hold on;
    plot(t, xt(2, :), 'r:', 'LineWidth', 1.5);
    legend('Estimated', 'True');
    title('Velocity');
    
    figure;
    subplot(2, 1, 1);
    plot(t, x(1, :) - xt(1, :), 'LineWidth', 2);
    title('Position Error');
    
    subplot(2, 1, 2);
    plot(t, x(2, :) - xt(2, :), 'LineWidth', 2);
    title('Velocity Error');
end
N = 1000;    % Number of time steps
dt = 0.001;  % Sampling time
u = 9.80665;
y0 = 100;  % Initial position
v0 = 0;    % Initial velocity
R = 4;     % Error variance in measurement of position

kalmanFilterEstimation(N, dt, u, y0, v0, R);
    `;
    setCode(generatedCode);
    setCodeHtml(`<pre>${generatedCode}</pre>`);
  };

  const handleRun = async () => {
    setLoading(true);
    setShowImages(false);
    const data = inputs.reduce((acc, input) => {
      acc[input.id] = input.value;
      return acc;
    }, {});

    try {
      const response = await axios.post('http://localhost:5000/Estimation', data);
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
    element.download = "kalmanFilterEstimation.m";
    document.body.appendChild(element);
    element.click();
  };

  const SphereLoading = () => (
    <div className="flex fixed inset-0 items-center justify-center bg-white bg-opacity-50">
      <div className="w-20 h-10">
        <div className="relative w-full h-full overflow-hidden p-2 pl-3">
          <p className="font-sans text-sm font-semibold">Loading...</p>
          <div className="absolute inset-0 bg-blue-button rounded-lg animate-pulse opacity-0 text-black"></div>
        </div>
      </div>
    </div>
  );

  return (
      <div className="flex flex-row gap-5 space-x-5">
    <div className="flex flex-col space-y-10">
        <div className="flex flex-col">
          <iframe
            srcDoc={codeHtml}
            title="Generated Code"
            width="750"
            height="300"
            className="outline border-4 p-2 rounded-sm border-blue-hover"
          ></iframe>
          <div className="flex justify-between text-sm">
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
        <div className="grid grid-cols-1">
          {imageUrls.map((url, index) => (
            <img key={index} src={url} alt={`Output ${index + 1}`} />
          ))}
        </div>
      )}
      </div>
      
        <div className="text-sm">
          <div className="flex flex-col items-center">
            <p className="font-semibold">Select the input Parameters</p>
            <div className="bg-blue-hover px-5 py-3 mt-2 rounded-xl">
              {inputs.map(input => (
                <div key={input.id} className="flex flex-col items-center">
                  <label htmlFor={input.id} className="block mb-2">
                    <pre className="font-serif">
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
                      onChange={(e) => handleInputChange(input.id, parseFloat(e.target.value))}
                      className="w-16 text-center border border-gray-300 rounded-lg py-1 focus:outline-none focus:border-blue-500"
                    />
                    <input
                      type="range"
                      min={input.min}
                      max={input.max}
                      step={input.step}
                      value={input.value}
                      onChange={(e) => handleInputChange(input.id, parseFloat(e.target.value))}
                      className="flex-grow ml-2"
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

export default Estimation;
