import React, { useState } from 'react';

const Quiz = () => {
  const questions = [
    {
      question: "What are the valid audio formats?",
      options: [".mp3", ".png", ".jpeg", ".wav"],
      answer: [0, 3],
      explanation: "Correct answers are Option 1 and Option 4 i.e., .mp3 and .wav"
    },
    {
      question: "What does frame length refer to for an audio signal?",
      options: ["Amplitude values of the samples in the frame", "Number of samples in the particular frame of the audio", "Half the duration of the audio signal", "None of the above"],
      answer: [1],
      explanation: "Correct answer is Option 2 i.e., Number of samples in the particular frame of the audio"
    },
    {
      question: "Based on the visualization of the plots of amplitude envelope select the aggregation feature that approximately traces the positive portion of the amplitude in the audio signal",
      options: ["MAX", "MEAN", "MIN", "MEDIAN"],
      answer: [0],
      explanation: "Correct answer is Option 1 i.e., MAX"
    },
    {
      question: "Which of the following statements are correct for an audio signal?",
      options: ["Duration of one sample refers to the sampling rate", "Duration of the first sample equals the reciprocal of the sampling rate", "Partially overlapping frames does not have zero hop length", "All of the above"],
      answer: [1, 2],
      explanation: "Correct answers are Option 2 and Option 3 i.e., Duration of the first sample equals the reciprocal of the sampling rate and Partially overlapping frames does not have zero hop length"
    },
    {
      question: "Which of the following statements are correct for an audio signal?",
      options: ["Frame duration is dependent on the number of samples in the frame", "Frame duration is dependent on the sampling rate", "Concept of framing plays a significant role in amplitude envelope extraction", "All of the above"],
      answer: [3],
      explanation: "Correct answer is Option 4 i.e., All of the above"
    },
    {
      question: "What is the default sampling rate for an audio signal?",
      options: ["22050 Hz", "1000 Hz", "44100 Hz", "22000 Hz"],
      answer: [0],
      explanation: "Correct answer is Option 1 i.e., 22050 Hz"
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
