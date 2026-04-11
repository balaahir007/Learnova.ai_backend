import { getAllMeets, getMeet } from "../entities/meetModel.js";
import { AppError } from "../utils/AppError.js";

export const fetchMeetController = async (req, res, next) => {
  try {
    const { meetId } = req.params;
    const meet = await getMeet(meetId);
    console.log("meets data : ",meet)
    return res.status(201).json({
      data: meet,
      success: true,
    });
  } catch (error) {
    return next(
      error instanceof AppError
        ? error
        : new AppError({
            status: 500,
            errorCode: "INTERNAL_SERVER_ERROR",
            message: error.message || "An error occurred while get a Meet.",
          })
    );
  }
};
export const fetchAllMeetController = async (req, res, next) => {
  try {
    const { spaceId } = req.params;
    const meets = await getAllMeets(spaceId);
    return res.status(201).json({
      data: meets,
      success: true,
    });
  } catch (error) {
    return next(
      error instanceof AppError
        ? error
        : new AppError({
            status: 500,
            errorCode: "INTERNAL_SERVER_ERROR",
            message: error.message || "An error occurred while get all Meets.",
          })
    );
  }
};
