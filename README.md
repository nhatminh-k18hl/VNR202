# 🇻🇳 THẦN TỐC 1975 - HỆ THỐNG TRẮC NGHIỆM TƯƠNG TÁC THỜI GIAN THỰC

> **Web Application Game hóa Tương tác Thời gian thực phục vụ Thuyết trình & Kiểm tra Kiến thức môn VNR202 (Lịch sử Đảng Cộng sản Việt Nam) - Đại học FPT**  
> **Chủ đề 6**: *Đại thắng Mùa Xuân 1975 & Chiến dịch Hồ Chí Minh lịch sử*

---

## 📌 1. Giới thiệu Dự án

**THẦN TỐC 1975** là nền tảng trò chơi tương tác giáo dục (EduGame) thời gian thực theo phong cách đấu trường trí tuệ (tương tự Kahoot / Blooket / Wayground nhưng được tùy biến sâu theo bối cảnh lịch sử dân tộc).

Dự án tái hiện sống động không khí hào hùng của **Chiến dịch Hồ Chí Minh lịch sử năm 1975**, nơi 5 cánh quân chủ lực thần tốc cùng mũi đột kích Biệt động thành đồng loạt tiến về giải phóng Sài Gòn, cắm cờ toàn thắng trên nóc Dinh Độc Lập trưa ngày 30/4/1975:
- **Cơ chế thi đấu đồng đội**: Cả lớp chia thành 6 đội đua tương ứng với các nhóm học tập trong lớp:
  1. **Quân đoàn 1** (Binh đoàn Quyết Thắng) - Mũi tiến công phía Bắc
  2. **Quân đoàn 2** (Binh đoàn Hương Giang) - Mũi tiến công phía Đông Nam
  3. **Quân đoàn 3** (Binh đoàn Tây Nguyên) - Mũi tiến công phía Tây Bắc
  4. **Quân đoàn 4** (Binh đoàn Cửu Long) - Mũi tiến công phía Đông
  5. **Đoàn 232** (Cánh quân Tây Nam) - Mũi tiến công phía Tây và Tây Nam
  6. **Lực lượng Biệt động & Đặc công** - Đột kích nội đô, chiếm giữ các mục tiêu đầu não
- **Chỉ Huy Sở (Host / Ban Quản Trị - Nhóm 6)**: Đóng vai trò Bộ Chỉ huy Chiến dịch, điều phối trận đánh trên máy chiếu lớp học, kích hoạt các sự kiện chiến trường và công bố bảng vàng vinh danh.

---

## ✨ 2. Tính năng Nổi bật

### 🎮 A. Dành cho Chiến Sĩ (Giao diện Mobile Client)
- **Tối ưu 100% Mobile First**:
  - Giao diện sáng (Light Mode) mặc định rõ nét, tối ưu cho mắt sinh viên và màn hình điện thoại di động.
  - Chạm vuốt nhạy bén, không phụ thuộc bàn phím.
- **Tham gia tức thì qua QR Code**:
  - Quét mã QR trên máy chiếu để vào sảnh chờ, điền họ tên, MSSV và tự chọn cánh quân cho riêng mình.
  - Hỗ trợ **Vào muộn (Late Join)**: Khi trận đánh đã bắt đầu, sinh viên quét mã đăng ký sẽ tự động được chi viện thẳng vào chiến trường mà không bị kẹt ở sảnh chờ.
- **Cơ chế Chống Gian Lận & Chống Spam Nút**:
  - **Xoay vòng câu hỏi trọn vẹn (Full-round cycling)**: Mỗi người chơi trải qua lần lượt tất cả 35 câu hỏi trong ngân hàng câu hỏi mới sang vòng lặp tiếp theo. Thuật toán tự động ngăn chặn 2 câu hỏi giống nhau xuất hiện liên tiếp giữa các vòng.
  - **Xáo trộn vị trí đáp án ngẫu nhiên**: 4 lựa chọn đáp án được xáo trộn ngẫu nhiên cho từng câu hỏi, triệt tiêu hoàn toàn hành vi spam nút (chống spam phím C).
  - Không hiển thị số thứ tự câu hỏi để tăng tính tập trung tác chiến.
  - Phản hồi đúng/sai tức thì (1s) kèm âm thanh kèn chiến thắng/thất bại, giữ nhịp độ thi đấu liền mạch.
