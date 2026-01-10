const PollService = require('../services/PollService');
const StudentService = require('../services/StudentService');
const ChatService = require('../services/ChatService');

const pollService = new PollService();
const studentService = new StudentService();
const chatService = new ChatService();

class PollSocketHandler {
  constructor(io) {
    this.io = io;
    this.pollTimers = new Map(); // Store timers for active polls
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      // Handle teacher joining
      socket.on('teacher:join', async () => {
        socket.join('teachers');
        await this.emitActivePoll(socket);
        await this.emitActiveStudents();
      });

      // Handle student joining
      socket.on('student:join', async (data) => {
        try {
          await studentService.registerStudent(data.name, data.sessionId);
          socket.join('students');
          socket.data.sessionId = data.sessionId;
          socket.data.studentName = data.name;
          
          await this.emitActivePoll(socket);
          await this.emitActiveStudents();
        } catch (error) {
          console.error('Error in student:join:', error);
          socket.emit('error', { message: 'Failed to join as student' });
        }
      });

      // Handle poll creation
      socket.on('poll:create', async (data) => {
        try {
          // Check if there's an active poll
          const activePoll = await pollService.getActivePoll();
          if (activePoll) {
            // Check if all students have answered
            const allAnswered = await pollService.haveAllStudentsAnswered(activePoll._id.toString());
            if (!allAnswered) {
              socket.emit('error', { message: 'Please wait for all students to answer the current question' });
              return;
            }
            // Complete the previous poll
            await pollService.completePoll(activePoll._id.toString());
            // Clear timer if exists
            if (this.pollTimers.has(activePoll._id.toString())) {
              clearTimeout(this.pollTimers.get(activePoll._id.toString()));
              this.pollTimers.delete(activePoll._id.toString());
            }
          }

          const poll = await pollService.createPoll(data.question, data.options, data.duration);
          
          // Emit to all clients
          const remainingTime = pollService.getRemainingTime(poll);
          this.io.emit('poll:created', {
            poll,
            remainingTime
          });

          // Set up auto-complete timer
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

      // Handle vote submission
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

          // Get updated results
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

      // Handle chat message
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

      // Handle student removal
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

      // Handle disconnect
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  }

  async emitActivePoll(socket) {
    try {
      const poll = await pollService.getActivePoll();
      if (poll) {
        const remainingTime = pollService.getRemainingTime(poll);
        const pollData = {
          poll: poll.toObject ? poll.toObject() : poll,
          remainingTime
        };
        socket.emit('poll:active', pollData);
        console.log(`Emitted poll:active to socket ${socket.id}, remaining time: ${remainingTime}s`);
      } else {
        console.log(`No active poll to emit to socket ${socket.id}`);
      }
    } catch (error) {
      console.error('Error emitting active poll:', error);
    }
  }

  async emitActiveStudents() {
    try {
      const students = await studentService.getActiveStudents();
      this.io.emit('students:update', students);
    } catch (error) {
      console.error('Error emitting active students:', error);
    }
  }
}

module.exports = PollSocketHandler;

