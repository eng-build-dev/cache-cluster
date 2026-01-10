import React, { useState } from 'react';
import './StudentNameEntry.css';

const StudentNameEntry = ({ onSubmit }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim());
    }
  };

  return (
    <div className="student-name-entry">
      <div className="name-entry-container">
        <div className="name-entry-header">
          <div className="poll-badge">Intense Poll</div>
          <h1>Let's Get Started</h1>
          <p>If you're a student, you'll be able to submit your answers, participate in live polls, and see how your responses compare with your classmates.</p>
        </div>

        <form onSubmit={handleSubmit} className="name-entry-form">
          <label htmlFor="name">Enter your Name</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name here..."
            className="name-input"
            required
          />
          <button type="submit" className="continue-button">
            Continue
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentNameEntry;


