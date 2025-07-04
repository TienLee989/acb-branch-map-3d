import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { fetchTrainings } from '../services/api';

const Trainings = ({ active }) => {
  const [trainings, setTrainings] = useState([]);
  const [search, setSearch] = useState('');
  const [modalData, setModalData] = useState(null);
  const [modalMode, setModalMode] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(0);

  const loadTrainings = async () => {
    try {
      showSpinner('trainings');
      const data = await fetchTrainings();
      setTrainings(data);
    } catch (error) {
      console.error('Lỗi khi tải đào tạo:', error);
    } finally {
      hideSpinner('trainings');
    }
  };

  useEffect(() => {
    if (active) loadTrainings();
  }, [active]);

  useEffect(() => {
    setCurrentPage(0);
  }, [search, rowsPerPage]);

  const filteredTrainings = trainings.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredTrainings.length / rowsPerPage);
  const paginatedTrainings = filteredTrainings.slice(
    currentPage * rowsPerPage,
    currentPage * rowsPerPage + rowsPerPage
  );

  const openModal = (mode, id = null) => {
    setModalMode(mode);
    let training = { title: '', description: '', date_range: '' };
    if (id !== null) {
      const found = trainings.find(t => t.id === id);
      if (found) training = found;
    }
    setModalData(training);
    setTimeout(() => {
      document.getElementById('trainingTitle').value = training.title;
      document.getElementById('trainingDesc').value = training.description;
      document.getElementById('trainingDateRange').value = training.date_range;
      document.getElementById('trainingModalLabel').innerText =
        mode === 'view' ? 'Xem Đào tạo' : mode === 'edit' ? 'Sửa Đào tạo' : 'Thêm Đào tạo';
      const inputs = document.querySelectorAll('#trainingModal input, #trainingModal textarea');
      inputs.forEach(input => input.disabled = mode === 'view');
      new bootstrap.Modal(document.getElementById('trainingModal')).show();
    }, 0);
  };

  const API_URL = 'http://localhost:8003/api/trainings/';

  const deleteTraining = async (id) => {
    try {
      await axios.delete(`${API_URL}${id}/`);
      setTrainings(trainings.filter(t => t.id !== id));
      showToast('Đã xóa đào tạo thành công!');
    } catch (error) {
      console.error('Lỗi khi xóa đào tạo:', error);
    }
  };

  window.saveTraining = async () => {
    if (modalMode === 'view') return;
    const title = document.getElementById('trainingTitle').value;
    const description = document.getElementById('trainingDesc').value;
    const date_range = document.getElementById('trainingDateRange').value;
    const data = { title, description, date_range };
    try {
      if (modalMode === 'edit') {
        await axios.put(`${API_URL}${modalData.id}/`, data);
      } else {
        await axios.post(API_URL, data);
      }
      loadTrainings();
      new bootstrap.Modal(document.getElementById('trainingModal')).hide();
      showToast('Đã lưu đào tạo thành công!');
    } catch (error) {
      console.error('Lỗi khi lưu đào tạo:', error);
    }
  };

  return (
    <div id="trainings" className={`section ${active ? '' : 'hidden'}`}>
      <h2 className="text-2xl font-bold mb-4">Quản lý Đào tạo</h2>

      <div className="flex flex-wrap gap-2 mb-4">
        <input
          type="text"
          placeholder="Tìm theo tiêu đề..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 border rounded-lg min-w-[200px]"
        />
        <button className="custom-btn" onClick={() => openModal('add')}>
          <i className="fas fa-plus mr-2"></i>Thêm Đào tạo
        </button>
        <button className="custom-btn" onClick={loadTrainings}>
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
        <div className="spinner-overlay" id="trainingsSpinner">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
        </div>
        <div className="overflow-y-auto" style={{ maxHeight: '400px' }}>
          <table className="w-full bg-white rounded-lg">
            <thead className="sticky top-0 bg-gray-200 z-10">
              <tr>
                <th className="p-2 text-left">Tiêu đề</th>
                <th className="p-2 text-left">Mô tả</th>
                <th className="p-2 text-left">Thời gian</th>
                <th className="p-2 text-left">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTrainings.map(t => (
                <tr key={t.id}>
                  <td className="p-2">{t.title}</td>
                  <td className="p-2">{t.description}</td>
                  <td className="p-2">{t.date_range}</td>
                  <td className="p-2">
                    <button className="custom-btn-view me-2" onClick={() => openModal('view', t.id)}>
                      <i className="fas fa-eye"></i> Xem
                    </button>
                    <button className="custom-btn-edit me-2" onClick={() => openModal('edit', t.id)}>
                      <i className="fas fa-edit"></i> Sửa
                    </button>
                    <button className="custom-btn-del text-danger" onClick={() => deleteTraining(t.id)}>
                      <i className="fas fa-trash"></i> Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredTrainings.length === 0 && (
          <div className="text-center p-4 text-gray-500">Không có dữ liệu</div>
        )}

        <div className="flex justify-center items-center mt-4 gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
            disabled={currentPage === 0}
            className="btn btn-outline-primary"
          >
            ← Trước
          </button>
          <span>Trang {currentPage + 1} / {totalPages || 1}</span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))}
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

export default Trainings;
