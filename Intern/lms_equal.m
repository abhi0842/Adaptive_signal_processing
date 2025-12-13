function lms_equal(N, signal_power, noise_power, mu,uniqueIdentifier)
    % N: Number of samples
    % signal_power: Power of the signal
    % noise_power: Power of the noise
    % mu: Step size for LMS algorithm

    h = [2 1];  % Impulse response of channel
    x = sqrt(signal_power) .* randn(1, N);  % Input signal
    d = conv(x, h);
    d = d(1:N) + sqrt(noise_power) .* randn(1, N);  % Introduction of noise

    w0(1) = 0;  % Initial filter weights
    w1(1) = 0;

    y(1) = w0(1) * x(1);  % Filter output
    e(1) = d(1) - y(1);  % Error signal
    w0(2) = w0(1) + 2 * mu * e(1) * x(1);  % Update weights
    w1(2) = w1(1);  % Update weights

    for n = 2:N  % LMS algorithm
        y(n) = w0(n) * x(n) + w1(n) * x(n-1);  % Filter output
        e(n) = d(n) - y(n);  % Error signal
        w0(n+1) = w0(n) + mu * e(n) * x(n);  % Update weight
        w1(n+1) = w1(n) + mu * e(n) * x(n-1);  % Update weight
    endfor

    mse = zeros(1, N);
    for i = 1:N
        mse(i) = abs(e(i)).^2;
    endfor

    n = 1:N;
   outputDir = 'Outputs';
if ~exist(outputDir, 'dir')
    mkdir(outputDir);
end

figSize = [0, 0, 20, 5]; % inches

fig = figure('Units', 'inches', 'Position', figSize);
semilogy(n, mse, 'LineWidth', 2);  % MSE versus time on log scale
xlabel('Adaptation cycles');
ylabel('MSE');
title('Adaptation cycles vs. MSE');
grid on;
print(fig, fullfile(outputDir, sprintf('lms_eq_%s.png', uniqueIdentifier)), '-dpng');
close(fig);

endfunction

