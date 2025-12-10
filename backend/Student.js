const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const studentSchema = new Schema({
  name: { 
    type: String, 
    required: [true, 'Tên học sinh là bắt buộc'],
    trim: true,
    minlength: [2, 'Tên học sinh phải có ít nhất 2 ký tự'],
    maxlength: [100, 'Tên học sinh không được vượt quá 100 ký tự']
  },
  age: { 
    type: Number, 
    required: [true, 'Tuổi là bắt buộc'],
    min: [1, 'Tuổi phải lớn hơn 0'],
    max: [120, 'Tuổi không hợp lệ'],
    validate: {
      validator: Number.isInteger,
      message: 'Tuổi phải là số nguyên'
    }
  },
  class: { 
    type: String, 
    required: [true, 'Lớp là bắt buộc'],
    trim: true,
    maxlength: [50, 'Tên lớp không được vượt quá 50 ký tự']
  }
}, { 
  collection: 'students',
  timestamps: true // Tự động thêm createdAt và updatedAt
});

module.exports = mongoose.model('Student', studentSchema);