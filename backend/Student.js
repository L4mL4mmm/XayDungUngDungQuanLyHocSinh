const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const studentSchema = new Schema({
  name: { type: String, required: true }, // Tên (bắt buộc) [cite: 53]
  age: { type: Number, required: true },  // Tuổi (bắt buộc) [cite: 53]
  class: { type: String, required: true } // Lớp (bắt buộc) [cite: 53]
}, { collection: 'students' }); // Tên collection trong MongoDB [cite: 54]

module.exports = mongoose.model('Student', studentSchema); // Export Model [cite: 55]