import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { fetchDepartments } from '../services/api';

const Departments = ({ active }) => {
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState('');
  const [modalData, setModalData] = useState(null);
  const [modalMode, setModalMode] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(0);

  const loadDepartments = async () => {
    try {
      showSpinner('departments');
      const data = await fetchDepartments();
      setDepartments(data);
    } catch (error) {
      console.error('Lỗi khi tải phòng ban:', error);
    } finally {
      hideSpinner('departments');
    }
  };

  useEffect(() => {
    if (active) loadDepartments();
  }, [active]);

  useEffect(() => {
    setCurrentPage(0);
  }, [search, rowsPerPage]);

  const filteredDepartments = departments.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredDepartments.length / rowsPerPage);
  const paginatedDepartments = filteredDepartments.slice(
    currentPage * rowsPerPage,
    currentPage * rowsPerPage + rowsPerPage
  );

  const openModal = (mode, id = null) => {
    setModalMode(mode);
    let department = { name: '', description: '' };

    if (id !== null) {
      const found = departments.find(d => d.id === id);
      if (found) department = found;
    }

    setModalData(department);

    setTimeout(() => {
      document.getElementById('deptName').value = department.name;
      document.getElementById('deptDesc').value = department.description;
      document.getElementById('deptModalLabel').innerText =
        mode === 'view' ? 'Xem Phòng ban' : mode === 'edit' ? 'Sửa Phòng ban' : 'Thêm Phòng ban';

      const inputs = document.querySelectorAll('#deptModal input, #deptModal textarea');
      inputs.forEach(input => input.disabled = mode === 'view');

      new bootstrap.Modal(document.getElementById('deptModal')).show();
    }, 0);
  };

  const API_URL = 'http://localhost:8003/api/departments/';

  const deleteDepartment = async (id) => {
    try {
      await axios.delete(`${API_URL}${id}/`);
      setDepartments(departments.filter(d => d.id !== id));
      showToast('Đã xóa phòng ban thành công!');
    } catch (error) {
      console.error('Lỗi khi xóa phòng ban:', error);
    }
  };

  window.saveDepartment = async () => {
    if (modalMode === 'view') return;

    const name = document.getElementById('deptName').value;
    const description = document.getElementById('deptDesc').value;
    const data = { name, description };

    try {
      if (modalMode === 'edit') {
        await axios.put(`${API_URL}${modalData.id}/`, data);
      } else {
        await axios.post(API_URL, data);
      }
      loadDepartments();
      new bootstrap.Modal(document.getElementById('deptModal')).hide();
      showToast('Đã lưu phòng ban thành công!');
    } catch (error) {
      console.error('Lỗi khi lưu phòng ban:', error);
    }
  };

  return (
    <div id="departments" className={`section ${active ? '' : 'hidden'}`}>
      <h2 className="text-2xl font-bold mb-4">Quản lý Phòng ban</h2>

      <div className="flex flex-wrap gap-2 mb-4">
        <input
          type="text"
          placeholder="Tìm theo tên..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 border rounded-lg min-w-[200px]"
        />
        <button className="custom-btn" onClick={() => openModal('add')}>
          <i className="fas fa-plus mr-2"></i>Thêm Phòng ban
        </button>
        <button className="custom-btn" onClick={loadDepartments}>
          <i className="fas fa-sync-alt mr-2"></i>Làm mới
        </button>
        <select
          value={rowsPerPage}
          onChange={(e) => setRowsPerPage(parseInt(e.target.value))}
          className="p-2 border rounded-lg"
        >
          {[5, 10, 20, 50].map(n => (
            <option key={n} value={n}>{n} dòng</option>
          ))}
        </select>
      </div>

      <div className="card relative shadow">
        <div className="spinner-overlay" id="departmentsSpinner">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
        </div>

        <div className="overflow-y-auto" style={{ maxHeight: '400px' }}>
          <table className="w-full bg-white rounded-lg">
            <thead className="sticky top-0 bg-gray-200 z-10">
              <tr>
                <th className="p-2 text-left">Tên</th>
                <th className="p-2 text-left">Mô tả</th>
                <th className="p-2 text-left">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {paginatedDepartments.map(d => (
                <tr key={d.id}>
                  <td className="p-2">{d.name}</td>
                  <td className="p-2">{d.description}</td>
                  <td className="p-2">
                    <button className="custom-btn-view me-2" onClick={() => openModal('view', d.id)}>
                      <i className="fas fa-eye"></i> Xem
                    </button>
                    <button className="custom-btn-edit me-2" onClick={() => openModal('edit', d.id)}>
                      <i className="fas fa-edit"></i> Sửa
                    </button>
                    <button className="custom-btn-del text-danger" onClick={() => deleteDepartment(d.id)}>
                      <i className="fas fa-trash"></i> Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {paginatedDepartments.length === 0 && (
          <div className="text-center p-4 text-gray-500">Không có dữ liệu</div>
        )}

        <div className="flex justify-center items-center mt-4 gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 0))}
            disabled={currentPage === 0}
            className="btn btn-outline-primary"
          >
            ← Trước
          </button>
          <span>Trang {currentPage + 1} / {totalPages || 1}</span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages - 1))}
            disabled={currentPage >= totalPages - 1}
            className="btn btn-outline-primary"
          >
            Tiếp →
          </button>
        </div>
      </div>
    </div>
  );
};

export default Departments;
