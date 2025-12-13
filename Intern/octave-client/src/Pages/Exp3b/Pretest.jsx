import React, { useState } from 'react';

const Quiz = () => {
  const questions = [
    {
      question: "LMS equalizer minimizes __________",
      options: ["Computational complexity", "Cost", "Mean square error", "Power density of output signal"],
      answer: 2,
      explanation: "Correct answer is Option :- 3 i.e., Mean square error"
    },
    {
      question: "Major application of adaptive filtering",
      options: ["System Identification", "Prediction", "Channel equalization", "All of above"],
      answer: 3,
      explanation: "Correct answer is Option :- 4 i.e., All of above"
    },
    {
      question: "For N symbol inputs, LMS algorithm requires ______ operations per iterations.",
      options: ["2N", "N+1", "2N+1", "N2"],
      answer: 2,
      explanation: "Correct answer is Option :- 3 i.e., 2N+1"
    },
    {
      question: "In the context of adaptive prediction, which matrix is updated recursively in the RLS algorithm?",
      options: ["Identity matrix", "Correlation matrix", "Inverse correlation matrix", "Gain matrix"],
      answer: 2,
      explanation: "Correct answer is Option :- 3 i.e., Inverse correlation matrix"
    },
    {
      question: "Which of the following correctly describes the cost function minimized by the RLS algorithm?",
      options: ["The sum of squared errors", "The product of squared errors", "The weighted sum of squared errors with an exponential weighting factor", "The absolute sum of errors"],
      answer: 2,
      explanation: "Correct answer is Option :- 3 i.e., The weighted sum of squared errors with an exponential weighting factor"
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
