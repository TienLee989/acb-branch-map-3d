import React, { useState, useEffect } from 'react';
import { fetchEvents } from '../services/api';

const Events = ({ active }) => {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');

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

  const filteredEvents = events.filter(e =>
    e.employee?.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div id="events" className={`section ${active ? '' : 'hidden'}`}>
      <h2 className="text-2xl font-bold mb-4">Sự kiện Nhân viên</h2>

      <div className="flex flex-wrap gap-2 mb-4">
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
      </div>

      <div className="card relative shadow">
        <div className="spinner-overlay" id="eventsSpinner">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
        </div>

        <table className="w-full bg-white rounded-lg">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 text-left">Nhân viên</th>
              <th className="p-2 text-left">Loại</th>
              <th className="p-2 text-left">Tiêu đề</th>
              <th className="p-2 text-left">Ngày</th>
            </tr>
          </thead>
          <tbody>
            {filteredEvents.map(e => (
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
    </div>
  );
};

export default Events;
