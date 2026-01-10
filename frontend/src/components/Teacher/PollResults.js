import React from 'react';
import './PollResults.css';

const PollResults = ({ poll, results, remainingTime, onCreateNewPoll, onViewHistory, canCreateNew }) => {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const calculatePercentage = (votes, total) => {
    if (total === 0) return 0;
    return Math.round((votes / total) * 100);
  };

  const totalVotes = results
    ? results.options.reduce((sum, opt) => sum + opt.votes, 0)
    : 0;

  return (
    <div className="poll-results">
      <div className="poll-results-header">
        <div className="poll-title-section">
          <h2 className="poll-title">Question</h2>
          {remainingTime > 0 && (
            <div className="poll-timer">
              <span>⏱</span>
              <span>{formatTime(remainingTime)}</span>
            </div>
          )}
        </div>
        <button onClick={onViewHistory} className="view-history-btn">
          View Poll history
        </button>
      </div>

      <div className="poll-question">
        <h3>{poll.question}</h3>
      </div>

      <div className="poll-options-results">
        {poll.options.map((option, index) => {
          const voteCount = results ? results.options[index].votes : 0;
          const percentage = calculatePercentage(voteCount, totalVotes);

          return (
            <div key={index} className="option-result">
              <div className="option-header">
                <span className="option-number">{index + 1}</span>
                <span className="option-text">{option.text}</span>
                <span className="option-percentage">{percentage}%</span>
              </div>
              <div className="progress-bar-container">
                <div
                  className="progress-bar"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {canCreateNew && (
        <button
          onClick={() => onCreateNewPoll(null)}
          className="ask-new-question-btn"
        >
          + Ask a new question
        </button>
      )}

      {!canCreateNew && remainingTime === 0 && (
        <div className="wait-message">
          Wait for the teacher to ask a new question..
        </div>
      )}
    </div>
  );
};

export default PollResults;


