# 🇻🇳 THẦN TỐC 1975 - PROJECT TEMPLATE (BỘ KHUNG DỰ ÁN)

> **Ứng dụng Web Game Trắc nghiệm Tương tác Thời gian thực phục vụ thuyết trình Chủ đề 6 môn VNR202 (Lịch sử Đảng Cộng sản Việt Nam) - Đại học FPT**

---

## 📌 1. Giới thiệu tổng quan
Dự án mô phỏng **Chiến dịch Hồ Chí Minh lịch sử năm 1975**, nơi 5 cánh quân thần tốc cùng mũi đột kích Biệt động thành tiến về giải phóng Sài Gòn, cắm cờ toàn thắng tại Dinh Độc Lập trưa ngày 30/4/1975.
- **Đối tượng tham gia**: 6 Đội đua trong lớp tương ứng với **Nhóm 1, Nhóm 2, Nhóm 3, Nhóm 4, Nhóm 5 và Nhóm 7**.
- **Chỉ Huy Sở (Quản trị viên)**: **Nhóm 6** giữ vai trò Ban Tổ Chức điều phối nhịp độ, kích hoạt hiệu ứng chiến trường và giám sát tiến độ.

---

## 🛠️ 2. Công nghệ sử dụng (Tech Stack)
- **Frontend Core**: React 18, Vite, TypeScript
- **Styling**: Tailwind CSS với theme quân sự & lịch sử hào hùng (Đỏ cờ, Vàng sao, Xanh lục quân đội)
- **Định tuyến**: `react-router-dom` với `HashRouter` (chống lỗi 404 khi F5 trên GitHub Pages)
- **Icons & Visuals**: `lucide-react`, `canvas-confetti`, `qrcode.react`
- **Realtime Database**: Sẵn sàng tích hợp Firebase Realtime Hub
- **Deploy**: GitHub Actions tự động build và deploy lên GitHub Pages (`base: './'`)

---

## 📂 3. Cấu trúc thư mục chuẩn (Project Architecture)

```
SPST/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions tự động build & deploy lên GitHub Pages
├── public/
│   └── questions.md            # Ngân hàng câu hỏi trắc nghiệm Chủ đề 6 định dạng Markdown
├── src/
│   ├── config/
│   │   ├── adminAuth.ts        # Cấu hình 6 cánh quân, 5 mốc lịch sử & hàm xác thực Admin
│   │   └── firebase.ts         # Cấu hình kết nối Firebase Realtime Database
│   ├── pages/
│   │   ├── HomePage.tsx        # Trang chủ chọn vai trò & bộ kiểm tra parser questions.md
│   │   ├── PlayPage.tsx        # Màn hình chiến trường dành cho sinh viên (Chiến sĩ)
│   │   └── AdminPage.tsx       # Chỉ Huy Sở (Admin Nhóm 6) điều phối & vinh danh MVP
│   ├── types/
│   │   └── game.ts             # Định nghĩa toàn bộ TypeScript Interfaces & Types
│   ├── utils/
│   │   ├── markdownParser.ts   # Hàm parse Markdown (# Câu X, - [x], > Giải thích) -> Question[]
│   │   └── statsCalculator.ts  # Tự động tính MVP đội thắng, SVP đội thua, Top Streak, Top Điểm
│   ├── App.tsx                 # Điều hướng HashRouter với 3 Route (/, /play, /admin)
│   ├── index.css               # Cấu hình Tailwind CSS, theme màu & scrollbar
│   └── main.tsx                # Điểm khởi động ứng dụng React 18
├── .env.example                # File mẫu biến môi trường (Firebase, Admin credentials)
├── .gitignore                  # Bỏ qua node_modules, dist, .env, docx...
├── index.html                  # Khung HTML gốc với meta tag & font Inter
├── package.json                # Danh sách dependencies & scripts
├── postcss.config.js           # Cấu hình PostCSS cho Tailwind
├── tailwind.config.js          # Cấu hình bảng màu và hiệu ứng Tailwind
├── tsconfig.json               # Cấu hình TypeScript cho dự án Vite
├── tsconfig.node.json          # Cấu hình TypeScript cho file cấu hình Vite
└── vite.config.ts              # Cấu hình Vite với base: './' cho GitHub Pages
```

---

## 🚀 4. Hướng dẫn chạy dự án trên máy cục bộ (Local Development)

### Bước 1: Di chuyển vào thư mục dự án
```bash
cd SPST
```

### Bước 2: Cài đặt các thư viện cần thiết
```bash
npm install
# hoặc nếu dùng bun / pnpm:
bun install
```

### Bước 3: Khởi chạy máy chủ phát triển
```bash
npm run dev
# hoặc:
bun run dev
```
Mở trình duyệt tại: `http://localhost:3000` (hoặc cổng hiển thị trên terminal).

---

## 📝 5. Cú pháp soạn thảo ngân hàng câu hỏi (`public/questions.md`)

Bạn có thể chỉnh sửa hoặc thêm mới câu hỏi tùy thích vào file `public/questions.md` theo định dạng chuẩn:

```markdown
# Câu 1: Nội dung câu hỏi trắc nghiệm ở đây?
- [ ] A. Phương án lựa chọn A
- [x] B. Phương án lựa chọn đúng (đánh dấu bằng [x])
- [ ] C. Phương án lựa chọn C
- [ ] D. Phương án lựa chọn D
> Giải thích: Ý nghĩa lịch sử hoặc căn cứ tài liệu của câu hỏi.
```

---

## 🔐 6. Tài khoản Quản trị viên Chỉ Huy Sở (Admin Nhóm 6)

- **Tên đăng nhập**: `admin_nhom6`
- **Mật khẩu**: `30041975`
*(Có thể tùy biến thông qua file `.env` với các biến `VITE_ADMIN_USERNAME` và `VITE_ADMIN_PASSWORD`).*

---

## 🌐 7. Triển khai lên GitHub Pages (Deployment)

1. Đưa toàn bộ mã nguồn lên nhánh `main` của repository GitHub.
2. Vào tab **Settings** trên GitHub -> **Pages** -> **Build and deployment** -> Chọn **Source: GitHub Actions**.
3. File workflow `.github/workflows/deploy.yml` sẽ tự động kích hoạt mỗi khi có lệnh `push` lên `main`.
4. Nhờ thiết lập `base: './'` trong `vite.config.ts` và sử dụng `HashRouter`, ứng dụng sẽ hoạt động ổn định trên mọi URL repository.
