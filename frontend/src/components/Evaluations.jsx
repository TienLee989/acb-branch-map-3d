import React, { useState, useEffect } from 'react';
import { fetchEvaluations } from '../services/api';

const Evaluations = ({ active }) => {
  const [evaluations, setEvaluations] = useState([]);
  const [search, setSearch] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(0); // bắt đầu từ 0

  const loadEvaluations = async () => {
    try {
      showSpinner('evaluations');
      const data = await fetchEvaluations();
      setEvaluations(data);
    } catch (error) {
      console.error('Lỗi khi tải đánh giá:', error);
    } finally {
      hideSpinner('evaluations');
    }
  };

  useEffect(() => {
    if (active) loadEvaluations();
  }, [active]);

  useEffect(() => {
    setCurrentPage(0); // reset về trang đầu khi tìm kiếm
  }, [search, rowsPerPage]);

  const filteredEvaluations = evaluations.filter(e =>
    e.employee?.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredEvaluations.length / rowsPerPage);
  const paginatedEvaluations = filteredEvaluations.slice(
    currentPage * rowsPerPage,
    (currentPage + 1) * rowsPerPage
  );

  return (
    <div id="evaluations" className={`section ${active ? '' : 'hidden'}`}>
      <h2 className="text-2xl font-bold mb-4">Đánh giá Nhân viên</h2>

      <div className="flex flex-wrap gap-2 mb-4">
        <input
          type="text"
          placeholder="Tìm theo tên nhân viên..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 border rounded-lg min-w-[200px]"
        />
        <button className="custom-btn" onClick={loadEvaluations}>
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
        <div className="spinner-overlay" id="evaluationsSpinner">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
        </div>
        <div className="overflow-y-auto" style={{ maxHeight: '400px' }}>
          <table className="w-full bg-white rounded-lg text-sm">
            <thead className="sticky top-0 bg-gray-200 z-10">
              <tr>
                <th className="p-2">Nhân viên</th>
                <th className="p-2">Kỳ</th>
                <th className="p-2">Điểm chuyên cần</th>
                <th className="p-2">Điểm thưởng</th>
                <th className="p-2">Kỷ luật</th>
                <th className="p-2">Đào tạo</th>
                <th className="p-2">Hiệu suất</th>
                <th className="p-2">Tổng</th>
                <th className="p-2">Xếp hạng PB</th>
                <th className="p-2">Xếp hạng CTY</th>
              </tr>
            </thead>
            <tbody>
              {paginatedEvaluations.map(e => (
                <tr key={e.id}>
                  <td className="p-2">{e.employee?.full_name || '—'}</td>
                  <td className="p-2">{e.evaluation_period}</td>
                  <td className="p-2">{e.attendance_score}</td>
                  <td className="p-2">{e.reward_score}</td>
                  <td className="p-2">{e.discipline_score}</td>
                  <td className="p-2">{e.training_score}</td>
                  <td className="p-2">{e.performance_score}</td>
                  <td className="p-2">{e.total_score}</td>
                  <td className="p-2">{e.rank_in_department}</td>
                  <td className="p-2">{e.rank_in_company}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {paginatedEvaluations.length === 0 && (
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

export default Evaluations;
