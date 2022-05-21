const express = require("express");
const router = require("./routeHandler/userHandler");
const adminRouter = require("./routeHandler/adminHandler");
const dotenv = require("dotenv");
const app = express();
const checkLogin = require("./middlewares/checkLogin");
const adminCheck = require("./middlewares/adminCheck");
const cors = require("cors");
// const cookieParser = require("cookie-parser");
//app.use(express.json);
dotenv.config();
app.use(
  cors({
    origin: "*",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credential": true,
  })
);
app.use("/auth", router);
app.use("/admin", adminRouter);
// app.use(cookieParser(process.env.cookie_secret));

app.get("/", checkLogin, adminCheck, (req, res) => {
  res.status(200).json({
    message: "you are logged in",
    User_Id: req.id,
    UserName: req.userName,
    Name: req.name,
  });
});

//default error handler
const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).json({ error: err });
};

app.listen(3001, () => {
  console.log("app is running!");
});
console.log("this program is running");
