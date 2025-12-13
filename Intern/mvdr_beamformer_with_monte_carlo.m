function mvdr_beamformer_with_monte_carlo( N, theta_s, theta_i, ss, snr, num_runs,uniqueIdentifier)
    j = sqrt(-1); % Defining complex iota
    source = 1;           % Number of signal sources
interference = 1;     % Number of interferences
    % Initialize results storage
    G_dB_all = zeros(num_runs, 180);

    % Monte Carlo runs
    for run = 1:num_runs
        %% Adding the channel to the transmitted signal
        for m = 1:(source + interference)
            S(m, :) = 10.^(snr(m)/10)*(randn(1, ss) + j*randn(1, ss)); % Signal and interference
        end

        %% Defining the DOA vectors for interference and transmitted Signal
        A_i = exp(-j*pi*(0:N-1)'*sin(theta_i/180*pi)); % DOA matrix for interference
        A_s = exp(-j*pi*(0:N-1)'*sin(theta_s*pi/180)); % DOA matrix for signal
        A = [A_s A_i(:,1:interference)]; % DOA matrix

        %% Defining AWGN noise at the receiver
        n = randn(N, ss) + j*randn(N, ss);  % Random noise

        %% Received Signal before MVDR beamforming
        X = A*S + n; % Received Signal

        %% MVDR beamforming 
        Wx = A_s' .* 2^10; % Initializing the beamformed vector
        u = 2^(-31) * 2^16; % Constant term
        B0H_B0 = eye(N);
        B0H_B0(1,1) = 0;
        dataout = zeros(1, ss); % Initializing the output data signal whose SNR will be calculated
        dataout(1,1) = Wx * X(:,1) ./ 2^14;

        %% LMS Algorithm 
        for i = 1:length(dataout)-1 
            Wx = Wx - u * (X(:,i)') * B0H_B0 * dataout(1,i); % LMS Algorithm Iterations
            dataout(1,i+1) = Wx * X(:,i+1) ./ 2^15;
        end

        %% Plotting the graph 
        phi = -89:1:90; % Different angles for plotting SNR
        a = exp(-j*pi*(0:N-1)'*sin(phi*pi/180));
        F = Wx * a; % Final beamformed vector

        G = abs(F).^2 ./ max(abs(F).^2); % MVDR beamformed vector SNR
        G_dB = 10*log10(G); % MVDR beamformed vector SNR in dB

        % Store result of this run
        G_dB_all(run, :) = G_dB;
    end

    % Average over all Monte Carlo runs
    G_dB_avg = mean(G_dB_all, 1);
outputDir = 'Outputs';
if ~exist(outputDir, 'dir')
    mkdir(outputDir);
end

figSize = [0, 0, 10, 5]; % inches

fig = figure('Units', 'inches', 'Position', figSize);
plot(phi, G_dB_avg, 'LineWidth', 2);
legend('d=\lambda/2');
xlabel('Angle (\circ)');
ylabel('Magnitude (dB)');
title('MVDR Beamformed Output with Monte Carlo Runs');
grid on;
print(fig, fullfile(outputDir, sprintf('monte_carlo_%s.png', uniqueIdentifier)), '-dpng');
close(fig);

end
