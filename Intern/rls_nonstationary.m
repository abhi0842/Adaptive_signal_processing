function rls_nonstationary(n, lambda, N, uniqueIdentifier)

    % n = 1000;  
    x = randn(n, 1); 
    d = sin(0.01 * (1:n)') + 0.5 * randn(n, 1); 
    % non-stationary signal  

    % RLS parameters  
    % lambda = 0.99;  
    % N = 4;  

    % Initialize variables 
    w = zeros(N, 1);  
    P = eye(N) * 1000; 
    y = zeros(n, 1); 
    e = zeros(n, 1); 
    w_hist = zeros(n, N); 

    % RLS algorithm  
    for i = N:n
        x_vec = x(i:-1:i-N+1);     
        pi = P * x_vec;     
        k = pi / (lambda + x_vec' * pi);   
        y(i) = w' * x_vec;    
        e(i) = d(i) - y(i);    
        w = w + k * e(i);     
        P = (P - k * x_vec' * P) / lambda;    
        w_hist(i, :) = w';  
    end  
% Ensure output directory exists
outputDir = 'Outputs';
if ~exist(outputDir, 'dir')
    mkdir(outputDir);
end

figSize = [0, 0, 20, 5]; % inches

% Plot: Desired vs RLS Output
fig = figure('Units', 'inches', 'Position', figSize);
plot(d, 'DisplayName', 'Desired Signal');
hold on;
plot(y, 'DisplayName', 'RLS Output');
legend;
title('RLS Output vs Desired Signal');
xlabel('Sample Index');
ylabel('Amplitude');
print(fig, fullfile(outputDir, sprintf('rls_nonstationary_output_%s.png', uniqueIdentifier)), '-dpng');
close(fig);

% Plot: Error Signal
fig = figure('Units', 'inches', 'Position', figSize);
plot(e, 'DisplayName', 'Error');
legend;
title('Error Signal');
xlabel('Sample Index');
ylabel('Error');
print(fig, fullfile(outputDir, sprintf('rls_nonstationary_error_%s.png', uniqueIdentifier)), '-dpng');
close(fig);

% Plot: Norm of Weight Vector
fig = figure('Units', 'inches', 'Position', figSize);
plot(vecnorm(w_hist, 2, 2), 'DisplayName', 'Norm of Weight Vector');
legend;
title('Norm of Weight Vector');
xlabel('Sample Index');
ylabel('Norm');
print(fig, fullfile(outputDir, sprintf('rls_nonstationary_weight_%s.png', uniqueIdentifier)), '-dpng');
close(fig);
end