if(process.env.NODE_ENV !="production"){
    require("dotenv").config();
}


const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// MongoDB connection string
const DbUrl = process.env.ATLASDB_URL;

// Establish MongoDB connection
main().then(() => {
    console.log("Connected successfully to MongoDB");
}).catch((err) => {
    console.log(err);
});

async function main() {
    await mongoose.connect(DbUrl);
}

// Create a MongoStore instance for storing sessions
const Store = MongoStore.create({
    mongoUrl: DbUrl,
    crypto: {
        secret:process.env.SECRET
    },
    touchAfter: 24 * 3600,
});

Store.on("error", (err) => {
    console.log("Error in Mongo Session Store", err);
});

// Session configuration
const sessionOptions = {
    store: Store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true
    }
};

// Middleware for handling sessions and flash messages
app.use(session(sessionOptions));
app.use(flash());

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Middleware for setting local variables and flash messages
app.use((req, res, next) => {
    // Set flash messages
    req.flash("success");
    req.flash("error");

    // Set local variables
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;

    next();
});

// View engine and static files
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

// Routers
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

// 404 error handler
app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page not found!"));
});

// Error handler
app.use((err, req, res, next) => {
    let { statuscode = 500, message = "Something went wrong!" } = err;
    res.status(statuscode).render("error.ejs", { message });
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});