import React, { useState } from 'react';
import LMS_EQUALIZATION from './LMS_EQUALIZATION';
import RLS_EQUALIZATION from './RLS_EQUALIZATION';
import LMS_PREDICTION from './LMS_PREDICTION';
import RLS_PREDICTION from './RLS_PREDICTION';

const Simulation = () => {
  const [activeSection, setActiveSection] = useState('NULL'); // State to track the active section
  const [algorithmType, setAlgorithmType] = useState(''); // State to track the type of algorithm

  const renderSection = () => {
    if (activeSection === 'LMS') {
      switch (algorithmType) {
        case 'Equalization':
          return <div><LMS_EQUALIZATION/></div>;
        case 'Prediction':
          return <div><LMS_PREDICTION/></div>;
        default:
          return <div></div>;
      }
    } else if (activeSection === 'RLS') {
      switch (algorithmType) {
        case 'Equalization':
          return <div><RLS_EQUALIZATION/></div>;
        case 'Prediction':
          return <div><RLS_PREDICTION/></div>;
        default:
          return <div></div>;
      }
    } else {
      return <div>Select an algorithm</div>;
    }
  };

  return (
    <div className='flex flex-col items-center'>
      <div className='flex gap-5'>
        <button
          className={`px-6 py-2 rounded-lg ${
            activeSection === 'LMS' ? 'bg-blue-hover' : 'bg-blue-button hover:bg-blue-hover'
          }`}
          onClick={() => {
            setActiveSection('LMS');
            setAlgorithmType('');
          }}
        >
          LMS
        </button>
        <button
          className={`px-6 py-2 rounded-lg ${
            activeSection === 'RLS' ? 'bg-blue-hover' : 'bg-blue-button hover:bg-blue-hover'
          }`}
          onClick={() => {
            setActiveSection('RLS');
            setAlgorithmType('');
          }}
        >
          RLS
        </button>
      </div>
      {activeSection !== 'NULL' && (
        <div className='flex gap-5 mt-5'>
          <button
            className={`px-6 py-2 rounded-lg ${
              algorithmType === 'Equalization' ? 'bg-blue-hover' : 'bg-blue-button hover:bg-blue-hover'
            }`}
            onClick={() => setAlgorithmType('Equalization')}
          >
            Equalization
          </button>
          <button
            className={`px-6 py-2 rounded-lg ${
              algorithmType === 'Prediction' ? 'bg-blue-hover' : 'bg-blue-button hover:bg-blue-hover'
            }`}
            onClick={() => setAlgorithmType('Prediction')}
          >
            Prediction
          </button>
        </div>
      )}
      <div className='mt-5'>
        {renderSection()}
      </div>
    </div>
  );
};

export default Simulation;
