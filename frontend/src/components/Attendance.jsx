import React, { useEffect, useState } from 'react';

const Attendance = ({ active }) => {
  const [attendanceData, setAttendanceData] = useState([
    { name: "Nguyễn Văn A", date: "2025-05-28", status: "Đi làm", timeIn: "08:00", timeOut: "17:00", hours: 9 },
    { name: "Nguyễn Văn A", date: "2025-05-29", status: "Đi làm", timeIn: "08:15", timeOut: "17:30", hours: 9.25 },
    { name: "Nguyễn Văn A", date: "2025-05-30", status: "Muộn", timeIn: "09:00", timeOut: "17:00", hours: 8 },
    { name: "Trần Thị B", date: "2025-05-30", status: "Nghỉ", timeIn: "-", timeOut: "-", hours: 0 }
  ]);

  const [searchText, setSearchText] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(0);

  const refreshData = () => {
    showSpinner('attendance');
    setTimeout(() => {
      hideSpinner('attendance');
      showToast('Đã làm mới dữ liệu!');
    }, 1000);
  };

  const exportAttendance = () => {
    let csv = 'Tên,Ngày,Trạng thái,Giờ vào,Giờ ra\n';
    filteredAttendance.forEach(record => {
      csv += `${record.name},${record.date},${record.status},${record.timeIn},${record.timeOut}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'attendance.csv';
    a.click();
    showToast('Đã xuất CSV thành công!');
  };

  const filteredAttendance = attendanceData.filter(record => {
    const matchesName = record.name.toLowerCase().includes(searchText.toLowerCase());
    const matchesFrom = !fromDate || new Date(record.date) >= new Date(fromDate);
    const matchesTo = !toDate || new Date(record.date) <= new Date(toDate);
    return matchesName && matchesFrom && matchesTo;
  });

  const totalPages = Math.ceil(filteredAttendance.length / rowsPerPage);
  const paginatedAttendance = filteredAttendance.slice(
    currentPage * rowsPerPage,
    currentPage * rowsPerPage + rowsPerPage
  );

  const totalHours = paginatedAttendance.reduce((sum, record) => sum + record.hours, 0);

  useEffect(() => {
    if (active) {
      setSearchText('');
      setFromDate('');
      setToDate('');
      setCurrentPage(0);
    }
  }, [active]);

  useEffect(() => {
    setCurrentPage(0);
  }, [searchText, fromDate, toDate, rowsPerPage]);

  return (
    <div id="attendance" className={`section ${active ? '' : 'hidden'}`}>
      <h2 className="text-2xl font-bold mb-4">Thông tin Chấm công</h2>

      {/* Bộ lọc nâng cao */}
      <div className="flex flex-wrap gap-4 mb-4">
        <input
          type="text"
          placeholder="Tìm theo tên..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="p-2 border rounded-lg flex-1 min-w-[200px]"
        />
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="p-2 border rounded-lg"
        />
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="p-2 border rounded-lg"
        />
        <button className="custom-btn" onClick={refreshData}>
          <i className="fas fa-sync-alt mr-2"></i>Làm mới
        </button>
        <button className="custom-btn" onClick={exportAttendance}>
          <i className="fas fa-download mr-2"></i>Xuất CSV
        </button>
      </div>

      {/* Bảng dữ liệu */}
      <div className="card relative shadow p-0 overflow-x-auto">
        <div className="spinner-overlay" id="attendanceSpinner">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
        </div>

        {/* Selector hiển thị */}
        <div className="flex justify-between items-center mb-2 px-1 mt-1">
            <span className="font-medium">Hiển thị:</span>
            <select
            value={rowsPerPage}
            onChange={(e) => setRowsPerPage(parseInt(e.target.value))}
            className="border rounded p-1"
            >
            {[5, 10, 20, 50].map(n => <option key={n} value={n}>{n} dòng</option>)}
            </select>
        </div>

        <table className="w-full bg-white rounded-lg">
          <thead className="sticky top-0 bg-gray-200 z-10">
            <tr>
              <th className="p-2 text-left">Tên</th>
              <th className="p-2 text-left">Ngày</th>
              <th className="p-2 text-left">Trạng thái</th>
              <th className="p-2 text-left">Giờ vào</th>
              <th className="p-2 text-left">Giờ ra</th>
              <th className="p-2 text-left">Số giờ</th>
            </tr>
          </thead>
          <tbody>
            {paginatedAttendance.map((record, index) => (
              <tr key={index}>
                <td className="p-2">{record.name}</td>
                <td className="p-2">{record.date}</td>
                <td className="p-2">{record.status}</td>
                <td className="p-2">{record.timeIn}</td>
                <td className="p-2">{record.timeOut}</td>
                <td className="p-2">{record.hours}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {paginatedAttendance.length === 0 && (
          <div className="text-center p-4 text-gray-500">Không có dữ liệu</div>
        )}

        {/* Pagination Buttons */}
        <div className="flex justify-center mt-4 mb-2">
            {Array.from({ length: totalPages }, (_, i) => (
            <button
                key={i}
                className={`mx-1 px-3 py-1 rounded ${i === currentPage ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                onClick={() => setCurrentPage(i)}
            >
                {i + 1}
            </button>
            ))}
        </div>
      </div>

      {/* Tổng số giờ */}
      {/* <div className="text-right mt-4 font-semibold">
        Tổng giờ làm (trang hiện tại): {totalHours.toFixed(2)} giờ
      </div> */}
    </div>
  );
};

export default Attendance;
