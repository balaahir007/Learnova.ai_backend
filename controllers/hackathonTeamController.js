import Hackathon from "../schema/Hackathon.js";
import Registration from "../schema/HackathonRegistration.js";
import HackathonTeam from "../schema/HackathonTeam.js";

export const createTeam = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, hackathonId, description } = req.body;

    // Check if hackathon exists
    const hackathon = await Hackathon.findByPk(hackathonId);
    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: 'Hackathon not found'
      });
    }

    // Check if user is registered
    const registration = await Registration.findOne({
      where: { userId, hackathonId }
    });

    if (!registration) {
      return res.status(400).json({
        success: false,
        message: 'You must be registered for this hackathon to create a team'
      });
    }

    // Check if user already has a team
    if (registration.teamId) {
      return res.status(400).json({
        success: false,
        message: 'You are already in a team'
      });
    }

    // Create team
    const team = await  HackathonTeam.create({
      name,
      hackathonId,
      leaderId: userId,
      description,
      status: 'forming'
    });

    // Update registration with team
    await registration.update({
      teamId: team.id,
      isTeamLead: true
    });

    res.status(201).json({
      success: true,
      message: ' HackathonTeam created successfully',
      data: team
    });
  } catch (error) {
    console.error('Error creating team:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating team',
      error: error.message
    });
  }
};

// Get team details
export const getTeam = async (req, res) => {
  try {
    const { id } = req.params;

    const team = await HackathonTeam.findByPk(id, {
      include: [
        {
          model: User,
          as: 'leader',
          attributes: ['id', 'firstName', 'lastName', 'email', 'profileImage', 'skills']
        },
        {
          model: Registration,
          as: 'members',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'firstName', 'lastName', 'email', 'profileImage', 'skills']
            }
          ]
        },
        {
          model: Hackathon,
          as: 'hackathon',
          attributes: ['id', 'title', 'minTeamSize', 'maxTeamSize']
        }
      ]
    });

    if (!team) {
      return res.status(404).json({
        success: false,
        message: ' HackathonTeam not found'
      });
    }

    res.json({
      success: true,
      data: team
    });
  } catch (error) {
    console.error('Error fetching team:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching team',
      error: error.message
    });
  }
};

// Join team
export const joinTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const team = await HackathonTeam.findByPk(id, {
      include: [
        {
          model: Hackathon,
          as: 'hackathon',
          attributes: ['id', 'maxTeamSize']
        },
        {
          model: Registration,
          as: 'members'
        }
      ]
    });

    if (!team) {
      return res.status(404).json({
        success: false,
        message: ' HackathonTeam not found'
      });
    }

    // Check if user is registered for hackathon
    const registration = await Registration.findOne({
      where: { userId, hackathonId: team.hackathonId }
    });

    if (!registration) {
      return res.status(400).json({
        success: false,
        message: 'You must be registered for this hackathon to join a team'
      });
    }

    // Check if user already in a team
    if (registration.teamId) {
      return res.status(400).json({
        success: false,
        message: 'You are already in a team'
      });
    }

    // Check team size limit
    const currentSize = team.members ? team.members.length : 0;
    if (currentSize >= team.hackathon.maxTeamSize) {
      return res.status(400).json({
        success: false,
        message: ' HackathonTeam is full'
      });
    }

    // Add user to team
    await registration.update({ teamId: id });

    res.json({
      success: true,
      message: 'Successfully joined team'
    });
  } catch (error) {
    console.error('Error joining team:', error);
    res.status(500).json({
      success: false,
      message: 'Error joining team',
      error: error.message
    });
  }
};

// Leave team
export const leaveTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const team = await  HackathonTeam.findByPk(id);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: ' Hackathon Team not found'
      });
    }

    const registration = await Registration.findOne({
      where: { userId, teamId: id }
    });

    if (!registration) {
      return res.status(400).json({
        success: false,
        message: 'You are not in this team'
      });
    }

    // Check if user is team leader
    if (team.leaderId === userId) {
      return res.status(400).json({
        success: false,
        message: ' HackathonTeam leader cannot leave. Please transfer leadership or disband the team.'
      });
    }

    await registration.update({ teamId: null, isTeamLead: false });

    res.json({
      success: true,
      message: 'Successfully left team'
    });
  } catch (error) {
    console.error('Error leaving team:', error);
    res.status(500).json({
      success: false,
      message: 'Error leaving team',
      error: error.message
    });
  }
};

// Update team
export const updateTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updates = req.body;

    const team = await  HackathonTeam.findByPk(id);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: ' HackathonTeam not found'
      });
    }

    // Check if user is team leader
    if (team.leaderId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only team leader can update team details'
      });
    }

    await team.update(updates);

    res.json({
      success: true,
      message: ' HackathonTeam updated successfully',
      data: team
    });
  } catch (error) {
    console.error('Error updating team:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating team',
      error: error.message
    });
  }
};
