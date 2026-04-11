import { addComment, addLike, createPost, fetchPost, fetchPosts } from "../entities/postModels.js";
import { AppError } from "../utils/AppError.js";

export const createPostController = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const payload = req.body;
    const newPost = await createPost(payload, userId);
    return res.status(201).json({
      data: newPost,
      success: true,
    });
  } catch (error) {
    return next(
      error instanceof AppError
        ? error
        : new AppError({
            status: 500,
            errorCode: "INTERNAL_SERVER_ERROR",
            message: "An error occurred while create new post.",
          })
    );
  }
};
export const fetchAllPostsController = async (req, res, next) => {
  try {
    const {spaceId} = req.params;    
    const allPost = await fetchPosts(spaceId);
    return res.status(201).json({
      data: allPost,
      success: true,
    });
  } catch (error) {
    return next(
      error instanceof AppError
        ? error
        : new AppError({
            status: 500,
            errorCode: "INTERNAL_SERVER_ERROR",
            message: "An error occurred while fetch all posts.",
          })
    );
  }
};
export const fetchPostController = async (req, res, next) => {
  try {
    const {postId,spaceId} = req.params;
    const userId = req.user.id
    const post = await fetchPost(spaceId,postId,userId);
    return res.status(201).json({
      data: post,
      success: true,
    });
  } catch (error) {
    return next(
      error instanceof AppError
        ? error
        : new AppError({
            status: 500,
            errorCode: "INTERNAL_SERVER_ERROR",
            message: "An error occurred while fetch posts.",
          })
    );
  }
};
export const addCommentController = async (req, res, next) => {
  try {
    const {postId} = req.params;
    const userId = req.user.id
    const payload = req.body
    // console.log("space Id",postId,req.body);
    
    const newComment = await addComment(postId,payload,userId);
    return res.status(201).json({
      data: newComment,
      success: true,
    });
  } catch (error) {
    return next(
      error instanceof AppError
        ? error
        : new AppError({
            status: 500,
            errorCode: "INTERNAL_SERVER_ERROR",
            message: "An error occurred while fetch all posts.",
          })
    );
  }
};
export const addLikesController = async (req, res, next) => {
  try {
    const {postId} = req.params;
    const userId = req.user.id    
    const likedUser  = await addLike(postId,userId);
    return res.status(201).json({
      data: likedUser,
      success: true,
    });
  } catch (error) {
    return next(
      error instanceof AppError
        ? error
        : new AppError({
            status: 500,
            errorCode: "INTERNAL_SERVER_ERROR",
            message: "An error occurred while fetch all posts.",
          })
    );
  }
};
