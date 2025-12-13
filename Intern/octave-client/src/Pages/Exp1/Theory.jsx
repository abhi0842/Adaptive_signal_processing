import React from 'react'
import lms from './lms.png'
import l1 from './l1.png'
import l2 from './l2.png'
import r1 from './r1.png'
import r3 from './r3.png'
import r4 from './r4.png'
import r5 from './r5.png'
import img from './img.png'

const Theory = () => {
  return (
    <div className='leading-loose '>
      <p className='font-bold text-xl text-green underline'>Least Mean Square (LMS) Adaptive Filter Concepts</p>
      <p >
        An adaptive filter is a computational device that iteratively models the relationship between the input and output signals of a filter. An adaptive filter self-adjusts the filter coefficients according to an adaptive algorithm. Least mean squares (LMS) algorithms are a class of adaptive filter used to mimic a desired filter by finding the filter coefficients that relate to producing the least mean square of the error signal (difference between the desired and the actual signal). It is a stochastic gradient descent method in that the filter is only adapted based on the error at the current time.
      </p>
      <p >Figure 1 shows the diagram of a typical adaptive filter.</p>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
      <img src={lms} alt="adaptive filter" style={{ maxWidth: "40%" }} />
      </div>
      <pre className='font-serif leading-loose'>
        where<br/>
        x(n) is the input signal to a linear filter <br />
        y(n) is the corresponding output signal <br/>
        d(n) is an additional input signal to the adaptive filter<br/>
        e(n) is the error signal that denotes the difference between d(n) and y(n).
      </pre><br />
      <p>
        The linear filter can be different filter types such as finite impulse response (FIR) or infinite impulse response (IIR). An adaptive algorithm adjusts the coefficients of the linear filter iteratively to minimize the power of e(n). The LMS algorithm is an adaptive algorithm among others which adjusts the coefficients of FIR filters iteratively. Other adaptive algorithms include the recursive least square (RLS) algorithms.
      </p>
      <br/>
      <p>
        The LMS algorithm performs the following operations to update the coefficients of an adaptive FIR filter:
      </p>
      <ol className='list-decimal'>
        <li>
          <p>Calculates the output signal y(n) from the FIR filter.</p>
          <div style={{ display: "flex", justifyContent: "left", alignItems: "center" }}>
            <img src={l1} alt="Output signal formula" style={{ maxWidth: "40%" }} />
          </div>
        </li>
        <li>
          Calculates the error signal e(n) by using the following equation: e(n) = d(n)–y(n)
        </li>
        <li>
          <p>Updates the filter coefficients by using the following equation:</p>
          <div style={{ display: "flex", justifyContent: "left", alignItems: "center" }}>
            <img src={l2} alt="filter coefficients calculation" style={{ maxWidth: "27%" }} />
          </div>
          <pre className='font-serif'>
            where <br />
            μ is the step size of the adaptive filter<br />
            w(n) is the filter coefficients vector<br/>
            u(n) is the filter input vector.<br/>
          </pre>
        </li>
      </ol>
      <p className='font-semibold'>Advantage </p>
      <p>The advantage of the LMS algorithm include simplicity, ease of implementation, good convergence environments, and improved time domain waveform and convergence effect with the proposed algorithm.</p>
      <p className='font-semibold'>Limitation</p>
      <p>The Least Mean Square (LMS) algorithm is familiar and simple to use for cancellation of noises. However, the low convergence rate and low signal to noise ratio are the limitations for this LMS algorithm.</p>
      <br/>
      <p className='font-bold text-xl text-green underline'>Recursive Least Squares(RLS)</p>
      <br/>
      <p>
        Adaptive filtering is a signal processing technique that automatically adjusts the filter coefficients to achieve the desired filtering characteristics. The Recursive Least Squares (RLS) algorithm is a powerful adaptive filtering algorithm known for its rapid convergence and accuracy. The RLS algorithm is applied in various adaptive filtering scenarios, such as noise cancellation, echo cancellation, and system identification. This theory provides a detailed explanation of the RLS algorithm, its mathematical basis, and its application in adaptive filtering.
      </p>
      <p>
        The goal of adaptive filtering is to design a filter with coefficients that adapt to minimize the difference between the desired signal and the filter's actual output. The RLS algorithm accomplishes this by recursively minimizing the weighted least squares cost function, which considers both past and present error samples and uses an exponential weighting factor.
      </p>
      <pre className='font-serif'>
        Mathematical Foundation:<br/>
        The RLS algorithm minimizes the following cost function (J(n)):
      </pre>
      <div style={{ display: "flex", justifyContent: "left", alignItems: "center" }}>
        <img src={r1} alt="cost function calculation" style={{ maxWidth: "20%" }} />
      </div>
      <p>where e(i)  is the difference between the desired response d(i)  and the output y(i) produced by an FIR filter.</p>
      <div style={{ display: "flex", justifyContent: "left", alignItems: "center" }}>
        <img src={r3} alt="error calculation" style={{ maxWidth: "55%" }} />
      </div>
      <pre className='font-serif'>Note that the tap weights of the FIR filter remain fixed during the observation interval.<br/>
1 ≤ <i>i</i> ≤ n  for which the cost function J(n) is defined.<br/>
        The weighting factor  β(n,ⅈ)  has the property<br />
        0 &lt; β(n, i) ≤ 1 , i=1,2, …,n
      </pre>
      <p >
        The use of the weighting factor β(n,ⅈ), in general, is intended to ensure that data in the distant past are “forgotten” to afford the possibility of following the statistical variations of the observable data. A special form of weighting that is commonly used is the <span className='font-semibold'>exponential weighting factor, or forgetting factor,</span> defined by
      </p>
      <p>
        β(n, i) = λ<sup>(n - i)</sup>, &nbsp; i = 1, 2, &hellip;, n
      </p>
      <p>
        where λ is a positive constant close to, but less than, unity. When λ = 1, we have the ordinary method of least squares. The inverse of 1 - λ is, roughly speaking, a measure of the memory of the algorithm. The special case λ = 1 corresponds to infinite memory.
      </p>
      <p>
        The RLS algorithm updates the filter coefficients 𝑤(𝑛) recursively to minimize 𝐽(𝑛). The update equations are derived from the method of least squares and involve the following,
      </p>
      <p>
        Initialize the algorithm by setting,
      </p>
      <div style={{ display: "flex", justifyContent: "left", alignItems: "center" }}>
        <img src={r4} alt="cALC" style={{ maxWidth: "26%" }} />
      </div>
      <p>where δ is the regularization parameter.</p>
      <p>
        The parameter δ  should be assigned a small value for high signal-to-noise ratio (SNR) and a large value for low SNR.
      </p>
      <p>
        For each instant of time n=1,2,…,  compute 
      </p>
      <div style={{ display: "flex", justifyContent: "left", alignItems: "center" }}>
        <img src={r5} alt="compute" style={{ maxWidth: "50%" }} />
      </div>
      <p className='font-bold'>Signal Flow graph:</p>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        <img src={img} alt="graph" style={{ maxWidth: "80%" }} />
      </div>
      <p className='font-bold'>Advantages</p>
      <p>• Fast Convergence: The RLS algorithm converges faster than other adaptive filtering algorithms like the Least Mean Squares (LMS) algorithm.</p>
      <p>• Accuracy: It provides more accurate filter coefficient updates, leading to better performance in tracking signal changes.</p>
      <p className='font-bold'>Limitations</p>
      <p>
        •	Computational Complexity: The RLS algorithm is computationally more intensive than the LMS algorithm, making it less suitable for real-time applications with limited computational resources.
      </p>
      <p>
        •	Memory Requirement: It requires storage of the inverse correlation matrix, which can be memory-intensive for large filter orders.
      </p>
      <br />
      <p className='font-bold text-xl text-green underline'>
        Compare RLS and LMS Adaptive Filter Algorithms
      </p>
      <br />
      <p>
        Least mean squares (LMS) algorithms represent the simplest and most easily applied adaptive algorithms. The recursive least squares (RLS) algorithms, on the other hand, are known for their excellent performance and greater fidelity, but they come with increased complexity and computational cost. In performance, RLS approaches the Kalman filter in adaptive filtering applications with somewhat reduced required throughput in the signal processor. Compared to the LMS algorithm, the RLS approach offers faster convergence and smaller error with respect to the unknown system at the expense of requiring more computations.
      </p>
      <p>
        Note that the signal paths and identifications are the same whether the filter uses RLS or LMS. The difference lies in the adapting portion.
      </p>
      <p>
        The LMS filters adapt their coefficients until the difference between the desired signal and the actual signal is minimized (least mean squares of the error signal). This is the state when the filter weights converge to optimal values, that is, they converge close enough to the actual coefficients of the unknown system. This class of algorithms adapt based on the error at the current time. The RLS adaptive filter is an algorithm that recursively finds the filter coefficients that minimize a weighted linear least squares cost function relating to the input signals. These filters adapt based on the total error computed from the beginning.
      </p>
      <p>
        The LMS filters use a gradient-based approach to perform the adaptation. The initial weights are assumed to be small, in most cases very close to zero. At each step, the filter weights are updated based on the gradient of the mean square error. If the gradient is positive, the filter weights are reduced, so that the error does not increase positively. If the gradient is negative, the filter weights are increased. The step size with which the weights change must be chosen appropriately. If the step size is very small, the algorithm converges very slowly. If the step size is very large, the algorithm converges very fast, and the system might not be stable at the minimum error value.
      </p>
    </div>
  )
}

export default Theory

