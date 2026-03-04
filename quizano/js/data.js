// js/data.js

// Dữ liệu mẫu ban đầu
// một array các đối tượng json - javascript object notation. 
const mockUsers = [
    {
        id: "admin1",
        username: "admin",
        fullName: "Quản trị viên",
        email: "admin@quizano.com",
        password: "123",
        role: "admin"
    },
    {
        id: "sv1",
        username: "nguyenvana",
        fullName: "Nguyễn Văn A",
        email: "nguyenvana@gmail.com",
        password: "123",
        role: "student"
    },
    {
        id: "sv2",
        username: "tranthib",
        fullName: "Trần Thị B",
        email: "tranthib@gmail.com",
        password: "123",
        role: "student"
    }
];

const mockExams = [
    {
        id: "exam1",
        title: "Thi thử Lập trình Web",
        description: "Bài thi thử để làm quen với hệ thống trắc nghiệm.",
        type: "free",
        duration: 15,
        status: "active"
    },
    {
        id: "exam2",
        title: "Kiểm tra giữa kỳ Cơ sở dữ liệu",
        description: "Kiểm tra định kỳ kiến thức nửa đầu học kỳ môn CSDL.",
        type: "scheduled",
        startTime: "2026-03-05T08:00",
        endTime: "2026-03-05T10:00",
        duration: 45,
        status: "active"
    }
];

const mockQuestions = [
    {
        id: "q1",
        examId: "exam1",
        content: "Ngôn ngữ nào sau đây được sử dụng phổ biến để tạo cấu trúc cho trang web?",
        options: [
            { id: "optA", text: "HTML" },
            { id: "optB", text: "CSS" },
            { id: "optC", text: "JavaScript" },
            { id: "optD", text: "Python" }
        ],
        correctOptionId: "optA",
        explanation: "HTML (HyperText Markup Language) là ngôn ngữ đánh dấu tiêu chuẩn để tạo cấu trúc cho trang web."
    },
    {
        id: "q2",
        examId: "exam1",
        content: "Thẻ HTML nào dùng để tạo một danh sách không có thứ tự (danh sách dấu chấm)?",
        options: [
            { id: "optA", text: "ol" },
            { id: "optB", text: "ul" },
            { id: "optC", text: "li" },
            { id: "optD", text: "list" }
        ],
        correctOptionId: "optB",
        explanation: "Thẻ ul (unordered list) dùng để tạo danh sách không có thứ tự. Thẻ ol (ordered list) là cho danh sách có thứ tự."
    },
    {
        id: "q3",
        examId: "exam1",
        content: "CSS là viết tắt của từ gì?",
        options: [
            { id: "optA", text: "Creative Style Sheets" },
            { id: "optB", text: "Cascading Style Sheets" },
            { id: "optC", text: "Computer Style Sheets" },
            { id: "optD", text: "Colorful Style Sheets" }
        ],
        correctOptionId: "optB",
        explanation: "CSS là chữ viết tắt của Cascading Style Sheets."
    },
    {
        id: "q4",
        examId: "exam2",
        content: "Trong ngôn ngữ SQL, câu lệnh nào được dùng để truy xuất (lấy) dữ liệu từ cơ sở dữ liệu?",
        options: [
            { id: "optA", text: "GET" },
            { id: "optB", text: "OPEN" },
            { id: "optC", text: "EXTRACT" },
            { id: "optD", text: "SELECT" }
        ],
        correctOptionId: "optD",
        explanation: "Lệnh SELECT dùng để truy xuất các vảo ghi thỏa mãn điều kiện."
    },
    {
        id: "q5",
        examId: "exam2",
        content: "Trong một bảng cơ sở dữ liệu quan hệ, Khóa chính (Primary Key) có đặc điểm nào sau đây?",
        options: [
            { id: "optA", text: "Có thể chứa giá trị rỗng (NULL)" },
            { id: "optB", text: "Phải là duy nhất và không được phép rỗng" },
            { id: "optC", text: "Có thể trùng lặp giá trị giữa các dòng khác nhau" },
            { id: "optD", text: "Chỉ để làm đẹp cấu trúc bảng" }
        ],
        correctOptionId: "optB",
        explanation: "Khóa chính dùng để định danh duy nhất cho mỗi dòng nên không thể NULL và không được lặp lại."
    }
];

const mockResults = [
    {
        id: "res1",
        studentId: "sv1",
        examId: "exam1",
        startTime: new Date(Date.now() - 3600000).toISOString(),
        submitTime: new Date(Date.now() - 3000000).toISOString(),
        answers: [
            { questionId: "q1", selectedOptionId: "optA" },
            { questionId: "q2", selectedOptionId: "optC" },
            { questionId: "q3", selectedOptionId: "optB" }
        ],
        correctCount: 2,
        totalQuestions: 3,
        score: 6.67,
        status: "completed"
    }
];

// Khởi tạo dữ liệu mẫu vào Storage
function initQuizanoData() {
    if (!localStorage.getItem('quizano_users')) {
        localStorage.setItem('quizano_users', JSON.stringify(mockUsers));
    }
    if (!localStorage.getItem('quizano_exams')) {
        localStorage.setItem('quizano_exams', JSON.stringify(mockExams));
    }
    if (!localStorage.getItem('quizano_questions')) {
        localStorage.setItem('quizano_questions', JSON.stringify(mockQuestions));
    }
    if (!localStorage.getItem('quizano_results')) {
        localStorage.setItem('quizano_results', JSON.stringify(mockResults));
    }
}

initQuizanoData();

function getData(key) {
    var data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
}

function saveData(key, dataArray) {
    localStorage.setItem(key, JSON.stringify(dataArray));
}

function generateId(prefix) {
    return prefix + '_' + Math.random().toString(36).substr(2, 9);
}

function getCurrentUser() {
    var user = localStorage.getItem('quizano_currentUser');
    return user ? JSON.parse(user) : null;
}

function logout() {
    localStorage.removeItem('quizano_currentUser');
    window.location.href = 'index.html';
}

function formatDate(dateString) {
    if (!dateString) return "";
    var d = new Date(dateString);
    var day = d.getDate().toString().padStart(2, '0');
    var month = (d.getMonth() + 1).toString().padStart(2, '0');
    var year = d.getFullYear();
    var hours = d.getHours().toString().padStart(2, '0');
    var minutes = d.getMinutes().toString().padStart(2, '0');
    return day + '/' + month + '/' + year + ' ' + hours + ':' + minutes;
}
