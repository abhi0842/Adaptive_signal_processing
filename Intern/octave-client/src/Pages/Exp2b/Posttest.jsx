import React, { useState } from 'react';
import question3 from './question3.png'

const Quiz = () => {
  const questions = [
    {
      question: "In the Kalman filter simulation, what is the initial state estimate represented by?",
      options: ["A", "x0", "num_steps", "x0_est"],
      answer: 3,
      explanation: "Correct answer is Option :- 4 i.e., x0_est"
    },
    {
      question: "In the absence of process noise, how does the Kalman filter primarily account for uncertainties in the state estimates?",
      options: ["Through the state transition matrix.", "By adjusting the measurement noise variance.", "By updating the error covariance matrix using the Kalman gain.", "By modifying the initial state estimate."],
      answer: 2,
      explanation: "Correct answer is Option :- 3 i.e., By updating the error covariance matrix using the Kalman gain."
    },
    {
      question: "Can the initial state estimate (x0_est) be changed, and what effect does it have on the Kalman filter simulation?",
      options: ["No, it must always be [0; 0].", "Yes, it can be changed, and it affects the initial convergence and accuracy of the filter.  ", "No, changing it will cause the filter to fail.", "Yes, it can be changed, but it has no effect on the simulation."],
      answer: 1,
      explanation: "Correct answer is Option :- 2 i.e., Yes, it can be changed, and it affects the initial convergence and accuracy of the filter."
    },
    {
      question: "What is the main observation about the estimated state (x0_est) compared to the true state (x0) for State 1 over time? (From the figure)",
      images: [question3],
      options: ["The estimated state diverges significantly from the true state.", "The estimated state closely follows the true state.", "The estimated state fluctuates widely around the true state.", "The estimated state remains constant while the true state changes."],
      answer: 1,
      explanation: "Correct answer is Option :- 2 i.e., The estimated state closely follows the true state."
    },
    {
      question: "What can be inferred about the behaviour of State 2 from the simulation results?(From the Figure)",
      images: [question3],
      options: ["State 2 is decreasing over time.", "State 2 remains constant after an initial change.", "State 2 oscillates significantly.", "State 2 shows an exponential growth."],
      answer: 1,
      explanation: "Correct answer is Option :- 2 i.e., State 2 remains constant after an initial change."
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
