require("dotenv").config();
const express = require("express");
var jwt = require("jsonwebtoken");
const cookie = require("cookie-parser");
const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');  
const session = require("express-session");

const connectDB = require("./database/db")

const path = require("path");

const fs = require("fs");

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.DB_URI);

connectDB();
const app = express();

app.use(
  session({
    secret: "56465465", 
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, 
  })
);    

// Set EJS as the view engine
app.set("view engine", "ejs");
// Set the views directory
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.json());
app.use('/uploads', express.static('uploads'));



// mongoose
//   .connect("mongodb://127.0.0.1:27017/userAuthDB", { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => console.log("MongoDB Connected"))
//   .catch((err) => console.error(err));


const routes = require("./routes/route");
app.use(express.static("uploads"));

// Use the routes defined in route.js
app.use("/", routes);

// Route to render the AdminLTE dashboard
// app.use('/users', users);

app.listen(PORT, () => {
  console.log(`Server started and running at http://localhost:${PORT}`);
});
