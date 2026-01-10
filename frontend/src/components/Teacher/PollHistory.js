import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import './PollHistory.css';

const PollHistory = ({ onClose }) => {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPollHistory();
  }, []);

  const fetchPollHistory = async () => {
    try {
      const response = await api.get('/polls/history');
      setPolls(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching poll history:', error);
      setLoading(false);
    }
  };

  const calculatePercentage = (votes, total) => {
    if (total === 0) return 0;
    return Math.round((votes / total) * 100);
  };

  if (loading) {
    return (
      <div className="poll-history">
        <div className="poll-history-container">
          <div className="loading">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="poll-history">
      <div className="poll-history-container">
        <div className="poll-history-header">
          <h2>View Poll History</h2>
          <button onClick={onClose} className="close-btn">×</button>
        </div>

        <div className="poll-history-content">
          {polls.length === 0 ? (
            <div className="no-polls">No poll history available</div>
          ) : (
            polls.map((poll, pollIndex) => {
              const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
              return (
                <div key={poll._id} className="history-poll-item">
                  <div className="history-poll-header">
                    <h3>Question {pollIndex + 1}</h3>
                  </div>
                  <div className="history-poll-question">{poll.question}</div>
                  <div className="history-poll-options">
                    {poll.options.map((option, index) => {
                      const percentage = calculatePercentage(option.votes, totalVotes);
                      return (
                        <div key={index} className="history-option-result">
                          <div className="history-option-header">
                            <span className="history-option-number-badge">{index + 1}</span>
                            <span className="history-option-text">{option.text}</span>
                            <span className="history-option-percentage">{percentage}%</span>
                          </div>
                          <div className="history-progress-bar-container">
                            <div
                              className="history-progress-bar"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default PollHistory;


