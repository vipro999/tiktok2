// api/profile.js
// Vercel Serverless Function – lấy thông tin TikTok user qua TikAPI (GET version)

const fetch = require("node-fetch");

module.exports = async (req, res) => {
  const username = (req.query.username || "").trim();
  const TIKAPI_KEY = process.env.TIKAPI_KEY;

  if (!TIKAPI_KEY) {
    res.status(500).json({ error: "Server chưa cấu hình TIKAPI_KEY" });
    return;
  }

  if (!username) {
    res.status(400).json({ error: "Thiếu username query param" });
    return;
  }

  try {
    // Dùng GET endpoint mới: /public/user/info?unique_id=username
    const url = `https://api.tikapi.io/public/user/info?unique_id=${encodeURIComponent(
      username
    )}`;

    const apiResp = await fetch(url, {
      method: "GET",
      headers: {
        "X-API-KEY": TIKAPI_KEY,
        Accept: "application/json",
      },
    });

    const status = apiResp.status;
    const text = await apiResp.text();

    if (!apiResp.ok) {
      console.error("TikAPI error:", status, text);
      res
        .status(502)
        .json({ error: `Third-party API lỗi: ${status}`, details: text });
      return;
    }

    const data = JSON.parse(text);
    const userRaw = data.data || data.user || data;

    const result = {
      username:
        userRaw.unique_id ||
        userRaw.username ||
        userRaw.userName ||
        null,
      display_name:
        userRaw.nickname ||
        userRaw.display_name ||
        userRaw.name ||
        null,
      avatar_url:
        userRaw.avatar_url ||
        userRaw.avatar ||
        userRaw.profile_pic_url ||
        null,
      follower_count:
        (userRaw.stats && userRaw.stats.followerCount) ||
        userRaw.followers_count ||
        userRaw.follower_count ||
        null,
    };

    res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=60");
    res.status(200).json(result);
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: err.message || "Lỗi server nội bộ" });
  }
};
