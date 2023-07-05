var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const methodOverride = require("method-override");
const session = require("express-session");
const flash = require("connect-flash");
const bodyParser = require("body-parser");

const dashboardRouter = require("./app/dashboard/router");
const usersRouter = require("./app/users/router");
const notaDinasRouter = require("./app/notadinas/router");
const callbackRouter = require("./app/callback/router");

const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(bodyParser.json({ limit: "50mb" }));
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    cookie: {},
  })
);
app.use(flash());
app.use(methodOverride("_method"));
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "theme")));
app.use(
  "/dropify",
  express.static(path.join(__dirname, "/node_modules/dropify/"))
);
app.use(
  "/tinymce",
  express.static(path.join(__dirname, "node_modules", "tinymce"))
);
app.use(
  "/dompurify",
  express.static(path.join(__dirname, "node_modules", "dompurify"))
);
// app.use(
//   "/jspdf",
//   express.static(path.join(__dirname, "node_modules", "jspdf"))
// );

app.use("/", usersRouter);
app.use("/dashboard", dashboardRouter);
app.use("/notadinas", notaDinasRouter);
app.use("/callback", callbackRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
