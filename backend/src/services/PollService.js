const Poll = require('../models/Poll');
const Vote = require('../models/Vote');
const Student = require('../models/Student');

class PollService {
  /**
   * Create a new poll
   */
  async createPoll(question, options, duration) {
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + duration * 1000);

    const poll = new Poll({
      question,
      options: options.map(opt => ({ ...opt, votes: 0 })),
      duration,
      startTime,
      endTime,
      status: 'active'
    });

    await poll.save();
    return poll;
  }

  /**
   * Get the current active poll
   */
  async getActivePoll() {
    const now = new Date();
    return await Poll.findOne({
      status: 'active',
      endTime: { $gt: now }
    }).sort({ createdAt: -1 });
  }

  /**
   * Get poll by ID
   */
  async getPollById(pollId) {
    return await Poll.findById(pollId);
  }

  /**
   * Get all completed polls (history)
   */
  async getPollHistory() {
    return await Poll.find({
      status: 'completed'
    }).sort({ createdAt: -1 });
  }

  /**
   * Submit a vote for a poll
   * Prevents duplicate votes using sessionId
   */
  async submitVote(pollId, studentName, optionIndex, sessionId) {
    // Check if vote already exists
    const existingVote = await Vote.findOne({ pollId, sessionId });
    if (existingVote) {
      throw new Error('You have already voted for this poll');
    }

    // Check if poll is still active
    const poll = await Poll.findById(pollId);
    if (!poll) {
      throw new Error('Poll not found');
    }

    const now = new Date();
    if (poll.status !== 'active' || poll.endTime < now) {
      throw new Error('Poll is no longer active');
    }

    // Validate option index
    if (optionIndex < 0 || optionIndex >= poll.options.length) {
      throw new Error('Invalid option index');
    }

    // Create vote
    const vote = new Vote({
      pollId,
      studentName,
      optionIndex,
      sessionId
    });

    await vote.save();

    // Update poll option vote count
    poll.options[optionIndex].votes += 1;
    await poll.save();

    return vote;
  }

  /**
   * Get poll results with vote counts
   */
  async getPollResults(pollId) {
    const poll = await Poll.findById(pollId);
    if (!poll) return null;

    // Aggregate votes to ensure accuracy
    const votes = await Vote.find({ pollId });
    const voteCounts = new Array(poll.options.length).fill(0);
    
    votes.forEach(vote => {
      if (vote.optionIndex >= 0 && vote.optionIndex < voteCounts.length) {
        voteCounts[vote.optionIndex]++;
      }
    });

    // Update poll with accurate counts
    poll.options.forEach((option, index) => {
      option.votes = voteCounts[index];
    });

    await poll.save();
    return poll;
  }

  /**
   * Complete a poll (mark as completed)
   */
  async completePoll(pollId) {
    const poll = await Poll.findById(pollId);
    if (!poll) return null;

    poll.status = 'completed';
    await poll.save();
    return poll;
  }

  /**
   * Check if all students have answered
   */
  async haveAllStudentsAnswered(pollId) {
    const activeStudents = await Student.countDocuments({ isActive: true });
    const voteCount = await Vote.countDocuments({ pollId });
    return voteCount >= activeStudents;
  }

  /**
   * Calculate remaining time for a poll
   */
  getRemainingTime(poll) {
    const now = new Date();
    const remaining = Math.max(0, Math.floor((poll.endTime.getTime() - now.getTime()) / 1000));
    return remaining;
  }
}

module.exports = PollService;


