const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
const passport = require("passport");
//const ngrok = require("ngrok");

const app = express();

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Middlewares
app.use(express.static(path.join(__dirname,"..","build")));
app.use(cors());

//adding route
const user = require("./route/api/user");
const profile = require("./route/api/profile");
const service = require("./route/api/service");
const tutorial = require("./route/api/tutorial");
const work = require("./route/api/work");
const template = require("./route/api/template");
const post = require("./route/api/post");
const admin = require("./route/api/admin");
const order = require("./route/api/order");

// DB Config
const db = require("./config/keys").mongoURI;

// Connect to MongoDB
mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connection.on("connected", function () {
  console.log("connected");
});
mongoose.connection.on("error", function (err) {
  console.log("Could not connect to MongoDB");
});

//adding passport middleware
app.use(passport.initialize());

// Passport Config
require("./config/passport")(passport);

//using route
app.use("/api/users", user);
app.use("/api/profile", profile);
app.use("/api/service", service);
app.use("/api/tutorial", tutorial);
app.use("/api/work", work);
app.use("/api/template", template);
app.use("/api/post", post);
app.use("/api/admin", admin);
app.use("/api/order", order);

/*
app.post('/payment/success', function (req, res) {
  const body = req.body.Body
  res.set('Content-Type', 'text/plain')
  res.send(`You sent: ${body} to Express`)
  console.log(body);
})
*/

// Set static folder
app.use(express.static(path.join(__dirname, "..","bengal_frontebd","build")));
app.use(express.static(path.join(__dirname, "..","bengal_superadmin_dashboard", "build")));
//app.use(express.static(path.join(__dirname, ".","pages","payment.html")));

//using uploads route
app.use("/uploads", express.static("uploads"));
app.use(express.static("public"));

/*
app.use("/payment", (req,res) => {
  res.sendFile(path.resolve(__dirname, ".", "pages", "index.html"));
})
*/

app.get("/admin",(req,res) => {
  res.sendFile(path.resolve(__dirname, "..", "bengal_superadmin_dashboard", "build", "index.html"));
})

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname,"..",'bengal_frontebd','build', 'index.html'));
});
  


const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server running on port ${port}`));
