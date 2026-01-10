const PollService = require('../services/PollService');
const StudentService = require('../services/StudentService');
const ChatService = require('../services/ChatService');
const mongoose = require('mongoose');

const pollService = new PollService();
const studentService = new StudentService();
const chatService = new ChatService();

// Helper function to check if database is connected
const isDatabaseConnected = () => {
  return mongoose.connection.readyState === 1; // 1 = connected
};

class PollSocketHandler {
  constructor(io) {
    console.log('🔧 Initializing PollSocketHandler...');
    this.io = io;
    this.pollTimers = new Map(); // Store timers for active polls
    this.setupEventHandlers();
    console.log('✅ PollSocketHandler initialized successfully');
  }

  setupEventHandlers() {
    console.log('🔧 Setting up Socket.io event handlers...');
    
    this.io.on('connection', (socket) => {
      // Wrap entire connection handler in try-catch to catch any setup errors
      try {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🔌 NEW CLIENT CONNECTION');
        console.log('   Socket ID:', socket.id);
        console.log('   Origin:', socket.handshake.headers.origin);
        console.log('   Transport:', socket.conn.transport.name);
        console.log('   Query:', socket.handshake.query);
        console.log('   Headers:', {
          'user-agent': socket.handshake.headers['user-agent'],
          'referer': socket.handshake.headers.referer
        });
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        // Handle connection errors - catch any errors during connection
        socket.on('error', (error) => {
          console.error('❌ Socket error for client', socket.id);
          console.error('   Error:', error);
          console.error('   Error type:', error.constructor.name);
          console.error('   Error message:', error.message);
          if (error.stack) {
            console.error('   Stack:', error.stack);
          }
          // Don't emit error here - it might cause a loop
          // Instead, just log it
        });

        // Wrap all handlers in try-catch to prevent server crashes
        const safeEmit = (event, handler) => {
          socket.on(event, async (...args) => {
            try {
              await handler(...args);
            } catch (error) {
              console.error(`Error in ${event} handler:`, error);
              socket.emit('error', { 
                message: error.message || `Error handling ${event}`,
                event: event
              });
            }
          });
        };

      // Handle teacher joining
      socket.on('teacher:join', async () => {
        try {
          console.log('👨‍🏫 Teacher join request from socket:', socket.id);
          socket.join('teachers');
          console.log('   ✅ Teacher joined "teachers" room');
          
          console.log('   📊 Emitting active poll...');
          await this.emitActivePoll(socket);
          
          console.log('   👥 Emitting active students...');
          await this.emitActiveStudents();
          
          console.log('   ✅ Teacher join completed successfully');
        } catch (error) {
          console.error('❌ Error in teacher:join:', error);
          console.error('   Stack:', error.stack);
          socket.emit('error', { message: 'Failed to join as teacher' });
        }
      });

      // Handle student joining
      socket.on('student:join', async (data) => {
        try {
          console.log('👨‍🎓 Student join request from socket:', socket.id);
          console.log('   Data received:', { name: data.name, sessionId: data.sessionId });
          
          if (!data.name || !data.sessionId) {
            console.error('   ❌ Missing required data:', { hasName: !!data.name, hasSessionId: !!data.sessionId });
            socket.emit('error', { message: 'Name and sessionId are required' });
            return;
          }
          
          console.log('   📝 Registering student...');
          await studentService.registerStudent(data.name, data.sessionId);
          console.log('   ✅ Student registered successfully');
          
          socket.join('students');
          socket.data.sessionId = data.sessionId;
          socket.data.studentName = data.name;
          console.log('   ✅ Student joined "students" room');
          
          console.log('   📊 Emitting active poll...');
          await this.emitActivePoll(socket);
          
          console.log('   👥 Emitting active students...');
          await this.emitActiveStudents();
          
          console.log('   ✅ Student join completed successfully');
        } catch (error) {
          console.error('❌ Error in student:join:', error);
          console.error('   Error message:', error.message);
          console.error('   Error stack:', error.stack);
          socket.emit('error', { message: 'Failed to join as student: ' + error.message });
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
      socket.on('disconnect', (reason) => {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('⚠️ CLIENT DISCONNECTED');
        console.log('   Socket ID:', socket.id);
        console.log('   Reason:', reason);
        console.log('   Student Name:', socket.data?.studentName || 'N/A');
        console.log('   Session ID:', socket.data?.sessionId || 'N/A');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      });
      
      console.log('✅ Socket event handlers registered for:', socket.id);
      } catch (error) {
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('❌ CRITICAL ERROR in connection handler');
        console.error('   Socket ID:', socket?.id || 'unknown');
        console.error('   Error message:', error.message);
        console.error('   Error type:', error.constructor.name);
        console.error('   Error stack:', error.stack);
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        // Don't emit error here - it might cause issues
        // The socket will disconnect naturally if there's a problem
        // Just log it for debugging
      }
    });

    // Add global error handler for the io instance
    this.io.engine.on('connection_error', (err) => {
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('❌ SOCKET.IO ENGINE CONNECTION ERROR (PollSocketHandler)');
      console.error('   Code:', err.code);
      console.error('   Message:', err.message);
      console.error('   Context:', err.context);
      console.error('   Type:', err.type);
      if (err.req) {
        console.error('   Request URL:', err.req.url);
        console.error('   Request Origin:', err.req.headers.origin);
      }
      if (err.stack) {
        console.error('   Stack:', err.stack);
      }
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    });
    
    console.log('✅ Socket.io connection handler registered');
  }

  async emitActivePoll(socket) {
    try {
      // Check if database is connected
      if (!isDatabaseConnected()) {
        console.warn('   ⚠️ Database not connected, skipping poll emission');
        try {
          socket.emit('poll:inactive');
        } catch (emitError) {
          console.error('   ❌ Could not emit poll:inactive:', emitError);
        }
        return;
      }

      console.log(`   🔍 Checking for active poll...`);
      const poll = await pollService.getActivePoll();
      if (poll) {
        console.log(`   ✅ Found active poll:`, poll._id);
        const remainingTime = pollService.getRemainingTime(poll);
        console.log(`   ⏱️ Remaining time: ${remainingTime}s`);
        
        const pollData = {
          poll: poll.toObject ? poll.toObject() : poll,
          remainingTime
        };
        
        console.log(`   📤 Emitting poll:active to socket ${socket.id}...`);
        // Wrap emit in try-catch to handle emit errors
        try {
          socket.emit('poll:active', pollData);
          console.log(`   ✅ Successfully emitted poll:active to socket ${socket.id}`);
        } catch (emitError) {
          console.error('   ❌ Error emitting poll:active event:', emitError);
          // Don't throw - just log it
        }
      } else {
        console.log(`   ℹ️ No active poll found (this is normal)`);
        // Emit inactive state
        try {
          socket.emit('poll:inactive');
        } catch (emitError) {
          console.error('   ❌ Error emitting poll:inactive event:', emitError);
        }
      }
    } catch (error) {
      console.error('   ❌ Error in emitActivePoll:', error);
      console.error('   Error message:', error.message);
      console.error('   Error stack:', error.stack);
      // Emit inactive state on error to prevent client from waiting
      try {
        socket.emit('poll:inactive');
      } catch (emitError) {
        console.error('   ❌ Could not emit poll:inactive after error:', emitError);
      }
    }
  }

  async emitActiveStudents() {
    try {
      // Check if database is connected
      if (!isDatabaseConnected()) {
        console.warn('   ⚠️ Database not connected, emitting empty students array');
        try {
          this.io.emit('students:update', []);
        } catch (emitError) {
          console.error('   ❌ Could not emit empty students array:', emitError);
        }
        return;
      }

      console.log(`   🔍 Fetching active students...`);
      const students = await studentService.getActiveStudents();
      console.log(`   ✅ Found ${students.length} active students`);
      console.log(`   📤 Emitting students:update to all clients...`);
      
      // Wrap emit in try-catch to handle emit errors
      try {
        this.io.emit('students:update', students);
        console.log(`   ✅ Successfully emitted students:update (${students.length} students)`);
      } catch (emitError) {
        console.error('   ❌ Error emitting students:update event:', emitError);
        // Try to emit empty array as fallback
        try {
          this.io.emit('students:update', []);
        } catch (fallbackError) {
          console.error('   ❌ Could not emit fallback students:update:', fallbackError);
        }
      }
    } catch (error) {
      console.error('   ❌ Error in emitActiveStudents:', error);
      console.error('   Error message:', error.message);
      console.error('   Error stack:', error.stack);
      // Emit empty array on error to prevent client issues
      console.log(`   📤 Emitting empty students array due to error...`);
      try {
        this.io.emit('students:update', []);
      } catch (emitError) {
        console.error('   ❌ Could not emit empty students array:', emitError);
      }
    }
  }
}

module.exports = PollSocketHandler;

