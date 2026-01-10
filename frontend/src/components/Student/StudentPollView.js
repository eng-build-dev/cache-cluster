import React from 'react';
import './StudentPollView.css';

const StudentPollView = ({ poll, results, remainingTime, hasVoted, onVote }) => {
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
    <div className="student-poll-view">
      <div className="student-poll-container">
        <div className="student-poll-header">
          <h2>Question 1</h2>
          {remainingTime > 0 && (
            <div className="student-poll-timer">
              <span>⏱</span>
              <span>{formatTime(remainingTime)}</span>
            </div>
          )}
        </div>

        <div className="student-poll-question">
          <h3>{poll.question}</h3>
        </div>

        {!hasVoted && remainingTime > 0 ? (
          <>
            <div className="student-poll-options">
              {poll.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => onVote(index)}
                  className="student-option-button"
                >
                  <span className="option-number-badge">{index + 1}</span>
                  <span className="option-text">{option.text}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => {}}
              className="submit-button"
              style={{ display: 'none' }}
            >
              Submit
            </button>
          </>
        ) : (
          <div className="student-poll-results">
            <div className="results-header">
              {hasVoted && <p className="submitted-message">Your answer has been submitted!</p>}
              {remainingTime === 0 && <p className="time-up-message">Time's up!</p>}
            </div>
            {results && (
              <div className="results-options">
                {poll.options.map((option, index) => {
                  const voteCount = results.options[index].votes;
                  const percentage = calculatePercentage(voteCount, totalVotes);
                  return (
                    <div key={index} className="result-option">
                      <div className="result-option-header">
                        <span className="result-option-number-badge">{index + 1}</span>
                        <span className="result-option-text">{option.text}</span>
                        <span className="result-option-percentage">{percentage}%</span>
                      </div>
                      <div className="result-progress-bar-container">
                        <div
                          className="result-progress-bar"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="wait-message">
              Wait for the teacher to ask a new question..
            </div>
          </div>
        )}

        {!hasVoted && remainingTime > 0 && (
          <button
            onClick={() => onVote(0)}
            className="submit-button"
            style={{ display: 'none' }}
          >
            Submit
          </button>
        )}
      </div>
    </div>
  );
};

export default StudentPollView;


