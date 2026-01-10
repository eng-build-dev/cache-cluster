import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getSocket } from '../utils/socket';
import { getRole } from '../utils/storage';
import api from '../utils/api';
import PollCreation from '../components/Teacher/PollCreation';
import PollResults from '../components/Teacher/PollResults';
import PollHistory from '../components/Teacher/PollHistory';
import ChatPanel from '../components/ChatPanel';
import ParticipantsPanel from '../components/ParticipantsPanel';
import './TeacherDashboard.css';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const socketRef = useRef(null);
  const [activePoll, setActivePoll] = useState(null);
  const [remainingTime, setRemainingTime] = useState(0);
  const [pollResults, setPollResults] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [students, setStudents] = useState([]);
  const [canCreatePoll, setCanCreatePoll] = useState(true);

  const fetchPollResults = async (pollId) => {
    try {
      const response = await api.get(`/polls/${pollId}/results`);
      setPollResults(response.data);
    } catch (error) {
      console.error('Error fetching poll results:', error);
    }
  };

  const fetchCurrentState = async () => {
    try {
      // Fetch active poll
      const pollResponse = await api.get('/polls/active');
      if (pollResponse.data && pollResponse.data.poll) {
        setActivePoll(pollResponse.data.poll);
        setRemainingTime(pollResponse.data.remainingTime);
        setCanCreatePoll(false);
        await fetchPollResults(pollResponse.data.poll._id);
      }

      // Fetch active students (live data only)
      const studentsResponse = await api.get('/students/active');
      setStudents(studentsResponse.data || []);
    } catch (error) {
      // 404 is expected when no active poll exists
      if (error.response?.status === 404) {
        // No active poll - this is normal, continue to fetch students
        try {
          const studentsResponse = await api.get('/students/active');
          setStudents(studentsResponse.data || []);
        } catch (err) {
          console.error('Error fetching students:', err);
          // Ensure students array is empty if API fails
          setStudents([]);
        }
        return;
      }
      if (error.response?.status !== 404) {
        console.error('Error fetching current state:', error);
        // Ensure students array is empty if API fails
        setStudents([]);
      }
    }
  };

  useEffect(() => {
    const role = getRole();
    if (role !== 'teacher') {
      navigate('/');
      return;
    }

    const socket = getSocket();
    socketRef.current = socket;

    socket.emit('teacher:join');

    // Fetch current state on mount (state recovery)
    fetchCurrentState();

    // Listen for active poll
    socket.on('poll:active', async (data) => {
      setActivePoll(data.poll);
      setRemainingTime(data.remainingTime);
      setCanCreatePoll(false);
      await fetchPollResults(data.poll._id);
    });

    // Listen for poll created
    socket.on('poll:created', (data) => {
      setActivePoll(data.poll);
      setRemainingTime(data.remainingTime);
      setCanCreatePoll(false);
      setPollResults(null);
      toast.success('Poll created successfully!');
    });

    // Listen for poll results
    socket.on('poll:results', (poll) => {
      setPollResults(poll);
    });

    // Listen for poll completed
    socket.on('poll:completed', (poll) => {
      setActivePoll(null);
      setPollResults(poll);
      setCanCreatePoll(true);
      toast.info('Poll completed!');
    });

    // Listen for students update (live data only)
    socket.on('students:update', (studentsList) => {
      setStudents(studentsList || []);
    });

    // Listen for errors
    socket.on('error', (error) => {
      toast.error(error.message || 'An error occurred');
    });

    return () => {
      socket.off('poll:active');
      socket.off('poll:created');
      socket.off('poll:results');
      socket.off('poll:completed');
      socket.off('students:update');
      socket.off('error');
    };
  }, [navigate]);

  const handleCreatePoll = async (pollData) => {
    if (!socketRef.current) return;

    socketRef.current.emit('poll:create', pollData);
  };

  const handleRemoveStudent = async (sessionId) => {
    if (!socketRef.current) return;

    socketRef.current.emit('student:remove', { sessionId });
  };

  const handleViewHistory = async () => {
    setShowHistory(true);
  };

  const handleCloseHistory = () => {
    setShowHistory(false);
  };

  const handleToggleChat = () => {
    if (showChat) {
      setShowChat(false);
    } else {
      setShowChat(true);
      setShowParticipants(false);
    }
  };

  const handleToggleParticipants = () => {
    if (showParticipants) {
      setShowParticipants(false);
    } else {
      setShowParticipants(true);
      setShowChat(false);
    }
  };

  // Update timer
  useEffect(() => {
    if (remainingTime > 0 && activePoll) {
      const interval = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [remainingTime, activePoll]);

  if (showHistory) {
    return <PollHistory onClose={handleCloseHistory} />;
  }

  return (
    <div className="teacher-dashboard">
      <div className="dashboard-header">
        <div className="poll-badge">Intense Poll</div>
        <h1>Let's Get Started</h1>
        <p>You'll have the ability to create and manage polls, ask questions, and monitor your students' responses in real-time.</p>
      </div>

      <div className="dashboard-content">
        {!activePoll ? (
          <PollCreation onCreatePoll={handleCreatePoll} canCreate={canCreatePoll} />
        ) : (
          <PollResults
            poll={activePoll}
            results={pollResults}
            remainingTime={remainingTime}
            onCreateNewPoll={handleCreatePoll}
            onViewHistory={handleViewHistory}
            canCreateNew={canCreatePoll}
          />
        )}

        {(showChat || showParticipants) && (
          <div className="side-panel">
            {showChat && (
              <ChatPanel
                onClose={() => setShowChat(false)}
                senderType="teacher"
                senderName="Teacher"
                students={students}
                onRemoveStudent={handleRemoveStudent}
                showParticipantsTab={true}
              />
            )}
            {showParticipants && (
              <ParticipantsPanel
                students={students}
                onRemoveStudent={handleRemoveStudent}
                onClose={() => setShowParticipants(false)}
              />
            )}
          </div>
        )}
      </div>

      <div className="action-buttons">
        <button className="chat-button" onClick={handleToggleChat}>
          💬
        </button>
        <button className="participants-button" onClick={handleToggleParticipants}>
          👥
        </button>
      </div>
    </div>
  );
};

export default TeacherDashboard;

