# Live Polling System

## What is this project?

This project is a **Live Polling System** used in a virtual class or session.

👉 **A Teacher asks a question**  
👉 **Students answer in real time**  
👉 **Results update live**  
👉 **Even if someone refreshes the page, nothing breaks**

---

A resilient live polling system built with React, Node.js, Express, Socket.io, and MongoDB. This system supports two personas: Teacher (Admin) and Student, with real-time polling, state recovery, and comprehensive error handling.

## ✅ Project Status

**The project is working as expected!** All core features have been implemented and tested:

- ✅ **Poll Creation**: Teachers can create polls with questions, options, and timers
- ✅ **Real-time Voting**: Students can vote and results update live via Socket.io
- ✅ **State Recovery**: Page refresh maintains state - polls don't disappear
- ✅ **Timer Synchronization**: Late-joining students see correct remaining time
- ✅ **Race Condition Prevention**: Students cannot vote twice per question
- ✅ **Live Participants**: Only real participants are shown (no mock data)
- ✅ **Chat Functionality**: Real-time chat between teachers and students
- ✅ **Poll History**: Teachers can view past poll results
- ✅ **Student Removal**: Teachers can kick out students
- ✅ **Error Handling**: Graceful error handling with user feedback
- ✅ **UI/UX**: Matches the design specifications exactly

## Features

### Teacher Features
- Create polls with questions, multiple options, and configurable timer (30-120 seconds)
- View real-time poll results as students submit votes
- View poll history with aggregate results
- Remove students from the poll system
- Chat functionality for interaction with students
- View active participants

### Student Features
- Enter name on first visit (unique per session/tab)
- Receive questions instantly when teacher asks them
- Timer synchronization (if joining late, timer shows remaining time)
- Submit answers within the time limit
- View live polling results after submission
- Chat functionality

### System Features
- **State Recovery**: If teacher or student refreshes during an active poll, the application fetches current state from backend and resumes exactly where it left off
- **Race Condition Prevention**: Students cannot vote more than once per question, even if they spam the API
- **Real-time Updates**: Socket.io for instant communication
- **Database Persistence**: MongoDB for storing polls, votes, and chat messages
- **Error Handling**: Comprehensive error handling with user-friendly feedback

## Technology Stack

