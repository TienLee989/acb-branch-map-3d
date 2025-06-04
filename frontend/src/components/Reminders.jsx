import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // Import mặc định để ghi đè

import '../styles/calendar-custom.css'; // file CSS mới

const Reminders = ({ active }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  return (
    <div id="reminders" className={`section ${active ? '' : 'hidden'}`}>
      <h2 className="text-2xl font-bold mb-4">Nhắc việc</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <ul className="reminder-list">
            <li className="p-2 border-b text-gray-700">Giấy tờ hết hạn: 28</li>
            <li className="p-2 border-b text-gray-700">Ký nghiệm ngày vào làm: 47</li>
            <li className="p-2 border-b text-gray-700">Sinh nhật: 38</li>
            <li className="p-2 border-b text-gray-700">NPT hết thời gian giảm trừ: 648</li>
            <li className="p-2 border-b text-gray-700">Chưa ký hợp đồng: 26</li>
            <li className="p-2 border-b text-gray-700">Hết hạn hợp đồng: 1002</li>
          </ul>
        </div>

        <div className="card p-4">
          <Calendar
            onChange={setSelectedDate}
            value={selectedDate}
            locale="vi-VN"
            className="calendar-custom w-100"
          />
          <p className="mt-3 text-center text-gray-600">
            Ngày đã chọn: <strong>{selectedDate.toLocaleDateString('vi-VN')}</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Reminders;
