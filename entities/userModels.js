import bcrypt from "bcryptjs";
import User from "../models/userSchema.js";

export const createUser = async (userData) => {
  try {
    const { username, password, email,userType } = userData;

    if (!username || !password || !email || !userType) {
      throw new Error("Username, password, and email,userType are required");
    }

    const isExistingUser = await User.findOne({ where: { email } });
    if (isExistingUser) {
      throw new Error("User is already registered");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Predefined color palette
    const COLORS = [
      "FF6B6B",
      "FFB347",
      "FFD700",
      "9ACD32",
      "40E0D0",
      "00BFFF",
      "1E90FF",
      "6495ED",
      "9370DB",
      "FF69B4",
      "F08080",
      "20B2AA",
      "FF7F50",
      "6A5ACD",
      "2E8B57",
    ];

    const firstLetter = username.charAt(0).toUpperCase();
    const randomIndex = Math.floor(Math.random() * COLORS.length);
    const bgColor = COLORS[randomIndex]; // Already no '#'
    const textColor = "000000"; // black

    const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${firstLetter}&backgroundColor=${bgColor}&textColor=${textColor}`;
    const newUser = await User.create({
      username,
      email,
      role : userType,
      profilePicture: avatarUrl,
      password: hashedPassword,
    });

    const updatedUser = await User.findByPk(newUser.id, {
      attributes: { exclude: ["password"] },
    });

    return updatedUser;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const findUserByEmail = async (userData) => {
  try {
    const { password, email } = userData;

    if (!password || !email) {
      throw new Error("Username, password, and email are required");
    }

    const user = await User.findOne({
      where: { email },
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      throw new Error("User is not registered, please login first..");
    }

    return user;
  } catch (error) {
    throw new Error("Error fetching user: " + error.message);
  }
};
export const getProfile = async (userId) => {
  try {

    if (!userId) {
      throw new Error({
        status : 400,
        errCode : 'USERID_IS_EMPTY',
        message : 'error while getting user info'
      });
    }

 const user = await User.findOne({
  where: { id: userId },
  attributes: { exclude: ['password'] }, // 🔥 excludes password field
});


    if (!user) {
      throw new Error({
        status : 404,
        errCOde : 'USER_NOT_FOUND',
        message : 'User not found,please try diiferent user id'
      });
    }

    return user;
  } catch (error) {
    throw new Error("Error fetching user: " + error.message);
  }
};
