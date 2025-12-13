import React, { useState } from 'react';

const Quiz = () => {
  const questions = [
    {
      question: "What does RLS stand for in the context of adaptive filtering?",
      options: ["Recursive Least Squares", "Recurrent Linear System", "Random Least Squares", "Recursive Linear Smoothing"],
      answer: 0,
      explanation: "RLS stands for Recursive Least Squares."
    },
    {
      question: "What is the primary goal of the LMS, RLS algorithms in adaptive filtering?",
      options: ["To increase the complexity of the filter", "To minimize the computational load", "To minimize the error between the desired signal and the actual output", "To maximize the filter's order"],
      answer: 2,
      explanation: "The primary goal of LMS and RLS algorithms is to minimize the error between the desired signal and the actual output."
    },
    {
      question: "In which applications is the RLS algorithm particularly advantageous due to its fast convergence properties?",
      options: ["Image processing", "Echo cancellation and noise reduction", "Data encryption", "Video streaming"],
      answer: 1,
      explanation: "RLS algorithm is advantageous in applications like echo cancellation and noise reduction due to its fast convergence properties."
    },
    {
      question: "What does LMS stand for in the context of adaptive filtering?",
      options: ["Least Mean Square Algorithm", "Least Median Square Algorithm", "Largest Mean Square Algorithm", "None of the above"],
      answer: 0,
      explanation: "LMS stands for Least Mean Square Algorithm."
    },
    {
      question: "Which of the following statements is true about the computational complexity of the LMS algorithm compared to the RLS algorithm?",
      options: ["LMS has lower computational complexity", "LMS has higher computational complexity", "LMS and RLS have similar computational complexity", "LMS and RLS have no computational complexity"],
      answer: 0,
      explanation: "LMS has lower computational complexity compared to the RLS algorithm."
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
