const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const morgan = require("morgan")
const session = require("express-session")
const cookieParser = require("cookie-parser");
const authRoute = require('./route/auth')
const fetch = require("node-fetch")
const check = require('./middleWare/checkUser')
const port = process.env.PORT||3000

mongoose.connect('mongodb://localhost:27017/shop',{useNewUrlParser:true, useUnifiedTopology:true})
//useNewUrlParser:true fix lỗi warning DeprecationWarning: current URL string parser is deprecated, and will be
//removed in a future version. To use the new parser, pass option

/*useUnifiedTopology:true  fix warning DeprecationWarning: current Server Discovery and Monitoring engine is
deprecated, and will be removed in a future version. To use the new Server
Discover and Monitoring engine, pass option { useUnifiedTopology: true } to
the MongoClient constructor.*/
const db = mongoose.connection;
db.on('error', (err)=>{
    console.log(err);
})

db.once('open',()=>{
    console.log(" database  da duoc ket noi");
})
app.use(cookieParser())
app.use(session({
    secret: 'mySecretKey',
    resave: true,
    saveUninitialized: false
  }));
app.use(morgan('dev'))
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())




app.set("view engine", "ejs");
app.get('*',check)
app.use("/", require('./route/page'));
app.use(express.static('public'));
app.use("/",authRoute)


app.listen(port,()=>{
    console.log("server is runiing on port", port);
})