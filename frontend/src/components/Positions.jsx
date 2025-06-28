import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { fetchPositions } from '../services/api';

const Positions = ({ active }) => {
  const [positions, setPositions] = useState([]);
  const [search, setSearch] = useState('');
  const [modalData, setModalData] = useState(null);
  const [modalMode, setModalMode] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const loadPositions = async () => {
    try {
      showSpinner('positions');
      const data = await fetchPositions();
      setPositions(data);
    } catch (error) {
      console.error('Lỗi khi tải vị trí:', error);
    } finally {
      hideSpinner('positions');
    }
  };

  useEffect(() => {
    if (active) loadPositions();
  }, [active]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, rowsPerPage]);

  const filteredPositions = positions.filter(pos =>
    pos.title.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPositions.length / rowsPerPage);
  const paginatedPositions = filteredPositions.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const openModal = (mode, id = null) => {
    setModalMode(mode);
    let position = { title: '', level: '', base_salary: 0 };
    if (id !== null) {
      const found = positions.find(p => p.id === id);
      if (found) position = found;
    }
    setModalData(position);
    setTimeout(() => {
      document.getElementById('posTitle').value = position.title;
      document.getElementById('posLevel').value = position.level;
      document.getElementById('posSalary').value = position.base_salary;
      document.getElementById('addPositionModalLabel').innerText =
        mode === 'edit' ? 'Sửa Vị trí' : 'Thêm Vị trí';
      const inputs = document.querySelectorAll('#addPositionModal input');
      inputs.forEach(input => input.disabled = mode === 'view');
      new bootstrap.Modal(document.getElementById('addPositionModal')).show();
    }, 0);
  };

  const API_URL = 'http://localhost:8003/api/positions/';

  const deletePosition = async (id) => {
    try {
      await axios.delete(`${API_URL}${id}/`);
      setPositions(positions.filter(p => p.id !== id));
      showToast('Đã xóa vị trí thành công!');
    } catch (error) {
      console.error('Lỗi khi xóa vị trí:', error);
    }
  };

  window.savePosition = async () => {
    const title = document.getElementById('posTitle').value;
    const level = document.getElementById('posLevel').value;
    const base_salary = parseFloat(document.getElementById('posSalary').value);
    const data = { title, level, base_salary };
    try {
      if (modalData && modalData.id) {
        await axios.put(`${API_URL}${modalData.id}/`, data);
      } else {
        await axios.post(API_URL, data);
      }
      loadPositions();
      new bootstrap.Modal(document.getElementById('addPositionModal')).hide();
      showToast('Đã lưu vị trí thành công!');
    } catch (error) {
      console.error('Lỗi khi lưu vị trí:', error);
    }
  };

  return (
    <div id="positions" className={`section ${active ? '' : 'hidden'}`}>
      <h2 className="text-2xl font-bold mb-4">Quản lý Vị trí</h2>

      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <input
          type="text"
          placeholder="Tìm theo tên vị trí..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 border rounded-lg min-w-[200px]"
        />
        <button className="custom-btn" onClick={() => openModal('add')}>
          <i className="fas fa-plus mr-2"></i>Thêm Vị trí
        </button>
        <button className="custom-btn" onClick={loadPositions}>
          <i className="fas fa-sync-alt mr-2"></i>Làm mới
        </button>
        <select
          value={rowsPerPage}
          onChange={(e) => setRowsPerPage(parseInt(e.target.value))}
          className="border border-gray-300 rounded-lg p-2"
        >
          {[5, 10, 20, 50].map(num => (
            <option key={num} value={num}>{num} dòng</option>
          ))}
        </select>
      </div>

      <div className="card relative shadow">
        <div className="spinner-overlay" id="positionsSpinner">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
        </div>
        <div className="overflow-y-auto" style={{ maxHeight: '400px' }}>
          <table className="w-full bg-white rounded-lg">
            <thead className="sticky top-0 bg-gray-200 z-10">
              <tr>
                <th className="p-2 text-left">Tên</th>
                <th className="p-2 text-left">Cấp bậc</th>
                <th className="p-2 text-left">Lương cơ bản</th>
                <th className="p-2 text-left">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPositions.map(pos => (
                <tr key={pos.id}>
                  <td className="p-2">{pos.title}</td>
                  <td className="p-2">{pos.level}</td>
                  <td className="p-2">{pos.base_salary.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</td>
                  <td className="p-2">
                    <button className="custom-btn-edit me-2" onClick={() => openModal('edit', pos.id)}>
                      <i className="fas fa-edit"></i> Sửa
                    </button>
                    <button className="custom-btn-del text-danger" onClick={() => deletePosition(pos.id)}>
                      <i className="fas fa-trash"></i> Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {paginatedPositions.length === 0 && (
          <div className="text-center p-4 text-gray-500">Không có dữ liệu</div>
        )}

        <div className="flex justify-center items-center mt-4 gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="btn btn-outline-primary"
          >
            ← Trước
          </button>
          <span>Trang {currentPage} / {totalPages || 1}</span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="btn btn-outline-primary"
          >
            Tiếp →
          </button>
        </div>
      </div>
    </div>
  );
};

export default Positions;
