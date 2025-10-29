// api/profile.js
// Phiên bản TikAPI 2025 - GET /user/info/:username

const fetch = require("node-fetch");

module.exports = async (req, res) => {
  const username = (req.query.username || "").trim();
  const TIKAPI_KEY = process.env.TIKAPI_KEY;

  if (!TIKAPI_KEY) {
    return res
      .status(500)
      .json({ error: "Server chưa cấu hình biến môi trường TIKAPI_KEY" });
  }

  if (!username) {
    return res.status(400).json({ error: "Thiếu username query param" });
  }

  try {
    // ✅ Endpoint đúng: /user/info/<username>
    const url = `https://api.tikapi.io/user/info/${encodeURIComponent(username)}`;

    const apiResp = await fetch(url, {
      headers: {
        "X-API-KEY": TIKAPI_KEY,
        Accept: "application/json",
      },
    });

    const text = await apiResp.text();
    const status = apiResp.status;

    if (!apiResp.ok) {
      console.error("TikAPI error:", status, text);
      return res
        .status(502)
        .json({ error: `Third-party API lỗi: ${status}`, details: text });
    }

    const data = JSON.parse(text);
    const userRaw = data.user || data.data || data;

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
    return res.status(200).json(result);
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: err.message || "Lỗi server nội bộ" });
  }
};
