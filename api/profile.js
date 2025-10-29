// api/profile.js
// Sử dụng LiveCounts.io API (không cần TikAPI key)

const fetch = require("node-fetch");

module.exports = async (req, res) => {
  const username = (req.query.username || "").trim();

  if (!username) {
    return res.status(400).json({ error: "Thiếu username query param" });
  }

  try {
    // LiveCounts API
    const url = `https://api.livecounts.io/tiktok-live-follower-count/${encodeURIComponent(
      username
    )}`;

    const apiResp = await fetch(url);
    const text = await apiResp.text();
    const status = apiResp.status;

    if (!apiResp.ok) {
      console.error("API error:", status, text);
      return res
        .status(502)
        .json({ error: `Third-party API lỗi: ${status}`, details: text });
    }

    const data = JSON.parse(text);

    // Chuẩn hóa dữ liệu trả về
    const result = {
      username: data.uniqueId || username,
      display_name: data.nickname || data.uniqueId,
      avatar_url: data.avatar || null,
      follower_count: data.followerCount || 0,
    };

    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=120");
    res.status(200).json(result);
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: err.message || "Lỗi server nội bộ" });
  }
};
