import Group from "./groupModel.js";
import Note from "./Note.js";
import Participant from "./participantModel.js";
import StudySpaceChat from "./studySpaceChat.js";
import Comment from "./studySpaceComment.js";
import Post from "./studySpacePost.js";
import StudySpace from "./studySpaceModel.js";
import StudySpaceResource from "./studySpaceResource.js";
import User from "./userSchema.js";
import Hackathon from "./Hackathon.js";
import Registration from "./HackathonRegistration.js";
import HackathonTeam from "./HackathonTeam.js";
import HackathonSubmission from "./HackathonSubmission.js";
import Application from "./JobApplication.js";
import Job from "./Jobs.js";
import Company from "./company.js"; // ✅ Added
import StudySpaceAdmin from "./studySpaceAdmins.js";
import SavedItem from "./savedItemModel.js";
import Verification from "./Verification.js"; // ✅ Make sure path is correct
import { Course, Attachments, Category, UserProgress } from "./Course.js"; // ✅ Added Course models
const setupAssociations = () => {
  // ----- StudySpace -----
  StudySpace.hasMany(Post, {
    foreignKey: "spaceId",
    onDelete: "CASCADE",
    hooks: true,
  });

  StudySpace.hasMany(StudySpaceAdmin, { foreignKey: "spaceId", as: "admins" });
  StudySpaceAdmin.belongsTo(StudySpace, {
    foreignKey: "spaceId",
    as: "studyspaces",
  });

  // One User can be admin of many study spaces
  User.hasMany(StudySpaceAdmin, { foreignKey: "adminId", as: "adminSpaces" });
  StudySpaceAdmin.belongsTo(User, { foreignKey: "adminId", as: "admin" });

  Post.belongsTo(StudySpace, { foreignKey: "spaceId" });
  Post.belongsTo(User, { foreignKey: "authorId", as: "author" });
  Post.hasMany(Comment, { foreignKey: "postId", onDelete: "CASCADE" });
  Comment.belongsTo(Post, { foreignKey: "postId" });
  Comment.belongsTo(User, { foreignKey: "userId", as: "commenter" });
  StudySpaceChat.belongsTo(User, { foreignKey: "userId", as: "author" });
  User.hasMany(StudySpaceChat, { foreignKey: "userId" });
  StudySpace.hasMany(Note, {
    foreignKey: "spaceId",
    onDelete: "CASCADE",
    hooks: true,
  });
  Note.belongsTo(StudySpace, { foreignKey: "spaceId" });
  Group.belongsToMany(Participant, { through: "groupParticipants" });
  Participant.belongsToMany(Group, { through: "groupParticipants" });
  StudySpace.hasMany(StudySpaceResource, {
    foreignKey: "studySpaceId",
    onDelete: "CASCADE",
    hooks: true,
  });
  StudySpaceResource.belongsTo(StudySpace, {
    foreignKey: "studySpaceId",
    as: "studySpace",
  });
  User.hasMany(StudySpaceResource, {
    foreignKey: "uploadedBy",
    onDelete: "CASCADE",
  });
  StudySpaceResource.belongsTo(User, {
    foreignKey: "uploadedBy",
    as: "uploader",
  });

  User.hasMany(Verification, { foreignKey: "userId" });
  Verification.belongsTo(User, { foreignKey: "userId" });

  // ----- Hackathon -----
  User.hasMany(Hackathon, {
    foreignKey: "organizerId",
    as: "organizedHackathons",
  });
  Hackathon.belongsTo(User, {
    foreignKey: "organizerId",
    as: "organizerDetails",
  });
  User.hasMany(Registration, { foreignKey: "userId", as: "registrations" });
  Registration.belongsTo(User, { foreignKey: "userId", as: "user" });
  Hackathon.hasMany(Registration, {
    foreignKey: "hackathonId",
    as: "registrations",
  });
  Registration.belongsTo(Hackathon, {
    foreignKey: "hackathonId",
    as: "hackathon",
  });
  HackathonTeam.belongsTo(Hackathon, {
    foreignKey: "hackathonId",
    as: "hackathonDetails",
  });

  HackathonTeam.belongsTo(User, { foreignKey: "leaderId", as: "leader" });
  Hackathon.hasMany(HackathonTeam, {
    foreignKey: "hackathonId",
    as: "teams",
  });
  Registration.belongsTo(HackathonTeam, { foreignKey: "teamId", as: "team" });
  // HackathonTeam.hasMany(Registration, { foreignKey: "teamId", as: "members" });
  HackathonSubmission.belongsTo(HackathonTeam, {
    foreignKey: "teamId",
    as: "team",
  });

  SavedItem.belongsTo(User, { foreignKey: "userId" });
  User.hasMany(SavedItem, { foreignKey: "userId" });

  Job.hasMany(SavedItem, {
    foreignKey: "itemId",
    constraints: false,
    as: "SavedItems",
    scope: { itemType: "job" },
  });
  SavedItem.belongsTo(Job, {
    foreignKey: "itemId",
    constraints: false,
    as: "jobDetails",
  });

  // Hackathon can be saved
  Hackathon.hasMany(SavedItem, {
    foreignKey: "itemId",
    constraints: false,
    as: "SavedItems",
    scope: { itemType: "hackathon" },
  });
  SavedItem.belongsTo(Hackathon, {
    foreignKey: "itemId",
    constraints: false,
    as: "hackathonDetails",
  });

  HackathonSubmission.belongsTo(Hackathon, {
    foreignKey: "hackathonId",
    as: "hackathon",
  });
  HackathonTeam.hasOne(HackathonSubmission, {
    foreignKey: "teamId",
    as: "submission",
  });
  Hackathon.hasMany(HackathonSubmission, {
    foreignKey: "hackathonId",
    as: "submissions",
  });

  // ----- Recruiter & Company -----
  User.hasMany(Application, { foreignKey: "userId", onDelete: "CASCADE" });
  Application.belongsTo(User, { foreignKey: "userId" });
  Application.belongsTo(Job, { foreignKey: "jobId" });

  Company.hasMany(User, { foreignKey: "companyId" }); // A company can have many users (recruiters)
  User.belongsTo(Company, { foreignKey: "companyId" });
  Company.hasMany(Job, { foreignKey: "companyId" });
  Job.belongsTo(Company, { foreignKey: "companyId" });
  Job.hasMany(Application, { foreignKey: "jobId", onDelete: "CASCADE" });
  Application.belongsTo(User, { foreignKey: "userId" });
};

export default setupAssociations;
