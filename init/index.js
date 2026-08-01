const mongoose = require("mongoose");
const data = require("./data.js");
const Listing = require("../maj pro/models/listing.js");

require("dotenv").config({ path: "maj pro/.env" });

const MONGO_URL = process.env.ATLASDB_URL;

main()
  .then(async () => {
    console.log("connected to DB");
    await initDB();
    mongoose.connection.close();
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  await Listing.deleteMany({});

  const newData = data.data.map((obj) => ({
    ...obj,
    owner: new mongoose.Types.ObjectId("652d0081ae547c5d37e565f1"),
  }));

  console.log("Number of listings to insert:", newData.length);

  await Listing.insertMany(newData);

  console.log("data was initialized");

  const count = await Listing.countDocuments();
  console.log("Listings in database:", count);
};