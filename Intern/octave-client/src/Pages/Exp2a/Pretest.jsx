import React, { useState } from 'react';

const Quiz = () => {
  const questions = [
    {
      question: "The Kalman gain is used to:",
      options: ["Predict future states", "Update the measurement noise", "Combine predictions and measurements", "Eliminate process noise"],
      answer: 2,
      explanation: "Correct answer is Option :- 3 i.e., Combine predictions and measurements."
    },
    {
      question: "Which of the following represents the process noise covariance matrix in the Kalman filter?",
      options: ["R", "Q", "P", "H"],
      answer: 1,
      explanation: "Correct answer is Option :- 2 i.e., Q"
    },
    {
      question: "What are the two main steps in the Kalman filter algorithm?",
      options: ["Initialization and execution", "Prediction and update", "Training and testing", "Sorting and merging"],
      answer: 1,
      explanation: "Correct answer is Option :- 2 i.e., Prediction and update."
    },
    {
      question: "Why is the choice of initial state estimate important in the Kalman filter?",
      options: ["It does not affect the filter’s performance", "It determines the convergence rate and accuracy of the estimates ", "It only affects the first prediction step", "It ensures the noise is minimized"],
      answer: 1,
      explanation: "Correct answer is Option :- 2 i.e., It determines the convergence rate and accuracy of the estimates."
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
    <div className="postquiz font-sans text-sm">
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
