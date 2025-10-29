// api/profile.js
// Sử dụng public API Việt Nam ổn định (tiktok.fullstack.edu.vn)

const fetch = require("node-fetch");

module.exports = async (req, res) => {
  const username = (req.query.username || "").trim();

  if (!username) {
    return res.status(400).json({ error: "Thiếu username query param" });
  }

  try {
    // ✅ API công khai: không cần key, trả về JSON đầy đủ
    const url = `https://tiktok.fullstack.edu.vn/api/user/${encodeURIComponent(username)}`;

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

    if (!data || !data.data) {
      throw new Error("Không lấy được dữ liệu người dùng");
    }

    const user = data.data.user || {};
    const stats = user.stats || {};

    const result = {
      username: user.uniqueId || username,
      display_name: user.nickname || user.uniqueId,
      avatar_url:
        user.avatarLarger || user.avatarThumb || user.avatar || null,
      follower_count:
        stats.followerCount || stats.fans || user.followerCount || 0,
    };

    res.setHeader("Cache-Control", "s-maxage=120, stale-while-revalidate=300");
    return res.status(200).json(result);
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: err.message || "Lỗi server nội bộ" });
  }
};
