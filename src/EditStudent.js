import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';

function EditStudent() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [age, setAge] = useState("");
    const [stuClass, setStuClass] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // --- FETCH DỮ LIỆU HIỆN TẠI ---
    useEffect(() => {
        setLoading(true);
        axios.get(`http://localhost:5000/api/students/${id}`)
            .then(res => {
                setName(res.data.name);
                setAge(res.data.age);
                setStuClass(res.data.class);
                setLoading(false);
            })
            .catch(err => {
                console.error("Lỗi khi lấy dữ liệu học sinh:", err);
                toast.error('Không thể tải thông tin học sinh. Vui lòng thử lại!');
                setLoading(false);
                setTimeout(() => navigate('/'), 2000);
            });
    }, [id, navigate]);

    // --- HÀM XỬ LÝ CẬP NHẬT ---
    const handleUpdate = (e) => {
        e.preventDefault();
        setSubmitting(true);

        axios.put(`http://localhost:5000/api/students/${id}`, {
            name, 
            age: Number(age), 
            class: stuClass
        })
        .then(res => {
            toast.success(`Đã cập nhật thông tin học sinh ${res.data.name} thành công! 🎉`);
            setSubmitting(false);
            setTimeout(() => navigate("/"), 1500);
        })
        .catch(err => {
            console.error("Lỗi khi cập nhật:", err);
            toast.error('Không thể cập nhật thông tin. Vui lòng thử lại!');
            setSubmitting(false);
        });
    };

    if (loading) {
        return (
            <div className="container mt-5">
                <div className="card shadow-lg border-0">
                    <div className="card-body text-center py-5">
                        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-3 text-muted">Đang tải thông tin học sinh...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="container mt-4">
                <div className="mb-4">
                    <Link to="/" className="btn btn-outline-primary mb-3" aria-label="Quay lại danh sách">
                        <i className="bi bi-arrow-left me-2"></i>
                        Quay lại danh sách
                    </Link>
                </div>

                <div className="card p-4 shadow-lg border-0">
                    <h2 className="card-title mb-4 fw-bold" style={{
                        background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                    }}>
                        <i className="bi bi-pencil-square me-2"></i>
                        Chỉnh Sửa Học Sinh: <span className="text-primary">{name}</span>
                    </h2>
                    
                    <form onSubmit={handleUpdate}>
                        <div className="mb-4">
                            <label className="form-label fw-semibold">
                                <i className="bi bi-person me-1"></i>
                                Họ tên
                            </label>
                            <input 
                                type="text" 
                                className="form-control form-control-lg"
                                value={name} 
                                onChange={e => setName(e.target.value)} 
                                required 
                                disabled={submitting}
                                placeholder="Nhập họ tên học sinh"
                            />
                        </div>
                        
                        <div className="mb-4">
                            <label className="form-label fw-semibold">
                                <i className="bi bi-calendar me-1"></i>
                                Tuổi
                            </label>
                            <input 
                                type="number" 
                                className="form-control form-control-lg"
                                value={age} 
                                onChange={e => setAge(e.target.value)} 
                                required 
                                min="1"
                                max="100"
                                disabled={submitting}
                                placeholder="Nhập tuổi"
                            />
                        </div>
                        
                        <div className="mb-4">
                            <label className="form-label fw-semibold">
                                <i className="bi bi-building me-1"></i>
                                Lớp
                            </label>
                            <input 
                                type="text" 
                                className="form-control form-control-lg"
                                value={stuClass} 
                                onChange={e => setStuClass(e.target.value)} 
                                required 
                                disabled={submitting}
                                placeholder="Nhập lớp"
                            />
                        </div>
                        
                        <div className="d-flex flex-wrap gap-3 mt-4 pt-3 border-top">
                            <button 
                                type="submit" 
                                className="btn btn-primary btn-lg fw-semibold px-4"
                                disabled={submitting}
                                aria-label="Cập nhật thông tin học sinh"
                            >
                                {submitting ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Đang cập nhật...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-check-circle me-2"></i>
                                        Cập nhật thông tin
                                    </>
                                )}
                            </button>
                            <button 
                                type="button" 
                                onClick={() => navigate("/")} 
                                className="btn btn-outline-secondary btn-lg fw-semibold px-4"
                                disabled={submitting}
                                aria-label="Hủy và quay lại"
                            >
                                <i className="bi bi-x-circle me-2"></i>
                                Hủy bỏ
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Toast Notifications */}
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={true}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
                style={{ marginTop: '4rem' }}
                toastStyle={{
                    borderRadius: '0.75rem',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    fontSize: '0.9375rem'
                }}
            />
        </>
    );
}

export default EditStudent;