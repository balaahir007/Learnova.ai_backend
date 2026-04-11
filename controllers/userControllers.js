import {
  createUser,
  findUserByEmail,
  getProfile,
} from "../entities/userModels.js";
import User from "../models/userSchema.js";
import Verification from "../models/Verification.js";
import { AppError } from "../utils/AppError.js";
import generateToken from "../utils/generateToken.js";
import crypto from "crypto";
import Brevo from "@getbrevo/brevo";
import { sendEmail } from "../service/emailService.js";
import passwordResetTemplate from "../helper/emails/passwordResetTemplate.js";
import bcrypt from "bcryptjs";
import otpTemplate from "../helper/emails/otpTemplate.js";
const brevoClient = new Brevo.TransactionalEmailsApi();

brevoClient.setApiKey(
  Brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY
);


export const registerController = async (req, res, next) => {
  try {
    const userData = req.body;
    const payload = {
      ...userData,
    };

    const newUser = await createUser(payload);

    generateToken(res, newUser.id);
    res.status(201).json(newUser);
  } catch (error) {
    return next(
      new AppError({
        errorCode: "REGISTRATION_FAILED",
        message: error.message || "Failed to register user",
        status: 400,
      })
    );
  }
};

export const loginController = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ Check required fields
    if (!email || !password) {
      return next(
        new AppError({
          errorCode: "INVALID_CREDENTIALS",
          message: "Email and password are required.",
          status: 400,
        })
      );
    }

    // 2️⃣ Find user with password included
    const user = await User.findOne({ where: { email } });
    console.log("users : ",user )
    if (!user) {
      return next(
        new AppError({
          errorCode: "USER_NOT_FOUND",
          message: "User not registered.",
          status: 404,
        })
      );
    }

    // 3️⃣ Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next(
        new AppError({
          errorCode: "INVALID_PASSWORD",
          message: "Incorrect password.",
          status: 401,
        })
      );
    }

    generateToken(res, user.id);

    const { password: pwd, ...safeUser } = user.dataValues;

    return res.status(200).json(safeUser);
  } catch (error) {
    return next(
      new AppError({
        errorCode: "LOGIN_FAILED",
        message: error.message,
        status: 400,
      })
    );
  }
};

export const getAuth = async (req, res, next) => {
  try {
    if (!req.user) {
      return next(
        new AppError({
          errorCode: "USER_NOT_FOUND",
          message: "User not authenticated",
          status: 401,
        })
      );
    }
    res.status(200).json(req.user);
  } catch (error) {
    return next(
      new AppError({
        errorCode: "AUTH_ERROR",
        message: "Failed to get user authentication",
        status: 500,
      })
    );
  }
};

export const logOut = async (req, res, next) => {
  try {
    // Determine if we're in production mode
    const isProduction = process.env.NODE_ENV === "production";
    
    res.clearCookie("jwt", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
    });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    return next(
      new AppError({
        errorCode: "LOGOUT_FAILED",
        message: "Failed to logout",
        status: 500,
      })
    );
  }
};

export const getUserProfileController = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return next(
        new AppError({
          errorCode: "INVALID_USER_ID",
          message: "User ID is required",
          status: 400,
        })
      );
    }

    const profile = await getProfile(userId);

    if (!profile) {
      return next(
        new AppError({
          errorCode: "PROFILE_NOT_FOUND",
          message: "User profile not found",
          status: 404,
        })
      );
    }

    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    return next(
      new AppError({
        errorCode: "PROFILE_FETCH_FAILED",
        message: error.message || "Failed to fetch user profile",
        status: 500,
      })
    );
  }
};

