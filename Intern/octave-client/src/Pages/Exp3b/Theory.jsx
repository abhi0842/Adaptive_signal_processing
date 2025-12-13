import React from 'react'
import adaptiveequalization from './adaptiveequalization.png'
import convergence from './convergence.png'
import blockdiagram from './blockdiagram.png'
import equation1 from './equation1.png'
import equation2 from './equation2.png'
import equation3 from './equation3.png'
import lms1 from './lms1.png'
import lms2 from './lms2.png'
import rls from './rls.png'
import equation4 from './equation4.png'
import equation5 from './equation5.png'
import equation6 from './equation6.png'

const Theory = () => {
  return (
    <div className='leading-loose text-sm'>
      <p className='font-bold text-xl text-green underline'>Adaptive Equalization</p>
      <p>In adaptive equalization, the filters adopt themselves to the dispersive effects of the channel.  An adaptive equalizer automatically adapts to time-varying properties of the communication channel. The technique of equalization is used to reduce the additive noise. These equalizers are majorly kept in the receiver side. The theory behind this is that the filter characteristics should be optimized. The filter coefficients of an adaptive filter are based on error signal <i>e(n)</i> between the filter output <i> d&#770;(n) </i> and desired signal <i>d(n)</i>.Goal of equalizers is to overcome the negative effects of the channel.</p>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        <img src={adaptiveequalization} alt="adaptiveequalization" style={{ maxWidth: "70%" }} />
      </div>
      <p className='font-bold text-xl text-green underline'>Adaptive equalization using LMS </p>
      <p>
        Least mean squares (LMS) algorithms are a class of adaptive filter used to mimic a desired filter by finding the filter coefficients that relate to producing the least mean squares of the error signal (difference between the desired and the actual signal). It is a stochastic gradient descent method in that the filter is only adapted based on the error at the current time. LMS filter is built around a transversal (i.e. tapped delay line) structure. Two practical features, simple to design, yet highly effective in performance have made it highly popular in various application. LMS filter employ, small step size statistical theory, which provides a fairly accurate description of the transient behaviour.
        It also includes H∞ theory which provides the mathematical basis for the deterministic robustness of the LMS filters. As mentioned before
        LMS algorithm is built around a transversal filter, which is responsible for performing the filtering process.
        A weight control mechanism responsible for performing the adaptive control process on the tape weight of the transversal filter.<br />
        The LMS algorithm in general, consists of two basics procedure: Filtering process, which involve, computing the output of a linear filter in response to the input signal and generating an estimation error by comparing this output with a desired response as follows: <br /><i> e(n) = d(n) - y(n) </i><br />
        The LMS algorithm is based on minimizing the instantaneous error i.e. <i>e<sup>2</sup>(n)</i> with respect to the filter coefficient vector h(n).
        The filter weights are updated as:<br />
        <i>w(n + 1) = w(n) + μe(n)y(n)</i><br />
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <img src={convergence} alt="convergence" style={{ maxWidth: "67%" }} />
        </div>
      </p>
      <p className='font-bold text-xl text-green underline'>Adaptive equalization using RLS </p>
      <p>RLS is advantageous in adaptive equalization for its ability to quickly adapt to channel variations. It provides a high level of performance in environments where the channel characteristics change rapidly, ensuring that the equalizer can effectively mitigate ISI and maintain signal integrity.</p>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        <img src={blockdiagram} alt="blockdiagram" style={{ maxWidth: "60%" }} />
      </div>
      <p>
        In adaptive equalization, the received signal <i>y(n)</i>  is passed through an adaptive filter to produce the equalized output <i>s&#770;(n)</i>. 
        The error signal <i>e(n)</i>, which is the difference between the desired signal <i>s(n)</i> and the equalized output, 
        guides the adaptation process: 
        <div style={{ display: "flex", justifyContent: "left", alignItems: "center" }}>
          <img src={equation1} alt="equation3" style={{ maxWidth: "21%" }} />
        </div>
        The RLS algorithm updates the filter coefficients wn to minimize the weighted sum of squared errors:
        <div style={{ display: "flex", justifyContent: "left", alignItems: "center" }}>
          <img src={equation2} alt="equation4" style={{ maxWidth: "33%" }} />
        </div>
        The recursive update rules for RLS in the context of equalization are:
        <div style={{ display: "flex", justifyContent: "left", alignItems: "center" }}>
          <img src={equation3} alt="equation5" style={{ maxWidth: "39%" }} />
        </div>
        where <i>y(n)</i> represents the input vector to the equalizer.<br />
        where <i>P(n)</i> is the inverse correlation matrix and <i>k(n)</i> is the gain vector.
      </p>
      <p className='font-bold text-xl text-green underline'>Adaptive Prediction via LMS </p>
      <p>Commonly used filters can be divided into three kinds: FIR (Finite Impulse Response) filter, IIR (Infinite Impulse Response) filter, and adaptive filter. 
        The precondition of FIR filter and IIR filter is that the statistical characteristics of input signals are known. The premise design condition of adaptive filter is that some of the statistical characteristics of input signals are unknown. 
        The performance indexes of filter can be replaced by the estimated value of unknown signal. In order to analyse the adaptive filter based on LMS (Least Mean Square) algorithm, the principle and application of adaptive filter should be introduced, and the simulation results based on the statistical experimental method are presented according to the principle and structure of LMS algorithm. 
        The applications of adaptive filtering technology are shown by the introduction of three parts: an adaptive linear filter for the correction of channel mismatch, an adaptive equalizer for the improvement of system performance, and an adaptive notch filter for the elimination of the interference signal with known frequency.
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <img src={lms1} alt="lms1" style={{ maxWidth: "56%" }} />
        </div>
        Desired output is generated as:<br /><i> u(n) =- au(n - 1) + v(n) </i><br />
        where a = -0.98 and v(n) is gaussian white noise.<br />
        Hence the optimal value of estimated weight = a
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <img src={lms2} alt="lms2" style={{ maxWidth: "56%" }} />
        </div>
        Predicting signals requires that you make some key assumptions. Assume that the signal is either steady or slowly varying over time, and periodic over time as well.<br />
        Accepting these assumptions, the adaptive filter must predict the future values of the desired signal based on past values. 
        When s(n) is periodic and the filter is long enough to remember previous values, this structure with the delay in the input signal, can perform the prediction. 
      </p><br />
      <p className='font-bold text-xl text-green underline'>Adaptive Prediction via RLS </p>
      <p>
        Adaptive prediction involves estimating future values of a signal based on past observations. This is critical in applications such as speech coding, echo cancellation, and financial time series forecasting. The goal is to minimize the prediction error, which is the difference between the actual signal and its predicted value.<br />
        The RLS algorithm is preferred for adaptive prediction due to its recursive nature and rapid convergence. Unlike other algorithms such as the Least Mean Squares (LMS), RLS minimizes the weighted sum of squared errors with an exponential weighting factor, providing a robust and efficient means of updating prediction parameters.
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <img src={rls} alt="rls" style={{ maxWidth: "56%" }} />
        </div>
        Given a discrete time signal <i>x(n)</i>,  the predicted value <i>x&#770;(n+1)</i> is based on a linear combination of past values <i>x(n),x(n-1),…,x(n - p + 1)</i>. The prediction error <i>e(n)</i> is given by: <br />
        <div style={{ display: "flex", justifyContent: "left", alignItems: "center" }}>
          <img src={equation4} alt="equation6" style={{ maxWidth: "20%" }} />
        </div>
        In the RLS algorithm, the coefficients wn are updated to minimize the cost function: <br />
        <div style={{ display: "flex", justifyContent: "left", alignItems: "center" }}>
          <img src={equation5} alt="equation7" style={{ maxWidth: "20%" }} />
        </div>
        where 0 &#60; λ &#8804; 1 is the forgetting factor. The recursive update equations for the RLS algorithm are:<br />
        <div style={{ display: "flex", justifyContent: "left", alignItems: "center" }}>
          <img src={equation6} alt="equation8" style={{ maxWidth: "47%" }} />
        </div>
        where <i>P(n)</i> is the inverse correlation matrix and <i>k(n)</i> is the gain vector.<br />
        The learning curve and random walk behavior are critical aspects of understanding and evaluating adaptive prediction and equalization algorithms. The LMS algorithm is characterized by its simplicity and slower convergence, as evidenced by its gradual learning curve and susceptibility to random walk behavior in noisy environments. 
        In contrast, the RLS algorithm offers faster convergence and higher accuracy, with a sharp initial decline in its learning curve and reduced random walk behavior, making it more suitable for dynamic and high-performance applications.
      </p>
    </div>
  )
}

export default Theory

