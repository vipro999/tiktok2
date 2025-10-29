// /api/profile.js
// Lấy thông tin TikTok qua ScraperAPI proxy để tránh bị chặn

import fetch from "node-fetch";

export default async function handler(req, res) {
  const username = (req.query.username || "").trim();
  if (!username) {
    return res.status(400).json({ error: "Thiếu username query param" });
  }

  const apiKey = process.env.SCRAPER_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Thiếu SCRAPER_API_KEY trong môi trường" });
  }

  try {
    // 1️⃣ URL TikTok user page
    const tiktokUrl = `https://www.tiktok.com/@${username}`;

    // 2️⃣ Gọi qua proxy ScraperAPI
    const proxyUrl = `https://api.scraperapi.com/?api_key=${apiKey}&url=${encodeURIComponent(tiktokUrl)}&render=true`;

    const response = await fetch(proxyUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
      },
    });

    const html = await response.text();

    if (!html.includes("SIGI_STATE")) {
      return res.status(404).json({ error: "Không tìm thấy người dùng hoặc TikTok chặn truy cập" });
    }

    // 3️⃣ Tách dữ liệu JSON từ thẻ <script id="SIGI_STATE">
    const match = html.match(/<script id="SIGI_STATE" type="application\/json">(.*?)<\/script>/);
    if (!match) throw new Error("Không tách được dữ liệu từ TikTok");

    const sigi = JSON.parse(match[1]);
    const user = Object.values(sigi.UserModule.users)[0];
    const stats = Object.values(sigi.UserModule.stats)[0];

    // 4️⃣ Trả kết quả JSON
    res.status(200).json({
      username: user.uniqueId,
      display_name: user.nickname,
      avatar_url: user.avatarLarger,
      follower_count: stats.followerCount,
      following_count: stats.followingCount,
      heart_count: stats.heartCount,
    });
  } catch (err) {
    console.error("Lỗi khi lấy dữ liệu TikTok:", err);
    res.status(500).json({ error: "Lỗi server", details: err.message });
  }
}
