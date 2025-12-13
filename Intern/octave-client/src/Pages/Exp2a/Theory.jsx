import React from 'react'
import kalmanfilter from './kalmanfilter.png'

const Theory = () => {
  return (
    <div className='leading-loose text-sm'>
      <p className='font-bold text-xl text-green underline'>Kalman Filter</p>
      <p>The Kalman Filter algorithm is a powerful tool for estimating and predicting system states in the presence of uncertainty and is widely used as a fundamental component in applications such as target tracking, navigation, and control. The Kalman Filter predicts the future system state based on past estimations.<br /> </p>
      <p>Kalman filter is an algorithm that combines information about the state of a system using predictions based on a physical model and noisy measurements. It is called a “filter” because it is filtering out measurement noise. Kalman filter has many applications in robotics. For example, it can be used for localization of coordinates and velocity of a robot based on measurements of distance to certain landmarks. It’s widely used for filtering information from GPS sensors and radars. Kalman filters are often used to optimally estimate the internal states of a system in the presence of uncertain and indirect measurements.</p>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        <img src={kalmanfilter} alt="kalman filter" style={{ maxWidth: "55%" }} />
      </div>
      <p>Kalman Filter performs on two main operations. They are,
        <ol className='list-decimal'>
          <li>Estimating the next state of the machine</li>
          <li>Correcting the estimated state with actual measurements</li>
        </ol>
      </p>
      <p>Kalman filters combine two sources of information, the predicted states and noisy measurements, to produce optimal, unbiased state estimates. The essential part of the Kalman filter is to construct initial ensemble. The initial ensemble contains information about the initial states, parameters and their uncertainties.<br /></p>
      <p>The Kalman filter is a set of mathematical equations that provides an efficient computational means to estimate the state of a process in a way that minimizes the mean squared error. As an optimal recursive data processing algorithm, the Kalman filter combines all available measurement data plus prior knowledge about the system and measuring devices to produce an estimate of the desired variables in such a manner that error is minimized statistically. It processes all available measurements regardless of their precision to estimate the current value of the variables of interest. In addition, it does not require all previous data to be stored and reprocessed every time a new measurement is taken.<br /></p>
      <p className='font-bold text-xl text-green underline'>Kalman Filter equations</p>
      <p>Kalman Filter maintains the estimates of the state and the error covariance matrix of the state estimation.</p>
      <p><b>Notations:</b><br />
      X(t|t) — Estimate of x(t) given measurements z(t) and z (t-1), …<br />
      X(t+1|t) — Estimate of x(t+1) given measurements z(t) and z (t-1), …<br />
      P(t|t) — Covariance of X(t) given z(t), z(t-1), …<br />
      P(t+1|t) — Covariance of X(t+1) given z(t), z(t-1), …<br />
      H(t) — transformation matrix<br />
      G(t)=Kalman gain<br />
      </p>
      <p><b>State Estimation</b><br />We have known are x(t|t), u (t), P(t|t) and the new measurement <i>z</i>(t+1).</p>
      <p><b>Time Update</b><br />
        <ol className='list-decimal'>
          <li>State Prediction <b>x</b>(t +1|t) = <b>F</b>(<i>t</i>)<b>x</b>(t|t) + <b>G</b>(<i>t</i>)u(<i>t</i>)</li>
          <li>Measurement Prediction: <b>z</b>(<i>t</i>+1|<i>t</i>) = <b>H</b>(<i>t</i>)<b>x</b>(<i>t</i>+1|<i>t</i>)</li>
        </ol>
      </p>
      <p><b>Measurement Update</b><br />
        <ol className='list-decimal'>
          <li>Measurement Residual: <b>w</b>(<i>t</i>+1) = <b>z</b>(<i>t</i>+1) — <b>z</b>(<i>t</i>+1|<i>t</i>)</li>
          <li>Updated State Estimate: <b>x</b>(<i>t</i>+1|<i>t</i>+1) = <b>x</b>(<i>t</i>+1|<i>t</i>) + <b>W</b>(<i>t</i>+1)<b>w</b>(<i>t</i>+1)</li>
        </ol>
        where W(t+1) is called Kalman Gain in state covariance estimation.
      </p>
      <p><b>State covariance Estimation</b><br />
        <ol className='list-decimal'>
          <li>State prediction covariance: <b>P</b> (<i>t</i> +1|<i>t</i>) = <b>F</b>(<i>t</i>)<b>P</b>(<i>t</i>|<i>t</i>) <i>F</i> (<i>t</i>)’+<b>Q</b> (<i>t</i>)</li>
          <li>Measurement prediction covariance: <b>S</b> (<i>t</i> +1) = <b>H</b> (<i>t</i> +1) <b>P</b> (<i>t</i> +1|<i>t</i>) <b>H</b> (<i>t</i> +1)’+<b>R</b> (<i>t</i> +1)</li>
          <li>Filter Gain: <b>W</b> (<i>t</i> +1) = <b>P</b> (<i>t</i> +1|<i>t</i>) <i>H</i> (<i>t</i> +1)’ <b>S</b> (<i>t</i> +1)<b>-1</b></li>
          <li>Updated state covariance: <b>P</b> (<i>t</i> +1|<i>t</i> +1) = <b>P</b> (<i>t</i> +1|<i>t</i>) — <b>W</b> (<i>t</i> +1) <b>S</b> (<i>t</i> +1) <b>W</b> (<i>t</i> +1)’</li>
        </ol>
      </p>
      </div>
  )
}

export default Theory