export const sendVerification = async (req, res, next) => {
  try {
    const {
      identifier,
      channel = "email",
      type = "signup",
      redirect = "/",
    } = req.body;

    let toName;
    if (!identifier) {
      return next(
        new AppError({
          errorCode: "MISSING_IDENTIFIER",
          message: "Email or phone number is required",
          status: 400,
        })
      );
    }

    const allowedTypes = ["signup", "login", "password_reset", "2fa"];

    if (!allowedTypes.includes(type)) {
      return next(
        new AppError({
          errorCode: "INVALID_TYPE",
          message: `Type must be one of: ${allowedTypes.join(", ")}`,
          status: 400,
        })
      );
    }
    // Uncomment and adjust if want to check existing user before sign-up
    if (type === "signup") {
      const isExistingUser = await User.findOne({
        where: { email: identifier },
      });

      if (isExistingUser) {
        return next(
          new AppError({
            errorCode: "USER_ALREADY_EXISTS",
            message: "User is already registered",
            status: 409,
          })
        );
      }
    }
    if (["login", "password_reset", "2fa"].includes(type)) {
      const existingUser = await User.findOne({ where: { email: identifier } });
      toName = existingUser?.username;
      if (!existingUser) {
        return next(
          new AppError({
            errorCode: "USER_NOT_FOUND",
            message: "User does not exist",
            status: 404,
          })
        );
      }
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedCode = crypto.createHash("sha256").update(code).digest("hex");

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min validity


    await Verification.destroy({ where: { identifier, type, channel } });

    await Verification.create({
      identifier,
      channel,
      code: hashedCode,
      type,
      expiresAt,
    });

    if (channel === "email") {
      if (!process.env.EMAIL) {
        return next(
          new AppError({
            errorCode: "EMAIL_CONFIG_MISSING",
            message: "Email service not configured",
            status: 500,
          })
        );
      }

      const result = await sendEmail({
        toEmail: identifier,
        toName: "",
        subject: `Your Verification code`,
        code,
        htmlContent : otpTemplate(code)
      });

      if (!result.success) {
        return next(
          new AppError({
            errorCode: "EMAIL_SEND_FAILED",
            message: `Failed to send email: ${
              result.error.message || result.error
            }`,
            status: 500,
          })
        );
      }
    } else if (channel === "sms") {
      return next(
        new AppError({
          errorCode: "SMS_NOT_SUPPORTED",
          message: "SMS verification not yet supported",
          status: 501,
        })
      );
    } else {
      return next(
        new AppError({
          errorCode: "INVALID_CHANNEL",
          message: "Invalid verification channel",
          status: 400,
        })
      );
    }

    res.status(200).json({
      success: true,
      message: `${channel.toUpperCase()} OTP sent successfully`,
    });
  } catch (error) {
    return next(
      new AppError({
        errorCode: "OTP_SEND_FAILED",
        message: error.message || "Failed to send verification code",
        status: 500,
      })
    );
  }
};

export const verifyCode = async (req, res, next) => {
  try {
    const {
      identifier,
      channel = "email",
      type = "signup",
      code,
      token,
    } = req.body;


    if (
      !identifier ||
      !channel ||
      !type ||
      (type !== "password_reset" && !code)
    ) {
      return next(
        new AppError({
          errorCode: "MISSING_FIELDS",
          message: `All fields (identifier, channel, type${
            type !== "password_reset" ? ", code" : ""
          }) are required`,
          status: 400,
        })
      );
    }

    let hashedInput;

    if (type === "password_reset") {
      hashedInput = crypto.createHash("sha256").update(token).digest("hex");
    } else {
      hashedInput = crypto.createHash("sha256").update(code).digest("hex");
    }

    const record = await Verification.findOne({
      where: { identifier, channel, type },
    });

    if (!record) {
      return next(
        new AppError({
          errorCode: "CODE_NOT_FOUND",
          message: "Verification code not found or already used",
          status: 404,
        })
      );
    }

    if (record.expiresAt < new Date()) {
      await Verification.destroy({ where: { identifier, channel, type } });
      return next(
        new AppError({
          errorCode: "CODE_EXPIRED",
          message: `Verification ${
            type === "password_reset" ? "Link" : "code"
          }  has expired. Please request a new one`,
          status: 400,
        })
      );
    }

    if (record.code !== hashedInput) {
      return next(
        new AppError({
          errorCode: "INVALID_CODE",
          message: `Invalid verification ${
            type === "password_reset" ? "Link" : "code"
          }`,
          status: 400,
        })
      );
    }

    // Clean up used verification code
    await Verification.destroy({ where: { identifier, channel, type } });

    res.status(200).json({
      success: true,
      message: "Verification successful",
    });
  } catch (error) {
    return next(
      new AppError({
        errorCode: "VERIFICATION_FAILED",
        message: error.message || "Verification process failed",
        status: 500,
      })
    );
  }
};

export const sendResetPasswordLink = async (req, res, next) => {
  try {
    const { identifier, redirect = "/", type = "password_reset" } = req.body;
    if (!identifier) {
      return next(
        new AppError({
          errorCode: "EMAIL_REQUIRED",
          message: "Email is required",
          status: 400,
        })
      );
    }

    const user = await User.findOne({ where: { email: identifier } });
    const toName = user.username || "";

    if (!user) {
      return next(
        new AppError({
          errorCode: "USER_NOT_FOUND",
          message: "No user found with this email",
          status: 404,
        })
      );
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    await Verification.destroy({ where: { identifier, type } });

    await Verification.create({
      identifier,
      type: "password_reset",
      code: hashedToken,
      expiresAt,
    });

    const resetLink = `${
      process.env.FRONTEND_URL || process.env.CLIENT_URL
    }/reset-password?token=${resetToken}&email=${identifier}&redirect=${redirect}`;

    const result = await sendEmail({
      toEmail: identifier,
      toName,
      subject: "Reset your password",
      htmlContent: passwordResetTemplate(resetLink),
    });

    if (!result.success) {
      return next(
        new AppError({
          errorCode: "EMAIL_SEND_FAILED",
          message: "Failed to send password reset link",
          status: 500,
        })
      );
    }

    return res.status(200).json({
      success: true,
      message: "Password reset link sent successfully",
    });
  } catch (error) {
    return next(
      new AppError({
        errorCode: "RESET_PASSWORD_FAILED",
        message: error.message,
        status: 500,
      })
    );
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id; // assuming user is authenticated and user ID is in req.user

    if (!oldPassword || !newPassword) {
      return next(
        new AppError({
          errorCode: "MISSING_FIELDS",
          message: "Old password and new password are required",
          status: 400,
        })
      );
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return next(
        new AppError({
          errorCode: "USER_NOT_FOUND",
          message: "User not found",
          status: 404,
        })
      );
    }

    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return next(
        new AppError({
          errorCode: "INVALID_PASSWORD",
          message: "Old password is incorrect",
          status: 400,
        })
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    return next(
      new AppError({
        errorCode: "CHANGE_PASSWORD_FAILED",
        message: error.message,
        status: 500,
      })
    );
  }
};
export const deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const user = await User.findByPk(userId);
    if (!user) {
      return next(
        new AppError({
          errorCode: "USER_NOT_FOUND",
          message: "User not found",
          status: 404,
        })
      );
    }

    await user.destroy();
    res.clearCookie("jwt", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    return res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    return next(
      new AppError({
        errorCode: "DELETE_ACCOUNT_FAILED",
        message: error.message,
        status: 500,
      })
    );
  }
};
