# Quizano

Quizano là dự án hệ thống thi trắc nghiệm gồm 2 phần:

- Frontend tĩnh (HTML, CSS, JavaScript) cho sinh viên và admin.
- Backend API Node.js (Express) dùng SQL Server để cung cấp auth, quản lý đề thi, kết quả và thống kê.

Tài liệu này được chia thành 2 phần:

- Phần A: Hướng dẫn cho người dùng chạy nhanh.
- Phần B: Hướng dẫn cho dev tìm hiểu và phát triển.

## Phần A - Hướng Dẫn Cho Người Dùng Chạy Nhanh

### 1) Chạy giao diện frontend

Frontend nằm ở thư mục gốc dự án và có thể mở trực tiếp bằng trình duyệt.

Cách nhanh nhất:

1. Mở file index.html bằng trình duyệt.
2. Đăng nhập hoặc đăng ký tài khoản sinh viên trên trang chủ.
3. Nếu vào trang admin, mở file admin.html.

Tài khoản mặc định trong frontend demo:

- Admin: username admin, password 123
- Student 1: username nguyenvana, password 123
- Student 2: username tranthib, password 123

Lưu ý quan trọng:

- Frontend hiện tại đang sử dụng localStorage cho dữ liệu demo.
- Nếu bạn đã thao tác nhiều lần và muốn reset demo data, hãy xóa localStorage của trang web trong trình duyệt rồi tải lại trang.

### 2) Chạy backend API (tùy chọn cho người dùng nâng cao)

Nếu cần thử API (Swagger, endpoint), bạn có thể chạy backend riêng:

1. Vào thư mục api.
2. Tạo file .env (có thể copy từ .env.example).
3. Cài dependency và khởi tạo dữ liệu:

 npm install
 npm run db:init
 npm run dev

4. Mở Swagger tại địa chỉ: http://localhost:8080/docs

## Phần B - Hướng Dẫn Cho Dev Tìm Hiểu Dự Án

### 1) Tổng quan kiến trúc

Dự án hiện có 2 lớp tách biệt:

- Frontend static:
- Các trang HTML cho login, dashboard, exam, result, admin.
- JavaScript hiện đang thao tác với localStorage (không gọi trực tiếp API).
- Backend API:
- Express API theo kiểu REST.
- Authentication bằng JWT.
- Storage bằng SQL Server qua package mssql.

### 2) Cấu trúc thư mục chính

- index.html: trang đăng nhập/đăng ký sinh viên
- admin.html: trang đăng nhập admin
- student_dashboard.html, exam.html, result.html: luồng sinh viên
- admin_dashboard.html, admin_exam_form.html, admin_stats.html, admin_student_results.html: luồng admin
- js/: toàn bộ logic frontend
- css/style.css: style chung frontend
- api/: backend API Node.js

Cấu trúc backend api:

- api/src/server.js: điểm vào khởi động server
- api/src/app.js: cấu hình express, middleware, route mount
- api/src/routes/: route theo module (auth, users, exams, results, admin)
- api/src/middleware/: auth middleware, error handler
- api/src/lib/db.js: tầng truy cập SQL Server, schema + seed + read/write
- api/src/data/seedData.js: dữ liệu seed mẫu
- api/scripts/init-mssql.js: script init schema + seed từ .env

### 3) Yêu cầu môi trường cho dev

- Node.js 20+ (khuyến nghị 22+)
- SQL Server đang chạy và cho phép SQL authentication

Biến môi trường quan trọng trong api/.env:

- PORT
- JWT_SECRET
- SQLSERVER_HOST
- SQLSERVER_PORT
- SQLSERVER_DATABASE
- SQLSERVER_USER
- SQLSERVER_PASSWORD
- SQLSERVER_ENCRYPT
- SQLSERVER_TRUST_CERT
- SQLSERVER_POOL_MAX

### 4) Quy trình chạy backend cho dev

Tại thư mục api:

1. npm install
2. npm run db:init
3. npm run dev

Lệnh hữu ích:

- npm run db:init: tạo database/schema nếu chưa có, seed nếu database trống
- npm run db:seed:force: ghi đè toàn bộ dữ liệu bằng seedData
- npm run start: chạy production mode cơ bản

### 5) API và tài liệu endpoint

- Swagger UI: http://localhost:8080/docs
- Health check: http://localhost:8080/api/v1/health
- Tài liệu route chi tiết: xem file api/README.md

### 6) Trạng thái tích hợp frontend-backend hiện tại

Trạng thái hiện tại:

- Frontend đang sử dụng localStorage để demo full flow trên trình duyệt.
- Backend API đã hoạt động độc lập với SQL Server.

Điều này có nghĩa:

- Chạy frontend không bắt buộc phải chạy backend.
- Chạy backend không tự động làm frontend thay đổi vì frontend chưa gọi endpoint.

Nếu dev muốn tích hợp thật:

1. Thay các hàm đọc/ghi localStorage trong js/ bằng hàm fetch đến api/v1.
2. Đồng bộ luồng đăng nhập để dùng JWT từ backend.
3. Đồng bộ model dữ liệu giữa frontend và response API.

### 7) Lỗi thường gặp và cách xử lý nhanh

- Lỗi đăng nhập SQL Server (user/password):
- Kiểm tra SQL Server đã bật SQL authentication.
- Kiểm tra đúng host/port/user/password trong .env.
- Đảm bảo user có quyền tạo hoặc sử dụng database đã cấu hình.

- Port 8080 đang bị chiếm:
- Dừng tiến trình cũ đang chiếm cổng hoặc đổi PORT trong .env.

- Frontend dữ liệu lỗi sau khi test nhiều lần:
- Xóa localStorage của domain rồi tải lại trang.

## Ghi chú

- Dự án hiện hữu ích cho demo nghiệp vụ, học tập và từng bước nâng cấp sang mô hình frontend gọi API thật.
- Nếu cần mở rộng production, nên bổ sung hash password, migration schema, logging và test tự động.
