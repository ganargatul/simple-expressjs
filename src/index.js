var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var logger = require('morgan');
var Data = require("./models/test");
var Users = require("./models/Users");
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var bcrypt = require('bcrypt');
const faker = require('faker')

const User = {
  name: faker.name.findName(),
  email: faker.internet.email(),
  website: faker.internet.url(),
  address: faker.address.streetAddress() + faker.address.city() + faker.address.country(),
  bio: faker.lorem.sentences(),
  image: faker.image.avatar()
}
const connectdb = "mongodb://ganargatul:ix122001@ds233500.mlab.com:33500/kihadjarproject";
const router = express.Router();

var app = express();
mongoose.connect(connectdb,{ useNewUrlParser: true });

let db = mongoose.connection;
db.once("open", () => console.log("connected to the database"));

// checks if connection with the database is successful
db.on("error", console.error.bind(console, "MongoDB connection error:"));

// (optional) only made for logging and
// bodyParser, parses the request body to be a readable json format
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(logger("dev"));
app.use(session({
   secret: 'work hard',
   resave: true,
   saveUninitialized: false,
   store: new MongoStore({
     mongooseConnection: db
   })
 }));


//get data
app.get("/get", (req, res) => {
   Data.find((err, data) => {
     if (err) return res.json({ success: false, error: err });
     return res.json({ success: true, data: data });
   });
});

//update data
app.put("/update", (req, res) => {
   const { id, update } = req.body;
   Data.findOneAndUpdate(id, update, err => {
     if (err) return res.json({ success: false, error: err });
     return res.json({ success: true });
   });
});

//insert data
app.post("/post", (req, res) => {
   let data = new Data();
 
   const { id, message } = req.body;
 
   if ((!id && id !== 0) || !message) {
     return res.json({
       success: false,
       error: "All fields required."
     });
   }
   data.message = message;
   data.id = id;
   data.save(err => {
     if (err) return res.json({ success: false, error: err });
     return res.json({ success: true, "ID":data.id });
   });
});

//delete
app.delete("/delete", (req, res) => {
   const { id } = req.body;
   Data.findOneAndDelete(id, err => {
     if (err) return res.send(err);
     return res.json({ success: true });
   });
});

//register
app.post('/register',(req,ress)=>{
   let user = new Users();
   const {nama,email,password} = req.body;
   if(!nama || !email || !password){
      return ress.json({
         success: false,
         error: "All fields required"
      })
   }
   user.nama = nama;
   user.email = email;
   user.password = password
   user.save(err=>{
      if (err)return ress.json({ success: false, error: err });
      return ress.json({ success: true, "Nama":user.nama , "Email": user.email , "Password":user.password });
   })
   
});


//Login
app.post('/login',(req,res,next, callback)=>{
   Users.findOne({ email: email })
      .exec(function (err, user) {
        if (err) {
          return callback(err)
        } else if (!user) {
          var err = new Error('User not found.');
          err.status = 401;
          return callback(err);
        }
        bcrypt.compare(password, user.password, function (err, result) {
          if (result === true) {
            return callback(null, user);
          } else {
            return callback();
          }
        })
      });
})


//logout
// GET for logout logout
app.get('/logout', function (req, res, next) {
   if (req.session) {
     // delete session object
     req.session.destroy(function (err) {
       if (err) {
         return next(err);
       } else {
         return res.redirect('/');
       }
     });
   }
});

//testCURL
app.get('/curl',(req,res)=>{
  res.json({message:"you accsess curl"})
})

//make fake data
app.get('/fake',(req,ress)=>{
  let name= faker.name.findName();
  ress.json({ success: true, "Name": name});
})

//handle routes not found or not declarates
app.use(function (req, res, next) {
   var err = new Error('File Not Found');
   err.status = 404;
   res.json({success:false, "message": "File Not Found"})
});

app.listen(process.env.PORT || 3001);
