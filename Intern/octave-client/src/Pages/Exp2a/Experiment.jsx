import React from 'react'
import Quiz from './Pretest';
import Postquiz from './Posttest';
import Theory from './Theory';
import Procedure from './Procedure';
import Feedback from '../Exp1/Feedback';
import Estimation from './Estimation';
import Contact from '../Exp1/Contact';

const Experiment = ({activeTab}) => {

  const renderContent = () => {
    switch (activeTab) {
      case '':
        return <div>Implementation of correspondence  between the initial conditions of the Kalman filter variables, such as the initial state estimate and error covariance, and the filter's prediction performance.</div>;
      case 'theory':
        return <Theory/>;
      case 'pretest':
        return <Quiz/>;
      case 'procedure':
        return <Procedure/>;
      case 'simulation':
        return <Estimation/>;
      case 'post-test':
        return <Postquiz/>;
      case 'references':
        return <div >Haykin, Simon S. <i>Adaptive filter theory.</i> Pearson Education India, 2002.</div>;
      case 'contact':
        return <Contact/>
      case 'feedback':
        return <Feedback/>;
      default:
        return <div></div>;
    }
  };

  return (
          <div className="flex flex-col flex-1 gap-7 font-serif py-2 ">
            <div>
              <p className="font-bold text-lg text-center text-blue underline hover:text-green">
                <a href="https://www.vlab.co.in/broad-area-biotechnology-and-biomedical-engineering">
                  Adaptive Signal Processing
                </a>
              </p>
            </div>
            <div className='pl-16 pr-6'>{renderContent()}</div>
          </div>
  )
}

export default Experiment;
