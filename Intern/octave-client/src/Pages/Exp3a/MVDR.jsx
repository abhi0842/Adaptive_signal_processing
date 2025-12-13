import React, { useState } from 'react'
import image from '../../image.png'
import axios from 'axios';

const MVDR = () => {
  const [inputs, setInputs] = useState([
    { id: 'num-antennas', label: 'Number of antennas (N)', min: 8, max: 12, step: 1, value: 10 },
    { id: 'theta-s', label: 'DOA of signal (θ_s)', min: 0, max: 90, step: 1, value: 45 },
    { id: 'theta-i', label: 'DOA of interference (θ_i)', min: -90, max: 0, step: 1, value: -45 },
    { id: 'num-snapshots', label: 'Number of snapshots (ss)', min: 1024, max: 8192, step: 1, value: 4096 },
    { id: 'snr-snr', label: 'SNR (dB)', min: 0, max: 40, step: 1, value: 20 },
    { id: 'snr-inr', label: 'INR (dB)', min: 10, max: 40, step: 1, value: 25 },
    { id: 'num-runs', label: 'Number of Monte Carlo runs (num_runs)', min: 10, max: 100, step: 1, value: 50 }
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
    function mvdr_beamformer_with_monte_carlo(N, theta_s, theta_i, ss, snr, num_runs)
    j = sqrt(-1); % Defining complex iota
    source = 1; % Number of signal sources
    interference = 1; % Number of interferences
    % Initialize results storage
    G_dB_all = zeros(num_runs, 180);

    % Monte Carlo runs
    for run = 1:num_runs
        %% Adding the channel to the transmitted signal
        for m = 1:(source + interference)
            S(m, :) = 10.^(snr(m)/10)*(randn(1, ss) + j*randn(1, ss)); % Signal and interference
        end

        %% Defining the DOA vectors for interference and transmitted Signal
        A_i = exp(-j*pi*(0:N-1)'*sin(theta_i/180*pi)); % DOA matrix for interference
        A_s = exp(-j*pi*(0:N-1)'*sin(theta_s*pi/180)); % DOA matrix for signal
        A = [A_s A_i(:,1:interference)]; % DOA matrix

        %% Defining AWGN noise at the receiver
        n = randn(N, ss) + j*randn(N, ss); % Random noise

        %% Received Signal before MVDR beamforming
        X = A*S + n; % Received Signal

        %% MVDR beamforming 
        Wx = A_s' .* 2^10; % Initializing the beamformed vector
        u = 2^(-31) * 2^16; % Constant term
        B0H_B0 = eye(N);
        B0H_B0(1,1) = 0;
        dataout = zeros(1, ss); % Initializing the output data signal whose SNR will be calculated
        dataout(1,1) = Wx * X(:,1) ./ 2^14;

        %% LMS Algorithm 
        for i = 1:length(dataout)-1 
            Wx = Wx - u * (X(:,i)') * B0H_B0 * dataout(1,i); % LMS Algorithm Iterations
            dataout(1,i+1) = Wx * X(:,i+1) ./ 2^15;
        end

        %% Plotting the graph 
        phi = -89:1:90; % Different angles for plotting SNR
        a = exp(-j*pi*(0:N-1)'*sin(phi*pi/180));
        F = Wx * a; % Final beamformed vector

        G = abs(F).^2 ./ max(abs(F).^2); % MVDR beamformed vector SNR
        G_dB = 10*log10(G); % MVDR beamformed vector SNR in dB

        % Store result of this run
        G_dB_all(run, :) = G_dB;
    end

    % Average over all Monte Carlo runs
    G_dB_avg = mean(G_dB_all, 1);

    % Plot averaged result
    figure();
    plot(phi, G_dB_avg, 'linewidth', 2);
    legend('d=\\lambda/2');
    xlabel('Angle (\\circ)');
    ylabel('Magnitude (dB)');
    title('MVDR Beamformed Output with Monte Carlo Runs');
    grid on;
end

% Parameters
N = ${inputs.find(input => input.id === 'num-antennas').value}; // Array number of antennas
theta_s = ${inputs.find(input => input.id === 'theta-s').value}; // DOA of signal
theta_i = ${inputs.find(input => input.id === 'theta-i').value}; // DOA of interference
ss = ${inputs.find(input => input.id === 'num-snapshots').value}; // Number of snapshots
snr = [${inputs.find(input => input.id === 'snr-snr').value}, ${inputs.find(input => input.id === 'snr-inr').value}]; // SNR and INR values
num_runs = ${inputs.find(input => input.id === 'num-runs').value}; // Number of Monte Carlo runs
// Call the function
mvdr_beamformer_with_monte_carlo(N, theta_s, theta_i, ss, snr, num_runs);
    `;
    setCode(generatedCode);
    setCodeHtml(`<pre>${generatedCode}</pre>`);
  };

  const handleRun = async () => {
    setLoading(true); // Start loading
    setShowImages(false); // Hide images until new ones are loaded
    const data = {
      N: inputs.find(input => input.id === 'num-antennas').value,
      theta_s: inputs.find(input => input.id === 'theta-s').value,
      theta_i: inputs.find(input => input.id === 'theta-i').value,
      ss: inputs.find(input => input.id === 'num-snapshots').value,
      snr: [inputs.find(input => input.id === 'snr-snr').value, inputs.find(input => input.id === 'snr-inr').value],
      num_runs: inputs.find(input => input.id === 'num-runs').value
    };

    try {
      const response = await axios.post('http://localhost:5000/mvdr_beamformer', data);
      setImageUrls(response.data.images.map(img => `http://localhost:5000${img}`));
      setShowImages(true); // Show images after loading
    } catch (error) {
      console.error('Error running the script:', error);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([code], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = "mvdr_beamformer.m";
    document.body.appendChild(element); // Required for this to work in Firefox
    element.click();
  };

  const SphereLoading = () => (
    <div className="flex flex-col fixed inset-0 items-center justify-center bg-white bg-opacity-50">
      <div className="w-20 h-10">
        <div className="relative w-full h-full overflow-hidden p-2 pl-3">
          <p className='font-sans text-sm font-bold'>Loading...</p>
          <div className="absolute inset-0 bg-blue-button rounded-lg animate-pulse opacity-0 text-black"></div>
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
        {loading && <SphereLoading />}
      {!loading && showImages && (
        <div className='mt-5 flex flex-col space-y-2'>
          {imageUrls.map((url, index) => (
            <img key={index} src={url} alt={`Output ${index + 1}`} />
          ))}
        </div>
      )}
        
      </div>
      <div className="text-sm">
          <div className='flex flex-col items-center'>
            <p className='font-bold'>Select the input Parameters</p>
            <div className='bg-blue-hover px-5 py-3 mt-2 rounded-xl'>
              {inputs.map(input => (
                <div key={input.id} className="flex flex-col items-center">
                  <label htmlFor={input.id} className="block mb-2">
                    <pre className='font-serif'>
                      <span>{input.min} ≤ </span> {input.label} <span> ≤ {input.max} </span>
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

export default MVDR;
