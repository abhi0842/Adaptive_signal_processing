import axios from 'axios';
import React, { useState } from 'react';
import image from '../../image.png';

function Simulation() {
  const [inputs, setInputs] = useState([
    { id: 'A00', label: 'state_transition_matrix_00', min: -1, max: 1, step: 0.01, value: 0 },
    { id: 'A01', label: 'state_transition_matrix_01', min: -1, max: 1, step: 0.01, value: 0 },
    { id: 'A10', label: 'state_transition_matrix_10', min: -1, max: 1, step: 0.01, value: 0 },
    { id: 'A11', label: 'state_transition_matrix_11', min: -1, max: 1, step: 0.01, value: 0 },
    { id: 'x0', label: 'true_state_00', min: -1, max: 1, step: 0.001, value: 0.01 },
    { id: 'x1', label: 'true_state_01', min: -1, max:1, step: 0.001, value: 0.01 },
    { id: 'num_steps', label: 'No.of time steps', min: 10, max: 100, step: 1, value: 5 },
    { id: 'x0_est_0', label: 'initial_state_estimate_00', min: -1, max: 1, step: 0.001, value: 1 },
    { id: 'x0_est_1', label: 'initial_state_estimate_01', min: -1, max: 1, step: 0.001, value: 1 }
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
    const generatedCode = `function kalman_filter_simulation(A, x0, num_steps, x0_est)
    % Define the measurement matrix, process noise covariance, and measurement noise covariance
    C = eye(2);            % Measurement matrix (identity matrix)
    Q = 1e-6 * eye(2);     % Small process noise covariance
    R = zeros(2);          % Measurement noise covariance (noiseless)

    % Initialize true state and measurements
    x_true = zeros(2, num_steps); % True state
    y_meas = zeros(2, num_steps); % Measurements
    u = zeros(1, num_steps);      % Control input (zero for unforced dynamic model)

    % Initial true state
    x_true(:, 1) = x0; 

    % Simulate the system (unforced dynamic model)
    for k = 2:num_steps
        x_true(:, k) = A * x_true(:, k-1); % True state evolution (no control input)
        y_meas(:, k) = C * x_true(:, k);   % Measurements
    end

    % Kalman filter initial conditions
    x_est = zeros(2, num_steps); % Estimated state
    P = eye(2);                  % Initial error covariance
    x_est(:, 1) = x0_est;        % Initial state estimate

    % Kalman filter implementation
    for k = 2:num_steps
        % Prediction step (unforced dynamic model)
        x_pred = A * x_est(:, k-1);         % Predicted state (no control input)
        P_pred = A * P * A' + Q;            % Predicted error covariance

        % Update step (using Kalman filter equations)
        K = P_pred * C' / (C * P_pred * C' + R); % Kalman gain
        x_est(:, k) = x_pred + K * (y_meas(:, k) - C * x_pred); % Updated state estimate
        P = (eye(2) - K * C) * P_pred;      % Updated error covariance
    end

    % Plot results
    figure;
    subplot(2, 1, 1);
    plot(1:num_steps, x_true(1, :), 'g', 1:num_steps, x_est(1, :), 'b--');
    legend('True State', 'Estimated State');
    title('State 1');
    xlabel('Time step');
    ylabel('State value');

    subplot(2, 1, 2);
    plot(1:num_steps, x_true(2, :), 'g', 1:num_steps, x_est(2, :), 'b--');
    legend('True State', 'Estimated State');
    title('State 2');
    xlabel('Time step');
    ylabel('State value');
end

A = [1 1; 0 1];          % State transition matrix
x0 = [0; 1];             % Initial true state
num_steps = 50;          % Number of time steps
x0_est = [0; 0];         % Initial state estimate

kalman_filter_simulation(A, x0, num_steps, x0_est);
    `;
    setCode(generatedCode);
    setCodeHtml(`<pre>${generatedCode}</pre>`);
  };

  const handleRun = async () => {
    setLoading(true);
    setShowImages(false);
    const data = {
      A_octave: [[inputs.find(input => input.id === 'A00').value,inputs.find(input => input.id === 'A01').value],[inputs.find(input => input.id === 'A10').value,inputs.find(input => input.id === 'A11').value]],
      x0: [inputs.find(input => input.id === 'x0').value, inputs.find(input => input.id === 'x1').value],
      num_steps: inputs.find(input => input.id === 'num_steps').value,
      x0_est:[inputs.find(input => input.id === 'x0_est_0').value,inputs.find(input => input.id === 'x0_est_1').value]
    };

    try {
      const response = await axios.post('http://localhost:5000/Simulation', data);
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
    element.download = "kalmanFilterSimulation.m";
    document.body.appendChild(element);
    element.click();
  };

  const SphereLoading = () => (
    <div className="flex fixed inset-0 items-center justify-center bg-white bg-opacity-50">
      <div className="w-20 h1">
        <div className="relative w-full h-full overflow-hidden p-2 pl-3">
          <p className="font-sans text-sm font-semibold">Loading...</p>
          <div className="absolute inset-0 bg-blue-button rounded-lg animate-pulse opacity-0 text-black"></div>
        </div>
      </div>
    </div>
  );

  return (
      <div className="flex flex-row gap-5 space-x-5">
    <div className="flex flex-col space-y1">
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
                      className="w-16 text-center border border-gray-300 rounded-lg py-1 focus:outline-none focus:border-blue-0"
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
          <div className="flex flex-col mt-5">
            <button onClick={handleGenerateCode} className="bg-blue-button rounded-lg px-3 py-1 hover:bg-blue-hover mt1">
              Generate Code
            </button>
          </div>
        </div>
    </div>
  );
}

export default Simulation;