- **Túi Đồ Trang Bị & Vật Phẩm Tác Chiến**:
  - 🛡️ **Khiên Davis**: Kích hoạt lá chắn bảo vệ xe tăng của đội trước pháo kích địch.
  - ⚡ **Mệnh lệnh Thần tốc**: Nhân đôi điểm (+100%) cho câu hỏi kế tiếp.
  - ⛽ **Tiếp viện Trường Sơn**: Đẩy nhanh tiến độ xe tăng thêm +5%.
  - 📻 **Bản Mật Mã Cơ Yếu 1975**: Loại bỏ ngay 2 phương án sai cho câu trắc nghiệm hiện tại.
- **Báo cáo Cá nhân Cuối trận**:
  - Hiển thị rõ ràng thứ hạng cánh quân của mình (Top #1-6), thứ hạng cá nhân trong đội (xét MVP), và thứ hạng toàn quân.

---

### 🖥️ B. Dành cho Chỉ Huy Sở (Màn hình Máy Chiếu - Host / Admin Nhóm 6)
- **Màn hình Tổng quan Vừa vặn Máy Chiếu (Fit-to-Screen 100vh)**:
  - Tối ưu hiển thị đồng thời cả 6 cánh quân trên màn hình máy chiếu lớp học mà không bị tràn trang hay giấu thông tin.
- **Kiểm soát Sảnh Tuyển Quân Linh hoạt**:
  - Trạng thái **Khóa Tuyển Quân**: Mã QR được làm mờ an toàn kèm biểu tượng ổ khóa 🔒, chống quét sớm.
  - Trạng thái **Mở Tuyển Quân**: Hệ thống sinh mã QR thật sắc nét kèm đường link phòng để sinh viên quét vào chọn cánh quân.
- **Bộ Điều Khiển Chiến Lược Toàn Diện**:
  - 🎺 **Phát Lệnh Xuất Kích**: Đếm ngược 3-2-1 với hiệu ứng hào hùng, tự động đồng loạt kéo toàn bộ sinh viên vào trận.
  - ⏸️ **Tạm dừng (Pause)** / ▶️ **Tiếp tục (Resume)** / ⏹️ **Dừng trận (Stop / End Game)**: Điều khiển linh hoạt mọi tình huống diễn ra trong lớp học.
  - 🔄 **Xóa Cache Ván Mới (Reset)**: Xóa sạch dữ liệu cục bộ và bộ nhớ tạm trên mọi thiết bị để sẵn sàng thi đấu ván mới nhanh chóng.
- **Tự động hóa & Can thiệp Chiến trường**:
  - 🎯 **Địch Phản Kích**: Pháo kích tự động hoặc kích hoạt thủ công, cảnh báo đếm ngược 5s để các đội kịp bật Khiên bảo vệ, nếu trúng đạn xe sẽ bị choáng váng 4 giây.
  - 📦 **Thả Hòm Tiếp Tế**: Hòm dù tiếp tế xuất hiện ngẫu nhiên hoặc do Admin thả để sinh viên chạm nhận vật phẩm.
  - 📜 **Nhật Ký Điện Mật Thời Gian Thực**: Ghi nhận trực tiếp từng bước tiến, pha giải cứu và thành tích nổi bật của các đội.
- **Bảng Vinh Danh 3 Cấp Độ (Award Ceremony)**:
  1. 🏆 **Bảng Xếp Hạng 6 Cánh Quân**: Tôn vinh Cánh quân vô địch tiến vào Dinh Độc Lập đầu tiên với điểm số cao nhất.
  2. 👑 **Vinh Danh MVP Từng Cánh Quân**: Tuyên dương cá nhân có điểm số và đóng góp cao nhất cho từng đội.
  3. 🌟 **Bảng Điểm Cá Nhân Toàn Quân**: Bảng vàng Top 10 sinh viên xuất sắc nhất toàn lớp.
  4. 📥 **Xuất Báo Cáo (.CSV)**: 1 click xuất toàn bộ danh sách sinh viên, MSSV, đội, điểm số, chuỗi thắng và tỷ lệ trả lời đúng để báo cáo Giảng viên.

---

## 🏗️ 3. Kiến Trúc Kỹ Thuật & Động Cơ Đồng Bộ Lai (Hybrid Realtime Engine)

Ứng dụng kết hợp cơ chế đồng bộ đa tầng nhằm đảm bảo hoạt động mượt mà trong điều kiện mạng tại phòng học:

```
[Máy Chiếu / Host Admin]
         │
         ├──► Local BroadcastChannel ──► Các tab / cửa sổ cục bộ
         │
         ├──► WebRTC DataChannel (Google STUN) ──► Kết nối P2P Trực tiếp giữa Điện thoại & Host
         │
         └──► Firebase Realtime Database (Tùy chọn) ──► Đồng bộ đám mây dự phòng khi có Internet
```

- **WebRTC DataChannel Mesh**: Sử dụng STUN server công cộng (`stun.l.google.com:19302`) cho phép điện thoại của sinh viên kết nối trực tiếp với máy chiếu của Admin với độ trễ cực thấp (< 50ms).
- **Cơ chế Chống Phân Thân User (`deviceId`)**: Mỗi thiết bị được định danh bằng một `deviceId` duy nhất lưu trong `localStorage`. Khi sinh viên reload trang hoặc vô tình mở tab mới, hệ thống nhận diện đúng người chơi cũ, không tạo user ảo.
- **Hàng đợi Ngoại tuyến Resilient (`pendingOutbox`)**: Khi đường truyền mạng bị ngắt quãng ngắn hạn, các thao tác trả lời câu hỏi và nhặt vật phẩm được lưu vào hàng đợi và tự động gửi bù ngay khi có kết nối trở lại.

---

## 📚 4. Ngân Hàng Câu Hỏi Lịch Sử (`public/questions.md`)

Ngân hàng câu hỏi gồm **35 câu hỏi trắc nghiệm lịch sử chính thức** được biên soạn công phu theo chuẩn đề cương môn **VNR202 - Chủ đề 6**:
- Phản ánh trung thực các mốc chiến dịch: Tây Nguyên (mở màn), Huế - Đà Nẵng (bước ngoặt), Chiến dịch Hồ Chí Minh (toàn thắng 30/4/1975).
- Định dạng Markdown trực quan, dễ dàng bổ sung hoặc hiệu chỉnh:

```markdown
# Câu 1: Chiến dịch nào đã mở màn cuộc Tổng tiến công và nổi dậy mùa Xuân năm 1975?
- [x] A. Chiến dịch Tây Nguyên
- [ ] B. Chiến dịch Huế - Đà Nẵng
- [ ] C. Chiến dịch Đường 14 - Phước Long
- [ ] D. Chiến dịch Hồ Chí Minh
> Giải thích: Ngày 4/3/1975, quân ta mở màn Chiến dịch Tây Nguyên bằng đòn đánh nghi binh ở Pleiku, sau đó bất ngờ giải phóng Buôn Ma Thuột (10/3/1975), tạo bước ngoặt chiến lược quyết định.
```

---

## 💻 5. Ngăn Xếp Công Nghệ (Tech Stack)

| Hạng mục | Công nghệ sử dụng |
| :--- | :--- |
| **Giao diện & Cốt lõi** | React 18, TypeScript 5.7, Vite 5 |
| **Tạo kiểu (Styling)** | Tailwind CSS, PostCSS, Lucide React Icons |
| **Định tuyến (Routing)** | React Router DOM (`HashRouter` chống lỗi 404 trên GitHub Pages) |
| **Đồng bộ Thời gian thực** | WebRTC DataChannel (PeerJS), BroadcastChannel API, Firebase Realtime Database |
| **Hiệu ứng & Âm thanh** | Canvas Confetti, Web Audio API (Hiệu ứng hành quân, kèn xung trận, pháo kích) |
| **Mã QR & Báo cáo** | QRCodeSVG (`qrcode.react`), Xuất file CSV định dạng UTF-8 BOM |

---

## 🚀 6. Hướng Dẫn Cài Đặt & Chạy Cục Bộ

### Bước 1: Di chuyển vào thư mục dự án
```bash
cd SPST
```

### Bước 2: Cài đặt gói thư viện phụ thuộc
```bash
npm install
```

### Bước 3: Khởi chạy máy chủ phát triển
```bash
npm run dev
```
Trình duyệt sẽ mở tại địa chỉ: `http://localhost:3000` (hoặc cổng hiển thị trên Terminal).

### Bước 4: Đóng gói bản Production
```bash
npm run build
```
Mã nguồn sau khi build sẽ nằm trong thư mục `dist/`, sẵn sàng triển khai lên GitHub Pages, Vercel hoặc Netlify.

---

## 🔑 7. Thông Tin Đăng Nhập Chỉ Huy Sở (Admin Nhóm 6)

- **Đường dẫn quản trị**: `/admin`
- **Tài khoản mặc định**: `admin_nhom6`
- **Mật khẩu mặc định**: `30041975`
*(Có thể tùy biến thông qua file `.env` với các biến `VITE_ADMIN_USERNAME` và `VITE_ADMIN_PASSWORD`).*

---

## 🎯 8. Kịch Bản Vận Hành Trong Giờ Học

1. **Chuẩn bị trước giờ thuyết trình**:
   - Máy tính thuyết trình mở `/admin`, đăng nhập Chỉ Huy Sở và chiếu lên máy chiếu lớp học.
   - Nhấn **"Mở Tuyển Quân"** để hiển thị mã QR thật sắc nét trên màn chiếu.
2. **Cả lớp tham gia (2-3 phút)**:
   - Các nhóm trong lớp mở camera điện thoại quét mã QR.
   - Nhập họ tên, MSSV và chọn cánh quân đại diện cho nhóm của mình.
   - Chỉ Huy Sở quan sát quân số tập hợp đầy đủ trên máy chiếu.
3. **Phát lệnh xuất kích**:
   - Admin bấm **"Phát Lệnh Bắt Đầu"** -> Hiệu lệnh đếm ngược 3-2-1 vang lên toàn phòng học.
   - Toàn bộ điện thoại sinh viên tự động chuyển vào màn hình thi đấu trắc nghiệm.
4. **Tác chiến & Về đích (5 phút)**:
   - Sinh viên liên tục trả lời trắc nghiệm để tiếp nhiên liệu và đẩy xe tăng của đội tiến về Dinh Độc Lập.
   - Admin theo dõi tiến độ thời gian thực trên sa bàn và có thể kích hoạt thêm hòm tiếp tế.
5. **Tổng kết & Vinh danh**:
   - Khi hết giờ hoặc có đội húc đổ cổng Dinh Độc Lập, hệ thống tự động khóa ván và bật **Bảng Vinh Danh**.
   - Admin công bố Đội Vô Địch, MVP các đội và Top 10 cá nhân; bấm nút **"Xuất Kết Quả Toàn Bộ (.CSV)"** để lưu lại hồ sơ điểm số.

---

*Phát triển bởi Ban Nội Dung & Công Nghệ Nhóm 6 - Môn VNR202 - Đại học FPT.*
