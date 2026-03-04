window.onload = function () {
    var currentUser = getCurrentUser();
    if (currentUser) {
        if (currentUser.role === 'admin') {
            window.location.href = 'admin_dashboard.html';
        } else {
            window.location.href = 'student_dashboard.html';
        }
    }
}

function handleLogin(event) {
    event.preventDefault();

    var usernameInput = document.getElementById('loginUsername').value.trim();
    var passwordInput = document.getElementById('loginPassword').value.trim();
    var errorMsg = document.getElementById('loginErrorMsg');

    errorMsg.innerText = "";

    if (!usernameInput || !passwordInput) {
        errorMsg.innerText = "Vui lòng nhập đầy đủ thông tin.";
        return;
    }

    var users = getData('quizano_users');
    var foundUser = null;
    for (var i = 0; i < users.length; i++) {
        if (users[i].username === usernameInput && users[i].password === passwordInput && users[i].role === 'student') {
            foundUser = users[i];
            break;
        }
    }

    if (foundUser) {
        localStorage.setItem('quizano_currentUser', JSON.stringify(foundUser));
        window.location.href = 'student_dashboard.html';
    } else {
        errorMsg.innerText = "Tên đăng nhập hoặc mật khẩu không chính xác.";
    }
}

function handleAdminLogin() {
    var u = document.getElementById('aUsername').value.trim();
    var p = document.getElementById('aPassword').value.trim();
    var err = document.getElementById('aErrorMsg');
    err.innerText = "";

    if (!u || !p) {
        err.innerText = "Vui lòng nhập đầy đủ thông tin.";
        return;
    }

    var users = getData('quizano_users');
    var found = null;

    for (var i = 0; i < users.length; i++) {
        if (users[i].username === u && users[i].password === p && users[i].role === 'admin') {
            found = users[i];
            break;
        }
    }

    if (found) {
        localStorage.setItem('quizano_currentUser', JSON.stringify(found));
        window.location.href = 'admin_dashboard.html';
    } else {
        err.innerText = "Sai thông tin đăng nhập hoặc không có quyền quản trị.";
    }
}

function handleRegister(event) {
    event.preventDefault();

    var fullName = document.getElementById('regFullName').value.trim();
    var username = document.getElementById('regUsername').value.trim();
    var email = document.getElementById('regEmail').value.trim();
    var pwd = document.getElementById('regPassword').value.trim();
    var confirmPwd = document.getElementById('regConfirmPassword').value.trim();

    var errorMsg = document.getElementById('registerErrorMsg');
    var successMsg = document.getElementById('registerSuccessMsg');

    errorMsg.innerText = "";
    successMsg.innerText = "";

    if (pwd !== confirmPwd) {
        errorMsg.innerText = "Mật khẩu xác nhận không khớp.";
        return;
    }

    var users = getData('quizano_users');
    for (var i = 0; i < users.length; i++) {
        if (users[i].username === username) {
            errorMsg.innerText = "Tên đăng nhập đã tồn tại.";
            return;
        }
    }

    var newUser = {
        id: generateId("sv"),
        username: username,
        fullName: fullName,
        email: email,
        password: pwd,
        role: "student"
    };

    users.push(newUser);
    saveData('quizano_users', users);

    successMsg.innerText = "Đăng ký thành công! Vui lòng sử dụng form đăng nhập.";
    document.getElementById('registerForm').reset();
}
