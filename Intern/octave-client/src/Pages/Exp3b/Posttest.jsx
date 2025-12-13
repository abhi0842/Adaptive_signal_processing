import React, { useState } from 'react';
import learningcurveforrls from './learningcurveforrls.png';
import randomwalkbehaviour from './randomwalkbehaviour.png';

const Quiz = () => {
  const questions = [
    {
      question: " Which of the following statements best describes the behaviour of the Mean Squared Error (MSE) in the learning curve for the RLS algorithm (from the figure)?",
      images: [learningcurveforrls],
      options: ["The MSE increases over time.", "The MSE remains constant over time.", "The MSE decreases rapidly initially and then stabilizes.", "The MSE fluctuates randomly with no clear trend."],
      answer: 2,
      explanation: "Correct answer is Option :- 3 i.e., The MSE decreases rapidly initially and then stabilizes."
    },
    {
      question: "Convergence rate of LMS is fast.",
      options: ["True", "False"],
      answer: 1,
      explanation: "Correct answer is Option :- 2 i.e., False"
    },
    {
      question: "What is the limitation of the LMS algorithm?",
      options: ["low convergence rate", "low signal to noise ratio", "Both of above", "None of above"],
      answer: 2,
      explanation: "Correct answer is Option :- 3 i.e., Both of above"
    },
    {
      question: "What does the random walk behaviour plot indicate in the context of adaptive filtering (Hint: observe the figure given below)?",
      images: [randomwalkbehaviour],
      options: ["It shows the variation of the input signal over time.", "It compares the actual filter weights with the true value over iterations.", "It displays the desired output signal.", "It shows the fluctuation of the mean squared error over iterations."],
      answer: 1,
      explanation: "Correct answer is Option :- 2 i.e., It compares the actual filter weights with the true value over iterations."
    },
    {
      question: " After performing the experiments, by comparing the result of LMS and RLS, which one gives better result to another one",
      options: ["RLS based equalizer", "LMS based equalizer"],
      answer: 0,
      explanation: "Correct answer is Option :- 1 i.e., RLS based equalizer"
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
