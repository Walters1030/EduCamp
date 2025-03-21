const mongoose = require('mongoose');
const SubjectSchema = new mongoose.Schema({
    sname: String,
    tname: String,
    year: String,
    category: String,
    grade: Number,
    tprice: Number,
    addedBy: mongoose.Schema.Types.ObjectId,
    department: String,
    videoUrl: String
  });
  module.exports = mongoose.model('Subjects', SubjectSchema);