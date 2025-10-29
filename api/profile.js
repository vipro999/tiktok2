// api/profile.js
// TikTok user info – dùng public API của LiveCounts (phiên bản ổn định 2025)

const fetch = require("node-fetch");

module.exports = async (req, res) => {
  const username = (req.query.username || "").trim();

  if (!username) {
    return res.status(400).json({ error: "Thiếu username query param" });
  }

  try {
    // ✅ API chính xác đang hoạt động
    const url = `https://tiktok.livecounts.io/user/${encodeURIComponent(username)}`;

    const apiResp = await fetch(url);
    const status = apiResp.status;
    const text = await apiResp.text();

    if (!apiResp.ok) {
      console.error("API error:", status, text);
      return res
        .status(502)
        .json({ error: `Third-party API lỗi: ${status}`, details: text });
    }

    const data = JSON.parse(text);
    const user = data.user || data;

    const result = {
      username: user.uniqueId || username,
      display_name: user.nickname || user.uniqueId,
      avatar_url: user.avatarLarger || user.avatarThumb || user.avatar || null,
      follower_count:
        (user.stats && user.stats.followerCount) ||
        user.followerCount ||
        0,
    };

    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=120");
    return res.status(200).json(result);
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: err.message || "Lỗi server nội bộ" });
  }
};
