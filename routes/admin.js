var express = require('express');
var router = express.Router();
var exe = require('./connection')

function login(req) {
    if (req.session.admin_id == undefined) {
        return false;
    }
    else {

        return true;
    }
}

router.get("/", async function (req, res) {
    if (login(req)) {
        var year=new Date().getFullYear();
        var jan=await exe(`select count(user_courses_id) as ttl from user_courses where purchase_date like "${year}-01-%"`)
        var feb=await exe(`select count(user_courses_id) as ttl from user_courses where purchase_date like "${year}-02-%"`)
        var mar=await exe(`select count(user_courses_id) as ttl from user_courses where purchase_date like "${year}-03-%"`)
        var apr=await exe(`select count(user_courses_id) as ttl from user_courses where purchase_date like "${year}-04-%"`)
        var may=await exe(`select count(user_courses_id) as ttl from user_courses where purchase_date like "${year}-05-%"`)
        var jun=await exe(`select count(user_courses_id) as ttl from user_courses where purchase_date like "${year}-06-%"`)
        var jul=await exe(`select count(user_courses_id) as ttl from user_courses where purchase_date like "${year}-07-%"`)
        var aug=await exe(`select count(user_courses_id) as ttl from user_courses where purchase_date like "${year}-08-%"`)
        var sep=await exe(`select count(user_courses_id) as ttl from user_courses where purchase_date like "${year}-09-%"`)
        var oct=await exe(`select count(user_courses_id) as ttl from user_courses where purchase_date like "${year}-10-%"`)
        var nov=await exe(`select count(user_courses_id) as ttl from user_courses where purchase_date like "${year}-11-%"`)
        var dec=await exe(`select count(user_courses_id) as ttl from user_courses where purchase_date like "${year}-12-%"`)
        // console.log(jan);
        var obj={
            "jan":jan[0].ttl,
            "feb":feb[0].ttl,
            "mar":mar[0].ttl,
            "apr":apr[0].ttl,
            "may":may[0].ttl,
            "jun":jun[0].ttl,
            "jul":jul[0].ttl,
            "aug":aug[0].ttl,
            "sep":sep[0].ttl,
            "oct":oct[0].ttl,
            "nov":nov[0].ttl,
            "dec":dec[0].ttl
        }
        res.render('admin/home.ejs',obj);
    }
    else {
        res.send(`
            <script>
            alert('Login First');
            location.href='/admin/login'
            </script>
        `)
    }
})

router.get('/manage_slider', async function (req, res) {
    if (login(req)) {
        var data = await exe(`select * from slider`);
        // console.log(data)
        var obj = {
            'slides': data
        }
        res.render("admin/manage_slider.ejs", obj)
    }
    else {
        res.send(`
            <script>
            alert('Login First');
            location.href='/admin/login'
            </script>
        `)
    }
})

router.post('/save_slider', function (req, res) {
    if (login(req)) {
        const date = new Date()
        var time = date.getTime();
        var filename = time + req.files.slider_image.name;
        // console.log(filename)
        req.files.slider_image.mv('public/uploads/' + filename)
        var d = req.body;
        // var title=d.slider_title.replace("'","");

        // exe(`create table slider(slider_id int primary key auto_increment,slider_image text, slider_title varchar(200),slider_button_text varchar(200),slider_button_link text)`)

        exe(`insert into slider(slider_image,slider_title,slider_button_text,slider_button_link) values('${filename}','${d.slider_title}','${d.button_text}','${d.button_link}')`)
        res.redirect('/admin/manage_slider');
    }
    else {
        res.send(`
            <script>
            alert('Login First');
            location.href='/admin/login'
            </script>
        `)
    }
})


router.get('/slider_delete/:id', function (req, res) {
    if (login(req)) {
        var id = req.params.id;
        exe(`delete from slider where slider_id='${id}'`)
        res.redirect('/admin/manage_slider')
    }
    else {
        res.send(`
            <script>
            alert('Login First');
            location.href='/admin/login'
            </script>
        `)
    }
})

router.get('/slider_edit/:id', async function (req, res) {
    if (login(req)) {
        var id = req.params.id;
        var data = await exe(`select * from slider where slider_id='${id}'`)
        var obj = {
            list: data[0]
        };
        res.render('admin/update_slider.ejs', obj)
    }
    else {
        res.send(`
            <script>
            alert('Login First');
            location.href='/admin/login'
            </script>
        `)
    }
})

router.post('/update_slider', function (req, res) {
    if (login(req)) {
        const date = new Date()
        var time = date.getTime();
        var d = req.body;
        var id = req.body.slider_id;
        if (req.files != null) {
            var filename = time + req.files.slider_image.name;
            req.files.slider_image.mv('public/uploads/' + filename)

            exe(`update slider set slider_image='${filename}' where slider_id='${id}'`)
        }
        exe(`update slider set slider_title='${d.slider_title}',slider_button_text='${d.button_text}',slider_button_link='${d.button_link}' where slider_id='${id}'`)
        res.redirect('/admin/manage_slider')
    }
    else {
        res.send(`
            <script>
            alert('Login First');
            location.href='/admin/login'
            </script>
        `)
    }
})

