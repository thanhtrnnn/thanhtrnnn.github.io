var currentUser = getCurrentUser();

window.onload = function () {
    if (!currentUser || currentUser.role !== 'student') {
        alert('Vui lòng đăng nhập với tài khoản Sinh viên.');
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('userNameDisplay').innerText = currentUser.fullName;
    renderExamList();
};

function renderExamList() {
    var allExams = getData('quizano_exams');
    var tbody = document.getElementById('examListBody');
    var searchKeyword = document.getElementById('searchInput').value.trim().toLowerCase();
    var filterType = document.getElementById('typeFilter').value;

    tbody.innerHTML = '';

    var count = 0;
    for (var i = 0; i < allExams.length; i++) {
        var exam = allExams[i];

        if (searchKeyword && exam.title.toLowerCase().indexOf(searchKeyword) === -1) {
            continue;
        }
        if (filterType !== 'all' && exam.type !== filterType) {
            continue;
        }
        if (exam.status !== 'active') {
            continue;
        }

        count++;

        var typeText = exam.type === 'free' ? 'Luyện tập' : 'Cố định';

        var timeInfo = '<b>' + exam.duration + ' phút</b>';
        if (exam.type === 'scheduled') {
            timeInfo += '<br><small class="text-muted">Mở: ' + formatDate(exam.startTime) + '<br>Đóng: ' + formatDate(exam.endTime) + '</small>';
        }

        var canStart = true;
        var startMsg = '';
        if (exam.type === 'scheduled') {
            var nowTime = new Date().getTime();
            var mStart = new Date(exam.startTime).getTime();
            var mEnd = new Date(exam.endTime).getTime();

            if (nowTime < mStart) {
                canStart = false;
                startMsg = '<span class="text-warning">Chưa mở</span>';
            } else if (nowTime > mEnd) {
                canStart = false;
                startMsg = '<span class="text-danger">Đã đóng</span>';
            }
        }

        var btnHtml = '';
        if (canStart) {
            btnHtml = '<button class="btn btn-success" onclick="startExam(\'' + exam.id + '\')">Vào thi</button>';
        } else {
            btnHtml = startMsg;
        }

        var tr = document.createElement('tr');
        tr.innerHTML = '<td class="text-center">' + count + '</td>' +
            '<td><b>' + exam.title + '</b></td>' +
            '<td>' + exam.description + '</td>' +
            '<td class="text-center">' + typeText + '</td>' +
            '<td>' + timeInfo + '</td>' +
            '<td class="text-center">' + btnHtml + '</td>';

        tbody.appendChild(tr);
    }

    if (count === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center" style="color: gray;">Không có kỳ thi nào phù hợp.</td></tr>';
    }
}

function startExam(examId) {
    if (confirm('Thời gian làm bài sẽ bắt đầu tính khi bạn chọn OK. Bạn đã sẵn sàng chưa?')) {
        localStorage.setItem('quizano_currentExamId', examId);
        window.location.href = 'exam.html';
    }
}
