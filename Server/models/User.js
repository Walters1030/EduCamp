const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
  pid: String,
  username: String,
  password: String,
  mobile: { type: Number, unique: true },
  email: String,
  department: String,
  Likes: [{ type: { type: String }, id: mongoose.Schema.Types.ObjectId }]
});
module.exports = mongoose.model('Users', UserSchema);