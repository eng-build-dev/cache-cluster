import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getSocket } from '../utils/socket';
import { getRole, getStudentName, setStudentName, getSessionId } from '../utils/storage';
import api from '../utils/api';
import StudentNameEntry from '../components/Student/StudentNameEntry';
import StudentPollView from '../components/Student/StudentPollView';
import StudentWaitingView from '../components/Student/StudentWaitingView';
import StudentKickedView from '../components/Student/StudentKickedView';
import ChatPanel from '../components/ChatPanel';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const socketRef = useRef(null);
  const [studentName, setStudentNameState] = useState(null);
  const [activePoll, setActivePoll] = useState(null);
  const [remainingTime, setRemainingTime] = useState(0);
  const [pollResults, setPollResults] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [isKicked, setIsKicked] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const sessionIdRef = useRef(getSessionId());
  const hasFetchedStateRef = useRef(false);

  useEffect(() => {
    const role = getRole();
    if (role !== 'student') {
      navigate('/');
      return;
    }

    const name = getStudentName();
    if (name) {
      setStudentNameState(name);
      initializeSocket(name);
    }

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.off('poll:active');
        socketRef.current.off('poll:created');
        socketRef.current.off('poll:results');
        socketRef.current.off('poll:completed');
        socketRef.current.off('student:removed');
        socketRef.current.off('error');
        socketRef.current.off('connect');
        socketRef.current.off('disconnect');
        socketRef.current.off('connect_error');
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const initializeSocket = (name) => {
    const socket = getSocket();
    socketRef.current = socket;

    // Set up socket connection first
    socket.on('connect', () => {
      console.log('Socket connected');
      socket.emit('student:join', {
        name,
        sessionId: sessionIdRef.current
      });
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    // Emit join immediately (socket might already be connected)
    if (socket.connected) {
      socket.emit('student:join', {
        name,
        sessionId: sessionIdRef.current
      });
    }

    // Listen for active poll
    socket.on('poll:active', (data) => {
      console.log('Received poll:active', data);
      setActivePoll(data.poll);
      setRemainingTime(data.remainingTime);
      setHasVoted(false);
      setPollResults(null);
    });

    // Listen for poll created
    socket.on('poll:created', (data) => {
      console.log('Received poll:created', data);
      setActivePoll(data.poll);
      setRemainingTime(data.remainingTime);
      setHasVoted(false);
      setPollResults(null);
    });

    // Listen for poll results
    socket.on('poll:results', (poll) => {
      setPollResults(poll);
    });

    // Listen for poll completed
    socket.on('poll:completed', (poll) => {
      setActivePoll(null);
      setPollResults(poll);
    });

    // Listen for student removal
    socket.on('student:removed', (data) => {
      if (data.sessionId === sessionIdRef.current) {
        setIsKicked(true);
      }
    });

    // Listen for errors
    socket.on('error', (error) => {
      toast.error(error.message || 'An error occurred');
    });

    // Fetch current state on mount (state recovery) - only once, after socket connects
    if (socket.connected) {
      // Socket already connected, fetch state immediately
      fetchCurrentState(name);
    } else {
      // Wait for socket to connect before fetching state
      socket.once('connect', () => {
        fetchCurrentState(name);
      });
    }
  };

  const fetchCurrentState = async (name) => {
    // Only fetch once to avoid multiple API calls
    if (hasFetchedStateRef.current) {
      return;
    }
    hasFetchedStateRef.current = true;

    try {
      // Fetch active poll - 404 is expected when no poll exists
      // The interceptor will handle 404s silently
      const pollResponse = await api.get('/polls/active');
      
      // Check if response indicates no active poll (from interceptor)
      if (!pollResponse || pollResponse.data === null || pollResponse.isNoActivePoll) {
        // No active poll - this is normal, stay in waiting state
        setActivePoll(null);
        setPollResults(null);
        return;
      }
      
      if (pollResponse.data && pollResponse.data.poll) {
        console.log('✅ Found active poll, restoring state');
        setActivePoll(pollResponse.data.poll);
        setRemainingTime(pollResponse.data.remainingTime);
        setHasVoted(false);
        setPollResults(null);
        // Check if student has already voted
        await checkVoteStatus(pollResponse.data.poll._id);
      }
    } catch (error) {
      // This catch block should rarely be hit now since interceptor handles 404s
      // But keep it as a safety net
      if (error.isNoActivePoll || error.response?.status === 404) {
        // No active poll - stay in waiting state (this is normal)
        setActivePoll(null);
        setPollResults(null);
        return;
      }
      // Only log non-404 errors
      if (error.response?.status !== 404 && !error.isNoActivePoll) {
        console.error('❌ Error fetching current state:', error);
      }
    }
  };

  const checkVoteStatus = async (pollId) => {
    // This would require an endpoint to check vote status
    // For now, we'll assume they haven't voted if they refresh
    setHasVoted(false);
  };

  const handleNameSubmit = (name) => {
    setStudentName(name);
    setStudentNameState(name);
    initializeSocket(name);
  };

  const handleVote = async (optionIndex) => {
    if (!socketRef.current || !activePoll || hasVoted) return;

    try {
      socketRef.current.emit('poll:vote', {
        pollId: activePoll._id,
        optionIndex
      });
      setHasVoted(true);
      toast.success('Vote submitted successfully!');
    } catch (error) {
      toast.error('Failed to submit vote');
    }
  };

  // Update timer
  useEffect(() => {
    if (remainingTime > 0 && activePoll && !hasVoted) {
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
  }, [remainingTime, activePoll, hasVoted]);

  if (isKicked) {
    return <StudentKickedView />;
  }

  if (!studentName) {
    return <StudentNameEntry onSubmit={handleNameSubmit} />;
  }

  if (!activePoll) {
    return (
      <>
        <StudentWaitingView />
        {showChat && (
          <ChatPanel
            onClose={() => setShowChat(false)}
            senderType="student"
            senderName={studentName}
            showParticipantsTab={false}
          />
        )}
        <button className="chat-button" onClick={() => setShowChat(!showChat)}>
          💬
        </button>
      </>
    );
  }

  return (
    <>
      <StudentPollView
        poll={activePoll}
        results={pollResults}
        remainingTime={remainingTime}
        hasVoted={hasVoted}
        onVote={handleVote}
      />
      {showChat && (
        <ChatPanel
          onClose={() => setShowChat(false)}
          senderType="student"
          senderName={studentName}
          showParticipantsTab={false}
        />
      )}
      <button className="chat-button" onClick={() => setShowChat(!showChat)}>
        💬
      </button>
    </>
  );
};

export default StudentDashboard;

