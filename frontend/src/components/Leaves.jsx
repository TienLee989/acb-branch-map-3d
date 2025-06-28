import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { fetchLeaves } from '../services/api';

const Leaves = ({ active }) => {
  const [leaves, setLeaves] = useState([]);
  const [search, setSearch] = useState('');
  const [modalData, setModalData] = useState(null);
  const [modalMode, setModalMode] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const loadLeaves = async () => {
    try {
      showSpinner('leaves');
      const data = await fetchLeaves();
      setLeaves(data);
    } catch (error) {
      console.error('Lỗi khi tải đơn nghỉ:', error);
    } finally {
      hideSpinner('leaves');
    }
  };

  useEffect(() => {
    if (active) loadLeaves();
  }, [active]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, rowsPerPage]);

  const filteredLeaves = leaves.filter(l =>
    l.employee?.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredLeaves.length / rowsPerPage);
  const paginatedLeaves = filteredLeaves.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const openModal = (mode, id = null) => {
    setModalMode(mode);
    let leave = { employee: '', type: '', from: '', to: '', reason: '', status: 'Pending' };
    if (id !== null) {
      const found = leaves.find(l => l.id === id);
      if (found) leave = found;
    }
    setModalData(leave);
    setTimeout(() => {
      document.getElementById('leaveEmployee').value = leave.employee;
      document.getElementById('leaveType').value = leave.type;
      document.getElementById('leaveFrom').value = leave.from;
      document.getElementById('leaveTo').value = leave.to;
      document.getElementById('leaveReason').value = leave.reason;
      document.getElementById('leaveStatus').value = leave.status;
      document.getElementById('leaveModalLabel').innerText =
        mode === 'view' ? 'Xem Đơn nghỉ' : mode === 'edit' ? 'Sửa Đơn nghỉ' : 'Thêm Đơn nghỉ';
      const inputs = document.querySelectorAll('#leaveModal input, #leaveModal textarea, #leaveModal select');
      inputs.forEach(input => input.disabled = mode === 'view');
      new bootstrap.Modal(document.getElementById('leaveModal')).show();
    }, 0);
  };

  const API_URL = 'http://localhost:8003/api/leaves/';

  const deleteLeave = async (id) => {
    try {
      await axios.delete(`${API_URL}${id}/`);
      setLeaves(leaves.filter(l => l.id !== id));
      showToast('Đã xóa đơn nghỉ thành công!');
    } catch (error) {
      console.error('Lỗi khi xóa đơn nghỉ:', error);
    }
  };

  window.saveLeave = async () => {
    if (modalMode === 'view') return;

    const employee = document.getElementById('leaveEmployee').value;
    const type = document.getElementById('leaveType').value;
    const from = document.getElementById('leaveFrom').value;
    const to = document.getElementById('leaveTo').value;
    const reason = document.getElementById('leaveReason').value;
    const status = document.getElementById('leaveStatus').value;

    const data = { employee, type, from, to, reason, status };

    try {
      if (modalMode === 'edit') {
        await axios.put(`${API_URL}${modalData.id}/`, data);
      } else {
        await axios.post(API_URL, data);
      }
      loadLeaves();
      new bootstrap.Modal(document.getElementById('leaveModal')).hide();
      showToast('Đã lưu đơn nghỉ thành công!');
    } catch (error) {
      console.error('Lỗi khi lưu đơn nghỉ:', error);
    }
  };

  return (
    <div id="leaves" className={`section ${active ? '' : 'hidden'}`}>
      <h2 className="text-2xl font-bold mb-4">Quản lý Đơn nghỉ</h2>

      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <input
          type="text"
          placeholder="Tìm theo tên nhân viên..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 border rounded-lg min-w-[200px]"
        />
        <button className="custom-btn" onClick={() => openModal('add')}>
          <i className="fas fa-plus mr-2"></i>Thêm Đơn nghỉ
        </button>
        <button className="custom-btn" onClick={loadLeaves}>
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
        <div className="spinner-overlay" id="leavesSpinner">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
        </div>
        
        <div className="overflow-y-auto" style={{ maxHeight: '400px' }}>
          <table className="w-full bg-white rounded-lg">
            <thead className="sticky top-0 bg-gray-200 z-10">
              <tr>
                <th className="p-2 text-left">Nhân viên</th>
                <th className="p-2 text-left">Loại</th>
                <th className="p-2 text-left">Từ</th>
                <th className="p-2 text-left">Đến</th>
                <th className="p-2 text-left">Lý do</th>
                <th className="p-2 text-left">Trạng thái</th>
                <th className="p-2 text-left">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {paginatedLeaves.map(l => (
                <tr key={l.id}>
                  <td className="p-2">{l.employee?.full_name}</td>
                  <td className="p-2">{l.type}</td>
                  <td className="p-2">{l.from_date}</td>
                  <td className="p-2">{l.to_date}</td>
                  <td className="p-2">{l.reason}</td>
                  <td className="p-2">{l.status}</td>
                  <td className="p-2">
                    <button className="custom-btn-view me-2" onClick={() => openModal('view', l.id)}>
                      <i className="fas fa-eye"></i> Xem
                    </button>
                    <button className="custom-btn-edit me-2" onClick={() => openModal('edit', l.id)}>
                      <i className="fas fa-edit"></i> Sửa
                    </button>
                    <button className="custom-btn-del text-danger" onClick={() => deleteLeave(l.id)}>
                      <i className="fas fa-trash"></i> Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {paginatedLeaves.length === 0 && (
          <div className="text-center p-4 text-gray-500">Không có dữ liệu</div>
        )}

        <div className="flex justify-center items-center mt-4 gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="btn btn-outline-primary"
          >
            ← Trước
          </button>
          <span>Trang {currentPage} / {totalPages || 1}</span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
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

export default Leaves;
