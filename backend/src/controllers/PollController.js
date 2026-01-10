const PollService = require('../services/PollService');

const pollService = new PollService();

class PollController {
  /**
   * Create a new poll
   */
  async createPoll(req, res) {
    try {
      const { question, options, duration } = req.body;

      if (!question || !options || !Array.isArray(options) || options.length < 2) {
        res.status(400).json({ error: 'Invalid poll data' });
        return;
      }

      if (!duration || duration < 1 || duration > 300) {
        res.status(400).json({ error: 'Duration must be between 1 and 300 seconds' });
        return;
      }

      const poll = await pollService.createPoll(question, options, duration);
      res.status(201).json(poll);
    } catch (error) {
      console.error('Error creating poll:', error);
      res.status(500).json({ error: error.message || 'Failed to create poll' });
    }
  }

  /**
   * Get active poll
   */
  async getActivePoll(req, res) {
    try {
      const poll = await pollService.getActivePoll();
      if (!poll) {
        res.status(404).json({ error: 'No active poll found' });
        return;
      }

      const remainingTime = pollService.getRemainingTime(poll);
      res.json({
        poll,
        remainingTime
      });
    } catch (error) {
      console.error('Error getting active poll:', error);
      res.status(500).json({ error: error.message || 'Failed to get active poll' });
    }
  }

  /**
   * Get poll history
   */
  async getPollHistory(req, res) {
    try {
      const polls = await pollService.getPollHistory();
      res.json(polls);
    } catch (error) {
      console.error('Error getting poll history:', error);
      res.status(500).json({ error: error.message || 'Failed to get poll history' });
    }
  }

  /**
   * Get poll results
   */
  async getPollResults(req, res) {
    try {
      const { pollId } = req.params;
      const poll = await pollService.getPollResults(pollId);
      
      if (!poll) {
        res.status(404).json({ error: 'Poll not found' });
        return;
      }

      res.json(poll);
    } catch (error) {
      console.error('Error getting poll results:', error);
      res.status(500).json({ error: error.message || 'Failed to get poll results' });
    }
  }

  /**
   * Submit a vote
   */
  async submitVote(req, res) {
    try {
      const { pollId, studentName, optionIndex, sessionId } = req.body;

      if (!pollId || studentName === undefined || optionIndex === undefined || !sessionId) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const vote = await pollService.submitVote(pollId, studentName, optionIndex, sessionId);
      res.status(201).json(vote);
    } catch (error) {
      console.error('Error submitting vote:', error);
      res.status(400).json({ error: error.message || 'Failed to submit vote' });
    }
  }
}

module.exports = new PollController();


