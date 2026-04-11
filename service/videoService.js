import { google } from "googleapis";


export const getVideoLink = async (query) => {
  try {
    if (!process.env.YOUTUBE_API_KEY) {
      console.log("⚠️ YouTube API key not found");
      return null;
    }

    const youtube = google.youtube({
      version: "v3",
      auth: process.env.YOUTUBE_API_KEY,
    });

    const res = await youtube.search.list({
      part: "snippet",
      q: query,
      maxResults: 1,
      type: "video",
      order: "relevance",
      videoDefinition: "any",
      videoDuration: "medium",
    });

    if (res.data.items && res.data.items.length > 0) {
      const video = res.data.items[0];
      const videoId = video.id.videoId;
      return `https://www.youtube.com/watch?v=${videoId}`;
    }

    return null;
  } catch (error) {
    console.error("❌ YouTube API error:", error.message);
    return null;
  }
};

// fallback if quota exceeds or no result
export const generatePlaceholderVideoLink = (lessonTitle, prompt) => {
  const searchQuery = encodeURIComponent(
    `${lessonTitle} ${prompt} tutorial beginner`
  );
  return `https://www.youtube.com/results?search_query=${searchQuery}`;
};


// Generate YouTube search URLs as fallback

// Alternative: Get video metadata (title, thumbnail) without embedding
export const getVideoMetadata = async (query) => {
  try {
    if (!process.env.YOUTUBE_API_KEY) return null;

    const youtube = google.youtube({
      version: "v3",
      auth: process.env.YOUTUBE_API_KEY,
    });

    const res = await youtube.search.list({
      part: "snippet",
      q: query,
      maxResults: 1,
      type: "video",
      order: "relevance"
    });

    if (res.data.items && res.data.items.length > 0) {
      const video = res.data.items[0];
      return {
        title: video.snippet.title,
        description: video.snippet.description.substring(0, 200),
        thumbnail: video.snippet.thumbnails.medium.url,
        channelTitle: video.snippet.channelTitle,
        publishedAt: video.snippet.publishedAt,
        videoId: video.id.videoId,
        url: `https://www.youtube.com/watch?v=${video.id.videoId}`
      };
    }
    
    return null;
  } catch (error) {
    console.error("YouTube metadata error:", error.message);
    return null;
  }
};