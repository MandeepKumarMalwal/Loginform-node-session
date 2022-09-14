require('dotenv').config()
const bodyParser = require("body-parser")
const cors = require("cors")
const session = require("express-session")
const express = require("express")
const cookie = require("cookie-parser")
const User = require("./models/User")
const PORT = process.env.PORT || 5000
 
const app = express()


app.use(express.static(__dirname + 'views'));
app.use(express.static(__dirname + '/views'));
app.use(cookie())
// app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}))
app.use(
    session({
      key: "user_sid",
      secret: process.env.SECRET_KEY,
      resave: false,
      saveUninitialized: false,
      cookie: {
        expires: 100000,
      },
    })
  )

  app.use((req,res)=>{
    if(req.cookies.user_sid && !req.session.user){
        res.clearCookie("user_sid")
    }
})

  //middleware
  const sessionchecker = (req,res)=>{
    if(req.cookies.user_sid && req.session.user){
        res.redirect("/dasboard")
    }
    else{
        next()
    }
  }

  //routes

  app.get("/",sessionchecker,(req,res)=>{
    res.render("login.html")
  })

  app.get("/signup",sessionchecker,(req,res)=>{
    res.render("signup.html")
  })

  app.get("/login",sessionchecker,(req,res)=>{
    res.render("login.html")
  })

  // route for user's dashboard
app.get("/dashboard", (req, res) => {
  if (req.session.user && req.cookies.user_sid) {
    res.render("dashboard.html");
  } else {
    res.redirect("/login");
  }
})

 //for logout
app.get("/logout", (req, res) => {
  if (req.session.user && req.cookies.user_sid) {
    res.clearCookie("user_sid");
    res.redirect("/");
  } else {
    res.redirect("/login");
  }
});

  app.post("/signup",(req,res)=>{
    const user = new User({
      username: req.body.username,
      email: req.body.email,
      password:req.body.password,
    })
    user.save((err,result)=>{
      if(err){
        res.redirect("/signup")
      }
      else{
            console.log(result)
            req.session.user = result
            res.redirect("/dasboard")
          }
    })
  })

app.post("/login",async (req, res) => {
  const username = req.body.username,
        password = req.body.password;

    try {
      var user = await User.findOne({ username: username })
      if(!user) {
          res.redirect("/login");
      }
      user.comparePassword(password, (error, match) => {
          if(!match) {
            res.redirect("/login");
          }
      })
      req.session.user = user;
      res.redirect("/dashboard");
  } catch (error) {
    console.log(error)
  }
})


app.listen(PORT,(req,res)=>{
    console.log(`listening on PORT ${PORT}`)
})