5.    Các trang của hệ thống

5.1.    Người dùng thông thường

a. Trang đăng nhập và đăng ký:
•    Yêu cầu:
      o    Form đăng nhập với các trường: Tên đăng nhập và Mật khẩu.
      o    Form đăng ký mới với các trường: Tên người dùng, Email, Mật khẩu và Xác nhận mật khẩu.
      o    Kiểm tra tính hợp lệ của thông tin đăng nhập và đăng ký bằng JavaScript.
      o    Cho phép người dùng đăng nhập và đăng ký tài khoản mới (demo chưa cần gọi đến backend).
b. Trang Chính:
•    Yêu cầu:
      o    Hiển thị danh sách các kỳ thi: Luyện tập, Giữa kỳ, Cuối kỳ, v.v.
      o    Các kỳ thi được phân loại theo trạng thái: có thể truy cập tự do hoặc yêu cầu thời gian cụ thể.
      o    Cung cấp tính năng tìm kiếm và lọc kỳ thi theo tên hoặc trạng thái.
      o    Người dùng có thể chọn bài thi để bắt đầu làm
c. Trang Bài Thi:
•    Yêu cầu:
     o    Hiển thị câu hỏi, với các lựa chọn cho mỗi câu.
     o    Có bộ đếm thời gian cho mỗi bài thi.
     o    Nút "Nộp bài" để gửi bài làm.
     o    Hiển thị thông báo khi hết giờ hoặc sau khi nộp bài.

d. Trang Kết Quả:
•    Yêu cầu:
    o    Hiển thị số câu trả lời đúng và tổng số câu.
    o    Tính toán và hiển thị điểm số.
    o    Cho phép người dùng xem lại câu trả lời và đáp án đúng.
    o    Người dùng có thể xem kết quả của bài thi và câu trả lời chi tiết.
    o    Fix dữ liệu
    o    Yêu cầu có thống kê

5.2.    Admin
a. Trang Đăng nhập Admin
•    Yêu cầu tương tự như trang đăng nhập sinh viên nhưng dành cho admin.
b. Dashboard Admin
•    Yêu cầu:
    o    Quản lý danh sách các kỳ thi: thêm mới, chỉnh sửa, xóa.
    o    Quản lý danh sách người dùng: thêm mới, chỉnh sửa, xóa tài khoản sinh viên.
    o    Xem thống kê: số lượng người dùng tham gia mỗi kỳ thi, tỷ lệ hoàn thành, điểm trung bình, v.v.
c. Trang Tạo/Chỉnh sửa Kỳ thi
•    Yêu cầu:
    o    Form để nhập thông tin kỳ thi: tên kỳ thi, mô tả, loại kỳ thi (tự do hoặc thời gian cụ thể), danh sách câu hỏi.
    o    Tính năng để thêm, chỉnh sửa, xóa câu hỏi và lựa chọn câu trả lời.
    o    Cho phép nhập đề thi từ file excel có format cố định hoặc thêm từng câu.
d. Trang Thống kê
•    Yêu cầu:
    o    Hiển thị bảng thống kê tổng hợp kết quả của tất cả sinh viên tham gia các kỳ thi (Fix dữ liệu với frontend).
    o    Các thống kê bao gồm tổng số lần tham gia, tỷ lệ hoàn thành, điểm trung bình, phân phối điểm số (ví dụ: biểu đồ)
    o    Cung cấp khả năng lọc kết quả theo kỳ thi, ngày tháng, hoặc một số tiêu chí cụ thể khác.
    o    Tích hợp tính năng xuất báo cáo dưới dạng PDF hoặc Excel.
    o    Các chức năng này có thể fix dữ liệu để hiển thị
e. Trang Xem Kết quả của Từng Sinh Viên
•    Yêu cầu:
     o    Cho phép tìm kiếm sinh viên bằng tên hoặc mã số sinh viên để xem kết quả thi cụ thể của họ.
     o    Hiển thị danh sách các kỳ thi mà sinh viên đã tham gia, cùng với điểm số, trạng thái (hoàn thành/ không hoàn thành), và thời gian tham gia.
     o    Cung cấp chi tiết kết quả cho mỗi kỳ thi, bao gồm câu trả lời của sinh viên, đáp án đúng, và giải thích cho mỗi câu hỏi nếu có.
     o    Tính năng xuất báo cáo kết quả của sinh viên dưới dạng tài liệu có thể in được.
     o    Các chức năng này có thể fix dữ liệu để hiển thị