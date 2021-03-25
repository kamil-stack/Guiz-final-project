const express = require('express');
var session = require('express-session');
const app = express();
const mongoose = require('mongoose');
require('dotenv').config()
const ejs = require('ejs');
const port = 80;
const bcrypt = require('bcrypt');
var cookieParser = require('cookie-parser');
const { Cookie } = require('express-session');
const SECRET = process.env.SECRET
app.use(cookieParser());
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.json())
app.use(express.urlencoded({ extended: false }));
app.use('/public', express.static('public'));
app.use(session({
    secret: SECRET,
    user: "temp",
    resave: true,
	saveUninitialized: true
}));

var NumberOfUsers;
var NumberOfQuizzes;

//Was going to use two databases but decided to use one because I could just create another collection which just makes it more efficent
const usersdb = mongoose.createConnection(process.env.DB_CONN, {useNewUrlParser: true, useUnifiedTopology: true })
const USERS = usersdb.model('users', require('./model')); // For Users
const QUIZ = usersdb.model('quizzes', require('./quizmodel')) // For Quizzes


let getinfo = async() =>{
    NumberOfUsers = await USERS.countDocuments({}); // Number Of Users 
    NumberOfQuizzes = await QUIZ.countDocuments({}); // Number Of Quizzes
}



app.post('/api/register', (req, res)=>{ // Registers users
    pass = bcrypt.hashSync(req.body.password, 10) // hashes the users password so even I don't know what it is
    var now = new Date();
    var format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
    user = req.body.username;
    if(format.test(user)){
        res.send("</html><head><link rel='stylesheet' href='/public/css/main.css'><script>window.onload = async () => { const delay = ms => new Promise(res => setTimeout(res, ms)); await delay(3000); window.location.href = 'http://127.0.0.1/register';}</script></head><body><h1>Error: Username Contains Illegal characters</h1></body></html>") // If there is an error creating the user it is due the username not being unique
    }else{
    data = {
        USERNAME: user.toUpperCase(),  // Forces usernames to be uppercase
        PASSWORD: pass,
        created_at: now,
    }   
    USERS.create(data, (err) =>{
        if(err){
            res.send("</html><head><link rel='stylesheet' href='/public/css/main.css'><script>window.onload = async () => { const delay = ms => new Promise(res => setTimeout(res, ms)); await delay(3000); window.location.href = 'http://127.0.0.1/register';}</script></head><body><h1>Error: Username Taken</h1></body></html>") // If there is an error creating the user it is due the username not being unique
        } else {
            getinfo()
            res.redirect("/login")
        }
    })}
})   

app.get('/api/check',async (req,res)=>{
    if (req.cookies.ID){
        username = await USERS.findById(req.cookies.ID)
        console.log("[USER: "+username.USERNAME+"]:[METHOD: "+req.method+"]:["+req.path+"]")
    } else{
        console.log("[USER: UNKNOWN]:[METHOD: "+req.method+"]:["+req.path+"]")
    }
    answer = req.query.ans
    code = req.query.code
    question_number = req.query.q
    await QUIZ.findOne({_id: code},(err, dat) => {
        if (ans == dat.questions[question_number][1]) {
            res.json({"answer": true})
        }else{
            res.json({"answer": false})
        }})})

app.get('/api/quiz', async(req, res)=>{ //endpoint for getting quiz
    if (req.cookies.ID){
        username = await USERS.findById(req.cookies.ID)
        console.log("[USER: "+username.USERNAME+"]:[METHOD: "+req.method+"]:["+req.path+"]")
    } else{
        console.log("[USER: UNKNOWN]:[METHOD: "+req.method+"]:["+req.path+"]")
    }
    if(req.query.code){
            QUIZ.findOne({_id: req.query.code},(err, data) => {
            res.json(data)
        })
    }
})

app.post('/api/login', (req, res) => {
    username1 = (req.body.username).toUpperCase()
    var user = USERS.findOne({USERNAME: username1},(err, user) => {
        if (!user){
            res.send("Incorrect Information")
        }
        if (!(bcrypt.compareSync(req.body.password, user.PASSWORD))){
            res.send("Incorrect Information")
        } else {
            res.cookie("ID", user.id)
            req.session.userId = user.id;
            res.redirect('/')
        }}    
        );
    })
    
    
