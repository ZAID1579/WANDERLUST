const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const passportLocalMongoose =
  require("passport-local-mongoose").default;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
});
// Apply plugin BEFORE creating model
userSchema.plugin(passportLocalMongoose);
const User = mongoose.model("User", userSchema);
console.log("authenticate =", typeof User.authenticate);
module.exports = User;