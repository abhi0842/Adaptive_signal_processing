function rls_denoise(lambda, inputFile, M, uniqueIdentifier)
    % Function to apply RLS denoising to an EEG signal
    %
    % Parameters:
    %   lambda: Forgetting factor for RLS
    %   inputFile: Name of the input .csv file containing the EEG signal
    %   M: Length of the RLS filter
    %   uniqueIdentifier: Unique identifier for saving the image
    % Default values for delta and fs
    delta = 1e-3;  % Small positive constant to initialize P(0)
    fs = 100;      % Sampling frequency in Hz
    clc;
    close all;
    % Load the EEG signal from the input file
    x = csvread(inputFile);
    % Check the length of the signal
    n = length(x);
    % Initialize P and RLS weight vector
    P = (1 / delta) * eye(M); % Initialize P as an identity matrix
    w_rls = zeros(M, 1); % Initialize RLS weight vector
    % Generate the signal corrupted with noise
    D = x;
    A = D + 0.5 * randn(size(D)); % Simulated noisy signal
    % Initialization for RLS algorithm
    B_rls = zeros(1, n); % RLS output signal
    Err_rls = zeros(1, n); % RLS error signal
    weights_rls = zeros(M, n); % Array to store RLS weights
    % Adding padding to the signal for multi-tap processing
    A_padded = [zeros(M-1, 1); A]; % Transpose the zeros matrix to make it compatible with A
    t = (0:n-1) / fs;
    % Apply the RLS algorithm
    for i = M:n
        % Extract the current segment of the signal for multi-tap processing
        A_i = A_padded(i:-1:i-M+1);
        
        k = (P * A_i) / (lambda + A_i' * P * A_i);
        y_rls = w_rls' * A_i;
        Err_rls(i) = D(i) - y_rls;
        w_rls = w_rls + k * Err_rls(i);
        weights_rls(:, i) = w_rls;
        P = (P - k * A_i' * P) / lambda;
        if any(diag(P) < 1e-10)
            P = max(P, 1e-10 * eye(M));
        end
        B_rls(i) = w_rls' * A_i;
    end
    outputDir = 'Outputs';
    if ~exist(outputDir, 'dir')
        mkdir(outputDir);
    end
    % Display the signals
    figSize = [0, 0, 15, 5];  % inches

    % Plot: Desired Signal
    fig = figure('Units','inches','Position',figSize);
    plot(t, D);
    title('Desired Signal');
    xlabel('Time (s)');
    ylabel('Amplitude');
    print(fig, fullfile(outputDir, sprintf('rls_denoise_desired_%s.png', uniqueIdentifier)), '-dpng');
    close(fig);

    % Plot: Noisy Signal
    fig = figure('Units','inches','Position',figSize);
    plot(t, A);
    title('Signal Corrupted with Noise');
    xlabel('Time (s)');
    ylabel('Amplitude');
    print(fig, fullfile(outputDir, sprintf('rls_denoise_noise_%s.png', uniqueIdentifier)), '-dpng');
    close(fig);

    % Plot: Filtered Output
    fig = figure('Units','inches','Position',figSize);
    plot(t, B_rls);
    title('RLS Output Signal');
    xlabel('Time (s)');
    ylabel('Amplitude');
    legend('RLS Output');
    print(fig, fullfile(outputDir, sprintf('rls_denoise_output_%s.png', uniqueIdentifier)), '-dpng');
    close(fig);

    % Plot: Error Signal
    fig = figure('Units','inches','Position',figSize);
    plot(t, Err_rls);
    title('RLS Error Signal');
    xlabel('Time (s)');
    ylabel('Error');
    print(fig, fullfile(outputDir, sprintf('rls_denoise_error_%s.png', uniqueIdentifier)), '-dpng');
    close(fig);
end