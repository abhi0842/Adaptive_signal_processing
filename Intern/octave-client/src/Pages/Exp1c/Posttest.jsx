import React, { useState } from 'react';

const Postquiz = () => {
  const questions = [
    {
      question: "Which of the following algorithm are good for tracking the nonstationary input?",
      options: ["LMS algorithm", "RLS algorithm", "Both LMS and RLS", "None of these"],
      answer: 3,
      explanation: "Correct answer is Option :- 4 i.e., None of these"
    },
    {
      question: "After performing the experiments, by comparing the result of LMS and RLS, which one gives better result to another one in nonstationary environment",
      options: ["RLS","LMS"],
      answer: 0,
      explanation: "For a forgetting factor 𝜆 close to 1, the RLS algorithm ensures that the desired signal closely matches the output signal."
    },
    {
      question: "From the experiment result, if the norm of weight is decreasing, what does it signifies? ",
      options: ["Algorithm is trying to reach its optimal weight vector or track the input value.","It will not follow the track of input signal. "],
      answer: 0,
      explanation: "For a forgetting factor 𝜆 close to 1, the RLS algorithm ensures that the desired signal closely matches the output signal."
    },
    {
      question: "What will be effect of increasing the order of filter in RLS and LMS in nonstationary enviroment",
      options: [" It will improve the performance. ","It will deteriorate the performance. "],
      answer: 0,
      explanation: "For a forgetting factor 𝜆 close to 1, the RLS algorithm ensures that the desired signal closely matches the output signal."
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
                <p className={selectedOptions[index] === question.answer ? 'text-green' : 'text-red-500'}>{selectedOptions[index] === question.answer ? 'Correct' : 'Incorrect'}</p>
                <p className='text-blue-500'>Explanation: {question.explanation}</p>
              </div>
            )}
          </li>
        ))}
      </ol>
      <button onClick={handleSubmit} className='bg-blue-button hover:bg-blue-hover rounded-lg px-2 py-1 '>Submit</button>
      {showExplanations && (
        <div className='mt-2'>
          <p className='font-bold'>Your Score: {score}/{questions.length}</p>
        </div>
      )}
    </div>
  );
};

export default Postquiz;
