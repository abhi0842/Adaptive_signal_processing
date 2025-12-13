import React from 'react';
import Experiments from '../components/Experiments';

const Page1 = ({ activeTab }) => {

  const renderContent = () => {
    switch (activeTab) {
      case '':
        return (
          <div className='font-serif text-lg'>
            The interactive experiments in this lab will give the students an opportunity for better understanding and learning of the basic techniques used in Adaptive Signal Processing.
          </div>
        );
      case 'objective':
        return (
          <div className='font-serif text-lg'>
            To mathematically describe signals and understand how to process them using mathematical operations on signals.
          </div>
        );
      case 'experiments':
        return (
          <div>
            <Experiments />
          </div>
        );
      default:
        return <div></div>;
    }
  };

  return (
    <div className='flex flex-col flex-1 gap-7 font-serif py-2'>
      <div>
        <p className='font-bold text-xl text-center text-blue underline hover:text-green'>
          <a href='https://www.vlab.co.in/broad-area-biotechnology-and-biomedical-engineering'>Adaptive Signal Processing</a>
        </p>
      </div>
      <div className='pl-16 pr-10'>
      {renderContent()}
      </div>
    </div>
  );
};

export default Page1;
