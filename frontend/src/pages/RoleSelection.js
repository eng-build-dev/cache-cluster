import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setRole } from '../utils/storage';
import './RoleSelection.css';

const RoleSelection = () => {
  const [selectedRole, setSelectedRole] = useState(null);
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };

  const handleContinue = () => {
    if (selectedRole) {
      setRole(selectedRole);
      navigate(`/${selectedRole}`);
    }
  };

  return (
    <div className="role-selection">
      <div className="role-selection-container">
        <div className="role-selection-header">
          <div className="poll-badge">Intense Poll</div>
          <h1 className="role-selection-title">Welcome to the Live Polling System</h1>
          <p className="role-selection-description">
            Please select the role that best describes you to begin using the live polling system
          </p>
        </div>

        <div className="role-cards">
          <div
            className={`role-card ${selectedRole === 'student' ? 'selected' : ''}`}
            onClick={() => handleRoleSelect('student')}
          >
            <h3>I'm a Student</h3>
            <p>Submit answers and view live poll results in real-time</p>
          </div>

          <div
            className={`role-card ${selectedRole === 'teacher' ? 'selected' : ''}`}
            onClick={() => handleRoleSelect('teacher')}
          >
            <h3>I'm a Teacher</h3>
            <p>Create and manage polls, ask questions, and monitor your students' responses in real-time</p>
          </div>
        </div>

        <button
          className="continue-button"
          onClick={handleContinue}
          disabled={!selectedRole}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default RoleSelection;




