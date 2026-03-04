var currentUser = getCurrentUser();
var chartInstance = null;

window.onload = function () {
    if (!currentUser || currentUser.role !== 'admin') {
        alert('Tài khoản không đủ quyền hạn mở trang.');
        window.location.href = 'index.html';
        return;
    }

    var exams = getData('quizano_exams');
    var selectFilter = document.getElementById('examFilter');
    for (var i = 0; i < exams.length; i++) {
        var opt = document.createElement('option');
        opt.value = exams[i].id;
        opt.innerText = exams[i].title;
        selectFilter.appendChild(opt);
    }

    renderStats();
};

function renderStats() {
    var allResults = getData('quizano_results');
    var allExams = getData('quizano_exams');
    var allUsers = getData('quizano_users');

    var filterExamId = document.getElementById('examFilter').value;

    var filtered = [];
    for (var i = 0; i < allResults.length; i++) {
        var res = allResults[i];
        if (filterExamId !== 'all' && res.examId !== filterExamId) {
            continue;
        }
        filtered.push(res);
    }

    function getExamName(id) {
        for (var a = 0; a < allExams.length; a++) {
            if (allExams[a].id === id) return allExams[a].title;
        }
        return 'Dữ liệu kỳ thi đã xóa';
    }

    function getUserName(id) {
        for (var a = 0; a < allUsers.length; a++) {
            if (allUsers[a].id === id) return allUsers[a].fullName + ' (' + allUsers[a].username + ')';
        }
        return 'Tài khoản không tồn tại';
    }

    var totalAttempts = filtered.length;
    var sumScore = 0;
    var passCount = 0;

    var distList = [0, 0, 0, 0, 0];

    var tbody = document.getElementById('statsTbody');
    tbody.innerHTML = '';

    filtered.sort(function (a, b) {
        return new Date(b.submitTime) - new Date(a.submitTime);
    });

    for (var k = 0; k < filtered.length; k++) {
        var r = filtered[k];
        sumScore += r.score;
        if (r.score >= 5.0) passCount++;

        if (r.score < 3.0) distList[0]++;
        else if (r.score < 5.0) distList[1]++;
        else if (r.score < 7.0) distList[2]++;
        else if (r.score < 9.0) distList[3]++;
        else distList[4]++;

        if (k < 50) {
            var stt = k + 1;
            var isPassStr = (r.score >= 5.0) ? '<span class="text-success font-weight-bold">Đạt</span>' : '<span class="text-danger font-weight-bold">Trượt</span>';

            var tr = '<tr>' +
                '<td class="text-center">' + stt + '</td>' +
                '<td>' + getUserName(r.studentId) + '</td>' +
                '<td>' + getExamName(r.examId) + '</td>' +
                '<td>' + formatDate(r.submitTime) + '</td>' +
                '<td class="text-center">' + r.correctCount + '/' + r.totalQuestions + '</td>' +
                '<td class="text-center font-weight-bold">' + r.score.toFixed(2) + '</td>' +
                '<td class="text-center">' + isPassStr + '</td>' +
                '</tr>';
            tbody.innerHTML += tr;
        }
    }

    if (totalAttempts === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">Hệ thống chưa ghi nhận lượt tham gia nào cho bộ lọc này.</td></tr>';
    }

    document.getElementById('statTotalAttempts').innerText = totalAttempts;
    var avg = totalAttempts > 0 ? (sumScore / totalAttempts) : 0;
    document.getElementById('statAvgScore').innerText = avg.toFixed(2);
    var rate = totalAttempts > 0 ? (passCount / totalAttempts) * 100 : 0;
    document.getElementById('statPassRate').innerText = rate.toFixed(1);

    if (chartInstance) chartInstance.destroy();

    var ctx = document.getElementById('scoreChartCanvas').getContext('2d');
    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Yếu (<3đ)', 'Kém (3 - 4.9đ)', 'Trung bình (5 - 6.9đ)', 'Khá (7 - 8.9đ)', 'Giỏi (≥9đ)'],
            datasets: [{
                label: 'Số lượng bài thi',
                data: distList,
                backgroundColor: [
                    'rgba(220, 53, 69, 0.6)',
                    'rgba(255, 193, 7, 0.6)',
                    'rgba(0, 123, 255, 0.6)',
                    'rgba(40, 167, 69, 0.6)',
                    'rgba(111, 66, 193, 0.6)'
                ],
                borderColor: [
                    'rgb(220, 53, 69)',
                    'rgb(255, 193, 7)',
                    'rgb(0, 123, 255)',
                    'rgb(40, 167, 69)',
                    'rgb(111, 66, 193)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: { beginAtZero: true, stepSize: 1 }
                }]
            }
        }
    });

    window.currentFilteredData = filtered;
    window.getExNameCache = getExamName;
    window.getUsrNameCache = getUserName;
}

function exportExcel() {
    if (!window.currentFilteredData || window.currentFilteredData.length === 0) {
        alert('Dữ liệu đang trống, không thể xuất báo cáo.');
        return;
    }

    var excelData = [];
    for (var i = 0; i < window.currentFilteredData.length; i++) {
        var r = window.currentFilteredData[i];
        excelData.push({
            "Mã lượt thi (ID)": r.id,
            "Họ và tên sinh viên": window.getUsrNameCache(r.studentId),
            "Tên kỳ thi": window.getExNameCache(r.examId),
            "Giờ mở đề": formatDate(r.startTime),
            "Giờ nộp bài": formatDate(r.submitTime),
            "Đáp án đúng": r.correctCount + " / " + r.totalQuestions,
            "Điểm số (hệ 10)": r.score,
            "Đánh giá": (r.score >= 5.0) ? "Đạt" : "Trượt"
        });
    }

    var worksheet = XLSX.utils.json_to_sheet(excelData);
    var workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "BaoCaoDiem_Quizano");

    XLSX.writeFile(workbook, "Bao_Cao_Diem.xlsx");
}
