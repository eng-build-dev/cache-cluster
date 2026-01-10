import React from 'react';
import './ParticipantsPanel.css';

const ParticipantsPanel = ({ students, onRemoveStudent, onClose }) => {
  return (
    <div className="participants-panel">
      <div className="participants-panel-header">
        <div className="participants-tabs">
          <button className="participants-tab">Chat</button>
          <button className="participants-tab active">Participants</button>
        </div>
        <button className="close-participants-btn" onClick={onClose}>
          ×
        </button>
      </div>

      <div className="participants-content">
        <div className="participants-table">
          <div className="participants-table-header">
            <div className="table-header-cell">Name</div>
            <div className="table-header-cell">Action</div>
          </div>
          <div className="participants-table-body">
            {students.length === 0 ? (
              <div className="no-participants">No participants</div>
            ) : (
              students.map((student) => (
                <div key={student._id || student.sessionId} className="participants-table-row">
                  <div className="table-cell">{student.name}</div>
                  <div className="table-cell">
                    <button
                      onClick={() => onRemoveStudent(student.sessionId)}
                      className="kick-out-btn"
                    >
                      Kick out
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParticipantsPanel;


