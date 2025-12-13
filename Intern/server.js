const express = require('express');
const path = require('path');
const { exec ,spawn} = require('child_process');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid'); 

const app = express();
const PORT = 5000;
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'Outputs')));

app.post('/rls-process', async(req, res) => {
  try {
    console.log(req.body)
    const inputFile = req.body.file;
    const lambda = req.body.lambda;
    const M = req.body.M;
    const uploadPath = path.join('./Inputs', inputFile);
    console.log("path is :", uploadPath);

    const uniqueIdentifier = uuidv4();

    const command = `octave --eval "addpath('${__dirname}'); rls_denoise(${lambda}, '${uploadPath}', ${M}, '${uniqueIdentifier}')"`;

    exec(command, (err, stdout, stderr) => {
      if (err) {
        console.error('Error executing Octave script:', err);
        res.send(err);
        console.error('stderr:', stderr);
        return res.status(500).send(err);
      }

      const imageUrls = [
        `/rls_denoise_desired_${uniqueIdentifier}.png`,
        `/rls_denoise_noise_${uniqueIdentifier}.png`,
        `/rls_denoise_output_${uniqueIdentifier}.png`,
        `/rls_denoise_error_${uniqueIdentifier}.png`
      ];
      res.status(200).json({ images: imageUrls });
    });
  } catch (err) {
    console.error('Error handling the upload:', err);
    res.status(500).send(err);
  }
});

