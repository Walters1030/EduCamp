const mongoose = require('mongoose');
const ProductSchema = new mongoose.Schema({
    pname: String,
    pdesc: String,
    price: Number,
    category: String,
    pimages: [String],
    addedBy: mongoose.Schema.Types.ObjectId,
    department: String
  });
  module.exports = mongoose.model('Products', ProductSchema);