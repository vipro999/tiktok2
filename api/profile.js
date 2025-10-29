// api/profile.js  (Vercel Serverless - CommonJS)
const fetch = require('node-fetch');

const TIKAPI_KEY = process.env.TIKAPI_KEY;
if (!TIKAPI_KEY) {
  // Không ném lỗi khi import; kiểm tra khi request
}

module.exports = async (req, res) => {
  try {
    const username = (req.query.username || '').trim();
    if (!username) {
      res.status(400).json({ error: 'Thiếu username query param' });
      return;
    }
    if (!TIKAPI_KEY) {
      res.status(500).json({ error: 'Server chưa cấu hình TIKAPI_KEY (xem README)' });
      return;
    }

    // TikAPI docs: GET https://api.tikapi.io/user/info?username=<username>
    // Header: X-API-KEY: <your_key>
    const url = `https://api.tikapi.io/user/info?username=${encodeURIComponent(username)}`;

    const apiResp = await fetch(url, {
      method: 'GET',
      headers: {
        'X-API-KEY': TIKAPI_KEY,
        'Accept': 'application/json'
      },
      // timeout logic could be added if needed
    });

    if (!apiResp.ok) {
      const txt = await apiResp.text();
      console.error('TikAPI responded error', apiResp.status, txt);
      // map lỗi cho frontend
      res.status(502).json({ error: `Third-party API lỗi: ${apiResp.status}` });
      return;
    }

    const j = await apiResp.json();

    // TikAPI trả cấu trúc khác nhau theo version; map an toàn
    // Thử lấy j.data hoặc j.user
    const userRaw = j.data || j.user || j; // fallback
    // Map fields (nhiều provider dùng tên khác)
    const out = {
      username: userRaw.username || userRaw.unique_id || userRaw.userName || userRaw.nickname || null,
      display_name: userRaw.nickname || userRaw.display_name || userRaw.name || userRaw.unique_id || null,
      avatar_url: userRaw.avatar || userRaw.avatar_url || userRaw.profile_pic || null,
      follower_count: (userRaw.followers_count !== undefined) 
                       ? Number(userRaw.followers_count)
                       : (userRaw.follower_count !== undefined ? Number(userRaw.follower_count) : (userRaw.stats && userRaw.stats.followers ? Number(userRaw.stats.followers) : null)),
      raw: userRaw // để debug / mở rộng nếu cần
    };

    // Cache CDN: 30s — tránh gọi quá thường xuyên; điều chỉnh nếu bạn có quota lớn hơn
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');
    res.json(out);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
};
