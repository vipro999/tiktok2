# TikTok Profile Lookup (Vercel) — dùng TikAPI

## Mục đích
Frontend tĩnh (index.html) + serverless function (api/profile.js) để lấy avatar, username và follower count của 1 TikTok username, bằng dịch vụ TikAPI.

## Bước nhanh deploy lên Vercel
1. Tạo repo trên GitHub, push 3 file: `index.html`, `api/profile.js`, `package.json`.
2. Đăng nhập https://vercel.com → Import Project → chọn repo → Deploy.
3. Lấy API key từ TikAPI (hoặc dịch vụ bạn chọn) — hướng dẫn bên dưới.
4. Vercel → Project → Settings → Environment Variables → Add:
   - `TIKAPI_KEY` = `<API key từ TikAPI>`
   (Nhớ lưu và redeploy)
5. Mở trang của project, nhập username, bấm Lấy.

## Lấy API key TikAPI
1. Đăng ký tài khoản: https://tikapi.io (hoặc https://api.tikapi.io).
2. Vào Dashboard → API Keys → tạo hoặc copy *Account API Key*.
3. Sử dụng key này làm `TIKAPI_KEY`.

> Nếu bạn muốn dùng Apify / Scraper khác thay cho TikAPI, bạn cũng chỉ cần:
> - Lấy API key của dịch vụ đó.
> - Thay URL + header request trong `api/profile.js` theo docs của dịch vụ.

## Lưu ý
- TikAPI / Apify là dịch vụ bên thứ ba (không phải TikTok chính chủ), có thể có phí / giới hạn. Kiểm tra quota/pricing trước khi dùng. :contentReference[oaicite:2]{index=2}
- Nếu bạn muốn dữ liệu "chính chủ" (official TikTok Display/Research API), cần tạo TikTok Developer App, OAuth và có client token; đó là phương án phức tạp hơn. Mình có hướng dẫn nếu bạn muốn chuyển sang official API. :contentReference[oaicite:3]{index=3}

## Debug
- Nếu nhận `Server chưa cấu hình TIKAPI_KEY` — kiểm tra biến môi trường.
- Kiểm tra Vercel Function logs nếu lỗi 5xx.
- Bạn có thể mở `out.raw` (returned `raw`) để xem cấu trúc JSON thô từ TikAPI khi debug.

