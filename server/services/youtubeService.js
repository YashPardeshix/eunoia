const axios = require("axios");

const YT_KEY = process.env.YOUTUBE_API_KEY;
if (!YT_KEY) {
  console.warn("Missing YOUTUBE_API_KEY environment variable");
}

const SEARCH_URL = "https://www.googleapis.com/youtube/v3/search";
const VIDEOS_URL = "https://www.googleapis.com/youtube/v3/videos";

async function safeGet(url, params = {}) {
  try {
    const res = await axios.get(url, { params });
    return res.data;
  } catch (err) {
    console.error("YouTube API error:", err?.response?.data || err.message);
    return null;
  }
}

function makeWatchUrl(videoId) {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

function isPlayableVideo(video) {
  if (!video || !video.id) return false;

  const status = video.status || {};
  const contentDetails = video.contentDetails || {};
  const snippet = video.snippet || {};

  if (status.privacyStatus && status.privacyStatus !== "public") {
    return false;
  }

  if (status.embeddable === false) {
    return false;
  }

  const region = contentDetails.regionRestriction;
  if (region && Array.isArray(region.blocked) && region.blocked.length > 0) {
    return false;
  }

  const contentRating = contentDetails.contentRating || {};
  if (
    contentRating.ytRating &&
    contentRating.ytRating.toLowerCase().includes("age")
  ) {
    return false;
  }

  return true;
}

async function searchYouTubePlayable(query, maxResults = 5) {
  if (!YT_KEY) return [];

  const searchParams = {
    key: YT_KEY,
    q: query,
    part: "snippet",
    maxResults: Math.min(10, Math.max(1, maxResults)),
    type: "video",
  };

  const sdata = await safeGet(SEARCH_URL, searchParams);
  if (!sdata || !Array.isArray(sdata.items)) return [];

  const videoIds = sdata.items
    .map((it) => (it.id && it.id.videoId ? it.id.videoId : null))
    .filter(Boolean);

  if (!videoIds.length) return [];

  const idsBatches = [];
  for (let i = 0; i < videoIds.length; i += 50) {
    idsBatches.push(videoIds.slice(i, i + 50));
  }

  const playable = [];

  for (const ids of idsBatches) {
    const vdata = await safeGet(VIDEOS_URL, {
      key: YT_KEY,
      id: ids.join(","),
      part: "status,contentDetails,snippet",
      maxResults: ids.length,
    });
    if (!vdata || !Array.isArray(vdata.items)) continue;

    for (const video of vdata.items) {
      if (!isPlayableVideo(video)) {
        continue;
      }

      playable.push({
        title: video.snippet?.title || "Untitled",
        url: makeWatchUrl(video.id),
        description: video.snippet?.description || "",
        type: "VIDEO",
        thumbnails: video.snippet?.thumbnails || {},
        videoId: video.id,
        channelTitle: video.snippet?.channelTitle || "",
        publishTime: video.snippet?.publishedAt || "",
      });
    }
  }

  return playable.slice(0, maxResults);
}

module.exports = { searchYouTubePlayable };
