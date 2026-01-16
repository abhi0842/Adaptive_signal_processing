import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const AR = () => {
  const [inputs, setInputs] = useState([
    { id: 'n_steps', label: 'No.of time steps', min: 10, max: 1000, step: 1, value: 500 },
    { id: 'p', label: 'Order', min: 1, max: 20, step: 1, value: 10 },
    { id: 'sigma', label: 'Standard deviation', min: 0.01, max: 1, step: 0.0001, value: 0.5 }
  ]);

  const [coefficients, setCoefficients] = useState(new Array(10).fill(0.5));
  const [code, setCode] = useState('');
  const [codeHtml, setCodeHtml] = useState('Code will be generated here.!');
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCharts, setShowCharts] = useState(false);

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
    newCoefficients[index] = parseFloat(value);
    setCoefficients(newCoefficients);
  };

  // Generate random number with Box-Muller transform (normal distribution)
  const randn = () => {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  };

  // AR process simulation (migrated from MATLAB)
  const simulateARProcess = (n_steps, p, phi, sigma) => {
    // Validate coefficients
    if (phi.length !== p) {
      alert('The number of AR coefficients must match the specified order p');
      return null;
    }

    // Generate white noise
    const epsilon = Array(n_steps).fill(0).map(() => sigma * randn());

    // Initialize time series
    const X = new Array(n_steps).fill(0);

    // Start with initial values based on noise
    for (let t = 0; t < p; t++) {
      X[t] = epsilon[t];
    }

    // Simulate AR(p) process
    for (let t = p; t < n_steps; t++) {
      let sum = 0;
      for (let i = 0; i < p; i++) {
        sum += phi[i] * X[t - 1 - i];
      }
      X[t] = sum + epsilon[t];
    }

    return { X, epsilon };
  };

  const handleGenerateCode = () => {
    const generatedCode = `function AR_process(n_steps, p, phi, sigma, uniqueIdentifier)
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

    % Generate white noise using randn
    epsilon = sigma * randn(n_steps, 1);

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
    outputDir = 'Outputs';
    if ~exist(outputDir, 'dir')
        mkdir(outputDir);
    end

    figSize = [0, 0, 20, 5]; % inches

    % Plot: Simulated AR(p) Process
    fig = figure('Units', 'inches', 'Position', figSize);
    plot(1:n_steps, X, 'b');
    title(['Simulated AR(', num2str(p), ') Stochastic Process']);
    xlabel('Time');
    ylabel('Value');
    print(fig, fullfile(outputDir, sprintf('ar_process_signal_%s.png', uniqueIdentifier)), '-dpng');
    close(fig);

    % Plot: Generated White Noise
    fig = figure('Units', 'inches', 'Position', figSize);
    plot(1:n_steps, epsilon, 'r');
    title('Generated White Noise');
    xlabel('Time');
    ylabel('Noise Value');
    print(fig, fullfile(outputDir, sprintf('ar_process_noise_%s.png', uniqueIdentifier)), '-dpng');
    close(fig);
end`;
    
    setCode(generatedCode);
    setCodeHtml(`<pre>${generatedCode}</pre>`);
  };

  const handleRun = () => {
    setLoading(true);
    setShowCharts(false);

    // Small delay to show loading animation
    setTimeout(() => {
      const n_steps = inputs.find(input => input.id === 'n_steps').value;
      const p = inputs.find(input => input.id === 'p').value;
      const sigma = inputs.find(input => input.id === 'sigma').value;
      const phi = coefficients.slice(0, p);

      const result = simulateARProcess(n_steps, p, phi, sigma);

      if (result) {
        const timeSteps = Array.from({ length: n_steps }, (_, i) => i);

        const processChartData = {
          labels: timeSteps,
          datasets: [
            {
              label: `Simulated AR(${p}) Stochastic Process`,
              data: result.X,
              borderColor: 'rgba(0, 114, 189, 0.7)', // MATLAB blue with 70% opacity
              backgroundColor: 'transparent',
              pointRadius: 0,
              borderWidth: 1, // Thinner line
              tension: 0, // No smoothing, sharp lines like MATLAB
            },
          ],
        };

        const noiseChartData = {
          labels: timeSteps,
          datasets: [
            {
              label: 'Generated White Noise',
              data: result.epsilon,
              borderColor: 'rgba(217, 83, 25, 0.7)', // MATLAB red/orange with 70% opacity
              backgroundColor: 'transparent',
              pointRadius: 0,
              borderWidth: 1, // Thinner line
              tension: 0, // No smoothing, sharp lines like MATLAB
            },
          ],
        };

        setChartData({
          process: processChartData,
          noise: noiseChartData,
        });
        setShowCharts(true);
      }

      setLoading(false);
    }, 100);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([code], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = "AR_process.m";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const SphereLoading = () => (
    <div className="flex flex-col fixed inset-0 flex items-center justify-center bg-white bg-opacity-50 z-50">
      <div className="w-20 h-10">
        <div className="relative w-full h-full overflow-hidden p-2 pl-3">
          <p className='font-sans text-sm font-semibold'>Loading...</p>
          <div className="absolute inset-0 bg-blue-button rounded-lg animate-pulse opacity-0 text-black">
          </div>
        </div>
      </div>
    </div>
  );

  const getChartOptions = (title, yLabel) => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 14,
          weight: 'normal',
          family: 'Arial, sans-serif',
        },
        color: '#000',
        padding: {
          top: 10,
          bottom: 20,
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Time',
          font: {
            size: 12,
            family: 'Arial, sans-serif',
          },
          color: '#000',
        },
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)',
          lineWidth: 0.5,
        },
        ticks: {
          color: '#000',
          font: {
            size: 11,
          },
        },
        border: {
          display: true,
          color: '#000',
          width: 1,
        },
      },
      y: {
        title: {
          display: true,
          text: yLabel,
          font: {
            size: 12,
            family: 'Arial, sans-serif',
          },
          color: '#000',
        },
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)',
          lineWidth: 0.5,
        },
        ticks: {
          color: '#000',
          font: {
            size: 11,
          },
        },
        border: {
          display: true,
          color: '#000',
          width: 1,
        },
      },
    },
  });

  return (
    <div className='w-full max-w-7xl mx-auto p-4'>
      <div className='flex flex-col lg:flex-row gap-5 lg:space-x-5'>
        <div className="flex flex-col space-y-10 flex-1 w-full">
          <div className='flex flex-col'>
            <iframe
              srcDoc={codeHtml}
              title="Generated Code"
              className='w-full outline border-4 p-2 rounded-sm border-blue-hover'
              style={{ height: '300px' }}
            ></iframe>
            <div className='flex flex-col sm:flex-row justify-between gap-3 text-sm'>
              <button
                className="bg-blue-button rounded-lg px-3 py-2 hover:bg-blue-hover mt-4 sm:mt-8 w-full sm:w-auto"
                onClick={handleDownload}
              >
                Download
              </button>
              <button
                className="bg-blue-button rounded-lg px-3 py-2 hover:bg-blue-hover mt-4 sm:mt-8 w-full sm:w-auto"
                onClick={handleRun}
              >
                Submit & Run
              </button>
            </div>
          </div>

          {loading && <SphereLoading />}
          
          {!loading && showCharts && chartData && (
            <div className='flex flex-col gap-8'>
              <div className='border-4 border-blue-hover rounded-sm p-2 sm:p-4 bg-white' style={{ height: '300px', minHeight: '250px' }}>
                <Line 
                  data={chartData.process} 
                  options={getChartOptions(
                    `Simulated AR(${inputs.find(input => input.id === 'p').value}) Stochastic Process`,
                    'Value'
                  )} 
                />
              </div>
              <div className='border-4 border-blue-hover rounded-sm p-2 sm:p-4 bg-white' style={{ height: '300px', minHeight: '250px' }}>
                <Line 
                  data={chartData.noise} 
                  options={getChartOptions('Generated White Noise', 'Noise Value')} 
                />
              </div>
            </div>
          )}
        </div>
         
        <div className="text-sm w-full lg:w-auto lg:min-w-[320px]">
          <div className='flex flex-col items-center'>
            <p className='font-semibold'>
              Select the input Parameters
            </p>
            <div className='bg-blue-hover px-5 py-3 mt-2 rounded-xl w-full'>
              {inputs.map(input => (
                <div key={input.id} className="flex flex-col items-center mb-4">
                  <label htmlFor={input.id} className="block mb-2">
                    <pre className='font-serif text-xs sm:text-sm'>
                      <span>{input.min} ≤ </span> {input.label} <span> ≤  {input.max} </span>
                    </pre>
                  </label>
                  <div className="flex flex-row items-center w-full">
                    <input
                      type="number"
                      id={input.id}
                      min={input.min}
                      max={input.max}
                      step={input.step}
                      value={input.value}
                      onChange={(e) => handleInputChange(input.id, parseFloat(e.target.value))}
                      className="w-16 text-center border border-gray-300 rounded-lg py-1 focus:outline-none focus:border-blue-500 flex-shrink-0"
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

          <div className='bg-blue-hover px-5 py-3 mt-2 rounded-xl w-full max-h-96 overflow-y-auto'>
            {coefficients.map((coeff, index) => (
              <div key={index} className="flex flex-col items-center mb-4">
                <label htmlFor={`coeff-${index}`} className="block mb-2">
                  <pre className='font-serif text-xs sm:text-sm'>
                    <span>{-1} ≤ </span> {`Coefficient ${index + 1}`} <span> ≤  {1} </span>
                  </pre>
                </label>
                <div className="flex flex-row items-center w-full">
                  <input
                    type="number"
                    id={`coeff-${index}`}
                    min={-1}
                    max={1}
                    step={0.001}
                    value={coeff}
                    onChange={(e) => handleCoefficientChange(index, parseFloat(e.target.value))}
                    className="w-16 text-center border border-gray-300 rounded-lg py-1 focus:outline-none focus:border-blue-500 flex-shrink-0"
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

          <div className="flex flex-col w-full">
            <button 
              onClick={handleGenerateCode} 
              className="bg-blue-button rounded-lg px-3 py-2 hover:bg-blue-hover mt-10 w-full"
            >
              Generate Code
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AR;