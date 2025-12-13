import React, { useState } from 'react';

const Quiz = () => {
  const questions = [
    {
      question: "What is the primary objective of the Minimum Variance Distortionless Response (MVDR) beamformer?",
      options: ["Maximize the output power of the beamformer. ", "Minimize the output power of the beamformer while maintaining unity response in the desired direction.", "Equalize the output power in all directions.", "Enhance signals from all directions equally."],
      answer: 1,
      explanation: "Correct answer is Option :- 2 i.e., Minimize the output power of the beamformer while maintaining unity response in the desired direction."
    },
    {
      question: "What is application of Autoregressive process?",
      options: ["Texture modelling of visual content", "Speech processing", "Models for future sample predictions", "All of above"],
      answer: 3,
      explanation: "Correct answer is Option :- 4 i.e., All of above"
    },
    {
      question: "What is the purpose of the Least Mean Squares (LMS) algorithm in the context of beamforming?",
      options: ["To adaptively adjust the beamforming weights to minimize the mean square error.", "To maximize the signal-to-noise ratio (SNR).", "To calculate the covariance matrix of the input data.", "To ensure equal signal power from all directions."],
      answer: 0,
      explanation: "Correct answer is Option :- 1 i.e., To adaptively adjust the beamforming weights to minimize the mean square error."
    },
    {
      question: "The steering vector a(θ) in beamforming is used to:",
      options: ["Minimize the output power.", "Adjust the step size parameter ", "Measure the error signal.", "Define the desired signal direction."],
      answer: 3,
      explanation: "Correct answer is Option :- 4 i.e., Define the desired signal direction."
    },
    {
      question: "AR process with low an order",
      options: ["We will obtain a smoothed spectrum.", "There is a risk of introducing spurious low-level peaks in spectrum.", "Both of above", "None of above"],
      answer: 0,
      explanation: "Correct answer is Option :- 1 i.e., We will obtain a smoothed spectrum."
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
