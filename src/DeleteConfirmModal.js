import React from 'react';
import { Modal, Button } from 'react-bootstrap';

function DeleteConfirmModal({ show, onHide, onConfirm, studentName }) {
  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      centered 
      backdrop="static"
      keyboard={false}
      size="md"
      animation={true}
    >
      <Modal.Header closeButton className="bg-danger text-white">
        <Modal.Title className="d-flex align-items-center">
          <i className="bi bi-exclamation-triangle-fill me-2" style={{ fontSize: '1.5rem' }}></i>
          Xác nhận xóa học sinh
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="py-4">
        <div className="text-center mb-3">
          <div 
            style={{
              width: '80px',
              height: '80px',
              margin: '0 auto 1.5rem',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.1))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.5rem'
            }}
          >
            ⚠️
          </div>
        </div>
        <p className="text-center mb-3" style={{ fontSize: '1.0625rem', lineHeight: '1.6' }}>
          Bạn có chắc chắn muốn xóa học sinh{' '}
          <strong style={{ color: 'var(--danger-color)' }}>{studentName}</strong> không?
        </p>
        <div 
          className="text-center p-3 rounded"
          style={{ 
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)'
          }}
        >
          <p className="text-danger mb-0 fw-semibold">
            <i className="bi bi-info-circle me-2"></i>
            Hành động này không thể hoàn tác.
          </p>
        </div>
      </Modal.Body>
      <Modal.Footer className="border-top-0 pt-0">
        <Button 
          variant="secondary" 
          onClick={onHide}
          className="fw-semibold px-4"
          aria-label="Hủy xóa"
        >
          <i className="bi bi-x-circle me-2"></i>
          Hủy
        </Button>
        <Button 
          variant="danger" 
          onClick={onConfirm}
          className="fw-semibold px-4"
          aria-label={`Xác nhận xóa ${studentName}`}
        >
          <i className="bi bi-trash me-2"></i>
          Xóa học sinh
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default DeleteConfirmModal;

