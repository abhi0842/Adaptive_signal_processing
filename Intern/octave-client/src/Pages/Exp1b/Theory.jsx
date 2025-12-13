import React from 'react'
import autoregressive from './autoregressive.png'

const Theory = () => {
  return (
    <div className='leading-loose'>
      <p className='font-bold text-xl text-green underline'>Autoregressive Model </p>
      <p >
      A statistical model is autoregressive if it predicts future values based on past values. For example, an autoregressive model might seek to predict a stock's future prices based on its past performance. 
      </p>
      <p className='font-bold text-xl text-green underline'>Basic concept of Autoregressive Models </p>
      <p >Autoregressive models operate under the premise that past values have an effect on current values, which makes the statistical technique popular for analysing nature, economics, and other processes that vary over time. Multiple regression models forecast a variable using a linear combination of predictors, whereas autoregressive models use a combination of past values of the variable. <br />
An AR (1) autoregressive process is one in which the current value is based on the immediately preceding value, while an AR (2) process is one in which the current value is based on the previous two values. An AR (0) process is used for white noise and has no dependence between the terms. In addition to these variations, there are also many different ways to calculate the coefficients used in these calculations, such as the least squares method. </p>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
      <img src={autoregressive} alt="auto regressive model" style={{ maxWidth: "60%" }} />
      </div>
      <br/>
      <p>
      We consider the example of second order AR process that is real valued. The above figure shows the block diagram of model used to generate this process. Its time domain description is governed by the second order difference equation  <br />
      </p>
      <p align='center'>u(n)+a<sub>1</sub>u(n-1)+a<sub>2</sub>u(n-2)=v(n)</p>
      <p>where v(n) is drawn from a white noise process of zero mean and variance σ<sup>2</sup>.</p>
      </div>
  )
}

export default Theory

