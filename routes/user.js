var express = require('express');
var exe = require('./connection');
var router = express.Router();

function login(req) {
    if (req.session.user_id == undefined) {
        return false;
    }
    else {
        return true;
    }
}

function getDate() {
    var today = new Date();
    var date = (today.getDate()) ? "0" + today.getDate() : today.getDate();
    var month = (today.getMonth() + 1) ? "0" + (today.getMonth() + 1) : today.getMonth();
    var year = today.getFullYear();

    return (year + "-" + month + "-" + date);
}
router.get('/', async function (req, res) {
    var data = await exe(`select * from slider`)
    var data1 = await exe(`select * from course_tbl ORDER BY course_id DESC LIMIT 12`)
    var obj = {
        slides: data,
        courses: data1,
        login: login(req)
    }
    res.render('user/home.ejs', obj)
})

router.get('/course_details/:id', async function (req, res) {
    var id = req.params.id;
    var data = await exe(`select * from course_tbl,category where course_tbl.course_category_id=category.category_id AND course_id='${id}'`)
    var is_purchase = false;
    if (login(req)) {
        var user_id = req.session.user_id;
        var course = await exe(`select * from user_courses where user_id='${user_id}' and course_id ='${id}'`)
        if (course.length > 0) {
            is_purchase = true;
        }
    }
    var obj = {
        details: data,
        is_purchase: is_purchase,
        login: login(req)
    };

    res.render('user/course_details.ejs', obj);
})

router.get('/back_details', function (req, res) {
    res.redirect('/')
})

router.get('/courses', async function (req, res) {
    var data1 = await exe(`select * from course_tbl`)
    var obj = {
        courses: data1,
        login: login(req)
    }
    res.render('user/courses.ejs', obj)
})
router.get('/login', async function (req, res) {
    var obj = {
        login: login(req)
    }
    res.render('user/login.ejs', obj)
})

router.post('/register', async function (req, res) {
    // exe(`create table user_tbl(user_id int primary key auto_increment, user_name varchar(200), user_mobile varchar(15), user_email varchar(200), user_password varchar(200))`)
    var d = req.body;
    var data = await exe(`select * from user_tbl`)
    var flag = 0;
    for (var i = 0; i < data.length; i++) {
        if (d.user_mobile == data[i].user_mobile) {
            flag = 1;
            break;
        }
        else {
            flag = 0;
        }
    }

    if (flag == 0) {
        exe(`insert into user_tbl(user_name,user_mobile,user_email,user_password) values(
        '${d.user_name}',
        '${d.user_mobile}',
        '${d.user_email}',
        '${d.user_password}'
        )`);
        res.redirect('/login')
    }
    else {
        res.send(`
            <script>
                alert('Your Mobile no. already use, Use other Mobile no.');
                location.href="/login"
            </script>
        `)
    }
})

router.post('/do_login', async function (req, res) {
    var d = req.body;
    var data = await exe(`select * from user_tbl where user_mobile='${d.user_mobile}' and user_password='${d.user_password}'`)
    if (data.length > 0) {
        req.session.user_id = data[0].user_id;
        res.redirect('/');
    }
    else {
        res.send(`
        <script>
        alert('login Failed please Register first');
        location.href="/login";
        </script>
        `)
    }
})

router.get('/logout', function (req, res) {
    req.session.user_id = undefined;
    res.redirect('/');
})

router.get('/confirm_seat/:course_id', async function (req, res) {
    var course_id = req.params.course_id;
    if (req.session.user_id != undefined) {
        var course_det = await exe(`select * from course_tbl where course_id='${course_id}'`);
        var user_det = await exe(`select * from user_tbl where user_id='${req.session.user_id}'`)
        var obj = {
            course_det: course_det,
            'user_det': user_det,
            login: login(req)
        }
        res.render('user/confirm_seat.ejs', obj)
    }
    else {
        res.send(`
            <script>
                alert('please Login first');
                location.href="/login";
            </script>
        `)
    }
})

router.post('/pay_course_fee/:id', async function (req, res) {
    if (req.session.user_id != undefined) {
        var course_id = req.params.id;
        var data = await exe(`select * from course_tbl where course_id='${course_id}'`);
        var user_id = req.session.user_id;
        // exe(`CREATE TABLE user_courses(user_courses_id INT PRIMARY KEY AUTO_INCREMENT,user_id int,course_id int, amount int,purchase_date varchar(20),transaction_id varchar(100));`)
        var amt = data[0].course_price;
        var t_id = req.body.razorpay_payment_id;
        var today = getDate();
        exe(`insert into user_courses(user_id,course_id,amount,purchase_date,transaction_id) values(
            '${user_id}',
            '${course_id}',
            '${amt}',
            '${today}',
            '${t_id}'
        )`)
        // res.send("user_id : "+user_id + " <br><br>curser_id : "+course_id);
        res.redirect('/mycourses')
    }
    else {
        res.send(`
            <script>
                alert('please Login first');
                location.href="/login";
            </script>
        `)
    }
})

router.get('/mycourses', async function (req, res) {
    // amt,user_name,curse_name,transaction_id;
    if (login(req)) {
        var user_id = req.session.user_id;
        var courses_list = await exe(`select * from user_courses,course_tbl where user_courses.course_id=course_tbl.course_id and user_id='${user_id}'`)
        console.log(courses_list);

        var obj = {
            courses_list: courses_list,
            login: login(req)
        }
        res.render('user/mycourses.ejs', obj);
    }
    else {
        res.send(`
            <script>
                alert('please Login first');
                location.href="/login";
            </script>
        `)
    }
})

router.get('/edit_user', async function (req, res) {
    if (login(req)) {
        var id = req.session.user_id;
        var data = await exe(`select * from user_tbl where user_id='${id}'`)
        var obj = {
            'edit_user': data[0],
            'login': login(req)
        }

        // res.send(obj.edit_user)
        res.render('user/edit_user.ejs', obj);
    }
    else {
        res.send(`
            <script>
                alert('please Login first');
                location.href="/login";
            </script>
        `)
    }
})

router.post('/update_edit', function (req, res) {
    if (login(req)) {
        var d = req.body;
        var id = d.user_id;
        exe(`update user_tbl set user_name = '${d.user_name}', user_mobile = '${d.user_mobile}', user_email = '${d.user_email}',user_password = '${d.user_password}' where user_id='${id}'`)
        res.redirect('/');
    }
    else {
        res.send(`
            <script>
                alert('please Login first');
                location.href="/login";
            </script>
        `)
    }
})

router.get('/contact',function(req,res){
    var obj={
        login: login(req)
    }
    res.render('user/contact.ejs',obj);
})

router.post('/save_contact',function(req,res){
    var d=req.body;
    exe(`insert into contact(user_name,user_email,user_mobile,user_message) values(
        '${d.user_name}',
        '${d.user_email}',
        '${d.user_phone}',
        '${d.user_message}'
    ) `)
    res.redirect('/contact');
})

router.get('/feedback',function(req,res){
    var obj={
        login: login(req)
    }
    res.render('user/feedback.ejs',obj);
})

router.post('/save_feedback',function(req,res){
    var d=req.body;
    exe(`insert into feedback(user_name,user_email,user_mobile,user_message) values(
        '${d.user_name}',
        '${d.user_email}',
        '${d.user_phone}',
        '${d.user_message}'
    ) `)
    res.redirect('/feedback');
})
module.exports = router;