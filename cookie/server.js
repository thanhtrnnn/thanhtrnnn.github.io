const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();

// Thiết lập view engine là ejs
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
    secret: 'my_secret_key_123',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 } // 1hr
}));

// Route: Trang chủ /
app.get('/', (req, res) => {
    const theme = req.cookies.theme || 'light';
    
    const bgColor = theme === 'dark' ? '#333' : '#fff';
    const color = theme === 'dark' ? '#fff' : '#000';
    
    res.render('index', { theme, bgColor, color });
});

// Route: Chọn theme /set-theme/:theme
app.get('/set-theme/:theme', (req, res) => {
    const theme = req.params.theme;
    if (theme === 'light' || theme === 'dark') {
        res.cookie('theme', theme, { maxAge: 1000 * 60 * 60 * 24 });
    }
    res.redirect('/');
});

// Route: Trang đăng nhập GET /login (Hiển thị form)
app.get('/login', (req, res) => {
    if (req.session.username) {
        return res.redirect('/profile');
    }
    const message = req.query.msg === 'logout' ? 'Đã đăng xuất thành công.' : '';
    const error = req.query.err === 'unauthorized' ? 'Bạn chưa đăng nhập! Vui lòng truy cập trang đăng nhập.' : '';

    res.render('login', { error, message });
});

// Route: Xử lý đăng nhập POST /login
app.post('/login', (req, res) => {
    const username = req.body.username;
    
    if (username) {
        req.session.username = username;
        req.session.loginTime = new Date().toLocaleString('vi-VN');
        req.session.viewCount = 0;
        
        res.redirect('/profile');
    } else {
        res.render('login', { error: 'Vui lòng nhập username.', message: '' });
    }
});

// Route: Trang cá nhân /profile
app.get('/profile', (req, res) => {
    if (!req.session.username) {
        return res.redirect('/login?err=unauthorized');
    }

    req.session.viewCount += 1;

    res.render('profile', {
        username: req.session.username,
        loginTime: req.session.loginTime,
        viewCount: req.session.viewCount
    });
});

// Route: Đăng xuất /logout
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Lỗi khi xóa session:', err);
        }
        res.redirect('/login?msg=logout');
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
