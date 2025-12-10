const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
// body-parser đã được tích hợp vào express.json() từ Express 4.16+
const Student = require('./Student'); // Import Model Student (từ file Student.js)

const app = express();
const PORT = 5000; // Server chạy trên cổng 5000 [cite: 28]

// --- MIDDLEWARE ---
// Cho phép frontend truy cập API (CORS) [cite: 29]
app.use(cors()); 

// Parse JSON request body [cite: 29]
app.use(express.json());

// --- KẾT NỐI MONGODB ---
mongoose.connect('mongodb://localhost:27017/student_db') // Kết nối đến container MongoDB [cite: 47, 48]
  .then(() => console.log("✅ Đã kết nối MongoDB thành công"))
  .catch(err => console.error("❌ Lỗi kết nối MongoDB:", err));


// --- ROUTES API (CRUD) ---
// Đảm bảo tiền tố route API là /api [cite: 69]

// 1. READ (All): Lấy danh sách tất cả học sinh (GET /api/students) [cite: 60]
app.get('/api/students', async (req, res) => {
  try {
    const students = await Student.find(); // Tìm tất cả documents
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 1b. READ (Single): Lấy thông tin chi tiết một học sinh theo ID (Sử dụng cho Edit) [cite: 178]
app.get('/api/students/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// 2. CREATE: Thêm học sinh mới (POST /api/students) [cite: 96]
app.post('/api/students', async (req, res) => {
  try {
    // req.body chứa thông tin { name, age, class }
    const newStudent = await Student.create(req.body); // tạo document mới từ dữ liệu gửi lên [cite: 98]
    res.status(201).json(newStudent); // Trả về 201 Created và dữ liệu [cite: 100]
  } catch (e) {
    res.status(400).json({ error: e.message }); // Lỗi Validation
  }
});

// 3. UPDATE: Cập nhật thông tin học sinh theo ID (PUT /api/students/:id) [cite: 157]
app.put('/api/students/:id', async (req, res) => {
  try {
    const updatedStu = await Student.findByIdAndUpdate(
      req.params.id, // ID từ URL [cite: 161]
      req.body, // Dữ liệu cần cập nhật [cite: 162]
      { new: true } // Trả về document sau khi update [cite: 163, 173]
    );

    if (!updatedStu) {
      return res.status(404).json({ error: "Student not found" }); // ID không tồn tại [cite: 166, 174]
    }
    res.json(updatedStu); // Trả về học sinh đã được cập nhật [cite: 167]
  } catch (err) {
    res.status(400).json({ error: err.message }); // Lỗi Validation [cite: 170]
  }
});

// 4. DELETE: Xóa học sinh theo ID (DELETE /api/students/:id) [cite: 240]
app.delete('/api/students/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const deleted = await Student.findByIdAndDelete(id); // Xóa document khỏi DB [cite: 244]

    if (!deleted) {
      return res.status(404).json({ error: "Student not found" }); // ID không tồn tại [cite: 245]
    }
    res.json({ message: "Đã xóa học sinh", id: deleted._id }); // Trả về thông báo thành công [cite: 247]
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// --- KHỞI ĐỘNG SERVER EXPRESS ---
app.listen(PORT, () => {
  console.log(`🌍 Express server running on port ${PORT}`);
});