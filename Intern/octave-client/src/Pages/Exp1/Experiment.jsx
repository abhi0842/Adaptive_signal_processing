import React from 'react'
import Simulation from './Simulation';
import Quiz from './Pretest';
import Postquiz from './Posttsest';
import Theory from './Theory';
import Procedure from './Procedure';
import Feedback from './Feedback';
import Contact from './Contact';

const Experiment = ({activeTab}) => {

  const renderContent = () => {
    switch (activeTab) {
      case '':
        return <div>To simulate RLS and LMS algorithms on Simulated and real bio-signal data</div>;
      case 'theory':
        return <Theory/>;
      case 'pretest':
        return <Quiz/>;
      case 'procedure':
        return <Procedure/>;
      case 'simulation':
        return <Simulation />;
      case 'post-test':
        return <Postquiz/>;
      case 'references':
        return <div >Adaptive filters, by Simon Haykin</div>;
      case 'feedback':
        return <Feedback />;
      case 'contact':
        return <Contact/>;
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
