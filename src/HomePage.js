import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function HomePage() {
  // --- STATE QUẢN LÝ DANH SÁCH & TÍNH NĂNG ---
  const [students, setStudents] = useState([]); 
  const [searchTerm, setSearchTerm] = useState(""); // Bài 5: Tìm kiếm
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [stuClass, setStuClass] = useState("");
  const [sortAsc, setSortAsc] = useState(true); // Bài 6: Sắp xếp (true: A -> Z)

  // --- HÀM FETCH DANH SÁCH (Bài 1) ---
  useEffect(() => {
    // Gọi API để lấy danh sách khi component load
    axios.get('http://localhost:5000/api/students')
      .then(response => setStudents(response.data))
      .catch(error => console.error("Lỗi khi fetch danh sách:", error));
  }, []);

  // --- HÀM XỬ LÝ THÊM HỌC SINH (Bài 2) ---
  const handleAddStudent = (e) => {
    e.preventDefault(); 
    
    const newStu = { 
        name, 
        age: Number(age), 
        class: stuClass 
    };
    
    axios.post('http://localhost:5000/api/students', newStu)
      .then(res => {
        console.log("Đã thêm:", res.data);
        setStudents(prev => [...prev, res.data]); 
        
        // Xóa nội dung form
        setName(""); 
        setAge(""); 
        setStuClass("");
      })
      .catch(err => console.error("Lỗi khi thêm:", err));
  };
  
  // --- HÀM XỬ LÝ XÓA HỌC SINH (Bài 4) ---
  const handleDelete = (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa học sinh này?")) return;
    
    axios.delete(`http://localhost:5000/api/students/${id}`)
      .then(res => {
        console.log(res.data.message);
        setStudents(prevList => prevList.filter(s => s._id !== id));
      })
      .catch(err => console.error("Lỗi khi xóa:", err));
  };

  // Bài 5: Lọc danh sách học sinh
  const filteredStudents = students.filter(s =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) // So sánh không phân biệt hoa thường
  );
  
  // Bài 6: Sắp xếp danh sách đã lọc
  const sortedStudents = [...filteredStudents].sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      
      // Logic so sánh theo sortAsc (A->Z hoặc Z->A)
      if (nameA < nameB) return sortAsc ? -1 : 1;
      if (nameA > nameB) return sortAsc ? 1 : -1;
      return 0;
  });

  return (
    <div className="App" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>Ứng dụng Quản lý Học sinh MERN Stack</h1>
      
      {/* --- TÌM KIẾM HỌC SINH (Bài 5) --- */}
      <div style={{ marginBottom: '10px' }}>
          <h3>Tìm Kiếm Học Sinh</h3>
          <input
              type="text"
              placeholder="Tìm kiếm theo tên..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: '1px solid #ccc' }}
          />
      </div>

      {/* --- SẮP XẾP HỌC SINH (Bài 6) --- */}
      <button 
          onClick={() => setSortAsc(prev => !prev)}
          style={{ padding: '10px', cursor: 'pointer', marginBottom: '20px', border: '1px solid #007bff', backgroundColor: '#e9f5ff' }}
      >
          Sắp xếp theo tên: {sortAsc ? 'A → Z' : 'Z → A'}
      </button>

      {/* --- FORM THÊM HỌC SINH (Bài 2) --- */}
      <div style={{ marginBottom: '30px', padding: '15px', border: '1px solid #ccc', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
        <h3>Thêm Học Sinh Mới</h3>
        <form onSubmit={handleAddStudent} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input 
                type="text" 
                placeholder="Họ tên" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                required 
                style={{ padding: '8px', border: '1px solid #ccc' }}
            />
            <input 
                type="number" 
                placeholder="Tuổi" 
                value={age} 
                onChange={e => setAge(e.target.value)} 
                required 
                style={{ padding: '8px', border: '1px solid #ccc' }}
            />
            <input 
                type="text" 
                placeholder="Lớp" 
                value={stuClass} 
                onChange={e => setStuClass(e.target.value)} 
                required 
                style={{ padding: '8px', border: '1px solid #ccc' }}
            />
            <button type="submit" style={{ padding: '8px 15px', cursor: 'pointer', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '3px' }}>
                Thêm học sinh
            </button>
        </form>
      </div>

      {/* --- HIỂN THỊ DANH SÁCH (Bài 1, 3, 4, 5, 6) --- */}
      <div>
        <h2>Danh sách học sinh hiện tại ({sortedStudents.length} học sinh)</h2>
        {students.length === 0 ? (
          <p>Chưa có học sinh nào trong cơ sở dữ liệu.</p>
        ) : (
          <table border="1" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f1f1' }}>
                <th style={{ padding: '10px', textAlign: 'left' }}>Họ tên</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>Tuổi</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>Lớp</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {/* Vòng lặp sử dụng danh sách ĐÃ SẮP XẾP */}
              {sortedStudents.map(s => (
                <tr key={s._id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '8px' }}>{s.name}</td>
                  <td style={{ padding: '8px' }}>{s.age}</td>
                  <td style={{ padding: '8px' }}>{s.class}</td>
                  <td style={{ padding: '8px', display: 'flex', gap: '5px', alignItems: 'center' }}>
                    
                    {/* NÚT SỬA (Bài 3) */}
                    <Link to={`/edit/${s._id}`} style={{ textDecoration: 'none' }}>
                        <button style={{ 
                            padding: '5px 10px', 
                            cursor: 'pointer', 
                            backgroundColor: '#4CAF50', 
                            color: 'white', 
                            border: 'none',
                            borderRadius: '3px'
                        }}>
                            Sửa
                        </button>
                    </Link>
                    
                    {/* NÚT XÓA (Bài 4) */}
                    <button 
                        onClick={() => handleDelete(s._id)} 
                        style={{ 
                            padding: '5px 10px', 
                            cursor: 'pointer',
                            backgroundColor: '#f44336', 
                            color: 'white', 
                            border: 'none',
                            borderRadius: '3px'
                        }}
                    >
                        Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}

export default HomePage;