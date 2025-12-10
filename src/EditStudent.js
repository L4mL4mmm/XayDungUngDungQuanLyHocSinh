import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

function EditStudent() {
    const { id } = useParams(); // Lấy ID của học sinh từ URL
    const navigate = useNavigate(); // Hook để điều hướng sau khi update

    const [name, setName] = useState("");
    const [age, setAge] = useState("");
    const [stuClass, setStuClass] = useState("");
    const [loading, setLoading] = useState(true);

    // --- FETCH DỮ LIỆU HIỆN TẠI (GET /api/students/:id) ---
    useEffect(() => {
        // Gọi API chi tiết để lấy thông tin học sinh hiện tại
        axios.get(`http://localhost:5000/api/students/${id}`)
            .then(res => {
                setName(res.data.name);
                setAge(res.data.age);
                setStuClass(res.data.class);
                setLoading(false);
            })
            .catch(err => {
                console.error("Lỗi khi lấy dữ liệu học sinh:", err);
                setLoading(false);
            });
    }, [id]); 

    // --- HÀM XỬ LÝ CẬP NHẬT (PUT /api/students/:id) ---
    const handleUpdate = (e) => {
        e.preventDefault();

        // Gửi yêu cầu PUT để cập nhật
        axios.put(`http://localhost:5000/api/students/${id}`, {
            name, 
            age: Number(age), 
            class: stuClass
        })
        .then(res => {
            console.log("Đã cập nhật:", res.data);
            alert("Cập nhật thành công!");
            // Điều hướng về trang chủ sau khi cập nhật (sẽ kích hoạt HomePage fetch lại danh sách)
            navigate("/"); 
        })
        .catch(err => console.error("Lỗi khi cập nhật:", err));
    };

    if (loading) {
        return <h2 style={{ padding: '20px' }}>Đang tải thông tin...</h2>;
    }

    return (
        <div style={{ padding: '20px' }}>
            <h2>Chỉnh Sửa Học Sinh: {name}</h2>
            <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', width: '300px', gap: '10px' }}>
                <input 
                    type="text" 
                    placeholder="Họ tên" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    required 
                />
                <input 
                    type="number" 
                    placeholder="Tuổi" 
                    value={age} 
                    onChange={e => setAge(e.target.value)} 
                    required 
                />
                <input 
                    type="text" 
                    placeholder="Lớp" 
                    value={stuClass} 
                    onChange={e => setStuClass(e.target.value)} 
                    required 
                />
                <button type="submit">Cập nhật thông tin</button>
                <button type="button" onClick={() => navigate("/")} style={{ backgroundColor: '#ccc' }}>Hủy bỏ</button>
            </form>
        </div>
    );
}

export default EditStudent;