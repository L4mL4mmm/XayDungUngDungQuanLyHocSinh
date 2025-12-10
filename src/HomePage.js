import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DeleteConfirmModal from './DeleteConfirmModal';

function HomePage() {
  // --- STATE QUẢN LÝ DANH SÁCH & TÍNH NĂNG ---
  const [students, setStudents] = useState([]); 
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [stuClass, setStuClass] = useState("");
  const [sortAsc, setSortAsc] = useState(true);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ show: false, studentId: null, studentName: '' });
  const [submitting, setSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'card'

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // --- HÀM FETCH DANH SÁCH ---
  useEffect(() => {
    setLoading(true);
    axios.get('http://localhost:5000/api/students')
      .then(response => {
        setStudents(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Lỗi khi fetch danh sách:", error);
        toast.error('Không thể tải danh sách học sinh. Vui lòng thử lại!');
        setLoading(false);
      });
  }, []);

  // --- HÀM XỬ LÝ THÊM HỌC SINH ---
  const handleAddStudent = (e) => {
    e.preventDefault();
    setSubmitting(true);
    const newStu = { name, age: Number(age), class: stuClass };
    
    axios.post('http://localhost:5000/api/students', newStu)
      .then(res => {
        setStudents(prev => [...prev, res.data]); 
        setName(""); 
        setAge(""); 
        setStuClass("");
        toast.success(`Đã thêm học sinh ${res.data.name} thành công! 🎉`);
        setSubmitting(false);
      })
      .catch(err => {
        console.error("Lỗi khi thêm:", err);
        toast.error('Không thể thêm học sinh. Vui lòng thử lại!');
        setSubmitting(false);
      });
  };
  
  // --- HÀM XỬ LÝ XÓA HỌC SINH ---
  const handleDeleteClick = (id, studentName) => {
    setDeleteModal({ show: true, studentId: id, studentName });
  };

  const handleDeleteConfirm = () => {
    const { studentId } = deleteModal;
    axios.delete(`http://localhost:5000/api/students/${studentId}`)
      .then(() => {
        const deletedStudent = students.find(s => s._id === studentId);
        setStudents(prevList => prevList.filter(s => s._id !== studentId));
        setDeleteModal({ show: false, studentId: null, studentName: '' });
        toast.success(`Đã xóa học sinh ${deletedStudent?.name || ''} thành công!`);
      })
      .catch(err => {
        console.error("Lỗi khi xóa:", err);
        toast.error('Không thể xóa học sinh. Vui lòng thử lại!');
        setDeleteModal({ show: false, studentId: null, studentName: '' });
      });
  };

  // --- LOGIC LỌC & SẮP XẾP ---
  const filteredStudents = useMemo(() => {
    return students.filter(s =>
      s.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );
  }, [students, debouncedSearchTerm]);
  
  const sortedStudents = useMemo(() => {
    return [...filteredStudents].sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      
      if (nameA < nameB) return sortAsc ? -1 : 1;
      if (nameA > nameB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [filteredStudents, sortAsc]);

  // Get initials for avatar
  const getInitials = useCallback((name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }, []);

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <>
      {[...Array(5)].map((_, i) => (
        <tr key={i}>
          <td><div className="skeleton skeleton-text" style={{ width: '60%' }}></div></td>
          <td><div className="skeleton skeleton-text" style={{ width: '40px' }}></div></td>
          <td><div className="skeleton skeleton-text" style={{ width: '80px' }}></div></td>
          <td>
            <div className="d-flex justify-content-center gap-2">
              <div className="skeleton skeleton-text" style={{ width: '60px', height: '32px' }}></div>
              <div className="skeleton skeleton-text" style={{ width: '60px', height: '32px' }}></div>
            </div>
          </td>
        </tr>
      ))}
    </>
  );

  // Card view skeleton
  const CardSkeleton = () => (
    <div className="row g-3">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="col-md-6 col-lg-4">
          <div className="student-card">
            <div className="student-card-header">
              <div className="skeleton skeleton-avatar"></div>
              <div style={{ flex: 1 }}>
                <div className="skeleton skeleton-title"></div>
                <div className="skeleton skeleton-text" style={{ width: '50%' }}></div>
              </div>
            </div>
            <div className="skeleton skeleton-text mb-2"></div>
            <div className="skeleton skeleton-text" style={{ width: '70%' }}></div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <>
      <div className="container mt-4">
        <div className="card mb-4 border-0 shadow-lg">
          <div className="card-body p-4">
            <h1 className="text-center mb-2 display-5 fw-bold" style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              <i className="bi bi-people-fill me-2"></i>
              Quản lý Học sinh
            </h1>
            <p className="text-center text-muted">Hệ thống quản lý học sinh MERN Stack</p>
          </div>
        </div>
        
        {/* --- FORM THÊM HỌC SINH --- */}
        <div className="card shadow-lg p-4 mb-4 border-0">
          <h3 className="card-title mb-4 fw-bold text-success">
            <i className="bi bi-person-plus-fill me-2"></i>
            Thêm Học Sinh Mới
          </h3>
          <form onSubmit={handleAddStudent}>
            <div className="row g-3">
              <div className="col-md-3">
                <label className="form-label fw-semibold">
                  <i className="bi bi-person me-1"></i>
                  Họ tên
                </label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Nhập họ tên" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  required 
                  disabled={submitting}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label fw-semibold">
                  <i className="bi bi-calendar me-1"></i>
                  Tuổi
                </label>
                <input 
                  type="number" 
                  className="form-control"
                  placeholder="Nhập tuổi" 
                  value={age} 
                  onChange={e => setAge(e.target.value)} 
                  required 
                  min="1"
                  max="100"
                  disabled={submitting}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label fw-semibold">
                  <i className="bi bi-building me-1"></i>
                  Lớp
                </label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Nhập lớp" 
                  value={stuClass} 
                  onChange={e => setStuClass(e.target.value)} 
                  required 
                  disabled={submitting}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label fw-semibold">&nbsp;</label>
                <button 
                  type="submit" 
                  className="btn btn-success w-100 fw-semibold"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Đang thêm...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-plus-circle me-2"></i>
                      Thêm học sinh
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
        
        {/* --- TÌM KIẾM & SẮP XẾP --- */}
        <div className="card shadow-lg p-4 mb-4 border-0">
          <div className="row g-3 align-items-end">
            <div className="col-md-6">
              <label className="form-label fw-semibold">
                <i className="bi bi-search me-1"></i>
                Tìm kiếm
              </label>
              <div className="search-input-wrapper">
                <i className="bi bi-search search-icon"></i>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Tìm kiếm theo tên học sinh..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  aria-label="Tìm kiếm học sinh"
                />
                {searchTerm && (
                  <button
                    type="button"
                    className="search-clear-btn"
                    onClick={() => setSearchTerm('')}
                    aria-label="Xóa tìm kiếm"
                  >
                    <i className="bi bi-x-lg"></i>
                  </button>
                )}
              </div>
            </div>
            <div className="col-md-3">
              <label className="form-label fw-semibold">
                <i className="bi bi-arrow-down-up me-1"></i>
                Sắp xếp
              </label>
              <button 
                onClick={() => setSortAsc(prev => !prev)}
                className="btn btn-outline-primary w-100 fw-semibold"
                aria-label={`Sắp xếp ${sortAsc ? 'Z đến A' : 'A đến Z'}`}
              >
                <i className={`bi bi-sort-${sortAsc ? 'alpha-down' : 'alpha-down-alt'} me-2`}></i>
                {sortAsc ? 'A → Z' : 'Z → A'}
              </button>
            </div>
            <div className="col-md-3">
              <label className="form-label fw-semibold">
                <i className="bi bi-layout-split me-1"></i>
                Chế độ xem
              </label>
              <div className="view-toggle">
                <button
                  type="button"
                  className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
                  onClick={() => setViewMode('table')}
                  aria-label="Xem dạng bảng"
                  title="Xem dạng bảng"
                >
                  <i className="bi bi-table"></i>
                </button>
                <button
                  type="button"
                  className={`view-toggle-btn ${viewMode === 'card' ? 'active' : ''}`}
                  onClick={() => setViewMode('card')}
                  aria-label="Xem dạng thẻ"
                  title="Xem dạng thẻ"
                >
                  <i className="bi bi-grid-3x3-gap"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* --- HIỂN THỊ DANH SÁCH --- */}
        <div className="card shadow-lg border-0">
          <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="mb-0 fw-bold">
                <i className="bi bi-list-ul me-2"></i>
                Danh sách học sinh
              </h2>
              <span className="badge bg-primary fs-6 px-3 py-2">
                {sortedStudents.length} {sortedStudents.length === 1 ? 'học sinh' : 'học sinh'}
              </span>
            </div>

            {loading ? (
              viewMode === 'table' ? (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead>
                      <tr>
                        <th><i className="bi bi-person me-2"></i>Họ tên</th>
                        <th><i className="bi bi-calendar me-2"></i>Tuổi</th>
                        <th><i className="bi bi-building me-2"></i>Lớp</th>
                        <th style={{ width: '180px' }} className="text-center">
                          <i className="bi bi-gear me-2"></i>Hành động
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <LoadingSkeleton />
                    </tbody>
                  </table>
                </div>
              ) : (
                <CardSkeleton />
              )
            ) : students.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📚</div>
                <h4>Chưa có học sinh nào</h4>
                <p>Hãy thêm học sinh đầu tiên của bạn!</p>
              </div>
            ) : sortedStudents.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🔍</div>
                <h4>Không tìm thấy kết quả</h4>
                <p>Không có học sinh nào khớp với từ khóa "{debouncedSearchTerm}"</p>
                <button 
                  className="btn btn-outline-primary mt-3"
                  onClick={() => setSearchTerm('')}
                >
                  <i className="bi bi-x-circle me-2"></i>
                  Xóa bộ lọc
                </button>
              </div>
            ) : viewMode === 'table' ? (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead>
                    <tr>
                      <th><i className="bi bi-person me-2"></i>Họ tên</th>
                      <th><i className="bi bi-calendar me-2"></i>Tuổi</th>
                      <th><i className="bi bi-building me-2"></i>Lớp</th>
                      <th style={{ width: '180px' }} className="text-center">
                        <i className="bi bi-gear me-2"></i>Hành động
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedStudents.map(s => (
                      <tr key={s._id}>
                        <td className="fw-semibold" data-label="Họ tên">{s.name}</td>
                        <td data-label="Tuổi">
                          <span className="badge bg-info text-dark">{s.age} tuổi</span>
                        </td>
                        <td data-label="Lớp">
                          <span className="badge bg-secondary">{s.class}</span>
                        </td>
                        <td data-label="Hành động">
                          <div className="d-flex justify-content-center gap-2">
                            <Link to={`/edit/${s._id}`}>
                              <button 
                                className="btn btn-sm btn-warning fw-semibold"
                                aria-label={`Sửa thông tin ${s.name}`}
                              >
                                <i className="bi bi-pencil-square me-1"></i>
                                Sửa
                              </button>
                            </Link>
                            <button 
                              onClick={() => handleDeleteClick(s._id, s.name)} 
                              className="btn btn-sm btn-danger fw-semibold"
                              aria-label={`Xóa ${s.name}`}
                            >
                              <i className="bi bi-trash me-1"></i>
                              Xóa
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="row g-3">
                {sortedStudents.map(s => (
                  <div key={s._id} className="col-md-6 col-lg-4">
                    <div className="student-card">
                      <div className="student-card-header">
                        <div className="student-avatar">
                          {getInitials(s.name)}
                        </div>
                        <div className="student-info">
                          <div className="student-name">{s.name}</div>
                        </div>
                      </div>
                      <div className="student-meta">
                        <span className="badge bg-info text-dark">
                          <i className="bi bi-calendar me-1"></i>
                          {s.age} tuổi
                        </span>
                        <span className="badge bg-secondary">
                          <i className="bi bi-building me-1"></i>
                          {s.class}
                        </span>
                      </div>
                      <div className="student-actions">
                        <Link to={`/edit/${s._id}`} className="flex-grow-1">
                          <button 
                            className="btn btn-warning w-100 fw-semibold"
                            aria-label={`Sửa thông tin ${s.name}`}
                          >
                            <i className="bi bi-pencil-square me-1"></i>
                            Sửa
                          </button>
                        </Link>
                        <button 
                          onClick={() => handleDeleteClick(s._id, s.name)} 
                          className="btn btn-danger w-100 fw-semibold"
                          aria-label={`Xóa ${s.name}`}
                        >
                          <i className="bi bi-trash me-1"></i>
                          Xóa
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        show={deleteModal.show}
        onHide={() => setDeleteModal({ show: false, studentId: null, studentName: '' })}
        onConfirm={handleDeleteConfirm}
        studentName={deleteModal.studentName}
      />

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

export default HomePage;