var currentUser = getCurrentUser();

window.onload = function () {
    if (!currentUser || currentUser.role !== 'admin') {
        alert('Tài khoản không có quyền truy cập trang quản trị.');
        window.location.href = 'admin.html';
        return;
    }

    document.getElementById('adminNameDisplay').innerText = currentUser.fullName;

    loadExams();
    loadStudents();
};

function loadExams() {
    var exams = getData('quizano_exams');
    var tbody = document.getElementById('adminExamList');
    tbody.innerHTML = '';

    for (var i = exams.length - 1; i >= 0; i--) {
        var ex = exams[i];

        var lbType = (ex.type === 'free') ? 'Tự do' : 'Cố định';
        var lbSts = (ex.status === 'active') ? '<span class="text-success font-weight-bold">Đang mở</span>' : '<span class="text-danger font-weight-bold">Đã đóng</span>';

        var btnEdit = '<button class="btn btn-primary btn-sm" style="margin-right: 5px;" onclick="editExam(\'' + ex.id + '\')">Sửa</button>';
        var btnDel = '<button class="btn btn-danger btn-sm" onclick="deleteExam(\'' + ex.id + '\')">Xóa</button>';

        var tr = '<tr>' +
            '<td><b>' + ex.title + '</b></td>' +
            '<td class="text-center">' + lbType + '</td>' +
            '<td class="text-center">' + lbSts + '</td>' +
            '<td class="text-center">' + btnEdit + btnDel + '</td>' +
            '</tr>';
        tbody.innerHTML += tr;
    }
}

function editExam(id) {
    localStorage.setItem('quizano_editExamId', id);
    window.location.href = 'admin_exam_form.html';
}

function deleteExam(id) {
    if (confirm('Bạn có chắc chắn muốn xóa kỳ thi này cùng toàn bộ câu hỏi liên quan?')) {
        var exams = getData('quizano_exams');
        var newExams = [];
        for (var i = 0; i < exams.length; i++) {
            if (exams[i].id !== id) newExams.push(exams[i]);
        }
        saveData('quizano_exams', newExams);

        var qs = getData('quizano_questions');
        var newQs = [];
        for (var j = 0; j < qs.length; j++) {
            if (qs[j].examId !== id) newQs.push(qs[j]);
        }
        saveData('quizano_questions', newQs);

        loadExams();
    }
}

function loadStudents() {
    var users = getData('quizano_users');
    var tbody = document.getElementById('adminStudentList');
    tbody.innerHTML = '';

    for (var i = 0; i < users.length; i++) {
        var u = users[i];
        if (u.role === 'student') {
            var btnDel = '<button class="btn btn-danger btn-sm" onclick="deleteStudent(\'' + u.id + '\')">Xóa</button>';

            var tr = '<tr>' +
                '<td>' + u.username + '</td>' +
                '<td>' + u.fullName + '</td>' +
                '<td class="text-center">' + btnDel + '</td>' +
                '</tr>';
            tbody.innerHTML += tr;
        }
    }
}

function addStudent() {
    var fn = document.getElementById('newSvName').value.trim();
    var un = document.getElementById('newSvUser').value.trim();
    var p = document.getElementById('newSvPass').value.trim();

    if (!fn || !un || !p) return;

    var users = getData('quizano_users');
    for (var i = 0; i < users.length; i++) {
        if (users[i].username === un) {
            alert('Tên đăng nhập này đã tồn tại.');
            return;
        }
    }

    var newUser = {
        id: generateId('sv'),
        username: un,
        fullName: fn,
        email: un + '@student.edu.vn',
        password: p,
        role: 'student'
    };

    users.push(newUser);
    saveData('quizano_users', users);

    document.getElementById('newSvName').value = '';
    document.getElementById('newSvUser').value = '';
    document.getElementById('newSvPass').value = '';

    loadStudents();
}

function deleteStudent(id) {
    if (confirm('Bạn có chắc chắn muốn xóa sinh viên này? (Dữ liệu thành tích thi trước đây vẫn được lưu trữ gốc).')) {
        var users = getData('quizano_users');
        var newUsers = [];
        for (var i = 0; i < users.length; i++) {
            if (users[i].id !== id) newUsers.push(users[i]);
        }
        saveData('quizano_users', newUsers);
        loadStudents();
    }
}
