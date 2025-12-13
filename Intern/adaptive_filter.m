function adaptive_filter(n, mu, sigma_nu, a,uniqueIdentifier)
    w = zeros(1, 2000);
    mse = zeros(length(mu), n);
    A(1, 1:200) = -0.98;

    for l = 1:length(mu)
        weight_e_temp = zeros(100, n);
        temp = zeros(100, n);
        temp1 = zeros(100, 200);

        for k = 1:100
            u = zeros(1, n);
            nu = sigma_nu * randn(1, n);

            for i = 2:n
                u(i) = a * u(i - 1) + nu(i);
            endfor

            u = sqrt(1 / var(u)) * u;
            w_est = zeros(1, n + 1);
            e = zeros(1, n);

            for j = 2:n
                e(j) = u(j) - w_est(j) * u(j - 1);
                w_est(j + 1) = w_est(j) + mu(l) * u(j - 1) * e(j);
                weight_e_temp(k, j) = w_est(j);
                temp(k, j) = (weight_e_temp(k, j) - a)^2;
                temp1(k, j) = w_est(j);
            endfor
        endfor

        mse(l, :) = sum(temp) / 100;
        rndwalk = sum(temp1) / 100;
    endfor

    outputDir = 'Outputs';
if ~exist(outputDir, 'dir')
    mkdir(outputDir);
end

figSize = [0, 0, 10, 5]; % inches

% Plot: Desired Output
fig = figure('Units', 'inches', 'Position', figSize);
stem(1:n, u);
title('Desired Output');
xlabel('Number of Samples');
ylabel('Magnitude');
print(fig, fullfile(outputDir, sprintf('desired_output_%s.png', uniqueIdentifier)), '-dpng');
close(fig);

% Plot: Learning Curve for Different Step Sizes
fig = figure('Units', 'inches', 'Position', figSize);
plot(1:n, mse(1, :), 'r', 1:n, mse(2, :), 'g', 1:n, mse(3, :), 'b');
title('Learning Curve for Different Step Sizes');
xlabel('Number of adaptation cycles, n');
ylabel('Mean Square Error');
legend('mu=0.01', 'mu=0.05', 'mu=0.1');
grid on;
print(fig, fullfile(outputDir, sprintf('learning_curve_%s.png', uniqueIdentifier)), '-dpng');
close(fig);

% Plot: Random Walk Behavior
fig = figure('Units', 'inches', 'Position', figSize);
plot(1:200, A, 'b', 1:n, rndwalk, 'r');
title('Random Walk Behaviour');
xlabel('Number of adaptation cycles, n');
ylabel('Tap Weight');
legend('True Weight A', 'Estimated Weight');
grid on;
print(fig, fullfile(outputDir, sprintf('random_walk_%s.png', uniqueIdentifier)), '-dpng');
close(fig);

endfunction

