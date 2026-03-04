var currentUser = getCurrentUser();
var editExamId = localStorage.getItem('quizano_editExamId');

var currentQuestions = [];

window.onload = function () {
    if (!currentUser || currentUser.role !== 'admin') {
        alert('Tài khoản không có quyền truy cập.');
        window.location.href = 'index.html';
        return;
    }

    if (editExamId) {
        document.getElementById('formTitle').innerText = 'CHỈNH SỬA KỲ THI';
        loadExamForEdit(editExamId);
    } else {
        addEmptyQuestionBound();
    }

    toggleScheduleFields();
};

function toggleScheduleFields() {
    var ty = document.getElementById('exType').value;
    var sr = document.getElementById('schedStartRow');
    var er = document.getElementById('schedEndRow');
    if (ty === 'scheduled') {
        sr.style.display = 'block';
        er.style.display = 'block';
    } else {
        sr.style.display = 'none';
        er.style.display = 'none';
    }
}

function loadExamForEdit(examId) {
    var allExams = getData('quizano_exams');
    var ex = null;
    for (var i = 0; i < allExams.length; i++) {
        if (allExams[i].id === examId) { ex = allExams[i]; break; }
    }

    if (!ex) {
        alert('Không tìm thấy dữ liệu kỳ thi.');
        localStorage.removeItem('quizano_editExamId');
        window.location.href = 'admin_dashboard.html';
        return;
    }

    document.getElementById('exTitle').value = ex.title;
    document.getElementById('exDesc').value = ex.description;
    document.getElementById('exStatus').value = ex.status;
    document.getElementById('exType').value = ex.type;
    document.getElementById('exDuration').value = ex.duration;

    if (ex.type === 'scheduled') {
        document.getElementById('exStart').value = ex.startTime;
        document.getElementById('exEnd').value = ex.endTime;
    }
    toggleScheduleFields();

    var qs = getData('quizano_questions');
    for (var j = 0; j < qs.length; j++) {
        if (qs[j].examId === examId) {
            currentQuestions.push(JSON.parse(JSON.stringify(qs[j])));
        }
    }

    renderQuestionsEditor();
}

function addEmptyQuestionBound() {
    var newQ = {
        id: generateId('q'),
        examId: editExamId || 'temp',
        content: '',
        options: [
            { id: 'optA', text: '' },
            { id: 'optB', text: '' },
            { id: 'optC', text: '' },
            { id: 'optD', text: '' }
        ],
        correctOptionId: 'optA',
        explanation: ''
    };
    currentQuestions.push(newQ);
    renderQuestionsEditor();
}

function removeQuestionBound(index) {
    if (confirm('Bạn có chắc chắn muốn xóa câu hỏi này khỏi danh sách?')) {
        currentQuestions.splice(index, 1);
        renderQuestionsEditor();
    }
}

function syncHTMLToVariables() {
    for (var i = 0; i < currentQuestions.length; i++) {
        var q = currentQuestions[i];
        var textNode = document.getElementById('qContent_' + i);
        if (textNode) {
            q.content = textNode.value;
            q.options[0].text = document.getElementById('optA_' + i).value;
            q.options[1].text = document.getElementById('optB_' + i).value;
            q.options[2].text = document.getElementById('optC_' + i).value;
            q.options[3].text = document.getElementById('optD_' + i).value;
            q.correctOptionId = document.getElementById('correct_' + i).value;
            q.explanation = document.getElementById('expl_' + i).value;
        }
    }
}

function renderQuestionsEditor() {
    var wr = document.getElementById('questionsEditorList');
    wr.innerHTML = '';

    for (var i = 0; i < currentQuestions.length; i++) {
        var q = currentQuestions[i];

        var isA = (q.correctOptionId === 'optA') ? 'selected' : '';
        var isB = (q.correctOptionId === 'optB') ? 'selected' : '';
        var isC = (q.correctOptionId === 'optC') ? 'selected' : '';
        var isD = (q.correctOptionId === 'optD') ? 'selected' : '';

        var html = '<div class="question-editor-card">' +
            '<div class="d-flex justify-content-between align-items-center mb-2">' +
            '<b>Câu hỏi ' + (i + 1) + ':</b>' +
            '<button type="button" class="btn btn-danger btn-sm" onclick="syncHTMLToVariables(); removeQuestionBound(' + i + ')">Xóa câu hỏi</button>' +
            '</div>' +
            '<div class="form-group">' +
            '<textarea id="qContent_' + i + '" rows="2" placeholder="Nhập nội dung câu hỏi..." required>' + q.content + '</textarea>' +
            '</div>' +

            '<div class="flex-container mb-2">' +
            '<div class="flex-child form-group" style="margin-bottom:0;"><label>Lựa chọn A:</label><input type="text" id="optA_' + i + '" value="' + q.options[0].text + '" required></div>' +
            '<div class="flex-child form-group" style="margin-bottom:0;"><label>Lựa chọn B:</label><input type="text" id="optB_' + i + '" value="' + q.options[1].text + '" required></div>' +
            '</div>' +
            '<div class="flex-container mb-3">' +
            '<div class="flex-child form-group" style="margin-bottom:0;"><label>Lựa chọn C:</label><input type="text" id="optC_' + i + '" value="' + q.options[2].text + '" required></div>' +
            '<div class="flex-child form-group" style="margin-bottom:0;"><label>Lựa chọn D:</label><input type="text" id="optD_' + i + '" value="' + q.options[3].text + '" required></div>' +
            '</div>' +

            '<div class="flex-container align-items-center">' +
            '<div class="flex-child form-group" style="flex:1; margin-bottom:0;">' +
            '<label>Đáp án đúng:</label>' +
            '<select id="correct_' + i + '">' +
            '<option value="optA" ' + isA + '>A</option>' +
            '<option value="optB" ' + isB + '>B</option>' +
            '<option value="optC" ' + isC + '>C</option>' +
            '<option value="optD" ' + isD + '>D</option>' +
            '</select>' +
            '</div>' +
            '<div class="flex-child form-group" style="flex: 2; margin-bottom:0;">' +
            '<label>Giải thích chi tiết (tùy chọn):</label>' +
            '<input type="text" id="expl_' + i + '" value="' + (q.explanation || '') + '" placeholder="Nhập lời giải thích...">' +
            '</div></div>' +
            '</div>';

        wr.innerHTML += html;
    }
}

