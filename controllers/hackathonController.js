import { Op } from "sequelize";
import Hackathon from "../models/Hackathon.js";
import slugify from "slugify";
import User from "../models/userSchema.js";
import Registration from "../models/HackathonRegistration.js";
import HackathonTeam from "../models/HackathonTeam.js";
import SavedItem from "../models/savedItemModel.js";

export const getAllHackathons = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      search,
      status,
      type,
      difficulty,
      location,
      tags,
      sortBy = "featured",
      featured,
      trending,
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    // Search filter
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { organizer: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    // Status filter
    if (status) {
      where.status = status.toLowerCase();
    }

    // Type filter
    if (type) {
      where.type = type.toLowerCase();
    }

    // Difficulty filter
    if (difficulty) {
      where.difficulty = difficulty.toLowerCase();
    }

    // Location filter
    if (location) {
      where.location = { [Op.iLike]: `%${location}%` };
    }

    // Tags filter
    if (tags) {
      where.tags = { [Op.contains]: [tags] };
    }

    // Featured filter
    if (featured === "true") {
      where.featured = true;
    }

    // Trending filter
    if (trending === "true") {
      where.trending = true;
    }

    // Sorting
    let order = [];
    switch (sortBy) {
      case "featured":
        order = [
          ["featured", "DESC"],
          ["trending", "DESC"],
          ["createdAt", "DESC"],
        ];
        break;
      case "deadline":
        order = [["registrationDeadline", "ASC"]];
        break;
      case "prizePool":
        order = [["prizePool", "DESC"]];
        break;
      case "participants":
        order = [["registrationCount", "DESC"]];
        break;
      case "startDate":
        order = [["startDate", "ASC"]];
        break;
      default:
        order = [["createdAt", "DESC"]];
    }
    const savedInclude = req.user
      ? {
          model: SavedItem,
          as: "SavedItems",
          where: { userId: req.user.id },
          required: false,
        }
      : {
          model: SavedItem,
          as: "SavedItems",
          required: false,
        };

    const { count, rows: hackathons } = await Hackathon.findAndCountAll({
      where,
      order,
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [savedInclude],
    });

    // const hackathonsWithCounts = await Promise.all(
    //   hackathons.map(async (hackathon) => {
    //     const registrationCount = await Registration.count({
    //       where: {
    //         hackathonId: hackathon.id,
    //         status: { [Op.in]: ["pending", "approved"] },
    //       },
    //     });

    //     return {
    //       ...hackathon.toJSON(),
    //       participants: registrationCount,
    //       duration: calculateDuration(hackathon.startDate, hackathon.endDate),
    //     };
    //   })
    // );

    res.json({
      success: true,
      data: {
        hackathons: hackathons,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching hackathons:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching hackathons",
      error: error.message,
    });
  }
};

// Get single hackathon by ID or slug
export const getHackathon = async (req, res) => {
  try {
    const { id } = req.params;

    const where = id.match(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    )
      ? { id }
      : { slug: id };

    const hackathon = await Hackathon.findOne({
      where,
      include: [
        {
          model: User,
          as: "organizerDetails",
          attributes: [
            "id",
            "firstName",
            "username",
            "email",
            "profilePicture",
            "college",
          ],
        },
        {
          model: SavedItem,
          as: "SavedItems",
          where: req.user ? { userId: req.user.id } : {},
          required: false,
        },
        // {
        //   model: Registration,
        //   as: "registrations",
        //   where: { status: { [Op.in]: ["pending", "approved"] } },
        //   required: false,
        //   include: [
        //     {
        //       model: User,
        //       as: "user",
        //       attributes: ["id", "firstName", "username", "profilePicture"],
        //     },
        //   ],
        // },
        // {
        //   model: Team,
        //   as: "teams",
        //   required: false,
        // },
      ],
    });

    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: "Hackathon not found",
      });
    }

    // Increment view count
    await hackathon.increment("viewCount");

    const registrationCount = hackathon.registrations
      ? hackathon.registrations.length
      : 0;

    res.json({
      success: true,
      data: {
        ...hackathon.toJSON(),
        participants: registrationCount,
        duration: calculateDuration(hackathon.startDate, hackathon.endDate),
      },
    });
  } catch (error) {
    console.error("Error fetching hackathon:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching hackathon",
      error: error.message,
    });
  }
};

export const getHackathonTeamRules = async (req, res) => {
  try {
    const { id } = req.params;

    const where = id.match(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    )
      ? { id }
      : { slug: id };

    console.log("id : ", id);

    const hackathon = await Hackathon.findOne({
      where,
      attributes: ["maxRegistration", "minTeamSize", "maxTeamSize"],
    });

    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: "hackathon Team rules is  not found",
      });
    }

    res.json({
      success: true,
      data: hackathon,
    });
  } catch (error) {
    console.error("Error fetching hackathon:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching hackathon",
      error: error.message,
    });
  }
};
export const getHackathonRegistrationRules = async (req, res) => {
  try {
    const { id } = req.params;

    const where = id.match(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    )
      ? { id }
      : { slug: id };

    console.log("id : ", id);

    const hackathon = await Hackathon.findOne({
      where,
      attributes: [
        "maxRegistration",
        "registrationCount",
        "minTeamSize",
        "maxTeamSize",
      ],
    });

    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: "hackathon Team rules is  not found",
      });
    }

    res.json({
      success: true,
      data: hackathon,
    });
  } catch (error) {
    console.error("Error fetching hackathon:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching hackathon",
      error: error.message,
    });
  }
};

