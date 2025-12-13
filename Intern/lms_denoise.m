function lms_denoise(mu, inputFile, order, uniqueIdentifier)
    % LMS Denoising Function for EEG Signal

    experiment = 100;
    clc;
    close all;

    % Load EEG signal
    x = csvread(inputFile)';
    iteration = length(x);

    w_LMS_main = zeros(order, 1);
    A = x + 0.5 * randn(1, iteration); % Additive noise

    for i = 1:experiment
        w_LMS = zeros(order, 1);
        An = zeros(order, 1);

        for n = 1:iteration
            An = [A(n); An(1:end-1)];
            e_LMS = x(n) - An' * w_LMS;
            w_LMS = w_LMS + mu * e_LMS * An;
        end

        w_LMS_main = w_LMS_main + w_LMS;
    end

    w_LMS_main = w_LMS_main / experiment;

    estimated_output_signal = zeros(iteration, 1);
    An = zeros(order, 1);
    e_LMS = zeros(iteration, 1);

    for n = 1:iteration
        An = [A(n); An(1:end-1)];
        estimated_output_signal(n) = An' * w_LMS_main;
        e_LMS(n) = x(n) - An' * w_LMS_main;
    end

    % Output directory
    outputDir = 'Outputs';
    if ~exist(outputDir, 'dir')
        mkdir(outputDir);
    end

    % Plot configuration
    figSize = [0, 0, 20, 5]; % inches

    fig = figure('Units','inches','Position',figSize);
    plot(x);
    title('Desired Signal');
    ylabel('Amplitude');
    xlabel('Sample Index');
    print(fig, fullfile(outputDir, sprintf('lms_denoise_desired_%s.png', uniqueIdentifier)), '-dpng');
    close(fig);


    % Plot: Noisy Signal
    fig = figure('Units','inches','Position',figSize);
    plot(A);
    title('Signal Corrupted with Noise');
    ylabel('Amplitude');
    xlabel('Sample Index');
    print(fig, fullfile(outputDir, sprintf('lms_denoise_noise_%s.png', uniqueIdentifier)), '-dpng');
    close(fig);

    % Plot: Filtered Output
    fig = figure('Units','inches','Position',figSize);
    plot(estimated_output_signal);
    title('Adaptive Filter Outputs');
    ylabel('Amplitude');
    xlabel('Sample Index');
    legend('LMS Output');
    print(fig, fullfile(outputDir, sprintf('lms_denoise_output_%s.png', uniqueIdentifier)));
    close(fig);

    % Plot: Error Signal
    fig = figure('Units','inches','Position',figSize);
    plot(e_LMS);
    title('LMS Error Signal');
    ylabel('Amplitude');
    xlabel('Sample Index');
    print(fig, fullfile(outputDir, sprintf('lms_denoise_error_%s.png', uniqueIdentifier)), '-dpng');
    close(fig);
end
