if (process.env.NODE_ENV !== "production") {
    require("dotenv").config({
        path: "./maj pro/.env"
    });
}

// ADD THESE TWO LINES HERE
console.log("ATLASDB_URL =", process.env.ATLASDB_URL);
console.log("SECRET =", process.env.SECRET);


const express = require("express");

const sessionOptions = {
  secret: process.env.SECRET ,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

const app = express();
const mongoose = require("mongoose");
const Listing = require("./maj pro/models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./maj pro/wrapAsync");
const { listingSchema, reviewSchema } = require("./schema.js");
const ExpressError = require("./maj pro/models/ExpressError");
const Review = require("./maj pro/models/reviews.js/rev");
const listingsRouter = require("./maj pro/routes/listing");
const session=require("express-session");
const flash=require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("./maj pro/models/user.js");
const user=require("./maj pro/routes/userlog");
const { isLoggedIn } = require("./maj pro/routes/middleware.js");
const validateReview=(req,res,next)=>{
  let{error}=reviewSchema.validate(req.body);
  if(error){
    let errMsg=error.details.map((el)=>el.message).join(",");
    throw new ExpressError(400,errMsg);
  }else{
    next();
  }
  };

// Database setup
const mongo_url = process.env.ATLASDB_URL;
main()
  .then(() => {
    console.log("connected to database");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(mongo_url);
}

// View Engine Setup
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");

app.set(
  "views",
  path.join(__dirname, "maj pro", "models", "models", "views")
);
// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

app.use(
  express.static(
    path.join(__dirname, "maj pro", "models", "public")
  )
);

app.use(session(sessionOptions));
// flash should come before route
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
// serialize user means to store the info related to user in a session
//to remove that info is known as deserialize of the user
// to know more about it read the article present on the npm
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use((req,res,next)=>{
  res.locals.success=req.flash("success");
  res.locals.error=req.flash("error");
  res.locals.currUser=req.user;
  console.log("Success");

  next();
});
app.get("/demouser",async(req,res)=>{
  let fakeUser=new User({
    email:"student@gmail.com",
    username:"delta-student",
  });
  let registeredUser=await User.register(fakeUser,"helloworld");
  res.send(registeredUser);
})
 //Root Route
app.get("/", (req, res) => {
  res.redirect("/listings");
});
app.use("/listings",listingsRouter);
app.use("/",user);
//reviews
//post route
// Review POST Route
app.post(
  "/listings/:id/reviews",
  isLoggedIn,
  validateReview,
  wrapAsync(async (req, res) => {
    const listing = await Listing.findById(req.params.id);

    let newReview = new Review(req.body.review);
newReview.author = req.user._id;

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    req.flash("success", "New Review Created!");
    res.redirect(`/listings/${listing._id}`);
  })
);
//Delete reviews route
app.delete(
  "/listings/:id/reviews/:reviewId",
  wrapAsync(async (req, res) => {
    let { id, reviewId } = req.params;

    await Listing.findByIdAndUpdate(id, {
      $pull: { reviews: reviewId },
    });

    await Review.findByIdAndDelete(reviewId);
    req.flash("success"," Review Deleted");
    res.redirect(`/listings/${id}`);
  })
);
// Test Route
app.get("/testlisting", async (req, res) => {
  let samplelisting = new Listing({
    title: "my home",
    description: "by the beach",
    price: 1200,
    location: "up",
    country: "india",
  });

  await samplelisting.save();

  console.log("sample was saved");

  res.send("success");
});

// Server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
// Check Route
app.get("/check", async (req, res) => {
    const listings = await Listing.find({});

    listings.forEach((listing) => {
        console.log(listing.title);
        console.log(listing.image);
        console.log("--------------");
    });

    res.send("Check terminal");
});


app.use((err, req, res, next) => {
  console.log(err);


  if (err.name === "ValidationError") {
    return res.status(400).render("error.ejs", {
      error: err.message,
    });
  }

  res.status(500).render("error.ejs", {
    error: "Something went wrong",
  });
});


// Error Handling Middleware (MUST BE LAST)
app.use((err, req, res, next) => {
  console.log("ERROR HANDLER REACHED");
  console.log(err);

  let { statusCode = 500, message = "Something went wrong" } = err;

  res.status(statusCode).render("error", {
    error: message,
  });
});