function importExcel() {
    syncHTMLToVariables();

    var fileInput = document.getElementById('excelFileInput');
    var file = fileInput.files[0];
    if (!file) {
        alert("Vui lòng đính kèm file Excel trước.");
        return;
    }

    var reader = new FileReader();
    reader.onload = function (e) {
        var data = new Uint8Array(e.target.result);
        var workbook = XLSX.read(data, { type: 'array' });
        var firstSheetName = workbook.SheetNames[0];
        var worksheet = workbook.Sheets[firstSheetName];
        var jsonArr = XLSX.utils.sheet_to_json(worksheet);

        var importCount = 0;
        for (var i = 0; i < jsonArr.length; i++) {
            var r = jsonArr[i];

            if (r.Question && r.OptionA && r.OptionB) {
                var cId = 'optA';
                if (r.CorrectOption) {
                    var ansLetter = r.CorrectOption.toString().trim().toUpperCase();
                    if (ansLetter === 'B') cId = 'optB';
                    if (ansLetter === 'C') cId = 'optC';
                    if (ansLetter === 'D') cId = 'optD';
                }

                var newQ = {
                    id: generateId('q'),
                    examId: editExamId || 'temp',
                    content: r.Question.toString(),
                    options: [
                        { id: 'optA', text: (r.OptionA || '').toString() },
                        { id: 'optB', text: (r.OptionB || '').toString() },
                        { id: 'optC', text: (r.OptionC || '').toString() },
                        { id: 'optD', text: (r.OptionD || '').toString() }
                    ],
                    correctOptionId: cId,
                    explanation: r.Explanation ? r.Explanation.toString() : ''
                };
                currentQuestions.push(newQ);
                importCount++;
            }
        }

        renderQuestionsEditor();
        alert('Import thành công ' + importCount + ' câu hỏi từ file Excel.');
    };

    reader.readAsArrayBuffer(file);
}

function saveExamData() {
    syncHTMLToVariables();

    var eType = document.getElementById('exType').value;
    var eStart = document.getElementById('exStart').value;
    var eEnd = document.getElementById('exEnd').value;

    if (eType === 'scheduled' && (!eStart || !eEnd)) {
        alert("Vui lòng nhập đầy đủ thời gian mở và đóng trạng thái kỳ thi cố định.");
        return;
    }

    if (currentQuestions.length === 0) {
        if (!confirm("Kỳ thi hiện tại chưa có câu hỏi nào. Bạn có chắc chắn muốn lưu nội dung này không?")) {
            return;
        }
    }

    var finalExamId = editExamId || generateId('exam');

    var exDataObj = {
        id: finalExamId,
        title: document.getElementById('exTitle').value,
        description: document.getElementById('exDesc').value,
        type: eType,
        duration: parseInt(document.getElementById('exDuration').value),
        status: document.getElementById('exStatus').value
    };

    if (eType === 'scheduled') {
        exDataObj.startTime = eStart;
        exDataObj.endTime = eEnd;
    }

    var allExams = getData('quizano_exams');
    if (editExamId) {
        for (var i = 0; i < allExams.length; i++) {
            if (allExams[i].id === editExamId) {
                allExams[i] = exDataObj;
                break;
            }
        }
    } else {
        allExams.push(exDataObj);
    }
    saveData('quizano_exams', allExams);

    var allQues = getData('quizano_questions');
    var newQues = [];
    for (var j = 0; j < allQues.length; j++) {
        if (allQues[j].examId !== finalExamId) {
            newQues.push(allQues[j]);
        }
    }

    for (var k = 0; k < currentQuestions.length; k++) {
        currentQuestions[k].examId = finalExamId;
        newQues.push(currentQuestions[k]);
    }
    saveData('quizano_questions', newQues);

    localStorage.removeItem('quizano_editExamId');
    alert("Cập nhật thông tin kỳ thi thành công.");
    window.location.href = 'admin_dashboard.html';
}
