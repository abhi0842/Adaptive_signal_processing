import React from 'react'
import equation3 from './equation3.png'
import equation4 from './equation4.png'
import equation5 from './equation5.png'
import equation6 from './equation6.png'
import equation7 from './equation7.png'
import equation8 from './equation8.png'
import equation9 from './equation9.png'
import equation10 from './equation10.png'
import equation11 from './equation11.png'

const Theory = () => {
  return (
    <div className='leading-loose text-sm'>
      <p className='font-bold text-xl text-green underline'>Kalman filter With unforced dynamic model and noiseless state space model.</p>
      <p>The Kalman filter is a recursive algorithm for estimating the state of a linear dynamic system using noisy observations. his summary focuses on a specialized form of the Kalman filter applied to an unforced dynamic model with a noiseless state-space representation, as described by Sayed and Kailath (1994). 
         This model is characterized by the absence of process noise and a simplified state transition influenced by a scalar parameter. This special unforced dynamical model holds the key to the formulation of a general framework for deriving the RLS family of adaptive filtering algorithms<br /><br />
      </p>
      <p>The linear dynamical system under consideration is described by the following state-space equations::<br />
        <ol className='list-decimal'>
          <li><b>State Equation:</b></li>
          <p><i>x</i>(<i>n</i> + 1) = λ<sup>-1/2</sup> <i>x</i>(<i>n</i>), where λ is a positive real scalar.</p>
          <li><b>Measurement Equation:</b> <i>y</i>(<i>n</i>) = u<sup>H</sup> (<i>n</i>) <i>x</i>(<i>n</i>) + <i>v</i>(<i>n</i>)</li>
          <p>According to this model, the process noise is zero, and the measurement noise, denoted by the scalar vn , is a zero-mean white noise process with unit variance, as shown by</p>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <img src={equation3} alt="equation3" style={{ maxWidth: "35%" }} />
          </div>
          <p><b>Characteristics:</b>
            <ul className='list-disc'>
              <li>Unforced Dynamics: The absence of process noise indicates no external disturbances affect the state transition.</li>
              <li>Measurement Noise: The measurement noise vn is a zero-mean white noise process with unit variance.</li>
              <li>State Transition Matrix: The state transition matrix is simplified to  λ, a scalar.
                <p><b>Initial Conditions:</b></p>
                <p>Initial State Estimate:</p>
                <div style={{ display: "flex", justifyContent: "left", alignItems: "center" }}>
                  <img src={equation4} alt="equation4" style={{ maxWidth: "15%" }} />
                </div>
                <p>Initial Error Covariance:</p>
                <div style={{ display: "flex", justifyContent: "left", alignItems: "center" }}>
                  <img src={equation5} alt="equation5" style={{ maxWidth: "47%" }} />
                </div>
              </li>
            </ul>
          </p>
        </ol>
      </p>
      <p>Given this model, the Kalman filter equations for computing the state estimates and error covariances are derived as follows:<br />
      <ol className='list-decimal'>
          <b><li>Time Update (Prediction):</li></b>
          <p>The prediction step involves estimating time n based on the state at time n-1:</p>
          <div style={{ display: "flex", justifyContent: "left", alignItems: "center" }}>
            <img src={equation6} alt="equation6" style={{ maxWidth: "30%" }} />
          </div>
          <p>The corresponding error covariance matrix is updated as:</p>
          <div style={{ display: "flex", justifyContent: "left", alignItems: "center" }}>
            <img src={equation7} alt="equation7" style={{ maxWidth: "28%" }} />
          </div>
          <b><li>Measurement Update (Correction):</li></b>
            <ul className='list-disc'>
              <p>The correction step involves updating the predicted state estimate using the measurement at time n:</p>
              <li>Kalman Gain Computation:</li>
              <div style={{ display: "flex", justifyContent: "left", alignItems: "center" }}>
                <img src={equation8} alt="equation8" style={{ maxWidth: "32%" }} />
              </div>
              <li>Measurement Residual:</li>
              <div style={{ display: "flex", justifyContent: "left", alignItems: "center" }}>
                <img src={equation9} alt="equation9" style={{ maxWidth: "38%" }} />
              </div>
              <li>State Estimate Update:</li>
              <div style={{ display: "flex", justifyContent: "left", alignItems: "center" }}>
                <img src={equation10} alt="equation10" style={{ maxWidth: "38%" }} />
              </div>
              <li>Error Covariance Update:</li>
              <div style={{ display: "flex", justifyContent: "left", alignItems: "center" }}>
                <img src={equation11} alt="equation11" style={{ maxWidth: "45%" }} />
              </div>
            </ul>
        </ol>
      </p>
      <p>This Kalman filter formulation for an unforced dynamic model with a noiseless state-space model provides a robust method for state estimation. The absence of process noise simplifies the state transition, while the scalar parameter λ plays a crucial role in the filter's operation. 
        This approach is particularly valuable for adaptive filtering algorithms, such as the Recursive Least Squares (RLS) algorithm, leveraging the unique properties of the unforced dynamic model to achieve efficient and accurate state estimation in the presence of measurement noise. By following the described steps, the filter continuously refines its state estimates and error covariances, ensuring optimal performance.
      </p>
      </div>
  )
}

export default Theory

