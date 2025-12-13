import React, { useState } from 'react';

const Quiz = () => {
  const questions = [
    {
      question: "What is the valid frame size for an audio signal?",
      options: ["1024", "1000", "400", "512"],
      answer: [0, 3],
      explanation: "Correct answers are Option 1 and Option 4 i.e., 1024 and 512"
    },
    {
      question: "What does adjacent non overlapping frames with zero intermediate samples refer to for an audio signal?",
      options: ["Frame Length equals double the Hop Length", "Frame Length equals half the Hop Length", "Frame Length equals Hop Length", "Frame Length equals four time the Hop Length"],
      answer: [2],
      explanation: "Correct answer is Option 3 i.e., Frame Length equals Hop Length"
    },
    {
      question: "If an audio signal is sampled at the rate 16khz, it means that",
      options: ["There are 8000 samples in one second duration of the audio", "There are 16000 samples in one second duration of the audio", "There are 4000 samples in one second duration of the audio", "None of the above"],
      answer: [1],
      explanation: "Correct answer is Option 2 i.e., There are 16000 samples in one second duration of the audio"
    },
    {
      question: "What does hop length refer to for an audio signal?",
      options: ["Number of samples in the particular frame of the audio", "Total number of samples present in two successive frames of the audio", "Number of samples between the two consecutive frames of the audio", "Amplitude value of the samples in the frame of the audio"],
      answer: [2],
      explanation: "Correct answer is Option 3 i.e., Number of samples between the two consecutive frames of the audio"
    }
  ];

  const [selectedOptions, setSelectedOptions] = useState(
    questions.map(q => (q.answer.length > 1 ? [] : null))
  );
  const [showExplanations, setShowExplanations] = useState(false);

  const handleOptionSelect = (questionIndex, optionIndex, isMultiple) => {
    setSelectedOptions(prevOptions => {
      const updatedOptions = [...prevOptions];

      if (isMultiple) {
        const selectedForQuestion = new Set(updatedOptions[questionIndex] || []);
        if (selectedForQuestion.has(optionIndex)) {
          selectedForQuestion.delete(optionIndex);
        } else {
          selectedForQuestion.add(optionIndex);
        }
        updatedOptions[questionIndex] = Array.from(selectedForQuestion);
      } else {
        updatedOptions[questionIndex] = [optionIndex];
      }

      return updatedOptions;
    });
  };

  const handleSubmit = () => {
    setShowExplanations(true);
  };

  const score = selectedOptions.reduce((acc, selected, index) => {
    const correctAnswers = new Set(questions[index].answer);
    const selectedSet = new Set(selected);

    return correctAnswers.size === selectedSet.size && [...correctAnswers].every(ans => selectedSet.has(ans))
      ? acc + 1
      : acc;
  }, 0);

  return (
    <div className="postquiz font-sans text-sm">
      <ol>
        {questions.map((question, index) => {
          const isMultiple = question.answer.length > 1;

          return (
            <li key={index} className="py-4">
              <h3 className="mb-2 font-semibold">{`${index + 1}. ${question.question}`}</h3>
              <ul className="space-y-2">
                {question.options.map((option, optionIndex) => (
                  <li key={optionIndex}>
                    <input
                      type={isMultiple ? "checkbox" : "radio"}
                      id={`option-${index}-${optionIndex}`}
                      name={`question-${index}`}
                      value={option}
                      checked={
                        isMultiple
                          ? selectedOptions[index]?.includes(optionIndex)
                          : selectedOptions[index]?.[0] === optionIndex
                      }
                      onChange={() => handleOptionSelect(index, optionIndex, isMultiple)}
                    />
                    <label htmlFor={`option-${index}-${optionIndex}`} className="ml-2">{option}</label>
                  </li>
                ))}
              </ul>
              {showExplanations && (
                <div className="mt-2 space-y-2">
                  <p
                    className={
                      questions[index].answer.every(ans => selectedOptions[index]?.includes(ans)) &&
                      questions[index].answer.length === (selectedOptions[index]?.length || 0)
                        ? "text-green"
                        : "text-red-500"
                    }
                  >
                    {questions[index].answer.every(ans => selectedOptions[index]?.includes(ans)) &&
                    questions[index].answer.length === (selectedOptions[index]?.length || 0)
                      ? "Correct"
                      : "Incorrect"}
                  </p>
                  <p className="text-blue-500">Explanation: {question.explanation}</p>
                </div>
              )}
            </li>
          );
        })}
      </ol>
      <button
        onClick={handleSubmit}
        className="mt-5 bg-blue-button hover:bg-blue-hover rounded-lg px-2 py-1 w-1/5"
      >
        Submit
      </button>
      {showExplanations && (
        <div className="mt-2">
          <p className="font-bold">Your Score: {score}/{questions.length}</p>
        </div>
      )}
    </div>
  );
};

export default Quiz;