app.get('/logout', async(req, res) => {
    if (req.cookies.ID){
        username = await USERS.findById(req.cookies.ID)
        console.log("[USER: "+username.USERNAME+"]:[METHOD: "+req.method+"]:["+req.path+"]")
    } else{
        console.log("[USER: UNKNOWN]:[METHOD: "+req.method+"]:["+req.path+"]")
    }
    if (req.session){
        res.clearCookie("ID")
        res.redirect("/")
    }
})
    
app.get('/quizzes', async(req, res) => {
    if (req.cookies.ID){
        username = await USERS.findById(req.cookies.ID)
        console.log("[USER: "+username.USERNAME+"]:[METHOD: "+req.method+"]:["+req.path+"]")
    } else{
        console.log("[USER: UNKNOWN]:[METHOD: "+req.method+"]:["+req.path+"]")
    }
    // This lists quizzes a user can play
    d3 = await QUIZ.find({},{},{ sort: { 'created_at' : -1 } }, (err, data) =>{ //Get newest 5 quizzes
    if (err) {
        console.log("[Server] Error: "+err);
    } else{
        res.write('<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><style>.quizdata{margin: 5;width: 300px;box-sizing: border-box;border: 5px solid black;}</style><meta name="viewport" content="width=device-width, initial-scale=1.0"><link rel="stylesheet" href="/public/css/main.css"><script src="/public/js/home.js"></script><title>[Home]</title></head><a onclick="redirect(`/`)">back</a><br><br><center>Latest 5 Quizzes')
    for ( _=0 ; _ < NumberOfQuizzes; _++ ){
        res.write('<div class="quizdata"><p>Title: '+data[_].get("title")+'</p>')
        res.write('<p>Description: '+data[_].get("desc")+'</p>')
        res.write('<p>Number Of Questions: '+data[_].get("noq")+'</p>')
        res.write('<a href="/player?code='+data[_].get("_id")+'&noq='+data[_].get("noq")+'">Play</a></div><br>')
    }
    res.end()
}}).select('title desc questions noq _id');
})
        
        
app.get("/player", async(req,res) => {
    if (req.cookies.ID){
        username = await USERS.findById(req.cookies.ID)
        console.log("[USER: "+username.USERNAME+"]:[METHOD: "+req.method+"]:["+req.path+"]")
    } else{
        console.log("[USER: UNKNOWN]:[METHOD: "+req.method+"]:["+req.path+"]")
    }
    res.render("player")
})
            
            
app.get('/', async(req, res)=>{
    if (req.cookies.ID){
        username = await USERS.findById(req.cookies.ID)
        console.log("[USER: "+username.USERNAME+"]:[METHOD: "+req.method+"]:["+req.path+"]")
    } else{
        console.log("[USER: UNKNOWN]:[METHOD: "+req.method+"]:["+req.path+"]")
    }
    getinfo()
    if (req.cookies.ID){
        res.render("index.ejs", {var1: "Create", var2: "Logout", data1: NumberOfUsers, data2: NumberOfQuizzes, second: "About"})
    } else {
        res.render("index.ejs", {var1: "Login", var2: "Register", data1: NumberOfUsers, data2: NumberOfQuizzes, second: "About"})
    }
});
            
app.get('/Login', async(req, res)=>{
    if (req.cookies.ID){
        username = await USERS.findById(req.cookies.ID)
        console.log("[USER: "+username.USERNAME+"]:[METHOD: "+req.method+"]:["+req.path+"]")
    } else{
        console.log("[USER: UNKNOWN]:[METHOD: "+req.method+"]:["+req.path+"]")
    }
    res.render("login")
});

app.get('/About', async(req,res)=>{
    if (req.cookies.ID){
        username = await USERS.findById(req.cookies.ID)
        console.log("[USER: "+username.USERNAME+"]:[METHOD: "+req.method+"]:["+req.path+"]")
    } else{
        console.log("[USER: UNKNOWN]:[METHOD: "+req.method+"]:["+req.path+"]")
    }
    res.render("about")
    res.status(200)
})
            
