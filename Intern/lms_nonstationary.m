function lms_nonstationary(n,M,mu,uniqueIdentifier)
 %n = 1000;
 x = randn(n, 1);
 d = sin(0.01 * (1:n)') + 0.5 * randn(n, 1);
 % non-stationary signal
 % LMS parameters 
%mu = 0.01; 
%M = 4; 
% Initialize variables 
w = zeros(M, 1); 
y = zeros(n, 1);
 e = zeros(n, 1);
 w_hist = zeros(n, M); 
% LMS algorithm 
for i = M:n 
x_vec = x(i:-1:i-M+1);
 y(i) = w' * x_vec; 
e(i) = d(i) - y(i);
 w = w + mu * x_vec * e(i);
 w_hist(i, :) = w'; 
end
 % Ensure output directory exists
outputDir = 'Outputs';
if ~exist(outputDir, 'dir')
    mkdir(outputDir);
end

figSize = [0, 0, 20, 5]; % inches

% Plot: Desired signal
fig = figure('Units', 'inches', 'Position', figSize);
plot(d, 'DisplayName', 'Desired Signal');
legend;
title('Desired Signal');
xlabel('Sample Index');
ylabel('Amplitude');
print(fig, fullfile(outputDir, sprintf('lms_nonstationary_desired_%s.png', uniqueIdentifier)), '-dpng');
close(fig);

% Plot: LMS output
fig = figure('Units', 'inches', 'Position', figSize);
plot(y, 'DisplayName', 'LMS Output');
legend;
title('LMS Output vs Desired Signal');
xlabel('Sample Index');
ylabel('Amplitude');
print(fig, fullfile(outputDir, sprintf('lms_nonstationary_output_%s.png', uniqueIdentifier)), '-dpng');
close(fig);

% Plot: Error signal
fig = figure('Units', 'inches', 'Position', figSize);
plot(e, 'DisplayName', 'Error');
legend;
title('Error Signal');
xlabel('Sample Index');
ylabel('Error');
print(fig, fullfile(outputDir, sprintf('lms_nonstationary_error_%s.png', uniqueIdentifier)), '-dpng');
close(fig);

% Plot: Norm of weight vector
fig = figure('Units', 'inches', 'Position', figSize);
plot(vecnorm(w_hist, 2, 2), 'DisplayName', 'Norm of Weight Vector');
legend;
title('Norm of Weight Vector');
xlabel('Sample Index');
ylabel('Norm');
print(fig, fullfile(outputDir, sprintf('lms_nonstationary_weight_%s.png', uniqueIdentifier)), '-dpng');
close(fig);
end