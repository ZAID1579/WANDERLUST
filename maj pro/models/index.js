const mongoose = require("mongoose");
const data = require("../../init/data.js");
const Listing = require("./listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(async () => {
    console.log("connected to DB");
    await initDB();
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

  await Listing.insertMany(newData);

  console.log("data was initialized");
};