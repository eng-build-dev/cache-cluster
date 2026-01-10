import React, { useState } from 'react';
import './PollCreation.css';

const PollCreation = ({ onCreatePoll, canCreate }) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState([
    { text: '', isCorrect: false },
    { text: '', isCorrect: false }
  ]);
  const [duration, setDuration] = useState(60);

  const handleOptionChange = (index, field, value) => {
    const newOptions = [...options];
    if (field === 'text') {
      newOptions[index].text = value;
    } else if (field === 'isCorrect') {
      newOptions[index].isCorrect = value;
    }
    setOptions(newOptions);
  };

  const handleAddOption = () => {
    setOptions([...options, { text: '', isCorrect: false }]);
  };

  const handleRemoveOption = (index) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!question.trim()) {
      alert('Please enter a question');
      return;
    }

    if (options.some(opt => !opt.text.trim())) {
      alert('Please fill in all options');
      return;
    }

    if (question.length > 100) {
      alert('Question must be 100 characters or less');
      return;
    }

    onCreatePoll({
      question: question.trim(),
      options: options.map(opt => ({
        text: opt.text.trim(),
        isCorrect: opt.isCorrect
      })),
      duration
    });

    // Reset form
    setQuestion('');
    setOptions([
      { text: '', isCorrect: false },
      { text: '', isCorrect: false }
    ]);
    setDuration(60);
  };

  return (
    <div className="poll-creation">
      <form onSubmit={handleSubmit} className="poll-creation-form">
        <div className="form-group">
          <div className="form-header">
            <label htmlFor="question">Enter your question</label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="duration-select"
            >
              <option value={30}>30 seconds</option>
              <option value={60}>60 seconds</option>
              <option value={90}>90 seconds</option>
              <option value={120}>120 seconds</option>
            </select>
          </div>
          <textarea
            id="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Enter your question here..."
            maxLength={100}
            rows={3}
            className="question-input"
          />
          <div className="char-counter">{question.length}/100</div>
        </div>

        <div className="form-group">
          <div className="edit-options-header">
            <label>Edit Options</label>
            <span className="is-correct-label">Is it Correct?</span>
          </div>
          {options.map((option, index) => (
            <div key={index} className="option-row">
              <div className="option-number-badge">{index + 1}</div>
              <input
                type="text"
                value={option.text}
                onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                placeholder={`Option ${index + 1}`}
                className="option-input"
              />
              <div className="correct-option">
                <div className="radio-group">
                  <label>
                    <input
                      type="radio"
                      name={`correct-${index}`}
                      checked={option.isCorrect === true}
                      onChange={() => handleOptionChange(index, 'isCorrect', true)}
                    />
                    Yes
                  </label>
                  <label>
                    <input
                      type="radio"
                      name={`correct-${index}`}
                      checked={option.isCorrect === false}
                      onChange={() => handleOptionChange(index, 'isCorrect', false)}
                    />
                    No
                  </label>
                </div>
              </div>
              {options.length > 2 && (
                <button
                  type="button"
                  onClick={() => handleRemoveOption(index)}
                  className="remove-option-btn"
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddOption}
            className="add-option-btn"
          >
            + Add More option
          </button>
        </div>

        <button
          type="submit"
          className="ask-question-btn"
          disabled={!canCreate}
        >
          Ask Question
        </button>
      </form>
    </div>
  );
};

export default PollCreation;


