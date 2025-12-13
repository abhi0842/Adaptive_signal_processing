import React, { useState } from 'react';

const Quiz = () => {
  const questions = [
    {
      question: "What is the consequence of setting the initial state covariance too high in the Kalman filter?",
      options: ["The filter converges quickly but may be inaccurate", "The filter converges slowly but robustly", "The filter ignores new measurements", "The filter does not converge at all"],
      answer: 1,
      explanation: "Correct answer is Option :- 2 i.e., The filter converges slowly but robustly."
    },
    {
      question: "What is the effect of choosing an initial state covariance that is too low?",
      options: ["The filter will ignore all measurements", "The filter will adapt quickly to measurements but might be less robust", "The filter will converge very slowly", "The filter will become unstable"],
      answer: 1,
      explanation: "Correct answer is Option :- 2 i.e., The filter will adapt quickly to measurements but might be less robust."
    },
    {
      question: "How can initial conditions of the Kalman filter be optimized for better prediction performance?",
      options: ["By setting all initial values to zero", "By guessing the initial values", "By using domain knowledge and historical data", "By not initializing them at all"],
      answer: 2,
      explanation: "Correct answer is Option :- 3 i.e., By using domain knowledge and historical data."
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
