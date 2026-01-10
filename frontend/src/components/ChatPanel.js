import React, { useState, useEffect, useRef } from 'react';
import { getSocket } from '../utils/socket';
import api from '../utils/api';
import './ChatPanel.css';
import './ParticipantsPanel.css';

const ChatPanel = ({ onClose, senderType, senderName, students, onRemoveStudent, showParticipantsTab = false }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeTab, setActiveTab] = useState('chat');
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = getSocket();
    socketRef.current = socket;

    // Fetch recent messages
    fetchRecentMessages();

    // Listen for new messages
    socket.on('chat:message', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.off('chat:message');
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchRecentMessages = async () => {
    try {
      const response = await api.get('/chat/messages?limit=50');
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socketRef.current) return;

    socketRef.current.emit('chat:message', {
      message: newMessage.trim(),
      senderType
    });

    setNewMessage('');
  };

  return (
    <div className="chat-panel">
      <div className="chat-panel-header">
        <div className="chat-tabs">
          <button
            className={`chat-tab ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            Chat
          </button>
          {showParticipantsTab && (
            <button
              className={`chat-tab ${activeTab === 'participants' ? 'active' : ''}`}
              onClick={() => setActiveTab('participants')}
            >
              Participants
            </button>
          )}
        </div>
        <button className="close-chat-btn" onClick={onClose}>
          ×
        </button>
      </div>

      {activeTab === 'chat' && (
        <div className="chat-content">
          <div className="chat-messages">
            {messages.map((msg, index) => {
              const isOwnMessage = msg.senderType === senderType;
              return (
                <div key={index} className={`chat-message ${isOwnMessage ? 'own-message' : 'other-message'}`}>
                  <div className="message-sender">{msg.senderName}</div>
                  <div className={`message-bubble ${isOwnMessage ? 'own-bubble' : 'other-bubble'}`}>
                    {msg.message}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSendMessage} className="chat-input-form">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="chat-input"
            />
            <button type="submit" className="send-button">
              Send
            </button>
          </form>
        </div>
      )}

      {activeTab === 'participants' && showParticipantsTab && (
        <div className="participants-content">
          <div className="participants-table">
            <div className="participants-table-header">
              <div className="table-header-cell">Name</div>
              <div className="table-header-cell">Action</div>
            </div>
            <div className="participants-table-body">
              {(!students || students.length === 0) ? (
                <div className="no-participants">No participants</div>
              ) : (
                students.map((student) => (
                  <div key={student._id || student.sessionId} className="participants-table-row">
                    <div className="table-cell">{student.name}</div>
                    <div className="table-cell">
                      <button
                        onClick={() => onRemoveStudent && onRemoveStudent(student.sessionId)}
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
      )}
    </div>
  );
};

export default ChatPanel;