router.get('/manage_category', async function (req, res) {
    if (login(req)) {
        var data = await exe(`select  * from category`);
        var obj = {
            cats: data
        }
        res.render('admin/manage_category.ejs', obj);
    }
    else {
        res.send(`
            <script>
            alert('Login First');
            location.href='/admin/login'
            </script>
        `)
    }
})
router.post('/save_category', function (req, res) {
    if (login(req)) {
        // exe(`create table category(category_id int primary key auto_increment,category_name varchar(200),category_description text)`)

        var name = req.body.category_name.replace("'", "\\'");
        var desc = req.body.category_description.replace("'", "\\'");
        exe(`insert into category(category_name,category_description) values('${name}','${desc}')`)
        res.redirect('/admin/manage_category')
    }
    else {
        res.send(`
            <script>
            alert('Login First');
            location.href='/admin/login'
            </script>
        `)
    }
})

router.get('/category_delete/:id', function (req, res) {
    if (login(req)) {
        var id = req.params.id;
        exe(`delete from category where category_id='${id}'`)
        res.redirect('/admin/manage_category')
    }
    else {
        res.send(`
            <script>
            alert('Login First');
            location.href='/admin/login'
            </script>
        `)
    }
})

router.get('/category_edit/:id', async function (req, res) {
    if (login(req)) {
        var id = req.params.id;
        var data = await exe(`select * from category where category_id='${id}'`)
        var obj = {
            cats: data
        }
        res.render('admin/update_category.ejs', obj);
    }
    else {
        res.send(`
            <script>
            alert('Login First');
            location.href='/admin/login'
            </script>
        `)
    }
})


router.post('/update_category', function (req, res) {
    if (login(req)) {
        var name = req.body.category_name.replace("'", "\\'");
        var desc = req.body.category_description.replace("'", "\\'");
        exe(`update category set category_name='${name}',category_description='${desc}' where category_id='${req.body.category_id}'`)
        res.redirect('/admin/manage_category')
    }
    else {
        res.send(`
            <script>
            alert('Login First');
            location.href='/admin/login'
            </script>
        `)
    }
})

router.get('/add_course', async function (req, res) {
    if (login(req)) {
        var data = await exe(`select * from category`);
        var obj = {
            cats: data
        }
        res.render('admin/add_course.ejs', obj)
    }
    else {
        res.send(`
            <script>
            alert('Login First');
            location.href='/admin/login'
            </script>
        `)
    }
})

router.post('/save_course', function (req, res) {
    if (login(req)) {
        var date = new Date()
        var time = date.getTime();
        var d = req.body;
        var img_name = time + req.files.course_image.name
        req.files.course_image.mv('public/uploads/' + img_name)
        var video_name = "";
        if (req.files.course_sample_video != undefined) {
            video_name = time + req.files.course_sample_video.name
            req.files.course_sample_video.mv('public/uploads/' + video_name)
        }

        var course_name = d.course_name.replaceAll("'", "\\'");
        var course_detail = d.course_detail.replaceAll("'", "\\'");

        // exe(`create table course_tbl(course_id int primary key auto_increment ,course_name varchar(200),course_category_id int,course_duration varchar(30),course_price int,course_image text,course_sample_video text,course_mentor varchar(200),course_link text,course_platform varchar(50),course_detail text)`)

        exe(`insert into course_tbl(course_name,course_category_id,course_duration,course_price,course_image,course_sample_video,course_mentor,course_link,course_platform,course_detail) values(
            '${course_name}',
            '${d.course_category_id}',
            '${d.course_duration}',
            '${d.course_price}',
            '${img_name}',
            '${video_name}',
            '${d.course_mentor}',
            '${d.course_link}',
            '${d.course_platform}',
            '${course_detail}'
        )`)
        res.redirect('/admin/add_course')
    }
    else {
        res.send(`
            <script>
            alert('Login First');
            location.href='/admin/login'
            </script>
        `)
    }
})

router.get('/course_list', async function (req, res) {
    if(login(req))
    {
        var data = await exe(`select * from course_tbl,category where course_tbl.course_category_id=category.category_id`)
    var obj = {
        course_list: data
    }
    res.render('admin/course_list.ejs', obj);
    }
    else{
        res.send(`
            <script>
            alert('Login First');
            location.href='/admin/login'
            </script>
        `)
    }
})

router.get('/course_detail/:id', async function (req, res) {
    if(login(req))
    {
        var id = req.params.id;
    var data = await exe(`select * from course_tbl,category where course_tbl.course_category_id=category.category_id AND course_id='${id}'`)
    var obj = {
        details: data
    }
    res.render('admin/course_detail.ejs', obj)
    }
    else{
        res.send(`
            <script>
            alert('Login First');
            location.href='/admin/login'
            </script>
        `)
    }
})

