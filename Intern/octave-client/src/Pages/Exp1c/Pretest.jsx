import React, { useState } from 'react';
import questionImage from './question.png';

const Quiz = () => {
  const questions = [
    {
      question: "What is the standard form of WSSRP?",
      options: ["Wide Sense Stationary Random Points ", "Wide Sense Stationary Random Particles", "Wide Sense Stationary Random Process", "None of the above"],
      answer: 2,
      explanation: "Correct answer is Option :- 3 i.e., Wide Sense Stationary Random Process"
    },
    {
      question: "Gaussian process is a",
      options: ["Wide sense stationary process", "Strict sense stationary process", "All of the mentioned", "None of the mentioned"],
      answer: 2,
      explanation: "Correct answer is Option :- 3 i.e., All of the mentioned"
    },
    {
      question: "Random variables give relationship between _____",
      options: ["Two random events", "Probability of occurrence of two random events", "Random event and a real number", "Random event and its probability of occurrence"],
      answer: 2,
      explanation: "Correct answer is Option :- 3 i.e., Random event and a real number"
    },
    {
      question: "A stationary stochastic process has",
      options: ["Finite energy signal", "Infinite zero signal", "Zero energy signal", "None of the mentioned"],
      answer: 1,
      explanation: "Correct answer is Option :- 2 i.e., Infinite zero signal"
    },
    {
      question: "Which of the following conditions are necessary for a series to be classifiable as a weakly stationary process?",
      images: [questionImage],
      options: ["(ii) and (iv) only", "(i) and (iii) only", "(i), (ii) and(iii) only", "(i), (ii), (iii) and (iv) "],
      answer: 2,
      explanation: "Correct answer is Option :- 3 i.e., (i), (ii) and(iii) only"
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
