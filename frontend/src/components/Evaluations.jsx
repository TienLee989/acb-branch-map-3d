import React, { useState, useEffect } from 'react';
import { fetchEvaluations } from '../services/api';

const Evaluations = ({ active }) => {
  const [evaluations, setEvaluations] = useState([]);
  const [search, setSearch] = useState('');

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

  const filteredEvaluations = evaluations.filter(e =>
    e.employee?.full_name?.toLowerCase().includes(search.toLowerCase())
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
      </div>

      <div className="card relative shadow">
        <div className="spinner-overlay" id="evaluationsSpinner">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
        </div>

        <table className="w-full bg-white rounded-lg text-sm">
          <thead className="bg-gray-200">
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
            {filteredEvaluations.map(e => (
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
    </div>
  );
};

export default Evaluations;
