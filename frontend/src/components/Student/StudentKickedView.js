import React from 'react';
import './StudentKickedView.css';

const StudentKickedView = () => {
  return (
    <div className="student-kicked">
      <div className="kicked-container">
        <div className="kicked-header">
          <div className="poll-badge">⚡ Intervue Poll</div>
        </div>
        <div className="kicked-content">
          <h1>You've been Kicked out!</h1>
          <p>Looks like the teacher had removed you from the poll system. Please Try again sometime.</p>
        </div>
      </div>
    </div>
  );
};

export default StudentKickedView;


