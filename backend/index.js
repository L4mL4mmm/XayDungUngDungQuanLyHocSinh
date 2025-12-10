const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Student = require('./Student');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/student_db';

// --- MIDDLEWARE ---
app.use(cors()); 
app.use(express.json({ limit: '10mb' })); // Limit request size

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// --- KẾT NỐI MONGODB ---
mongoose.connect(MONGODB_URI)
  .then(() => console.log("✅ Đã kết nối MongoDB thành công"))
  .catch(err => {
    console.error("❌ Lỗi kết nối MongoDB:", err);
    process.exit(1); // Exit if MongoDB connection fails
  });

// MongoDB connection event handlers
mongoose.connection.on('disconnected', () => {
  console.warn("⚠️ MongoDB đã ngắt kết nối");
});

mongoose.connection.on('reconnected', () => {
  console.log("✅ MongoDB đã kết nối lại");
});


// --- HELPER FUNCTION ---
// Validate MongoDB ObjectId
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// Standard error response
const sendError = (res, statusCode, message) => {
  return res.status(statusCode).json({ 
    success: false,
    error: message 
  });
};

// Standard success response
const sendSuccess = (res, data, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data: data
  });
};

// --- HEALTH CHECK ---
app.get('/api/health', (req, res) => {
  const healthStatus = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  };
  res.json(healthStatus);
});

// --- ROUTES API (CRUD) ---

// 1. READ (All): Lấy danh sách tất cả học sinh
app.get('/api/students', async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 }); // Sort by newest first
    return sendSuccess(res, students);
  } catch (err) {
    console.error('Error fetching students:', err);
    return sendError(res, 500, 'Không thể lấy danh sách học sinh');
  }
});

// 1b. READ (Single): Lấy thông tin chi tiết một học sinh theo ID
app.get('/api/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!isValidObjectId(id)) {
      return sendError(res, 400, 'ID không hợp lệ');
    }

    const student = await Student.findById(id);
    if (!student) {
      return sendError(res, 404, 'Không tìm thấy học sinh');
    }
    
    return sendSuccess(res, student);
  } catch (err) {
    console.error('Error fetching student:', err);
    return sendError(res, 500, 'Không thể lấy thông tin học sinh');
  }
});


// 2. CREATE: Thêm học sinh mới
app.post('/api/students', async (req, res) => {
  try {
    const { name, age, class: stuClass } = req.body;

    // Basic validation
    if (!name || !age || !stuClass) {
      return sendError(res, 400, 'Vui lòng điền đầy đủ thông tin (tên, tuổi, lớp)');
    }

    // Trim and validate input
    const trimmedName = name.trim();
    const trimmedClass = stuClass.trim();
    const ageNum = Number(age);

    if (!trimmedName) {
      return sendError(res, 400, 'Tên học sinh không được để trống');
    }

    if (isNaN(ageNum) || !Number.isInteger(ageNum)) {
      return sendError(res, 400, 'Tuổi phải là số nguyên');
    }

    if (ageNum < 1 || ageNum > 120) {
      return sendError(res, 400, 'Tuổi phải từ 1 đến 120');
    }

    const newStudent = await Student.create({
      name: trimmedName,
      age: ageNum,
      class: trimmedClass
    });

    return sendSuccess(res, newStudent, 201);
  } catch (err) {
    console.error('Error creating student:', err);
    
    // Handle Mongoose validation errors
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message).join(', ');
      return sendError(res, 400, messages);
    }
    
    return sendError(res, 500, 'Không thể thêm học sinh');
  }
});

// 3. UPDATE: Cập nhật thông tin học sinh theo ID
app.put('/api/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, age, class: stuClass } = req.body;

    if (!isValidObjectId(id)) {
      return sendError(res, 400, 'ID không hợp lệ');
    }

    // Build update object with only provided fields
    const updateData = {};
    if (name !== undefined) {
      const trimmedName = name.trim();
      if (!trimmedName) {
        return sendError(res, 400, 'Tên học sinh không được để trống');
      }
      updateData.name = trimmedName;
    }
    
    if (age !== undefined) {
      const ageNum = Number(age);
      if (isNaN(ageNum) || !Number.isInteger(ageNum)) {
        return sendError(res, 400, 'Tuổi phải là số nguyên');
      }
      if (ageNum < 1 || ageNum > 120) {
        return sendError(res, 400, 'Tuổi phải từ 1 đến 120');
      }
      updateData.age = ageNum;
    }
    
    if (stuClass !== undefined) {
      updateData.class = stuClass.trim();
    }

    const updatedStu = await Student.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedStu) {
      return sendError(res, 404, 'Không tìm thấy học sinh');
    }

    return sendSuccess(res, updatedStu);
  } catch (err) {
    console.error('Error updating student:', err);
    
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message).join(', ');
      return sendError(res, 400, messages);
    }
    
    return sendError(res, 500, 'Không thể cập nhật thông tin học sinh');
  }
});

// 4. DELETE: Xóa học sinh theo ID
app.delete('/api/students/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return sendError(res, 400, 'ID không hợp lệ');
    }

    const deleted = await Student.findByIdAndDelete(id);

    if (!deleted) {
      return sendError(res, 404, 'Không tìm thấy học sinh');
    }

    return sendSuccess(res, { 
      message: 'Đã xóa học sinh thành công',
      id: deleted._id 
    });
  } catch (err) {
    console.error('Error deleting student:', err);
    return sendError(res, 500, 'Không thể xóa học sinh');
  }
});

// 404 handler for undefined routes
app.use((req, res) => {
  sendError(res, 404, 'API endpoint không tồn tại');
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  sendError(res, 500, 'Lỗi máy chủ nội bộ');
});


// --- KHỞI ĐỘNG SERVER EXPRESS ---
const server = app.listen(PORT, () => {
  console.log(`🌍 Express server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});