var currentUser = getCurrentUser();
var currentExamId = localStorage.getItem('quizano_currentExamId');
var examData = null;
var examQuestions = [];
var timerInterval = null;
var remainingSeconds = 0;
var examStartTimeKey = 'quizano_startTime_' + currentExamId;
var examAnswersKey = 'quizano_answers_' + currentExamId;

window.onload = function () {
    if (!currentUser || currentUser.role !== 'student') {
        alert('Phiên làm việc không hợp lệ, vui lòng đăng nhập lại.');
        window.location.href = 'index.html';
        return;
    }
    if (!currentExamId) {
        window.location.href = 'student_dashboard.html';
        return;
    }
    var allExams = getData('quizano_exams');
    for (var i = 0; i < allExams.length; i++) {
        if (allExams[i].id === currentExamId) {
            examData = allExams[i];
            break;
        }
    }
    if (!examData) {
        alert('Không tìm thấy dữ liệu bài thi.');
        window.location.href = 'student_dashboard.html';
        return;
    }

    document.getElementById('examTitleDisplay').innerText = examData.title;
    document.getElementById('examDescriptionDisplay').innerText = examData.description;

    var allQuestions = getData('quizano_questions');
    for (var j = 0; j < allQuestions.length; j++) {
        if (allQuestions[j].examId === currentExamId) {
            examQuestions.push(allQuestions[j]);
        }
    }

    renderQuestions();

    var savedStartTimestamp = localStorage.getItem(examStartTimeKey);
    var durationMs = examData.duration * 60 * 1000;

    if (savedStartTimestamp) {
        var elapsedMs = new Date().getTime() - parseInt(savedStartTimestamp);
        var leftMs = durationMs - elapsedMs;
        if (leftMs <= 0) {
            alert("Đã hết thời gian làm bài. Hệ thống tự cập nhật nộp bài.");
            submitExam(true);
            return;
        } else {
            remainingSeconds = Math.floor(leftMs / 1000);
        }
    } else {
        localStorage.setItem(examStartTimeKey, new Date().getTime().toString());
        remainingSeconds = examData.duration * 60;
    }

    updateTimerDisplay();

    timerInterval = setInterval(function () {
        remainingSeconds--;
        if (remainingSeconds <= 0) {
            clearInterval(timerInterval);
            alert("Đã hết thời gian làm bài! Hệ thống tự động nộp bài.");
            submitExam(true);
        } else {
            updateTimerDisplay();
        }
    }, 1000);
};

function updateTimerDisplay() {
    var minutes = Math.floor(remainingSeconds / 60);
    var seconds = remainingSeconds % 60;
    var mm = minutes < 10 ? '0' + minutes : minutes;
    var ss = seconds < 10 ? '0' + seconds : seconds;
    document.getElementById('timeRemainingDisplay').innerText = mm + ':' + ss;
}

function getSavedDraftAnswers() {
    var dataStr = localStorage.getItem(examAnswersKey);
    if (!dataStr) return {};
    try {
        var parsed = JSON.parse(dataStr);
        if (Array.isArray(parsed)) return {};
        return parsed;
    } catch (e) {
        return {};
    }
}

function renderQuestions() {
    var wrapper = document.getElementById('questionsWrapper');
    wrapper.innerHTML = '';
    var savedAnswers = getSavedDraftAnswers();

    if (examQuestions.length === 0) {
        wrapper.innerHTML = '<p class="text-muted">Chưa có câu hỏi nào trong kỳ thi này.</p>';
        return;
    }

    for (var i = 0; i < examQuestions.length; i++) {
        var q = examQuestions[i];
        var qHtml = '<div class="question-card">' +
            '<b style="font-size: 1.05em;">Câu ' + (i + 1) + ': ' + q.content + '</b><div class="mt-3">';

        for (var k = 0; k < q.options.length; k++) {
            var opt = q.options[k];
            var isChecked = (savedAnswers[q.id] === opt.id) ? 'checked' : '';
            qHtml += '<label class="option-label">' +
                '<input type="radio" name="ans_' + q.id + '" value="' + opt.id + '" ' + isChecked +
                ' onchange="saveAnswerToDraft(\'' + q.id + '\', \'' + opt.id + '\')"> ' +
                '<span>' + opt.text + '</span></label>';
        }
        qHtml += '</div></div>';
        wrapper.innerHTML += qHtml;
    }
}

function saveAnswerToDraft(questionId, optionId) {
    var savedAnswers = getSavedDraftAnswers();
    savedAnswers[questionId] = optionId;
    localStorage.setItem(examAnswersKey, JSON.stringify(savedAnswers));
}

function submitExam(isAutoSubmit) {
    if (!isAutoSubmit) {
        var answerCount = Object.keys(getSavedDraftAnswers()).length;
        if (!confirm('Bạn có chắc chắn muốn nộp bài?\nĐã chọn: ' + answerCount + '/' + examQuestions.length + ' câu.')) {
            return;
        }
    }

    clearInterval(timerInterval);

    var savedAnswers = getSavedDraftAnswers();
    var correctCount = 0;
    var finalAnswers = [];

    for (var i = 0; i < examQuestions.length; i++) {
        var q = examQuestions[i];
        var ansOpt = savedAnswers[q.id] || null;

        finalAnswers.push({
            questionId: q.id,
            selectedOptionId: ansOpt
        });

        if (ansOpt && ansOpt === q.correctOptionId) {
            correctCount++;
        }
    }

    var total = examQuestions.length;
    var score = total > 0 ? (correctCount / total * 10).toFixed(2) : 0;

    var resultsDb = getData('quizano_results');
    var startTimestamp = parseInt(localStorage.getItem(examStartTimeKey) || new Date().getTime());
    var startTimeStr = new Date(startTimestamp).toISOString();

    var newResult = {
        id: generateId("res"),
        studentId: currentUser.id,
        examId: currentExamId,
        startTime: startTimeStr,
        submitTime: new Date().toISOString(),
        answers: finalAnswers,
        correctCount: correctCount,
        totalQuestions: total,
        score: parseFloat(score),
        status: "completed"
    };

    resultsDb.push(newResult);
    saveData('quizano_results', resultsDb);

    localStorage.removeItem(examStartTimeKey);
    localStorage.removeItem(examAnswersKey);
    localStorage.removeItem('quizano_currentExamId');
    localStorage.setItem('quizano_latestResultId', newResult.id);

    if (!isAutoSubmit) {
        alert('Nộp bài thành công! Điểm số: ' + score + '/10');
    }

    window.location.href = 'result.html';
}
