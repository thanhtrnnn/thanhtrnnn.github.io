# Quizano Node.js API

SQLite database file default: `src/data/quizano.sqlite`

You can override database path with env var `SQLITE_FILE`.

Base URL: `http://localhost:8080/api/v1`

## Run

```bash
npm install
npm run dev
```

Swagger UI: `http://localhost:8080/docs`

## API Routes Overview

### Health

| Method | Route | Function |
| --- | --- | --- |
| GET | `/health` | Kiểm tra trạng thái service API. |

### Auth

| Method | Route | Function |
| --- | --- | --- |
| POST | `/auth/register` | Đăng ký tài khoản sinh viên mới và trả về access token. |
| POST | `/auth/login` | Đăng nhập bằng username/password, có thể giới hạn theo role `student` hoặc `admin`. |
| GET | `/auth/me` | Lấy thông tin người dùng đang đăng nhập. |

### Users

Admin only.

| Method | Route | Function |
| --- | --- | --- |
| GET | `/users` | Lấy danh sách user, hỗ trợ lọc theo role và từ khóa tìm kiếm. |
| POST | `/users/students` | Tạo mới tài khoản sinh viên. |
| PUT | `/users/:userId` | Cập nhật họ tên, email hoặc mật khẩu của user. |
| DELETE | `/users/:userId` | Xóa user khỏi hệ thống, không cho xóa admin. |

### Exams

| Method | Route | Function |
| --- | --- | --- |
| GET | `/exams` | Lấy danh sách kỳ thi, hỗ trợ search/filter theo `type`, `status`, `availableNow`. |
| POST | `/exams` | Tạo kỳ thi mới, có thể gửi kèm danh sách câu hỏi. |
| GET | `/exams/:examId` | Lấy chi tiết một kỳ thi. |
| PUT | `/exams/:examId` | Cập nhật thông tin kỳ thi, có thể thay luôn danh sách câu hỏi. |
| DELETE | `/exams/:examId` | Xóa kỳ thi và toàn bộ câu hỏi liên quan. |
| GET | `/exams/:examId/questions` | Lấy danh sách câu hỏi của kỳ thi; student không thấy đáp án đúng. |
| PUT | `/exams/:examId/questions` | Ghi đè toàn bộ danh sách câu hỏi của kỳ thi. |
| POST | `/exams/:examId/questions/import` | Import nhanh câu hỏi từ payload dạng các dòng dữ liệu đã parse từ Excel. |

### Results

| Method | Route | Function |
| --- | --- | --- |
| POST | `/results/submit` | Sinh viên nộp bài thi, hệ thống chấm điểm và lưu kết quả. |
| GET | `/results/me` | Lấy lịch sử kết quả của sinh viên đang đăng nhập |
| GET | `/results/me/latest` | Lấy kết quả gần nhất của sinh viên đang đăng nhập. |
| GET | `/results/:resultId` | Xem chi tiết một kết quả; student chỉ xem được bài của mình, admin xem được tất cả. |

### Admin

Admin only.

| Method | Route | Function |
| --- | --- | --- |
| GET | `/admin/results` | Lấy danh sách kết quả thi có phân trang, lọc theo kỳ thi, sinh viên, thời gian. |
| GET | `/admin/stats/summary` | Lấy thống kê tổng hợp: số lượt thi, điểm trung bình, tỷ lệ đạt, phân bố điểm. |
| GET | `/admin/students/:studentId/journey` | Xem hành trình thi của một sinh viên và toàn bộ các lượt làm bài. |
| GET | `/admin/students/:studentId/results/:resultId` | Xem chi tiết một bài làm cụ thể của sinh viên, gồm đáp án chọn và đáp án đúng. |

## Notes

- Các route trừ `/health`, `/auth/register`, `/auth/login` đều dùng Bearer token.
- Swagger UI tại `/docs` có mô tả request/response đầy đủ hơn, gồm schema và ví dụ payload.
