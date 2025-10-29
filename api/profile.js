// api/profile.js
// Vercel Serverless Function – lấy thông tin TikTok user qua TikAPI
// Phiên bản cập nhật 2025

const fetch = require("node-fetch");

module.exports = async (req, res) => {
  const username = (req.query.username || "").trim();
  const TIKAPI_KEY = process.env.TIKAPI_KEY;

  if (!TIKAPI_KEY) {
    res.status(500).json({ error: "Server chưa cấu hình TIKAPI_KEY (xem README)" });
    return;
  }

  if (!username) {
    res.status(400).json({ error: "Thiếu username query param" });
    return;
  }

  try {
    // Endpoint chính thức TikAPI: https://api.tikapi.io/user/info
    // Dạng POST body JSON { username: "..." }
    const apiResp = await fetch("https://api.tikapi.io/user/info", {
      method: "POST",
      headers: {
        "X-API-KEY": TIKAPI_KEY,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ username }),
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

    // Chuẩn hoá dữ liệu trả về cho frontend
    const result = {
      username:
        userRaw.username ||
        userRaw.unique_id ||
        userRaw.userName ||
        null,
      display_name:
        userRaw.nickname ||
        userRaw.display_name ||
        userRaw.name ||
        userRaw.unique_id ||
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

    // Cache CDN nhẹ để tránh gọi liên tục
    res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=60");
    res.status(200).json(result);
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: err.message || "Lỗi server nội bộ" });
  }
};