app.post('/lms-process', async (req, res) => {
  try {
    const inputFile = req.body.file;
    const mu = req.body.mu;
    const order = req.body.order;
    const uploadPath = path.join('./Inputs', inputFile);

    const uniqueIdentifier = uuidv4();
    const command = `octave --eval "addpath('${__dirname}'); lms_denoise(${mu},'${uploadPath}', ${order}, '${uniqueIdentifier}')"`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('Error executing Octave script:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }

      const imageUrls = [
        `/lms_denoise_desired_${uniqueIdentifier}.png`,
        `/lms_denoise_noise_${uniqueIdentifier}.png`,
        `/lms_denoise_output_${uniqueIdentifier}.png`,
        `/lms_denoise_error_${uniqueIdentifier}.png`
      ];

      res.status(200).json({ images: imageUrls });
    });
  } catch (err) {
    console.error('Error handling the request:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/AR-process', async (req, res) => {
  try {
    console.log(req.body);
    const { n_steps, p, phi, sigma } = req.body;
    const uniqueIdentifier = uuidv4();
    const command = `octave --eval "addpath('${__dirname}'); AR_process(${n_steps}, ${p}, [${phi}], ${sigma}, '${uniqueIdentifier}')"`;

    exec(command, (err, stdout, stderr) => {
      if (err) {
        console.error('Error executing Octave script:', err);
        console.error('stderr:', stderr);
        return res.status(500).send(err);
      }
      const imageUrls = [
        `/ar_process_signal_${uniqueIdentifier}.png`,
        `/ar_process_noise_${uniqueIdentifier}.png`
      ];
      res.status(200).json({ images: imageUrls });
    });
  } catch (err) {
    console.error('Error handling the upload:', err);
    res.status(500).send(err);
  }
});

app.post('/lms_nonstationary-process', async (req, res) => {
  try {
    console.log(req.body);
    const { n, M, mu } = req.body;
    const uniqueIdentifier = uuidv4();
    const command = `octave --eval "addpath('${__dirname}'); lms_nonstationary(${n}, ${M}, ${mu},'${uniqueIdentifier}')"`;

    exec(command, (err, stdout, stderr) => {
      if (err) {
        console.error('Error executing Octave script:', err);
        console.error('stderr:', stderr);
        return res.status(500).send(err);
      }
      const imageUrls = [
        `/lms_nonstationary_desired_${uniqueIdentifier}.png`,
        `/lms_nonstationary_output_${uniqueIdentifier}.png`,
        `/lms_nonstationary_error_${uniqueIdentifier}.png`,
        `/lms_nonstationary_weight_${uniqueIdentifier}.png`
      ];
      res.status(200).json({ images: imageUrls });
    });
  } catch (err) {
    console.error('Error handling the upload:', err);
    res.status(500).send(err);
  }
});
app.post('/rls_nonstationary-process', async (req, res) => {
  try {
    console.log(req.body);
    const { n, lambda, N } = req.body;
    const uniqueIdentifier = uuidv4();
    const command = `octave --eval "addpath('${__dirname}'); rls_nonstationary(${n}, ${lambda}, ${N},'${uniqueIdentifier}')"`;

    exec(command, (err, stdout, stderr) => {
      if (err) {
        console.error('Error executing Octave script:', err);
        console.error('stderr:', stderr);
        return res.status(500).send(err);
      }
      const imageUrls = [
        `/rls_nonstationary_output_${uniqueIdentifier}.png`,
        `/rls_nonstationary_error_${uniqueIdentifier}.png`,
        `/rls_nonstationary_weight_${uniqueIdentifier}.png`
      ];
      res.status(200).json({ images: imageUrls });
    });
  } catch (err) {
    console.error('Error handling the upload:', err);
    res.status(500).send(err);
  }
});

app.post('/ar_lms', async (req, res) => {
  try {
    console.log(req.body);
    const { N, u_init, mu } = req.body;
    const uniqueIdentifier = uuidv4();
    const command = `octave --eval "addpath('${__dirname}'); lms_ar(${N}, [${u_init}], ${mu},'${uniqueIdentifier}')"`;

    exec(command, (err, stdout, stderr) => {
      if (err) {
        console.error('Error executing Octave script:', err);
        console.error('stderr:', stderr);
        return res.status(500).send(err);
      }
      const imageUrls = [
        `/comparision_${uniqueIdentifier}.png`,
        `/random_walk_of_w1_${uniqueIdentifier}.png`,
        `/random_walk_of_w2_${uniqueIdentifier}.png`
      ];
      res.status(200).json({ images: imageUrls });
    });
  } catch (err) {
    console.error('Error handling the upload:', err);
    res.status(500).send(err);
  }
});

app.post('/mvdr_beamformer', async (req, res) => {
  try {
    console.log(req.body);
    const { N, theta_s, theta_i, ss, snr, num_runs } = req.body;
    const uniqueIdentifier = uuidv4();
    const command = `octave --eval "addpath('${__dirname}'); mvdr_beamformer_with_monte_carlo(${N}, ${theta_s}, ${theta_i},${ss},[${snr}],${num_runs},'${uniqueIdentifier}')"`;

    exec(command, (err, stdout, stderr) => {
      if (err) {
        console.error('Error executing Octave script:', err);
        console.error('stderr:', stderr);
        return res.status(500).send(err);
      }
      const imageUrls = [
        `/monte_carlo_${uniqueIdentifier}.png`
      ];
      res.status(200).json({ images: imageUrls });
    });
  } catch (err) {
    console.error('Error handling the upload:', err);
    res.status(500).send(err);
  }
});

app.post('/lms_equ', async (req, res) => {
  try {
    console.log(req.body);
    const { N, signal_power, noise_power, mu } = req.body;
    const uniqueIdentifier = uuidv4();
    const command = `octave --eval "addpath('${__dirname}'); lms_equal(${N}, ${signal_power}, ${noise_power},${mu},'${uniqueIdentifier}')"`;

    exec(command, (err, stdout, stderr) => {
      if (err) {
        console.error('Error executing Octave script:', err);
        console.error('stderr:', stderr);
        return res.status(500).send(err);
      }
      const imageUrls = [
        `/lms_eq_${uniqueIdentifier}.png`
      ];
      res.status(200).json({ images: imageUrls });
    });
  } catch (err) {
    console.error('Error handling the upload:', err);
    res.status(500).send(err);
  }
});

app.post('/lms_predict', async (req, res) => {
  try {
    console.log(req.body);
    const { n, mu, sigma_nu, a } = req.body;
    const uniqueIdentifier = uuidv4();
    const command = `octave --eval "addpath('${__dirname}'); adaptive_filter(${n},[${mu}], ${sigma_nu}, ${a},'${uniqueIdentifier}')"`;

    exec(command, (err, stdout, stderr) => {
      if (err) {
        console.error('Error executing Octave script:', err);
        console.error('stderr:', stderr);
        return res.status(500).send(err);
      }
      const imageUrls = [
        `/desired_output_${uniqueIdentifier}.png`,
        `/learning_curve_${uniqueIdentifier}.png`,
        `/random_walk_${uniqueIdentifier}.png`
      ];
      res.status(200).json({ images: imageUrls });
    });
  } catch (err) {
    console.error('Error handling the upload:', err);
    res.status(500).send(err);
  }
});

app.post('/rls_equ', async (req, res) => {
  try {
    console.log(req.body);
    const { W, xi_R, N, SNR_dB,L,delay } = req.body;
    const uniqueIdentifier = uuidv4();
    const command = `octave --eval "addpath('${__dirname}'); eqrls(${W}, ${xi_R}, ${N},${SNR_dB},${L},${delay},'${uniqueIdentifier}')"`;

    exec(command, (err, stdout, stderr) => {
      if (err) {
        console.error('Error executing Octave script:', err);
        console.error('stderr:', stderr);
        return res.status(500).send(err);
      }
      const imageUrls = [
        `/rls_eq_${uniqueIdentifier}.png`
      ];
      res.status(200).json({ images: imageUrls });
    });
  } catch (err) {
    console.error('Error handling the upload:', err);
    res.status(500).send(err);
  }
});

app.post('/rls_predict', async (req, res) => {
  try {
    console.log(req.body);
    const { n, sigma_nu, a, lambda } = req.body;
    const uniqueIdentifier = uuidv4();
    const command = `octave --eval "addpath('${__dirname}'); predictor_rls(${n}, ${sigma_nu}, ${a},${lambda},'${uniqueIdentifier}')"`;

    exec(command, (err, stdout, stderr) => {
      if (err) {
        console.error('Error executing Octave script:', err);
        console.error('stderr:', stderr);
        return res.status(500).send(err);
      }
      const imageUrls = [
        `/desired_output_${uniqueIdentifier}.png`,
        `/learning_curve_${uniqueIdentifier}.png`,
        `/random_walk_${uniqueIdentifier}.png`,
      ];
      res.status(200).json({ images: imageUrls });
    });
  } catch (err) {
    console.error('Error handling the upload:', err);
    res.status(500).send(err);
  }
});

app.post('/Estimation', async (req, res) => {
  try {
    console.log(req.body);
    const { N, dt, u, y0, v0, R } = req.body;
    const uniqueIdentifier = uuidv4();
    const command = `octave --eval "addpath('${__dirname}'); kalmanFilterEstimation(${N}, ${dt}, ${u},${y0},${v0},${R},'${uniqueIdentifier}')"`;

    exec(command, (err, stdout, stderr) => {
      if (err) {
        console.error('Error executing Octave script:', err);
        console.error('stderr:', stderr);
        return res.status(500).send(err);
      }
      const imageUrls = [
        `/position_${uniqueIdentifier}.png`,
        `/velocity_${uniqueIdentifier}.png`,
        `/position_error_${uniqueIdentifier}.png`,
        `/velocity_error_${uniqueIdentifier}.png`,
      ];
      res.status(200).json({ images: imageUrls });
    });
  } catch (err) {
    console.error('Error handling the upload:', err);
    res.status(500).send(err);
  }
});

app.post('/Simulation', async (req, res) => {
  try {
    console.log(req.body);
    const { A_octave, x0, num_steps, x0_est } = req.body;
const uniqueIdentifier = uuidv4();
const A = `[${A_octave.map(row => '[' + row.join(',') + ']').join(';')}]`;
const command = `octave --eval "addpath('${__dirname}'); kalman_filter_simulation(${A}, [${x0}], ${num_steps}, [${x0_est}], '${uniqueIdentifier}')"`


    exec(command, (err, stdout, stderr) => {
      if (err) {
        console.error('Error executing Octave script:', err);
        console.error('stderr:', stderr);
        return res.status(500).send(err);
      }
      const imageUrls = [
        `/state_1_${uniqueIdentifier}.png`,
        `/state_2_${uniqueIdentifier}.png`,
      ];
      res.status(200).json({ images: imageUrls });
    });
  } catch (err) {
    console.error('Error handling the upload:', err);
    res.status(500).send(err);
  }
});


app.post('/process_audio', async (req, res) => {
  try {
    console.log(req.body);
    const { audioPath, hop, frame, sr, feature } = req.body;
    const uniqueIdentifier = uuidv4();
    
    // Path configuration
    const pythonScript = path.join(__dirname, 'process_audio.py');
    const inputFile = path.join(__dirname, 'Inputs', audioPath);

    // Build the Python command
    const args = [
      '--file', inputFile.toString(),
      '--hop', hop.toString(),
      '--frame', frame.toString(),
      '--sr', sr.toString(),
      '--feature', feature,
      '--unique-id', uniqueIdentifier
    ];

    // Execute Python script
const pythonProcess = spawn('/mnt/c/Users/user/Downloads/Intern/octave-react-1/env/bin/python', [pythonScript, ...args], {
  cwd: __dirname
});

    // Handle output
    let stdoutData = '';
    pythonProcess.stdout.on('data', (data) => {
      stdoutData += data.toString();
    });

    // Handle errors
    pythonProcess.stderr.on('data', (data) => {
      console.error(`Python stderr: ${data}`);
    });

    // Handle process completion
    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        return res.status(500).json({
          error: `Python script exited with code ${code}`,
          details: stdoutData
        });
      }
  const imageUrls = [
    `/Outputs/${uniqueIdentifier}_AmplitudeEnvelope.png`
    
  ];
res.status(200).json({ images: imageUrls });

    });

  } catch (err) {
    console.error('Error handling the request:', err);
    res.status(500).send(err);
  }
});
app.use('/outputs', express.static(path.join(__dirname, 'outputs')));


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
