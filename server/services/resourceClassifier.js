const crypto = require("crypto");

const SOURCE_TYPES = {
  VIDEO: "VIDEO",
  ARTICLE: "ARTICLE",
  BOOK: "BOOK",
  COURSE: "COURSE",
  OTHER: "OTHER",
};

function safeUrl(input) {
  if (!input || typeof input !== "string") return null;
  try {
    let u = input.trim();
    if (/^\/\//.test(u)) u = "https:" + u;
    if (!/^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(u)) {
      u = "https://" + u;
    }
    const url = new URL(u);

    url.hash = "";

    [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
      "fbclid",
      "gclid",
    ].forEach((p) => url.searchParams.delete(p));

    url.hostname = url.hostname.toLowerCase();

    if (
      (url.protocol === "https:" && url.port === "443") ||
      (url.protocol === "http:" && url.port === "80")
    ) {
      url.port = "";
    }
    return url.toString();
  } catch (e) {
    return null;
  }
}

function detectSourceType(url = "") {
  if (!url) return SOURCE_TYPES.OTHER;
  const u = url.toLowerCase();

  if (
    u.includes("youtube.com") &&
    !u.includes("watch?v=") &&
    !u.includes("youtu.be/")
  ) {
    return SOURCE_TYPES.OTHER;
  }

  if (
    u.includes("youtube.com") ||
    u.includes("youtu.be") ||
    u.includes("vimeo.com")
  )
    return SOURCE_TYPES.VIDEO;

  if (
    u.includes("udemy.com") ||
    u.includes("coursera.org") ||
    u.includes("edx.org") ||
    u.includes("pluralsight.com") ||
    u.includes("/course/")
  )
    return SOURCE_TYPES.COURSE;

  if (u.includes("amazon.com") && u.includes("/dp/")) return SOURCE_TYPES.BOOK;
  if (
    u.includes("books.google") ||
    u.includes("goodreads.com") ||
    u.includes("oreilly.com")
  )
    return SOURCE_TYPES.BOOK;

  if (
    u.includes("medium.com") ||
    u.includes("/blog/") ||
    u.includes("dev.to") ||
    u.includes("hashnode.com") ||
    u.includes("blogspot.com")
  )
    return SOURCE_TYPES.ARTICLE;
  if (u.endsWith(".pdf")) return SOURCE_TYPES.ARTICLE;

  if (
    u.includes("stackoverflow.com") ||
    u.includes("docs.github.com") ||
    u.includes("github.com")
  )
    return SOURCE_TYPES.ARTICLE;

  return SOURCE_TYPES.OTHER;
}

function safeTitle(title, url) {
  if (title && typeof title === "string" && title.trim().length > 0)
    return title.trim();

  try {
    const u = new URL(url);
    const parts = u.pathname.split("/").filter(Boolean);
    const candidate = parts.length
      ? decodeURIComponent(parts[parts.length - 1])
      : u.hostname;
    return candidate.replace(/[-_]/g, " ").slice(0, 120);
  } catch {
    return title || url || "Untitled";
  }
}

function makeId(url, title) {
  const src = `${url}|${title || ""}`;
  return crypto.createHash("sha1").update(src).digest("hex");
}

function classifyResource(resource = {}) {
  const rawUrl = resource.url || resource.link || resource.href;
  const normalized = safeUrl(rawUrl);
  const title = safeTitle(
    resource.title || resource.name || "",
    normalized || rawUrl
  );
  const hint = (resource.sourceType || resource.type || "")
    .toString()
    .toUpperCase();

  let inferred = detectSourceType(normalized || rawUrl);

  if (hint && ["VIDEO", "ARTICLE", "BOOK", "COURSE", "OTHER"].includes(hint)) {
    inferred = hint;
  }

  let confidence = 0.6;
  if (normalized && inferred !== SOURCE_TYPES.OTHER) confidence = 0.9;
  if (normalized && hint) confidence = 0.95;
  if (!normalized && hint) confidence = 0.7;
  if (!normalized && !hint) confidence = 0.4;

  const id = makeId(normalized || rawUrl || title);

  return {
    id,
    title,
    url: normalized || rawUrl || null,
    type: inferred,
    confidence,
    description: resource.description || resource.desc || "",
    note: normalized ? null : "missing-or-invalid-url",
  };
}

function mergeAndClassify(
  aiResources = [],
  searchResults = [],
  youtubeResults = []
) {
  const map = new Map();

  function upsert(res) {
    const classified = classifyResource(res);
    const key = classified.id;
    const existing = map.get(key);
    if (!existing) {
      map.set(key, classified);
      return;
    }

    const isExistingYoutube =
      existing.type === "VIDEO" &&
      existing.url &&
      existing.url.includes("youtube.com");

    const isNewYoutube =
      classified.type === "VIDEO" &&
      classified.url &&
      classified.url.includes("youtube.com");

    if (isExistingYoutube && !isNewYoutube) {
      return;
    }

    if (isNewYoutube && !isExistingYoutube) {
      map.set(key, classified);
      return;
    }

    if ((classified.confidence || 0) > (existing.confidence || 0)) {
      map.set(key, { ...existing, ...classified });
    }
  }

  for (const r of youtubeResults || []) upsert(r);
  for (const r of searchResults || []) upsert(r);
  for (const r of aiResources || []) upsert(r);

  for (const [k, v] of map.entries()) {
    if (v.url && v.url.includes("example")) {
      const best = (searchResults || []).find((s) =>
        (s.title || "")
          .toLowerCase()
          .includes(
            (v.title || "").toLowerCase().split(" ").slice(0, 3).join(" ")
          )
      );
      if (best) {
        map.set(k, classifyResource(best));
      }
    }
  }

  return Array.from(map.values()).sort(
    (a, b) => (b.confidence || 0) - (a.confidence || 0)
  );
}

module.exports = {
  classifyResource,
  detectSourceType,
  safeUrl,
  mergeAndClassify,
  SOURCE_TYPES,
};
