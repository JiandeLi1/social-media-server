var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose')
const multer = require("multer")
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var authRouter = require('./routes/auth');
var postRouter = require('./routes/posts');
var conversationRouter = require('./routes/conversation');
var messageRouter = require('./routes/messages');
var cors = require('cors')

mongoose.connect('mongodb://localhost:27017/social-app', { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex:true})
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(cors())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use("/images", express.static(path.join(__dirname,"public/images")))

//Upload file
//Make a storage file to save the upload file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images/post")
  },
  //Setting the file name
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
})

const upload = multer({ storage : storage});
app.post("/api/upload", upload.single("file"), (req, res) => {
  try {
    return res.status(200).json("File upload successfully!")
  } catch(err) {
    console.log(err)
  }
})

app.use('/', indexRouter);
app.use('/api/users', usersRouter);
app.use('/api/auth', authRouter);
app.use('/api/posts', postRouter);
app.use('/api/conversations', conversationRouter);
app.use('/api/messages', messageRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
