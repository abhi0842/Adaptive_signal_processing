import React, { useState } from 'react';
import questionImage from './question.png';

const Quiz = () => {
  const questions = [
    {
      question: "In autoregressive models ……………………………",
      options: ["Current value of dependent variable is influenced by current values of independent variables", "Current value of dependent variable is influenced by current and past values of independent variables", "Current value of dependent variable is influenced by past values of both dependent and independent variables", "None of the above"],
      answer: 2,
      explanation: "Correct answer is Option :- 3 i.e., Current value of dependent variable is influenced by past values of both dependent and independent variables ."
    },
    {
      question: "A white noise process will have",
      images: [questionImage],
      options: ["(ii) and (iv) only", "(i) and (iii) only", "(i), (ii) and(iii) only", "(i), (ii), (iii) and (iv)"],
      answer: 0,
      explanation: "Correct answer is Option :- 1 i.e., (ii) and (iv) only"
    },
    {
      question: "The white noise spectral density………………………",
      options: ["changes with frequency", "remain constant", "changes with BW", "changes with amplitude"],
      answer: 1,
      explanation: "Correct answer is Option :- 2 i.e., remain constant"
    },
    {
      question: "What are the properties of autoregressive Models?",
      options: ["Stationarity", "Invertibility", "Ergodicity", "All of above"],
      answer: 3,
      explanation: "Correct answer is Option :- 4 i.e., All of above"
    },
    {
      question: "What is the key feature of an order(p) of AR model",
      options: ["The current value depends on future values", "The current value depends only on a random noise term", "The current value depends on past p values", "The current value depends on the mean of the process"],
      answer: 2,
      explanation: "Correct answer is Option :- 3 i.e., The current value depends on past p values"
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
    <div className="postquiz font-sans">
      <ol>
        {questions.map((question, index) => (
          <li key={index} className="py-4">
            <h3 className='mb-2 font-semibold'>{`${index + 1}. ${question.question}`}</h3>
            {question.images && question.images.map((image, imgIndex) => (
              <img key={imgIndex} src={image} alt={`Illustration for question ${index + 1}`} className='mb-2' />
            ))}
            <ul className='space-y-2'>
              {question.options.map((option, optionIndex) => (
                <li key={optionIndex} >
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
      <button onClick={handleSubmit} className=' mt-5 bg-blue-button hover:bg-blue-hover rounded-lg px-2 py-1 w-1/5'>Submit</button>
      {showExplanations && (
        <div className='mt-2'>
          <p className='font-bold'>Your Score: {score}/{questions.length}</p>
        </div>
      )}
    </div>
  );
};

export default Quiz;
