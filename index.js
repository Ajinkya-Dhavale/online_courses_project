var express=require('express');
var bodyparser=require('body-parser');
var upload=require('express-fileupload')
var session=require('express-session')
var userRouter=require('./routes/user');
var adminRouter=require('./routes/admin')
var app=express();

//middleware
app.use(express.static('public/'))
app.use(upload());
app.use(session({
    secret:'couses project',
    resave:true,
    saveUninitialized:true    
}))
app.use(bodyparser.urlencoded({extended:true}));

app.use('/',userRouter)
app.use('/admin',adminRouter)

app.listen(1000)