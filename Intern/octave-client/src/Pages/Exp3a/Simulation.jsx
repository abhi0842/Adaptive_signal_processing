import React, { useState } from 'react';
import LMS from './LMS';
import MVDR from './MVDR';

const Simulation = () => {
  const [activeSection, setActiveSection] = useState('NULL'); // State to track the active section

  const renderSection = () => {
    switch (activeSection) {
      case 'LMS':
        return <div><LMS/></div>;
      case 'MVDR':
        return <div><MVDR/></div>;
      default:
        return <div>Which algorithm you wanna try out</div>;
    }
  };

  return (
    <div className='flex flex-col items-center'>
      <div className='flex gap-5 '>
        <button
          className={`px-6 py-2 rounded-lg ${
            activeSection === 'LMS' ? 'bg-blue-hover' : 'bg-blue-button hover:bg-blue-hover'
          }`}
          onClick={() => setActiveSection('LMS')}
        >
          LMS
        </button>
        <button
          className={`px-6 py-2 rounded-lg ${
            activeSection === 'MVDR' ? 'bg-blue-hover' : 'bg-blue-button hover:bg-blue-hover'
          }`}
          onClick={() => setActiveSection('MVDR')}
        >
          MVDR
        </button>
      </div>
      <div className='mt-5'>
        {renderSection()}
      </div>
    </div>
  );
};

export default Simulation;
