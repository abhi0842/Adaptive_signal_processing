import React, { useState } from 'react';
import equation from './equation.png';
import image from './image.png';

const Postquiz = () => {
  const questions = [
    {
      question: "What are the assumptions of autoregressive models?",
      options: ["the data must be stationary", "the relationship between variables and their lagged values must be linear", "the error term should be white noise", "All of above"],
      answer: 3,
      explanation: "Correct answer is Option :- 4 i.e., All of above"
    },
    {
      question: "From the figures given below, choose the correct option for Autoregressive process?",
      images: [image],
      options: ["order of  fig-1  > order of  fig-2", "order of  fig-1  < order of  fig-2", "order of  fig-1  = order of  fig-2", "None of the above"],
      answer: 1,
      explanation: "Correct answer is Option :- 2 i.e., order of  fig-1  < order of  fig-2"
    },
    {
      question: "What is the order of the given Autoregressive process?",
      images: [equation],
      options: ["3", "2", "1", "4"],
      answer: 1,
      explanation: "Correct answer is Option :- 2 i.e., 2"
    },
    {
      question: "In the plot obtained from the simulation of Autoregressive process what does x-axis represent?",
      options: ["order of the AR process", "AR coefficients", "Standard deviation of the noise", "Number of time steps"],
      answer: 3,
      explanation: "Correct answer is Option :- 4 i.e., Number of time steps"
    }
  ];

  const [selectedOptions, setSelectedOptions] = useState(Array(questions.length).fill(null));
  const [showExplanations, setShowExplanations] = useState(false);

  const handleOptionSelect = (index, optionIndex) => {
    setSelectedOptions(prevOptions => {
      const updatedOptions = [...prevOptions];
      updatedOptions[index] = optionIndex;
      return updatedOptions;
    });
  };

  const handleSubmit = () => {
    setShowExplanations(true);
  };

  const score = selectedOptions.reduce((acc, optionIndex, index) => {
    if (optionIndex === questions[index].answer) {
      return acc + 1;
    }
    return acc;
  }, 0);

  return (
    <div className="postquiz font-sans ">
      <ol>
        {questions.map((question, index) => (
          <li key={index} className="py-4">
            <h3 className='mb-2 font-semibold'>{`${index + 1}. ${question.question}`}</h3>
            {question.images && question.images.map((image, imgIndex) => (
              <img key={imgIndex} src={image} alt={`Illustration for question ${index + 1}`} className='mb-2' />
            ))}
            <ul className='space-y-2'>
              {question.options.map((option, optionIndex) => (
                <li key={optionIndex}>
                  <input
                    type="radio"
                    id={`option-${index}-${optionIndex}`}
                    name={`question-${index}`}
                    value={option}
                    checked={selectedOptions[index] === optionIndex}
                    onChange={() => handleOptionSelect(index, optionIndex)}
                  />
                  <label htmlFor={`option-${index}-${optionIndex}`}>{option}</label>
                </li>
              ))}
            </ul>
            {showExplanations && (
              <div className='mt-2 space-y-2'>
                <p className={selectedOptions[index] === question.answer ? 'text-green' : 'text-red-500'}>
                  {selectedOptions[index] === question.answer ? 'Correct' : 'Incorrect'}
                </p>
                <p className='text-blue-500'>Explanation: {question.explanation}</p>
              </div>
            )}
          </li>
        ))}
      </ol>
      <button onClick={handleSubmit} className='bg-blue-button hover:bg-blue-hover rounded-lg px-2 py-1'>
        Submit
      </button>
      {showExplanations && (
        <div className='mt-2'>
          <p className='font-bold'>Your Score: {score}/{questions.length}</p>
        </div>
      )}
    </div>
  );
};

export default Postquiz;
