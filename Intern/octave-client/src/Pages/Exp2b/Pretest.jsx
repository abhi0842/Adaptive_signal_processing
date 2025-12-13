import React, { useState } from 'react';
import question1 from './question1.png'
import question2 from './question2.png'

const Quiz = () => {
  const questions = [
    {
      question: "In the given model, what is the nature of the process noise v(n) ?",
      options: ["Zero-mean", "unit variance white noise", "measurement noise", "All the above"],
      answer: 3,
      explanation: "Correct answer is Option :- 4 i.e., All the above."
    },
    {
      question: "What is the role of the Kalman gain in the Kalman filter?",
      options: ["It updates the state transition matrix.", "It determines the measurement noise.", "It adjusts the predicted state estimate based on the measurement residual.", "It computes the measurement matrix."],
      answer: 2,
      explanation: "Correct answer is Option :- 3 i.e., It adjusts the predicted state estimate based on the measurement residual."
    },
    {
      question: "What does the parameter λ represent in the given model?",
      options: ["Measurement noise variance", "State transition scalar", "Kalman gain scalar", "Error covariance scalar"],
      answer: 1,
      explanation: "Correct answer is Option :- 2 i.e., State transition scalar."
    },
    {
      question: "",
      images: [question1],
      options: ["The state estimate after measurement update", "The state estimate before measurement update", "The initial state estimate", "The measurement noise"],
      answer: 1,
      explanation: "Correct answer is Option :- 2 i.e., The state estimate before measurement update."
    },
    {
      question: "",
      images: [question2],
      options: ["The prediction of the next state", "The correction based on the measurement residual", "The measurement noise", "The Kalman gain"],
      answer: 0,
      explanation: "Correct answer is Option :- 1 i.e., The prediction of the next state."
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
