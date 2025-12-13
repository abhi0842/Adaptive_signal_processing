function predictor_rls(n, sigma_nu, a, lambda,uniqueIdentifier)
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
    outputDir = 'Outputs';
if ~exist(outputDir, 'dir')
    mkdir(outputDir);
end

figSize = [0, 0, 20, 5]; % inches

% Plot: Desired Output
fig = figure('Units', 'inches', 'Position', figSize);
stem(1:n, u, 'filled');
title('Desired Output');
xlabel('Number of Samples');
ylabel('Magnitude');
print(fig, fullfile(outputDir, sprintf('desired_output_%s.png', uniqueIdentifier)), '-dpng');
close(fig);

% Plot: Learning Curve for RLS
fig = figure('Units', 'inches', 'Position', figSize);
plot(1:n, mse, 'r', 'LineWidth', 2);
title('Learning Curve for RLS');
xlabel('Number of Adaptation Cycles, n');
ylabel('Mean Square Error');
print(fig, fullfile(outputDir, sprintf('learning_curve_%s.png', uniqueIdentifier)), '-dpng');
close(fig);

% Plot: Random Walk Behaviour
fig = figure('Units', 'inches', 'Position', figSize);
plot(1:n, A, 'b', 'LineWidth', 2);
hold on;
plot(1:n, rndwalk, 'r', 'LineWidth', 1.5);
title('Random Walk Behaviour');
xlabel('Number of Adaptation Cycles, n');
ylabel('Tap Weight');
legend('Original Weight A', 'Random Walk', 'Location', 'best');
print(fig, fullfile(outputDir, sprintf('random_walk_%s.png', uniqueIdentifier)), '-dpng');
close(fig);

end

