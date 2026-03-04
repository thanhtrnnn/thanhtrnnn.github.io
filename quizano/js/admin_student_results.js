var currentUser = getCurrentUser();
var currentSelectedSvId = null;

window.onload = function () {
    if (!currentUser || currentUser.role !== 'admin') {
        alert('Tài khoản không đủ thẩm quyền quản trị.');
        window.location.href = 'index.html';
        return;
    }
};

function renderStudentList() {
    var kw = document.getElementById('searchInput').value.trim().toLowerCase();
    var allUsers = getData('quizano_users');

    var tbody = document.getElementById('studentListTbody');
    tbody.innerHTML = '';

    var count = 0;
    for (var i = 0; i < allUsers.length; i++) {
        var u = allUsers[i];
        if (u.role === 'student') {
            var matchText = u.fullName.toLowerCase() + ' ' + u.username.toLowerCase();
            if (!kw || matchText.indexOf(kw) !== -1) {
                count++;
                var tr = '<tr><td class="row-hover" style="background-color: #f8f9fa;" onclick="viewJourney(\'' + u.id + '\', \'' + u.fullName + '\')">' +
                    '<span style="font-size: 1.2em;">👤</span> <b>' + u.fullName + '</b><br>' +
                    '<span class="text-muted" style="font-size: 0.9em;">MSSV: ' + u.username + '</span>' +
                    '</td></tr>';
                tbody.innerHTML += tr;
            }
        }
    }

    if (count === 0) {
        tbody.innerHTML = '<tr><td class="text-center text-muted">Không tìm thấy sinh viên nào hợp lệ với từ khóa này.</td></tr>';
    }
}

function viewJourney(svId, svName) {
    currentSelectedSvId = svId;
    document.getElementById('studentJourneyArea').classList.remove('d-none');
    document.getElementById('targetSvName').innerText = svName;

    document.getElementById('examDetailBox').classList.add('d-none');

    var allResults = getData('quizano_results');
    var allExams = getData('quizano_exams');

    var jtbody = document.getElementById('journeyTbody');
    jtbody.innerHTML = '';

    var foundResCount = 0;

    allResults.sort(function (a, b) {
        return new Date(b.submitTime) - new Date(a.submitTime);
    });

    for (var i = 0; i < allResults.length; i++) {
        var r = allResults[i];
        if (r.studentId === svId) {
            foundResCount++;
            var eName = 'Kỳ thi không xác định';
            for (var e = 0; e < allExams.length; e++) {
                if (allExams[e].id === r.examId) {
                    eName = allExams[e].title; break;
                }
            }

            var isPassStr = (r.score >= 5.0) ? '<span class="text-success font-weight-bold">Đạt</span>' : '<span class="text-danger font-weight-bold">Chưa đạt</span>';
            var btn = '<button class="btn btn-primary btn-sm" onclick="viewPaperDetails(\'' + r.id + '\', \'' + eName + '\')">Xem chi tiết</button>';

            var tr = '<tr>' +
                '<td>' + eName + '</td>' +
                '<td><span class="text-muted" style="font-size: 0.9em;">' + formatDate(r.submitTime) + '</span></td>' +
                '<td class="text-center"><span class="text-primary font-weight-bold">' + r.score.toFixed(2) + '</span> <br>(' + r.correctCount + '/' + r.totalQuestions + ')</td>' +
                '<td class="text-center">' + isPassStr + '</td>' +
                '<td class="text-center">' + btn + '</td>' +
                '</tr>';
            jtbody.innerHTML += tr;
        }
    }

    if (foundResCount === 0) {
        jtbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Sinh viên này chưa có lịch sử tham gia làm bài thi nào.</td></tr>';
    }
}

function viewPaperDetails(resId, examName) {
    document.getElementById('examDetailBox').classList.remove('d-none');
    document.getElementById('detailExamName').innerText = examName;

    var allResults = getData('quizano_results');
    var targetRes = null;
    for (var i = 0; i < allResults.length; i++) {
        if (allResults[i].id === resId) targetRes = allResults[i];
    }
    if (!targetRes) return;

    var allQuestions = getData('quizano_questions');
    var examQs = [];
    for (var j = 0; j < allQuestions.length; j++) {
        if (allQuestions[j].examId === targetRes.examId) examQs.push(allQuestions[j]);
    }

    var dw = document.getElementById('detailPaperArea');
    dw.innerHTML = '';

    for (var q = 0; q < examQs.length; q++) {
        var ques = examQs[q];
        var stPicked = null;
        for (var a = 0; a < targetRes.answers.length; a++) {
            if (targetRes.answers[a].questionId === ques.id) {
                stPicked = targetRes.answers[a].selectedOptionId;
                break;
            }
        }

        var isCorrect = (stPicked === ques.correctOptionId);

        var block = '<div class="question-card">';
        var iconStr = isCorrect ? '<span class="text-success font-weight-bold"> [Trả lời Đúng]</span>' : '<span class="text-danger font-weight-bold"> [Trả lời Sai]</span>';
        if (!stPicked) iconStr += ' <span class="text-warning"><i>(Bỏ trống đáp án)</i></span>';

        block += '<b style="font-size: 1.05em;">Câu ' + (q + 1) + ': ' + ques.content + '</b>' + iconStr + '<div class="mt-3">';

        for (var o = 0; o < ques.options.length; o++) {
            var opt = ques.options[o];

            var highlightClass = '';
            var pointerStr = '';

            if (opt.id === ques.correctOptionId) {
                highlightClass = 'correct-ans';
                pointerStr = ' <span class="text-success font-weight-bold">&larr; ĐÁP ÁN ĐÚNG</span>';
            }
            else if (opt.id === stPicked && !isCorrect) {
                highlightClass = 'wrong-ans';
                pointerStr = ' <span class="text-danger font-weight-bold">&larr; SV CHỌN (SAI)</span>';
            }

            if (stPicked === ques.correctOptionId && opt.id === ques.correctOptionId) {
                pointerStr = ' <span class="text-primary font-weight-bold">&larr; SV CHỌN (ĐÚNG)</span>';
            }

            var isChecked = (opt.id === stPicked) ? 'checked' : '';
            block += '<div class="' + highlightClass + ' mb-2">' +
                '<label class="option-label" style="margin-bottom:0;"><input type="radio" disabled ' + isChecked + '> ' + opt.text + pointerStr + '</label>' +
                '</div>';
        }

        block += '</div></div>';
        dw.innerHTML += block;
    }
}

function printReport() {
    window.print();
}
