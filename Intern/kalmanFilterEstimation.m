function kalmanFilterEstimation(N, dt, u, y0, v0, R,uniqueIdentifier)
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
    
   outputDir = 'Outputs';
if ~exist(outputDir, 'dir')
    mkdir(outputDir);
end

figSize = [0, 0, 10, 5]; % inches

% Plot Position
fig = figure('Units', 'inches', 'Position', figSize);
plot(t, z, 'g-', t, x(1, :), 'b--', 'LineWidth', 2);
hold on;
plot(t, xt(1, :), 'r:', 'LineWidth', 1.5);
legend('Measured', 'Estimated', 'True');
title('Position');
print(fig, fullfile(outputDir, sprintf('position_%s.png', uniqueIdentifier)), '-dpng');
close(fig);

% Plot Velocity
fig = figure('Units', 'inches', 'Position', figSize);
plot(t, x(2, :), 'LineWidth', 2);
hold on;
plot(t, xt(2, :), 'r:', 'LineWidth', 1.5);
legend('Estimated', 'True');
title('Velocity');
print(fig, fullfile(outputDir, sprintf('velocity_%s.png', uniqueIdentifier)), '-dpng');
close(fig);

% Plot Position Error
fig = figure('Units', 'inches', 'Position', figSize);
plot(t, x(1, :) - xt(1, :), 'LineWidth', 2);
title('Position Error');
print(fig, fullfile(outputDir, sprintf('position_error_%s.png', uniqueIdentifier)), '-dpng');
close(fig);

% Plot Velocity Error
fig = figure('Units', 'inches', 'Position', figSize);
plot(t, x(2, :) - xt(2, :), 'LineWidth', 2);
title('Velocity Error');
print(fig, fullfile(outputDir, sprintf('velocity_error_%s.png', uniqueIdentifier)), '-dpng');
close(fig);
end