- **Frontend**: React.js (with Hooks)
- **Backend**: Node.js with Express
- **Real-time**: Socket.io
- **Database**: MongoDB
- **Language**: JavaScript

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd project-12
```

2. Install dependencies for root, backend, and frontend:
```bash
npm run install-all
```

Or install manually:
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Set up environment variables:

Create a `.env` file in the `backend` directory:
```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/live-polling
FRONTEND_URL=http://localhost:3001
```

For the frontend, create a `.env` file in the `frontend` directory:
```env
REACT_APP_API_URL=http://localhost:5001/api
REACT_APP_SOCKET_URL=http://localhost:5001
```

4. Start MongoDB:
```bash
# If using local MongoDB
mongod
```

Or use MongoDB Atlas (cloud) and update the `MONGODB_URI` in the `.env` file.

## Running the Application

### Development Mode

Run both backend and frontend concurrently:
```bash
npm run dev
```

Or run them separately:

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3001 (or 3000 if 3001 is unavailable)
- Backend API: http://localhost:5001

## Usage

1. **Start the application** and navigate to http://localhost:3001 (or http://localhost:3000)
2. **Select Role**: Choose between "I'm a Teacher" or "I'm a Student"
3. **Teacher Flow**:
   - Create polls with questions and options
   - Set timer duration (30-120 seconds)
   - View real-time results as students vote
   - View poll history
   - Remove students if needed
   - Use chat to interact with students
4. **Student Flow**:
   - Enter your name
   - Wait for teacher to ask questions
   - Submit answers when questions appear
   - View results after voting
   - Use chat to interact

## Project Structure

```
project-12/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── controllers/
│   │   │   ├── PollController.js
│   │   │   ├── StudentController.js
│   │   │   └── ChatController.js
│   │   ├── models/
│   │   │   ├── Poll.js
│   │   │   ├── Vote.js
│   │   │   ├── Student.js
│   │   │   └── ChatMessage.js
│   │   ├── routes/
│   │   │   ├── pollRoutes.js
│   │   │   ├── studentRoutes.js
│   │   │   └── chatRoutes.js
│   │   ├── services/
│   │   │   ├── PollService.js
│   │   │   ├── StudentService.js
│   │   │   └── ChatService.js
│   │   ├── socket/
│   │   │   └── PollSocketHandler.js
│   │   └── server.js
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Teacher/
│   │   │   ├── Student/
│   │   │   ├── ChatPanel.js
│   │   │   └── ParticipantsPanel.js
│   │   ├── hooks/
│   │   │   ├── useSocket.js
│   │   │   └── usePollTimer.js
│   │   ├── pages/
│   │   │   ├── RoleSelection.js
│   │   │   ├── TeacherDashboard.js
│   │   │   └── StudentDashboard.js
│   │   ├── utils/
│   │   │   ├── api.js
│   │   │   ├── socket.js
│   │   │   └── storage.js
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
└── package.json
```

## API Endpoints

### Polls
- `POST /api/polls/create` - Create a new poll
- `GET /api/polls/active` - Get active poll
- `GET /api/polls/history` - Get poll history
- `GET /api/polls/:pollId/results` - Get poll results
- `POST /api/polls/vote` - Submit a vote

### Students
- `POST /api/students/register` - Register a student
- `GET /api/students/active` - Get active students
- `DELETE /api/students/:sessionId` - Remove a student

### Chat
- `POST /api/chat/send` - Send a chat message
- `GET /api/chat/messages` - Get recent messages

## Socket Events

### Client to Server
- `teacher:join` - Teacher joins the system
- `student:join` - Student joins with name and sessionId
- `poll:create` - Create a new poll
- `poll:vote` - Submit a vote
- `chat:message` - Send a chat message
- `student:remove` - Remove a student

### Server to Client
- `poll:active` - Active poll data
- `poll:created` - New poll created
- `poll:results` - Updated poll results
- `poll:completed` - Poll completed
- `students:update` - Updated student list
- `student:removed` - Student removed notification
- `chat:message` - New chat message
- `error` - Error message

## Architecture

### Backend Architecture
- **Controller-Service Pattern**: Business logic separated from routes and socket handlers
- **Service Layer**: Handles all database operations and business logic
- **Socket Handler**: Manages real-time communication
- **Models**: Mongoose schemas for data persistence

### Frontend Architecture
- **Custom Hooks**: `useSocket`, `usePollTimer` for reusable logic
- **Component-based**: Modular React components
- **State Management**: React hooks (useState, useEffect)
- **Error Handling**: Toast notifications for user feedback

## Key Features Implementation

### State Recovery
When a user refreshes the page:
1. Frontend fetches current active poll from API
2. Socket connection is re-established
3. Current state (poll, timer, results) is restored
4. UI resumes exactly where it left off

### Timer Synchronization
- Server calculates remaining time based on `endTime - currentTime`
- When student joins late, they receive the actual remaining time
- Client updates timer every second, but server is source of truth

### Race Condition Prevention
- Unique index on `{pollId, sessionId}` in Vote model
- Server-side validation prevents duplicate votes
- Database constraint ensures data integrity

## Testing

To test the application:
1. Open multiple browser tabs/windows
2. Select "Teacher" in one tab
3. Select "Student" in other tabs
4. Create a poll as teacher
5. Submit votes as students
6. Test state recovery by refreshing during an active poll
7. Test timer synchronization by joining late

### Verification Checklist

✅ **Core Functionality**
- [x] Teacher can create polls with questions and options
- [x] Students receive polls instantly via Socket.io
- [x] Real-time results update as students vote
- [x] Timer counts down correctly
- [x] Results display correctly after voting

✅ **Resilience Features**
- [x] Page refresh maintains active poll state
- [x] Late-joining students see correct remaining time
- [x] Students cannot vote twice (race condition prevention)
- [x] State recovery works for both teacher and student

✅ **Additional Features**
- [x] Chat functionality works in real-time
- [x] Participants panel shows only live data
- [x] Teacher can remove students
- [x] Poll history displays correctly
- [x] UI matches design specifications

## Deployment

### Backend Deployment
1. Set environment variables on hosting platform
2. Ensure MongoDB connection string is correct
3. Build and start the server:
```bash
cd backend
npm start
```

### Frontend Deployment
1. Build the React app:
```bash
cd frontend
npm run build
```
2. Deploy the `build` folder to your hosting platform (Vercel, Netlify, etc.)
3. Update API URLs in environment variables

## License

ISC

## Author

Built as an assignment for Intervue


#   I n t e r v u e - P o l l  
 