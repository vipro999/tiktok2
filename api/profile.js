// api/profile.js
// Lấy thông tin TikTok user trực tiếp từ trang web công khai (không cần API key)

const fetch = require("node-fetch");

module.exports = async (req, res) => {
  const username = (req.query.username || "").trim();

  if (!username) {
    return res.status(400).json({ error: "Thiếu username query param" });
  }

  try {
    const url = `https://www.tiktok.com/@${encodeURIComponent(username)}`;
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
        Accept: "text/html",
      },
    });

    const html = await response.text();

    if (!response.ok || !html.includes('SIGI_STATE')) {
      return res.status(404).json({
        error: "Không tìm thấy người dùng hoặc TikTok chặn truy cập",
      });
    }

    // Trích xuất JSON nhúng trong HTML
    const jsonMatch = html.match(/<script id="SIGI_STATE" type="application\/json">(.*?)<\/script>/);
    if (!jsonMatch) {
      throw new Error("Không trích xuất được dữ liệu TikTok");
    }

    const data = JSON.parse(jsonMatch[1]);
    const userData = data.UserModule.users[username.toLowerCase()] || {};

    const result = {
      username: userData.uniqueId || username,
      display_name: userData.nickname || username,
      avatar_url: userData.avatarLarger || null,
      follower_count: userData.stats?.followerCount || 0,
    };

    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=120");
    res.status(200).json(result);
  } catch (err) {
    console.error("Server error:", err);
    res
      .status(500)
      .json({ error: err.message || "Lỗi server nội bộ khi lấy dữ liệu TikTok" });
  }
};
