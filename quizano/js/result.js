var currentUser = getCurrentUser();
var latestResultId = localStorage.getItem('quizano_latestResultId');

window.onload = function () {
    if (!currentUser || currentUser.role !== 'student') {
        alert('Phần này chỉ dành cho sinh viên.');
        window.location.href = 'index.html';
        return;
    }

    if (!latestResultId) {
        alert('Không tìm thấy kết quả gần đây.');
        window.location.href = 'student_dashboard.html';
        return;
    }

    var allResults = getData('quizano_results');
    var resultData = null;

    for (var i = 0; i < allResults.length; i++) {
        if (allResults[i].id === latestResultId && allResults[i].studentId === currentUser.id) {
            resultData = allResults[i];
            break;
        }
    }

    if (!resultData) {
        alert('Không tìm thấy dữ liệu kết quả bài làm.');
        window.location.href = 'student_dashboard.html';
        return;
    }

    var allExams = getData('quizano_exams');
    var examObj = null;
    for (var j = 0; j < allExams.length; j++) {
        if (allExams[j].id === resultData.examId) {
            examObj = allExams[j];
        }
    }

    document.getElementById('resExamTitle').innerText = examObj ? examObj.title : 'Không xác định';
    document.getElementById('resStudentName').innerText = currentUser.fullName + ' (' + currentUser.username + ')';

    var timeStart = new Date(resultData.startTime);
    var timeEnd = new Date(resultData.submitTime);
    var diffMs = timeEnd - timeStart;
    var minuteDiff = Math.floor(diffMs / 60000);
    var secDiff = Math.floor((diffMs % 60000) / 1000);

    var infoTimeStr = minuteDiff + ' phút ' + secDiff + ' giây';
    infoTimeStr += ' (Nộp bài lúc: ' + formatDate(resultData.submitTime) + ')';

    document.getElementById('resTimeInfo').innerText = infoTimeStr;
    document.getElementById('resCorrectCount').innerText = resultData.correctCount;
    document.getElementById('resTotalCount').innerText = resultData.totalQuestions;
    document.getElementById('resScore').innerText = resultData.score.toFixed(2);

    renderDetails(resultData, examObj);
};

function renderDetails(resultData, examObj) {
    if (!examObj) return;

    var allQuestions = getData('quizano_questions');
    var eq = [];
    for (var i = 0; i < allQuestions.length; i++) {
        if (allQuestions[i].examId === examObj.id) {
            eq.push(allQuestions[i]);
        }
    }

    var wrapper = document.getElementById('detailsWrapper');
    wrapper.innerHTML = '';

    for (var i = 0; i < eq.length; i++) {
        var q = eq[i];

        var stPicked = null;
        for (var a = 0; a < resultData.answers.length; a++) {
            if (resultData.answers[a].questionId === q.id) {
                stPicked = resultData.answers[a].selectedOptionId;
                break;
            }
        }

        var isCorrect = (stPicked === q.correctOptionId);

        var blockHtml = '<div class="question-card">';
        var iconStr = isCorrect ? '<span class="text-success font-weight-bold"> [Đúng]</span>' : '<span class="text-danger font-weight-bold"> [Sai]</span>';

        if (!stPicked) {
            iconStr += ' <span class="text-warning"><i>(Chưa trả lời)</i></span>';
        }

        blockHtml += '<b style="font-size: 1.05em;">Câu ' + (i + 1) + ': ' + q.content + '</b>' + iconStr + '<div class="mt-3">';

        for (var o = 0; o < q.options.length; o++) {
            var opt = q.options[o];

            var highlightClass = '';
            var pointerStr = '';

            if (opt.id === q.correctOptionId) {
                highlightClass = 'correct-ans';
                pointerStr = ' <span class="text-success font-weight-bold">&larr; Đáp án chính xác</span>';
            }
            else if (opt.id === stPicked && !isCorrect) {
                highlightClass = 'wrong-ans';
                pointerStr = ' <span class="text-danger font-weight-bold">&larr; Lựa chọn của bạn (Sai)</span>';
            }

            if (stPicked === q.correctOptionId && opt.id === q.correctOptionId) {
                pointerStr = ' <span class="text-primary font-weight-bold">&larr; Lựa chọn của bạn (Đúng)</span>';
            }

            var isChecked = (opt.id === stPicked) ? 'checked' : '';

            blockHtml += '<div class="' + highlightClass + ' mb-2">' +
                '<label class="option-label" style="margin-bottom:0;"><input type="radio" disabled ' + isChecked + '> ' + opt.text + pointerStr + '</label>' +
                '</div>';
        }

        if (q.explanation) {
            blockHtml += '<div class="explanation-box">' +
                '<b>Giải thích:</b> <i>' + q.explanation + '</i></div>';
        }

        blockHtml += '</div></div>';
        wrapper.innerHTML += blockHtml;
    }
}
