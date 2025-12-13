import React from 'react'
import arprocessanalyser from './arprocessanalyser.png'
import arprocessgenerator from './arprocessgenerator.png'
import adaptivefilter from './adaptivefilter.png'
import equation1 from './equation1.png'
import equation2 from './equation2.png'
import mvdr from './mvdr.png'

const Theory = () => {
  return (
    <div className='leading-loose text-sm'>
      <p className='font-bold text-xl text-green underline'>Minimum Variance Distortion less Beamformer Using LMS and Monte-Carlo Runs<br /><br />Introduction to Beamforming</p>
      <p>Beamforming is a signal processing technique used in sensor arrays for directional signal transmission or reception. This technique involves combining signals from multiple sensors in such a way that signals from a particular direction are constructively combined while those from other directions are destructively interfered. Beamforming is widely used in applications such as radar, sonar, wireless communications, and audio signal processing.</p>
      <p className='font-bold text-xl text-green underline'>Minimum Variance Distortion less Response (MVDR) Beamformer </p>
      <p>The MVDR beamformer, also known as the Capon beamformer, is designed to minimize the output power of the beamformer subject to the constraint that the response in the direction of the desired signal remains unity. This can be mathematically expressed as:<br />
          <i>min<sub>w</sub>w<sup>H</sup>HRw subject to w<sup>H</sup>a(θ) = 1</i><br />
          where:
          <ul className='list-disc'>  
            <li> w is the beamforming weight vector,</li>
            <li>R is the covariance matrix of the input data,</li>
            <li>a(θ) is the steering vector in the direction θ</li>  
          </ul>
          The solution to this optimization problem is given by:<br />
          <i>w<sub>MvDR</sub> =R<sup>-1</sup>a(θ)/a<sup>H</sup>R<sup>-1</sup>a(θ)</i><br />
          This solution ensures that the desired signal is preserved while minimizing the power from interference and noise.
      </p>
      <p className='font-bold text-xl text-green underline'>Least Mean Squares (LMS) Algorithm </p>
      <p>The Least Mean Squares (LMS) algorithm is an adaptive filter used to find the filter coefficients that minimize the mean square error between the desired signal and the actual output of the filter. In the context of beamforming, the LMS algorithm can be used to iteratively adjust the beamforming weights to minimize the output power. The update rule for the weights is given by:<br />
      <i>w(n + 1) = w(n) - μx(n)ⅇ*(n)</i></p>
      <p>where:
      <ul className='list-disc'>
      <li>μ is the step size parameter,</li>
      <li>x(n) is the input signal vector at time n,</li>
      <li>e(n) is the error signal, defined as the difference between the desired signal and the actual output.</li>
      </ul>
      The LMS algorithm is simple to implement and computationally efficient, making it suitable for real-time applications.
      </p>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        <img src={mvdr} alt="mvdr" style={{ maxWidth: "55%" }} />
      </div>
      <p className='font-bold text-xl text-green underline'>Monte Carlo Simulations </p>
      <p>Monte Carlo simulations are a statistical technique used to model and analyse the behaviour of complex systems through random sampling. In the context of beamforming, Monte Carlo simulations can be used to evaluate the performance of the MVDR beamformer under various scenarios, such as different signal-to-noise ratios, array geometries, and interference conditions.<br />
      The combination of MVDR beamforming with the LMS algorithm and Monte Carlo simulations provides a robust framework for adaptive beamforming. The LMS algorithm adapts the beamforming weights in real-time, ensuring that the MVDR criterion is satisfied even in changing environments. Monte Carlo simulations can be used to evaluate the performance of this adaptive approach under different scenarios and validate its effectiveness.</p>
      <p className='font-bold text-xl text-green underline'>Advantages </p>
      <p>
        <ul className='list-disc'>
        <li><b>Real-Time Adaptation:</b> The LMS algorithm allows for real-time adjustment of the beamforming weights, making the system adaptable to changing conditions.<br /></li>
        <li><b>Performance Evaluation:</b> Monte Carlo simulations provide a comprehensive evaluation of the system's performance under various scenarios, ensuring robustness.</li>
        </ul>
      </p>
      <p className='font-bold text-xl text-green underline'>Disadvantages </p>
      <p>
        <ul className='list-disc'>
          <li><b>Computational Complexity:</b> While the LMS algorithm is computationally efficient, the overall complexity can increase with the size of the sensor array and the number of Monte Carlo runs.<br /></li>
          <li><b>Convergence:</b> Ensuring the convergence of the LMS algorithm to the optimal solution requires careful selection of the step size parameter μ.</li>
        </ul>
      </p>
      <p className='font-bold text-xl text-green underline'><br />AR process with LMS and monte-carlo runs </p>
      <p>Autoregressive models operate under the premise that past values have an effect on current values, which makes the statistical technique popular for analysing nature, economics, and other processes that vary over time. Multiple regression models forecast a variable using a linear combination of predictors, whereas autoregressive models use a combination of past values of the variable. </p>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        <img src={arprocessanalyser} alt="ar process analyser" style={{ maxWidth: "60%" }} />
      </div>
      <p>We consider the example of M order AR process that is real valued. 
        The above figure shows the block diagram of model used to generate this process. 
        Its time domain description is governed by the M order difference equation<br /></p>
      <p align='center'>u(n)+a<sub>1</sub>u(n-1)+a<sub>2</sub>u(n-2)+...........+a<sub>3</sub>u(n-M)=v(n)<br /></p>
      <p>where v(n) is drawn from a white noise process of zero mean and variance σ<sup>2</sup>.</p>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        <img src={arprocessgenerator} alt="ar process generator" style={{ maxWidth: "75%" }} />
      </div>
      <p className='font-bold text-xl text-green underline'>The Adaptive filter </p>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        <img src={adaptivefilter} alt="adaptive filter" style={{ maxWidth: "65%" }} />
      </div>
      <p>We use the error e(n) between the desired response d(n) and the output of the filter y(n) to tune the weights of the filter. The Least Mean Squares (LMS) algorithm is the most popular adaptive algorithm due to its simplicity and robustness.<br />
        The LMS algorithm performs the following operations to update the coefficients of an adaptive FIR filter:
      </p>
      <ol className='list-decimal'>
        <li>Calculates the output signal y(n) from the FIR filter.
        <div style={{ display: "flex", justifyContent: "left", alignItems: "center" }}>
          <img src={equation1} alt="equation1" style={{ maxWidth: "19%" }} />
        </div>
        where u(i)is the tap-input vector at time i, defined by <i>u(i)=[u(i),u(i-1),…,u(i-M+1)]T,</i><br />
                  and w(n) is the tap-weight vector at time n, defined by <i>n=[w<sub>0</sub>(n),w<sub>1</sub>(n),…,w<sub>M-1</sub>(n)]T</i>
        </li>
        <li>Calculates the error signal e(n) by using the following equation: e(n) = d(n)–y(n) </li>
        <li>Updates the filter coefficients by using the following equation:<br />
          <div style={{ display: "flex", justifyContent: "left", alignItems: "center" }}>
            <img src={equation2} alt="equation2" style={{ maxWidth: "36%" }} />
          </div>
          where, μ is the step size of the adaptive filter<br />
            w(n) is the filter coefficients vector<br />
            u(n) is the filter input vector.
        </li>
      </ol>
      <p>A Monte Carlo simulation is used to model the probability of different outcomes in a process that cannot easily be predicted due to the intervention of random variable. It is a technique used to understand the impact of risk and uncertainty. A Monte Carlo simulation is used to tackle a range of problems in many fields, including investing, business, physics, and engineering. It is also referred to as a multiple probability simulation.<br />
        The Monte Carlo simulation is a mathematical technique that predicts possible outcomes of an uncertain event. Monte Carlo Simulation is a type of computational algorithm that uses repeated random sampling to obtain the likelihood of a range of results of occurring.
      </p>
      </div>
  )
}

export default Theory

