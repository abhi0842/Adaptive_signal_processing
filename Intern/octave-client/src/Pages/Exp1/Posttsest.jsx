import React, { useState } from 'react';

const Postquiz = () => {
  const questions = [
    {
      question: "Which parameter in the RLS algorithm controls the weight given to past errors?",
      options: ["Filter length", "Step size", "Forgetting factor", "Gain vector"],
      answer: 2,
      explanation: "The forgetting factor (𝜆) in the RLS algorithm controls the weight given to past errors."
    },
    {
      question: "For which value of the forgetting factor 𝜆 does the RLS algorithm ensure that the desired signal closely matches the output signal?",
      options: ["0", "0.5", "Close to 1", "Greater than 1"],
      answer: 2,
      explanation: "For a forgetting factor 𝜆 close to 1, the RLS algorithm ensures that the desired signal closely matches the output signal."
    },
    {
      question: "Within which range should the forgetting factor 𝜆 typically fall to ensure effective performance of the RLS algorithm?",
      options: ["λ < 0", "0 < λ < 0.5", "0 < λ ≤ 1", "𝜆 > 1"],
      answer: 2,
      explanation: "The forgetting factor 𝜆 should typically fall within the range of 0 < 𝜆 ≤ 1 to ensure effective performance of the RLS algorithm."
    },
    {
      question: "Within which range should the step size parameter typically fall in the LMS algorithm to ensure stable convergence?",
      options: ["0 < 𝜇 < 1", "1 < 𝜇 < ∞", "0 < 𝜇 < ∞", "𝜇 > 1"],
      answer: 0,
      explanation: "The step size parameter (𝜇) in the LMS algorithm should typically fall within the range of 0 < 𝜇 < 1 to ensure stable convergence."
    },
    {
      question: "Which of the following best describes the stability of the LMS algorithm?",
      options: ["Unstable for all values of step size", "Stable for all values of step size", "Stable only for small values of step size", "Stable only for large values of step size"],
      answer: 2,
      explanation: "The LMS algorithm is stable only for small values of the step size parameter (𝜇)."
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
