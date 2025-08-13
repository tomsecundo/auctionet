import React from 'react';
import '../Modal.css'; // For styling

const Modal = ({ message, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-content">
          <p>{message}</p>
          <button className="modal-close-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default Modal;