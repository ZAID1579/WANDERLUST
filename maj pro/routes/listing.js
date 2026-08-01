const express = require("express");
const router = express.Router();

const { listingSchema } = require("../../schema.js");
const ExpressError = require("../models/ExpressError");
const Listing = require("../models/listing.js");
const { isLoggedIn } = require("./middleware.js");

const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

const validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);

  if (error) {
    const errMsg = error.details.map((el) => el.message).join(", ");
    throw new ExpressError(400, errMsg);
  }

  next();
};

// Index Route with Search
router.get("/", async (req, res, next) => {
  try {
    const { country } = req.query;

    let filter = {};

    if (country && country.trim() !== "") {
      filter.country = {
        $regex: country.trim(),
        $options: "i",
      };
    }

    const alllistings = await Listing.find(filter);

    res.render("listings/index", {
      alllistings,
      country,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/new", isLoggedIn, (req, res) => {
  res.render("listings/new");
});

router.post(
  "/",
  isLoggedIn,
  upload.single("listing[image]"),
  validateListing,
  async (req, res, next) => {
    try {
      const newListing = new Listing(req.body.listing);

      if (req.file) {
        newListing.image = {
          url: req.file.path,
          filename: req.file.filename,
        };
      }

      newListing.owner = req.user._id;

      await newListing.save();

      req.flash("success", "New Listing Created");
      res.redirect("/listings");
    } catch (err) {
      next(err);
    }
  }
);

router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const listing = await Listing.findById(id)
      .populate("owner")
      .populate({
        path: "reviews",
        populate: {
          path: "author",
        },
      });

    if (!listing) {
      req.flash("error", "Listing you requested does not exist");
      return res.redirect("/listings");
    }

    res.render("listings/show", { listing });
  } catch (err) {
    next(err);
  }
});

router.get("/:id/edit", isLoggedIn, async (req, res, next) => {
  try {
    const { id } = req.params;

    const listing = await Listing.findById(id);

    if (!listing) {
      req.flash("error", "Listing you requested does not exist");
      return res.redirect("/listings");
    }

    res.render("listings/edit", { listing });
  } catch (err) {
    next(err);
  }
});

router.put(
  "/:id",
  isLoggedIn,
  upload.single("listing[image]"),
  validateListing,
  async (req, res, next) => {
    try {
      const { id } = req.params;

      const listing = await Listing.findByIdAndUpdate(id, req.body.listing, {
        runValidators: true,
        new: true,
      });

      if (req.file) {
        listing.image = {
          url: req.file.path,
          filename: req.file.filename,
        };

        await listing.save();
      }

      req.flash("success", "Listing Updated Successfully");
      res.redirect(`/listings/${id}`);
    } catch (err) {
      next(err);
    }
  }
);

router.delete("/:id", isLoggedIn, async (req, res, next) => {
  try {
    const { id } = req.params;

    await Listing.findByIdAndDelete(id);

    req.flash("success", "Listing Deleted Successfully");
    res.redirect("/listings");
  } catch (err) {
    next(err);
  }
});

module.exports = router;