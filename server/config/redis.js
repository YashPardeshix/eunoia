const Redis = require("ioredis");

let redis;

if (process.env.REDIS_URL) {
  redis = new Redis(process.env.REDIS_URL);

  redis.on("connect", () => {
    console.log("Redis Connected Successfully");
  });

  redis.on("error", (err) => {
    console.error("Redis Connection Error:", err);
  });
} else {
  console.warn("Redis URL not found, caching will be disabled.");
}

module.exports = redis;
