function AR_process(n_steps, p, phi, sigma,uniqueIdentifier) 

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
end