app.get('/create', async(req, res)=>{
    if (req.cookies.ID){
        username = await USERS.findById(req.cookies.ID)
        console.log("[USER: "+username.USERNAME+"]:[METHOD: "+req.method+"]:["+req.path+"]")
    } else{
        console.log("[USER: UNKNOWN]:[METHOD: "+req.method+"]:["+req.path+"]")
    }
    res.render('create')
})
            
            
app.get('/create2', async(req, res)=>{
    if (req.cookies.ID){
        username = await USERS.findById(req.cookies.ID)
        console.log("[USER: "+username.USERNAME+"]:[METHOD: "+req.method+"]:["+req.path+"]")
    } else{
        console.log("[USER: UNKNOWN]:[METHOD: "+req.method+"]:["+req.path+"]")
    }
    res.write('<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><link rel="stylesheet" href="/public/css/create.css"><script src="/public/js/create.js"></script><title>[Quiz Creation]</title></head><body><form action="/part2" method="post">')
    res.write(`<input type="hidden" name="noq" value="${req.query.noq}"><input type="hidden" name="title" value="${req.query.title}">`)
    for (_ = 0; _ < req.query.noq; _++){
        res.write(`<br><label for="q${_+1}">Question ${_+1}: </label><input id="q${_+1}" type="text" name="q${_+1}"><br><br><label for="answer${_+1}">Answer:  </label><input id="answer${_+1}" type="text" name="answer${_+1}"><br><br><label for="choices${_+1}">Choices: </label><input id="choices${_+1}1" type="text" name="choices${_+1}1"><input id="choices${_+1}2" type="text" name="choices${_+1}2"><input id="choices${_+1}3" type="text" name="choices${_+1}3"><br><br>`)
    }
    res.write('<textarea name="description"></textarea><br><input type="submit"></form>')
    res.end()
    getinfo()
})

app.post('/part2', async(req, res)=>{ // This post is used to sort out the data from the quiz creations
    if (typeof(user) === undefined){
        user = "guest"
    }
    if (req.cookies.ID){
        username = await USERS.findById(req.cookies.ID)
        console.log("[USER: "+username.USERNAME+"]:[METHOD: "+req.method+"]:["+req.path+"]")
    } else{
        console.log("[USER: UNKNOWN]:[METHOD: "+req.method+"]:["+req.path+"]")
    }
    let question = [ ]
    for (_ = 0;_ < req.body.noq; _++){
    question.push([])
    t = _ + 1
    eval(`choice_1 = req.body.choices${t}1`)
    eval(`choice_2 = req.body.choices${t}2`)
    eval(`choice_3 = req.body.choices${t}3`)
    eval(`quest = req.body.q${t}`)
    eval(`ans = req.body.answer${t}`)
    question[_].push(quest)
    question[_].push(ans)
    question[_].push([choice_1,choice_2,choice_3])
    }
    var now = new Date();
    let data = {
        "title": req.body.title,
        "desc": req.body.description,
        "noq": req.body.noq,
        "questions": question,
        "createdBy": username.USERNAME,
        "createdAt": now,
        };
    QUIZ.create(data, (err) =>{
    if(err){
        res.send("[Server] Quiz Not Created")
    } else {
        console.log("[Server] Quiz Created")
    }})
    res.redirect("/")
    })
                        
app.get('/register', async(req, res)=>{
    if (req.cookies.ID){
        username = await USERS.findById(req.cookies.ID)
        console.log("[USER: "+username.USERNAME+"]:[METHOD: "+req.method+"]:["+req.path+"]")
    } else{
        console.log("[USER: UNKNOWN]:[METHOD: "+req.method+"]:["+req.path+"]")
    }
    res.render("register")
});
            
            
app.get('*', async(req, res)=>{
    if (req.cookies.ID){
        username = await USERS.findById(req.cookies.ID)
        console.log("[USER: "+username.USERNAME+"]:[METHOD: "+req.method+"]:["+req.path+"]")
    } else{
        console.log("[USER: UNKNOWN]:[METHOD: "+req.method+"]:["+req.path+"]")
    }
    res.render('404');
});
            
app.listen(port, () => {
    console.log(`[Server] Running On Port:${port}`)
    getinfo()
});
            
            