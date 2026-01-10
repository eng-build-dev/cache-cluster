const PollService = require('../services/PollService');
const StudentService = require('../services/StudentService');
const ChatService = require('../services/ChatService');
const mongoose = require('mongoose');

const pollService = new PollService();
const studentService = new StudentService();
const chatService = new ChatService();

const isDatabaseConnected = () => {
  return mongoose.connection.readyState === 1;
};

class PollSocketHandler {
  constructor(io) {
    this.io = io;
    this.pollTimers = new Map();
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      try {
        socket.on('error', (error) => {
          console.error('Socket error:', error.message);
        });

        socket.on('teacher:join', async () => {
          try {
            socket.join('teachers');
            await this.emitActivePoll(socket);
            await this.emitActiveStudents();
          } catch (error) {
            console.error('Error in teacher:join:', error);
            socket.emit('error', { message: 'Failed to join as teacher' });
          }
        });

        socket.on('student:join', async (data) => {
          try {
            if (!data.name || !data.sessionId) {
              socket.emit('error', { message: 'Name and sessionId are required' });
              return;
            }

            await studentService.registerStudent(data.name, data.sessionId);
            socket.join('students');
            socket.data.sessionId = data.sessionId;
            socket.data.studentName = data.name;

            await this.emitActivePoll(socket);
            await this.emitActiveStudents();
          } catch (error) {
            console.error('Error in student:join:', error);
            socket.emit('error', { message: 'Failed to join as student: ' + error.message });
          }
        });

        socket.on('poll:create', async (data) => {
          try {
            const activePoll = await pollService.getActivePoll();
            if (activePoll) {
              const allAnswered = await pollService.haveAllStudentsAnswered(activePoll._id.toString());
              if (!allAnswered) {
                socket.emit('error', { message: 'Please wait for all students to answer the current question' });
                return;
              }
              await pollService.completePoll(activePoll._id.toString());
              if (this.pollTimers.has(activePoll._id.toString())) {
                clearTimeout(this.pollTimers.get(activePoll._id.toString()));
                this.pollTimers.delete(activePoll._id.toString());
              }
            }

            const poll = await pollService.createPoll(data.question, data.options, data.duration);
            const remainingTime = pollService.getRemainingTime(poll);
            this.io.emit('poll:created', {
              poll,
              remainingTime
            });

            const timer = setTimeout(async () => {
              await pollService.completePoll(poll._id.toString());
              const results = await pollService.getPollResults(poll._id.toString());
              if (results) {
                this.io.emit('poll:completed', results);
              }
              this.pollTimers.delete(poll._id.toString());
            }, data.duration * 1000);

            this.pollTimers.set(poll._id.toString(), timer);
          } catch (error) {
            console.error('Error creating poll:', error);
            socket.emit('error', { message: error.message || 'Failed to create poll' });
          }
        });

        socket.on('poll:vote', async (data) => {
          try {
            if (!socket.data.sessionId || !socket.data.studentName) {
              socket.emit('error', { message: 'Not registered as student' });
              return;
            }

            const vote = await pollService.submitVote(
              data.pollId,
              socket.data.studentName,
              data.optionIndex,
              socket.data.sessionId
            );

            const poll = await pollService.getPollResults(data.pollId);
            if (poll) {
              this.io.emit('poll:results', poll);
            }

            socket.emit('vote:success', vote);
          } catch (error) {
            console.error('Error submitting vote:', error);
            socket.emit('error', { message: error.message || 'Failed to submit vote' });
          }
        });

        socket.on('chat:message', async (data) => {
          try {
            const senderName = socket.data.studentName || 'Teacher';
            const chatMessage = await chatService.sendMessage(
              senderName,
              data.message,
              data.senderType
            );
            this.io.emit('chat:message', chatMessage);
          } catch (error) {
            console.error('Error sending chat message:', error);
            socket.emit('error', { message: error.message || 'Failed to send message' });
          }
        });

        socket.on('student:remove', async (data) => {
          try {
            const success = await studentService.removeStudent(data.sessionId);
            if (success) {
              this.io.emit('student:removed', { sessionId: data.sessionId });
              await this.emitActiveStudents();
            }
          } catch (error) {
            console.error('Error removing student:', error);
            socket.emit('error', { message: error.message || 'Failed to remove student' });
          }
        });

        socket.on('disconnect', (reason) => {
          if (socket.data?.sessionId) {
            studentService.removeStudent(socket.data.sessionId).catch(() => {});
          }
        });
      } catch (error) {
        console.error('Error in connection handler:', error);
        if (socket && socket.connected) {
          socket.disconnect(true);
        }
      }
    });

    this.io.engine.on('connection_error', (err) => {
      console.error('Socket.io connection error:', err.message);
    });
  }

  async emitActivePoll(socket) {
    try {
      if (!isDatabaseConnected()) {
        socket.emit('poll:inactive');
        return;
      }

      const poll = await pollService.getActivePoll();
      if (poll) {
        const remainingTime = pollService.getRemainingTime(poll);
        const pollData = {
          poll: poll.toObject ? poll.toObject() : poll,
          remainingTime
        };
        socket.emit('poll:active', pollData);
      } else {
        socket.emit('poll:inactive');
      }
    } catch (error) {
      console.error('Error emitting active poll:', error);
      try {
        socket.emit('poll:inactive');
      } catch (emitError) {
        // Ignore emit errors
      }
    }
  }

  async emitActiveStudents() {
    try {
      if (!isDatabaseConnected()) {
        this.io.emit('students:update', []);
        return;
      }

      const students = await studentService.getActiveStudents();
      this.io.emit('students:update', students);
    } catch (error) {
      console.error('Error emitting active students:', error);
      try {
        this.io.emit('students:update', []);
      } catch (emitError) {
        // Ignore emit errors
      }
    }
  }
}

module.exports = PollSocketHandler;