export const createHackathon = async (req, res) => {
  try {
    const userId = req.user.id;
    const hackathonData = req.body;

    console.log("request Data : ", req.body);
    console.log("User Id : ", userId);
    const slug = slugify(hackathonData.title, { lower: true, strict: true });

    const hackathon = await Hackathon.create({
      ...hackathonData,
      slug,
      tags:
        typeof hackathonData.tags === "string"
          ? hackathonData.tags.split(",").map((t) => t.trim())
          : hackathonData.tags,
      themes:
        typeof hackathonData.themes === "string"
          ? hackathonData.themes.split(",").map((t) => t.trim())
          : hackathonData.themes,
      organizerId: userId,
    });

    res.status(201).json({
      success: true,
      message: "Hackathon created successfully",
      data: hackathon,
    });
  } catch (error) {
    console.error("Error creating hackathon:", error);
    res.status(500).json({
      success: false,
      message: "Error creating hackathon",
      error: error.message,
    });
  }
};

// Update hackathon
export const updateHackathon = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updates = req.body;

    const hackathon = await Hackathon.findByPk(id);

    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: "Hackathon not found",
      });
    }

    // Check if user is the organizer or admin
    if (hackathon.organizerId !== userId && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this hackathon",
      });
    }

    // Update slug if title changes
    if (updates.title && updates.title !== hackathon.title) {
      updates.slug = slugify(updates.title, { lower: true, strict: true });
    }

    await hackathon.update(updates);

    res.json({
      success: true,
      message: "Hackathon updated successfully",
      data: hackathon,
    });
  } catch (error) {
    console.error("Error updating hackathon:", error);
    res.status(500).json({
      success: false,
      message: "Error updating hackathon",
      error: error.message,
    });
  }
};

// Delete hackathon
export const deleteHackathon = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const hackathon = await Hackathon.findByPk(id);

    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: "Hackathon not found",
      });
    }

    // Check if user is the organizer or admin
    if (hackathon.organizerId !== userId && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this hackathon",
      });
    }

    await hackathon.destroy();

    res.json({
      success: true,
      message: "Hackathon deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting hackathon:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting hackathon",
      error: error.message,
    });
  }
};

export const registerForHackathon = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { registrationData, teamMembers } = req.body;
    console.log("regsitertion Data  : ", registrationData);
    console.log("teamMembers Data  : ", teamMembers);
    const hackathon = await Hackathon.findByPk(id);

    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: "Hackathon not found",
      });
    }

    // Check if already registered
    const existingRegistration = await Registration.findOne({
      where: { userId, hackathonId: id },
    });

    if (existingRegistration) {
      return res.status(400).json({
        success: false,
        message: "You are already registered for this hackathon",
      });
    }

    // Check if max participants reached
    const registrationCount = await Registration.count({
      where: {
        hackathonId: id,
        status: { [Op.in]: ["pending", "approved"] },
      },
    });

    if (registrationCount >= hackathon.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: "This hackathon has reached maximum participants",
      });
    }

    const isValid = teamMembers.some(
      (m) => !m.name?.trim() || !m.email?.trim() || !m.phone?.trim()
    );

    if (isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid team member details",
      });
    }

    const isExistingTeamName = await HackathonTeam.findOne({
      where: {
        name: registrationData?.teamName?.trim(),
      },
    });

    if (isExistingTeamName) {
      return res.status(400).json({
        success: false,
        message: "Team name is Already Taken By other",
      });
    }
    const techArray = registrationData?.techStack
      ? registrationData.techStack.split(",").map((t) => t.trim())
      : [];

    const membersArray = Array.isArray(teamMembers) ? teamMembers : [];

    const team = await HackathonTeam.create({
      name: registrationData?.teamName,
      hackathonId: id,
      technologies: techArray,
      contactEmail: registrationData?.email,
      contactPhone: registrationData?.phone,
      institution: registrationData?.institution,
      leaderId: userId,
      members: membersArray,
      projectDescription: registrationData?.projectIdea,
      githubRepo: registrationData?.github,
    });

    console.log("team : ", team);

    // Check if registration is open
    // if (hackathon.status !== "open") {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Registration is not open for this hackathon",
    //   });
    // }

    // Check if deadline has passed
    if (new Date() > new Date(hackathon.registrationDeadline)) {
      return res.status(400).json({
        success: false,
        message: "Registration deadline has passed",
      });
    }

    const registration = await Registration.create({
      userId,
      hackathonId: id,
      teamId: team?.id || null,
      answers: {},
      preferences: {},
      status: "approved", // Auto-approve for now
    });

    // Update registration count
    await hackathon.increment("registrationCount");

    res.status(201).json({
      success: true,
      message: "Successfully registered for hackathon",
      data: registration,
    });
  } catch (error) {
    console.error("Error registering for hackathon:", error);
    res.status(500).json({
      success: false,
      message: "Error registering for hackathon",
      error: error.message,
    });
  }
};

// Get user's registrations
export const getMyRegistrations = async (req, res) => {
  try {
    console.log("My Registrations API Called");

    const userId = req.user.id;

    const registrations = await Registration.findAll({
      where: { userId },
      include: [
        {
          model: Hackathon,
          as: "hackathon",
          attributes: [
            "id",
            "title",
            "slug",
            "thumbnail",
            "startDate",
            "endDate",
            "status",
            "organizerId",
          ],
        },
        {
          model: HackathonTeam,
          as: "team",
          required: false,
          attributes: [
            "id",
            "name",
            "technologies",
            "contactEmail",
            "leaderId",
            "members",
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.json({
      success: true,
      data: registrations,
    });
  } catch (error) {
    console.error("Error fetching registrations:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching hackathon registrations",
      error: error.message,
    });
  }
};

// Helper function to calculate duration
function calculateDuration(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const hours = Math.abs(end - start) / 36e5;
  return `${hours} hours`;
}
