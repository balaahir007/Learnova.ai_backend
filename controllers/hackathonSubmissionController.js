import HackathonSubmission from "../schema/HackathonSubmission.js";
import HackathonTeam from "../schema/HackathonTeam.js";

export const createSubmission = async (req, res) => {
  try {
    const userId = req.user.id;
    const submissionData = req.body;

    // Check if user is team leader
    const team = await HackathonTeam.findByPk(submissionData.teamId);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    if (team.leaderId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only team leader can submit project'
      });
    }

    // Check if already submitted
    const existingSubmission = await HackathonSubmission.findOne({
      where: { teamId: submissionData.teamId, hackathonId: team.hackathonId }
    });

    if (existingSubmission) {
      return res.status(400).json({
        success: false,
        message: 'Team has already submitted a project'
      });
    }

    const submission = await HackathonSubmission.create({
      ...submissionData,
      hackathonId: team.hackathonId,
      status: 'submitted',
      submittedAt: new Date()
    });

    // Update team status
    await team.update({ status: 'submitted', submittedAt: new Date() });

    res.status(201).json({
      success: true,
      message: 'Submission created successfully',
      data: submission
    });
  } catch (error) {
    console.error('Error creating submission:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating submission',
      error: error.message
    });
  }
};

// Get submission
export const getSubmission = async (req, res) => {
  try {
    const { id } = req.params;

    const submission = await HackathonSubmission.findByPk(id, {
      include: [
        {
          model: Team,
          as: 'team',
          include: [
            {
              model: User,
              as: 'leader',
              attributes: ['id', 'firstName', 'lastName', 'email', 'profileImage']
            },
            {
              model: Registration,
              as: 'members',
              include: [
                {
                  model: User,
                  as: 'user',
                  attributes: ['id', 'firstName', 'lastName', 'email', 'profileImage']
                }
              ]
            }
          ]
        },
        {
          model: Hackathon,
          as: 'hackathon',
          attributes: ['id', 'title', 'judgingCriteria']
        }
      ]
    });

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    res.json({
      success: true,
      data: submission
    });
  } catch (error) {
    console.error('Error fetching submission:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching submission',
      error: error.message
    });
  }
};

// Get all submissions for hackathon
export const getHackathonSubmissions = async (req, res) => {
  try {
    const { hackathonId } = req.params;
    const { status, sortBy = 'submittedAt' } = req.query;

    const where = { hackathonId };
    if (status) {
      where.status = status;
    }

    let order = [['submittedAt', 'DESC']];
    if (sortBy === 'score') {
      order = [['totalScore', 'DESC']];
    } else if (sortBy === 'rank') {
      order = [['rank', 'ASC']];
    }

    const submissions = await HackathonSubmission.findAll({
      where,
      order,
      include: [
        {
          model: Team,
          as: 'team',
          include: [
            {
              model: User,
              as: 'leader',
              attributes: ['id', 'firstName', 'lastName', 'profileImage']
            }
          ]
        }
      ]
    });

    res.json({
      success: true,
      data: submissions
    });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching submissions',
      error: error.message
    });
  }
};

// Update submission
export const updateSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updates = req.body;

    const submission = await HackathonSubmission.findByPk(id, {
      include: [{ model: Team, as: 'team' }]
    });

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Check if user is team leader
    if (submission.team.leaderId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only team leader can update submission'
      });
    }

    await submission.update(updates);

    res.json({
      success: true,
      message: 'Submission updated successfully',
      data: submission
    });
  } catch (error) {
    console.error('Error updating submission:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating submission',
      error: error.message
    });
  }
};