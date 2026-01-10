import React from 'react';
import './StudentWaitingView.css';

const StudentWaitingView = () => {
  return (
    <div className="student-waiting">
      <div className="waiting-container">
        <div className="waiting-icon">
          <div className="poll-logo">+ Intervue Poll</div>
          <div className="loading-spinner"></div>
        </div>
        <p className="waiting-message">Wait for the teacher to ask questions..</p>
      </div>
    </div>
  );
};

export default StudentWaitingView;


