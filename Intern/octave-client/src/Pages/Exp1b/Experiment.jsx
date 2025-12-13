import React from 'react'
import Quiz from './Pretest';
import Postquiz from './Posttest';
import Theory from './Theory';
import Procedure from './Procedure';
import Feedback from '../Exp1/Feedback';
import AR from './AR';
import Contact from '../Exp1/Contact';

const Experiment = ({activeTab}) => {

  const renderContent = () => {
    switch (activeTab) {
      case '':
        return <div>To simulate an Autoregressive (AR) stochastic process and analyze its response to different model parameters.</div>;
      case 'theory':
        return <Theory/>;
      case 'pretest':
        return <Quiz/>;
      case 'procedure':
        return <Procedure/>;
      case 'simulation':
        return <AR />;
      case 'post-test':
        return <Postquiz/>;
      case 'references':
        return( <div >
          <ul className='display-disc'>
            <li>Adaptive filters, by Simon Haykin</li>
            <li>Sayed, Ali H. Fundamentals of adaptive filtering. John Wiley & Sons, 2003.</li>
          </ul>
        </div>);
      case 'feedback':
        return <Feedback />;
      case 'contact':
        return <Contact/>
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
