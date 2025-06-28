import React, { useState, useEffect } from 'react';
import { fetchEvents } from '../services/api';

const Events = ({ active }) => {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const loadEvents = async () => {
    try {
      showSpinner('events');
      const data = await fetchEvents();
      setEvents(data);
    } catch (error) {
      console.error('Lỗi khi tải sự kiện:', error);
    } finally {
      hideSpinner('events');
    }
  };

  useEffect(() => {
    if (active) loadEvents();
  }, [active]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, rowsPerPage]);

  const filteredEvents = events.filter(e =>
    e.employee?.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredEvents.length / rowsPerPage);
  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <div id="events" className={`section ${active ? '' : 'hidden'}`}>
      <h2 className="text-2xl font-bold mb-4">Sự kiện Nhân viên</h2>

      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <input
          type="text"
          placeholder="Tìm theo tên nhân viên..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 border rounded-lg min-w-[200px]"
        />
        <button className="custom-btn" onClick={loadEvents}>
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
        <div className="spinner-overlay" id="eventsSpinner">
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
                <th className="p-2 text-left">Tiêu đề</th>
                <th className="p-2 text-left">Ngày</th>
              </tr>
            </thead>
            <tbody>
              {paginatedEvents.map(e => (
                <tr key={e.id}>
                  <td className="p-2">{e.employee?.full_name || '—'}</td>
                  <td className="p-2">{e.type}</td>
                  <td className="p-2">{e.title}</td>
                  <td className="p-2">{e.event_date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {paginatedEvents.length === 0 && (
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

export default Events;
