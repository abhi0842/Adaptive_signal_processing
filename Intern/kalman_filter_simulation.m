function kalman_filter_simulation(A, x0, num_steps, x0_est,uniqueIdentifier)
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

    outputDir = 'Outputs';
if ~exist(outputDir, 'dir')
    mkdir(outputDir);
end

figSize = [0, 0, 10, 5]; % inches

% Plot State 1
fig = figure('Units', 'inches', 'Position', figSize);
plot(1:num_steps, x_true(1, :), 'g', 1:num_steps, x_est(1, :), 'b--');
legend('True State', 'Estimated State');
title('State 1');
xlabel('Time step');
ylabel('State value');
print(fig, fullfile(outputDir, sprintf('state_1_%s.png', uniqueIdentifier)), '-dpng');
close(fig);

% Plot State 2
fig = figure('Units', 'inches', 'Position', figSize);
plot(1:num_steps, x_true(2, :), 'g', 1:num_steps, x_est(2, :), 'b--');
legend('True State', 'Estimated State');
title('State 2');
xlabel('Time step');
ylabel('State value');
print(fig, fullfile(outputDir, sprintf('state_2_%s.png', uniqueIdentifier)), '-dpng');
close(fig);

end

