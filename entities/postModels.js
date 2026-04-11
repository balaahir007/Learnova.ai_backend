import Comment from "../models/studySpaceComment.js";
import Post from "../models/studySpacePost.js";
import User from "../models/userSchema.js";
import { AppError } from "../utils/AppError.js";
import StudySpace from '../models/studySpaceModel.js'

export const createPost = async (payload, userId) => {
  try {
    const { description, attachments, visiblityMode, spaceId } = payload;

    if (!description || attachments.length == 0 || !visiblityMode || !spaceId) {
      throw new AppError({
        status: 400,
        errorCode: "REQUIRED_FULL_DATA",
        message: "please fill all feilds",
      });
    }
    const post = await Post.create({
      attachments: attachments,
      visible: visiblityMode,
      content: description,
      authorId: userId,
      spaceId,
    });
    if (!post) {
      throw new AppError({
        status: 400,
        errorCode: "ERROR_CREATING_POST",
        message: "Error while creating a post,please try later...",
      });
    }
    return post;
  } catch (error) {}
};
export const fetchPosts = async (spaceId) => {
  try {
    const posts = await Post.findAll({
      where: { spaceId },
      include: [
        {
          model: Comment,
          include: [
            {
              model: User,
              as: "commenter",
              attributes: ["id", "username", "profilePicture"],
            },
          ],
        },
        {
          model: User,
          as: "author",
          attributes: ["id", "username", "profilePicture"],
        },
      ],
    });

    if (!posts || posts.length === 0) {
      throw new AppError({
        status: 404,
        errorCode: "POSTS_NOT_FOUND",
        message: "Posts are empty, please create one to start.",
      });
    }

    return posts;
  } catch (error) {
    console.error("Error in fetchPosts:", error);
    throw error;
  }
};
export const fetchPost = async (spaceId,postId,userId) => {
  try {

    const studySpace = await StudySpace.findOne({
      where  : {
        id : spaceId
      }
    })
    const isUserAvailableWithinStudySpace = studySpace.members.includes(userId)
    if(!isUserAvailableWithinStudySpace){
      throw new AppError({
        status : 404,
        errorCode : "YOUR_NOT_IN_STUDY_SPACE",
        message : 'you not in our StudySpace, please join after explore our study space'
      })
    }
    const post = await Post.findAll({
      where: {id: postId },
      include: [
        {
          model: Comment,
          include: [
            {
              model: User,
              as: "commenter",
              attributes: ["id", "username", "profilePicture"],
            },
          ],
        },
        {
          model: User,
          as: "author",
          attributes: ["id", "username", "profilePicture"],
        },
      ],
    });

    if (!post) {
      throw new AppError({
        status: 404,
        errorCode: "POSTS_NOT_FOUND",
        message: "Posts are empty, please create one to start.",
      });
    }

    return post;
  } catch (error) {
    console.error("Error in fetchPosts:", error);
    throw error;
  }
};
export const addComment = async (postId, payload, userId) => {
  const { comment } = payload;
  const post = await Post.findOne({
    where: { id: postId },
  });

  if (!post) {
    throw new AppError({
      status: 404,
      errorCode: "POSTS_NOT_FOUND",
      message: "Posts not found, please give valid post.",
    });
  }
  const newComment = await Comment.create({
    postId: post.id,
    content: comment,
    userId,
  });
  console.log(newComment);

  if (!newComment) {
    throw new AppError({
      status: 400,
      errorCode: "ERROR_CREATE_COMMENT",
      message: "Error while add a comment.",
    });
  }
  const fullComment = await Comment.findOne({
    where: { id: newComment.id },
    include: [
      {
        model: User,
        as: "commenter",
        attributes: ["id", "username", "profilePicture"],
      },
    ],
  });
  return fullComment;
};
export const addLike = async (postId, userId) => {

  
  const post = await Post.findOne({
    where: { id: postId },
  });  
  if (!post) {
    throw new AppError({
      status: 404,
      errorCode: "POSTS_NOT_FOUND",
      message: "Post not found, please provide a valid post.",
    });
  }

  let updatedLikes;

  if (post.likes.includes(userId)) {
    updatedLikes = post.likes.filter((lk) => lk !== userId);
  } else {
    updatedLikes = [...post.likes, userId];
  }

  await post.update({ likes: updatedLikes });
  await post.save()

  
  return userId; 
};

