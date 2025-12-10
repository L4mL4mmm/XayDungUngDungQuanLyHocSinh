import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './HomePage'; // Import component HomePage mới
import EditStudent from './EditStudent'; // Import component EditStudent mới

function App() {
  return (
    // Cấu hình routes: Trang chủ (/) và Trang sửa (/edit/:id)
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/edit/:id" element={<EditStudent />} /> 
    </Routes>
  );
}

export default App;