router.get('/course_delete/:id', function (req, res) {
    if(login(req))
    {
        var id = req.params.id;
    exe(`delete from course_tbl where course_id="${id}"`)
    res.redirect('/admin/course_list');
    }
    else{
        res.send(`
            <script>
            alert('Login First');
            location.href='/admin/login'
            </script>
        `)
    }
})

router.get('/course_edit/:id', async function (req, res) {
    if(login(req))
    {
        var id = req.params.id;
    var data = await exe(`select * from course_tbl,category where course_tbl.course_category_id=category.category_id AND course_id='${id}'`)

    var data1 = await exe(`select * from course_tbl,category where course_tbl.course_category_id=category.category_id `)

    var obj = {
        course: data,
        list: data1
    }
    res.render('admin/update_course.ejs', obj)
    }
    else{
        res.send(`
            <script>
            alert('Login First');
            location.href='/admin/login'
            </script>
        `)
    }
})

router.post('/update_course', function (req, res) {
    if(login(req))
    {
        var d = req.body;
    var id = d.course_id;
    if (req.files) {
        if (req.files.course_image != undefined) {
            var date = new Date();
            var time = date.getTime();

            var image_name = time + req.files.course_image.name;
            req.files.course_image.mv('public/uploads/' + image_name);
            exe(`update course_tbl set course_image='${image_name}' where course_id="${id}"`)
        }

        if (req.files.course_sample_video != undefined) {
            var date = new Date();
            var time = date.getTime();

            var video_name = time + req.files.course_sample_video.name;
            req.files.course_sample_video.mv('public/uploads/' + video_name);
            exe(`update course_tbl set course_sample_video='${video_name}' where course_id="${id}"`)
        }
    }
    var course_name = d.course_name.replaceAll("'", "\\'");
    var course_detail = d.course_detail.replaceAll("'", "\\'");

    exe(`update course_tbl set 
        course_name='${course_name}',
        course_category_id='${d.course_category_id}',
        course_duration='${d.course_duration}',
        course_price='${d.course_price}',
        course_mentor='${d.course_mentor}',
        course_link='${d.course_link}',
        course_platform='${d.course_platform}',
        course_detail='${course_detail}'
    where course_id="${id}"`)

    res.redirect('/admin/course_list')
    }
    else{
        res.send(`
            <script>
            alert('Login First');
            location.href='/admin/login'
            </script>
        `)
    }
})

router.get('/all_user_list', async function (req, res) {
    if(login(req))
    {
        var data = await exe(`select * from user_tbl`);
    var obj = {
        user: data
    }
    res.render('admin/all_user_liste.ejs', obj)
    }
    else{
        res.send(`
            <script>
            alert('Login First');
            location.href='/admin/login'
            </script>
        `)
    }
})

router.get('/sold_courses', async function (req, res) {
    if(login(req))
    {
        var data = await exe(`select user_name,course_name,amount,purchase_date,transaction_id from user_courses,course_tbl,user_tbl where user_courses.user_id=user_tbl.user_id and user_courses.course_id=course_tbl.course_id`)
    var data1 = await exe(`select * from course_tbl`)
    var obj = {
        list: data,
        list1: data1
    }
    res.render('admin/sold_list.ejs', obj);
    }
    else{
        res.send(`
            <script>
            alert('Login First');
            location.href='/admin/login'
            </script>
        `)
    }
})

router.post('/search_course', async function (req, res) {
    if(login(req))
    {
        var id = req.body.course_search_id
    var data = await exe(`select user_name,course_name,amount,purchase_date,transaction_id from user_courses,course_tbl,user_tbl where user_courses.user_id=user_tbl.user_id and user_courses.course_id=course_tbl.course_id and course_name='${id}'`)
    var data1 = await exe(`select * from course_tbl`)
    var obj = {
        list: data,
        list1: data1
    }
    res.render('admin/sold_list.ejs', obj);
    }
    else{
        res.send(`
            <script>
            alert('Login First');
            location.href='/admin/login'
            </script>
        `)
    }
})

router.get('/login', function (req, res) {

    res.render('admin/admin_login.ejs')
})

router.post('/save_admin', async function (req, res) {
    var d = req.body;
    var data = await exe(`select * from admin where admin_email='${d.admin_email}' and admin_password='${d.admin_password}'`)
    if (data.length > 0) {
        req.session.admin_id = data[0].admin_id;
        res.redirect('/admin');
    }
    else {
        res.send(`
            <script>
                alert('Admin Login Failed');
                location.href="/admin/login";
            </script>
        `)
    }
})


router.get('/logout',function(req,res){
    req.session.admin_id=undefined;
    res.redirect('/admin/login');
})

router.get('/contact_list',async function(req,res){
    var data=await exe(`select * from contact`)
    var obj={
        list:data
    }
    res.render('admin/contact_list.ejs',obj)
})

router.get('/feedback_list',async function(req,res){
    var data=await exe(`select * from feedback`)
    var obj={
        list:data
    }
    res.render('admin/feedback_list.ejs',obj)
})

module.exports = router;