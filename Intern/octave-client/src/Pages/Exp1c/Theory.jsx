import React from 'react'
import randomprocesses from './randomprocesses.png'

const Theory = () => {
  return (
    <div className='leading-loose '>
      <p className='font-bold text-xl text-green underline'>Stochastic Process Definition </p>
      <ul className='list-disc'>
        <li>A stochastic process is a mathematical model that describes a sequence of random variables. The individual random variables in the sequence usually called “events.” </li>
        <li>A stochastic or random process can be defined as a collection of random variables that is indexed by some mathematical set, meaning that each random variable of the stochastic process is uniquely associated with an element in the set.</li>
        <li>A stochastic process can be used to model the evolution of a physical system over time, or the evolution of a random variable over time.</li>
      </ul><br />
      <p className='font-bold text-xl text-green underline'>Types of Stochastic Processes </p>
      <p>There are four types of stochastic processes: </p>
      <ol className='list-decimal'>
        <li><b>Discrete-time stochastic processes:</b> These processes are characterized by a sequence of random variables, each of which takes on a finite set of values. </li>
        <li><b>Continuous-time stochastic processes:</b> These processes are characterized by a sequence of random variables, each of which takes on a continuous range of values. </li>
        <li><b>Stationary stochastic processes:</b> These processes are characterized by the fact that the statistical properties of the random variables do not change over time. </li>
        <li><b>Non-stationary stochastic processes:</b> These processes are characterized by the fact that the statistical properties of the random variables change over time. </li>
      </ol><br />
      <p className='font-bold text-xl text-green underline'>Stationary Random Processes </p>
      <p>A random process at a given time is a random variable and, in general, the characteristics of this random variable depend on the time at which the random process is sampled. A random process <i>X(t)</i> is said to be stationary or strict-sense stationary if the pdf of any set of samples does not vary with time. In other words, the joint pdf or cdf of <i>X(t<sub>1</sub>), …, X(t<sub>k</sub>)</i> is the same as the joint pdf or cdf of <i> X<sub>(𝑡1+𝜏)</sub>,…, X<sub>(𝑡𝑘+𝜏)</sub> </i> for any time shift τ, and for all choices of <i>t<sub>1</sub>, …,t<sub>k</sub></i>.</p><br />
      <p>In principle, it is difficult to determine if a process is stationary, moreover, stationary processes cannot occur physically, because in reality signals begin at some finite time and end at some finite time. Due to practical considerations, we simply consider the observation interval to be limited, and usually use the first and second order statistics rather than the joint pdfs and cdfs. Since it is difficult to determine the distribution of a random process, the focus usually becomes on a partial, yet useful, description of the distribution of the process, such as the mean, autocorrelation, and autocovariance functions of the random process. </p><br />
      <p>A random process <i>X(t)</i> is a wide-sense stationary process if its mean is a constant (i.e., it is independent of time), and its autocorrelation function depends only on the time difference 𝜏=𝑡<sub>2</sub>−𝑡<sub>1</sub> and not on <i>t<sub>1</sub></i> and <i>t<sub>2</sub></i> individually. In other words, in a wide-sense stationary process, the mean and autocorrelation functions do not depend on the choice of the time origin. All random processes that are stationary in the strict sense are wide-sense stationary, but the converse, in general, is not true. However, if a Gaussian random process is wide-sense stationary, then it is also stationary in the strict sense.  </p>
      <p>
        A random process X (t) is said to be wide-sense stationary (WSS) if its mean and autocorrelation functions are time invariant, i.e. 
        <ol className='list-decimal'>
          <li>E (X (t)) = µ, independent of t </li>
          <li>R<sub>X</sub>(t<sub>1</sub>, t<sub>2</sub>) is a function only of the time difference t<sub>2</sub> − t<sub>1</sub> </li>
          <li>E [ X(t)<sub>2</sub>] &lt; ∞ (technical condition) </li>
        </ol>
        Since R<sub>X</sub>(t<sub>1</sub>, t<sub>2</sub>) = R<sub>X</sub>(t<sub>2</sub>, t<sub>1</sub>), for any wide sense stationary process X(t), R<sub>X</sub>(t<sub>1</sub>, t<sub>2</sub>) is a function only  
      </p><br />
      <p className='font-bold text-xl text-green underline'>Non-Stationary processes </p>
      <p>In a covariance stationary stochastic process, it is assumed that the means, variances and autocovariances are independent of time. In a non-stationary process, one or more of these assumptions is not true. </p>
      <p>A nonstationary process is characterized by a joint pdf or cdf that depends on time instants t<sub>1</sub>, …, t<sub>k</sub>. For a stationary random process, the mean and variance are both constants (i.e., neither of them is a function of time). </p>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        <img src={randomprocesses} alt="random processes" style={{ maxWidth: "45%" }} />
      </div>
      <p>Data points are often non stationary or have means, variances and covariances that change over the time. On-stationary behaviors can be trends, cycles, random walks, or combinations of the three. Non-stationary data, as a rule, are unpredictable and cannot be modelled or forecasted </p>
    </div>
  )
}

export default Theory

