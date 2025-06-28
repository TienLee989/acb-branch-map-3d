import React, { useState, useEffect } from 'react';
import { fetchAttendances } from '../services/api';

const Attendance = ({ active }) => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [summaryData, setSummaryData] = useState({ totalHours: 0, totalLate: 0, totalAbsent: 0, onTimeRate: 0 });

  useEffect(() => {
    if (active) fetchAttendance();
  }, [active]);

  const fetchAttendance = async () => {
    setTimeout(async () => {
      try {
        showSpinner('attendance');
        const res = await fetchAttendances({
          from_date: fromDate,
          to_date: toDate,
          search: searchText,
        });
        console.log('Dữ liệu từ API:', res);
        setAttendanceData(res);
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu chấm công:', err);
      } finally {
        hideSpinner('attendance');
      }
    }, 1000);
  };

  const refreshData = () => {
    fetchAttendance();
    showToast('Đã làm mới dữ liệu!');
  };

  const exportCSV = () => {
    let csv = 'Tên,Ngày,Trạng thái,Giờ vào,Giờ ra,Giờ bắt đầu công ty,Giờ kết thúc công ty,Số giờ,Ghi chú\n';
    filteredAttendance.forEach(record => {
      const name = record.employee?.full_name || '---';
      csv += `${name},${record.date},${record.status_display || record.status},${record.time_in || '-'},${record.time_out || '-'},${record.company_start_time || '-'},${record.company_end_time || '-'},${record.hours_worked || 0},${record.note || '-'}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'attendance.csv';
    a.click();
    showToast('Đã xuất CSV thành công!');
  };

  const filteredAttendance = (attendanceData || []).filter(record => {
    const name = record.employee?.full_name?.toLowerCase() || '';
    const matchesName = name.includes(searchText.toLowerCase());
    const matchesFrom = !fromDate || new Date(record.date) >= new Date(fromDate);
    const matchesTo = !toDate || new Date(record.date) <= new Date(toDate);
    return matchesName && matchesFrom && matchesTo;
  });

  const totalPages = Math.ceil(filteredAttendance.length / rowsPerPage);
  const paginatedAttendance = filteredAttendance.slice(
    currentPage * rowsPerPage,
    currentPage * rowsPerPage + rowsPerPage
  );

  useEffect(() => {
    setCurrentPage(0);
  }, [searchText, fromDate, toDate, rowsPerPage]);

  useEffect(() => {
    if (showModal && selectedEmployee) {
      const recentRecords = attendanceData.filter(r => r.employee?.id === selectedEmployee.id);
      console.log('Recent records for employee:', recentRecords);

      const summary = recentRecords.reduce((acc, cur) => {
        const month = new Date(cur.date).toLocaleString('default', { month: 'short', year: 'numeric' });
        if (!acc[month]) acc[month] = { hours: 0, late: 0, absent: 0 };
        const hoursWorked = Number(cur.hours_worked) || 0;
        acc[month].hours += hoursWorked;
        if (cur.status === 'Late') acc[month].late++;
        if (cur.status === 'Absent') acc[month].absent++;
        return acc;
      }, {});

      const totalHours = recentRecords.reduce((sum, r) => sum + (Number(r.hours_worked) || 0), 0);
      const totalLate = recentRecords.filter(r => r.status === 'Late').length;
      const totalAbsent = recentRecords.filter(r => r.status === 'Absent').length;
      const totalDays = recentRecords.length;
      const onTimeDays = totalDays - totalLate - totalAbsent;
      const onTimeRate = totalDays > 0 ? ((onTimeDays / totalDays) * 100).toFixed(2) : 0;

      setSummaryData({ totalHours, totalLate, totalAbsent, onTimeRate });
    }
  }, [showModal, selectedEmployee]);

  // Tính toán dữ liệu cho Bảng Tổng quan Chấm công theo Phòng ban
  const getDepartmentOverview = () => {
    const departments = [...new Set(attendanceData.map(r => r.employee?.department || 'Không xác định'))];
    return departments.map(dept => {
      const recordsInDept = attendanceData.filter(r => r.employee?.department === dept);
      const uniqueEmployees = [...new Set(recordsInDept.map(r => r.employee?.id))].length;
      const totalHours = recordsInDept.reduce((sum, r) => sum + (Number(r.hours_worked) || 0), 0);
      const totalLate = recordsInDept.filter(r => r.status === 'Late').length;
      const totalAbsent = recordsInDept.filter(r => r.status === 'Absent').length;
      const totalDays = recordsInDept.length;
      const onTimeDays = totalDays - totalLate - totalAbsent;
      const onTimeRate = totalDays > 0 ? ((onTimeDays / totalDays) * 100).toFixed(2) : 0;

      return {
        department: dept,
        employeeCount: uniqueEmployees,
        totalHours,
        totalLate,
        totalAbsent,
        onTimeRate,
      };
    }).sort((a, b) => b.onTimeRate - a.onTimeRate);
  };

  // Tính toán dữ liệu cho Bảng Tổng quan Chấm công theo Thời gian
  const getTimeBasedOverview = () => {
    const periods = [...new Set(attendanceData.map(r => {
      const date = new Date(r.date);
      return date.toLocaleString('default', { month: 'short', year: 'numeric' });
    }))].sort();

    return periods.map(period => {
      const recordsInPeriod = attendanceData.filter(r => {
        const recordDate = new Date(r.date);
        return recordDate.toLocaleString('default', { month: 'short', year: 'numeric' }) === period;
      });

      const uniqueEmployees = [...new Set(recordsInPeriod.map(r => r.employee?.id))].length;
      const totalHours = recordsInPeriod.reduce((sum, r) => sum + (Number(r.hours_worked) || 0), 0);
      const totalLateDays = recordsInPeriod.filter(r => r.status === 'Late').length;
      const totalAbsentDays = recordsInPeriod.filter(r => r.status === 'Absent').length;
      const totalRecords = recordsInPeriod.length;
      const onTimeDays = totalRecords - totalLateDays - totalAbsentDays;
      const averageAttendanceRate = totalRecords > 0 ? ((onTimeDays / totalRecords) * 100).toFixed(2) : 0;

      return {
        period,
        totalCheckedInEmployees: uniqueEmployees,
        totalHours,
        totalLateDays,
        totalAbsentDays,
        averageAttendanceRate,
      };
    });
  };

  const departmentOverview = getDepartmentOverview();
  const timeBasedOverview = getTimeBasedOverview();

  return (
    <div id="attendance" className={`section ${active ? '' : 'hidden'}`}>
      <h2 className="text-2xl font-bold mb-4">Thông tin Chấm công</h2>

      <div className="flex p-0 mb-3">
        <div className="w-1/2 ml-1">
          {/* Bảng Tổng quan Chấm công theo Phòng ban */}
          <div className="card mb-1 shadow-lg rounded-xl overflow-hidden">
            <h3 className="text-xl font-semibold p-4 bg-gray-100">Tổng quan Chấm công theo Phòng ban</h3>
            <div className="overflow-x-auto" style={{ height: '15em' }}>
              <table className="w-full bg-white rounded-lg border-collapse">
                <thead className="bg-gray-200 sticky top-0">
                  <tr>
                    <th className="p-2 text-left text-gray-700 font-semibold border-b border-gray-300">Phòng ban</th>
                    <th className="p-2 text-left text-gray-700 font-semibold border-b border-gray-300">Số nhân viên</th>
                    <th className="p-2 text-left text-gray-700 font-semibold border-b border-gray-300">Tổng giờ làm</th>
                    <th className="p-2 text-left text-gray-700 font-semibold border-b border-gray-300">Số lần đi trễ</th>
                    <th className="p-2 text-left text-gray-700 font-semibold border-b border-gray-300">Số ngày nghỉ không phép</th>
                    <th className="p-2 text-left text-gray-700 font-semibold border-b border-gray-300">Tỷ lệ đúng giờ (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {departmentOverview.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition duration-200">
                      <td className="p-2 border-b border-gray-200">{item.department}</td>
                      <td className="p-2 border-b border-gray-200">{item.employeeCount}</td>
                      <td className="p-2 border-b border-gray-200">{item.totalHours.toFixed(2)}</td>
                      <td className="p-2 border-b border-gray-200">{item.totalLate}</td>
                      <td className="p-2 border-b border-gray-200">{item.totalAbsent}</td>
                      <td className="p-2 border-b border-gray-200">{item.onTimeRate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {departmentOverview.length === 0 && (
              <div className="text-center p-4 text-gray-500">Không có dữ liệu</div>
            )}
          </div>
        </div>

        <div className="w-1/2 ml-1">
          {/* Bảng Tổng quan Chấm công theo Thời gian */}
          <div className="card mb-1 shadow-lg rounded-xl overflow-hidden">
            <h3 className="text-xl font-semibold p-4 bg-gray-100">Tổng quan Chấm công theo Thời gian</h3>
            <div className="overflow-x-auto" style={{ height: '15em' }}>
              <table className="w-full bg-white rounded-lg border-collapse">
                <thead className="bg-gray-200 sticky top-0">
                  <tr>
                    <th className="p-2 text-left text-gray-700 font-semibold border-b border-gray-300">Thời gian</th>
                    <th className="p-2 text-left text-gray-700 font-semibold border-b border-gray-300">Tổng nhân viên chấm công</th>
                    <th className="p-2 text-left text-gray-700 font-semibold border-b border-gray-300">Tổng giờ làm</th>
                    <th className="p-2 text-left text-gray-700 font-semibold border-b border-gray-300">Số ngày đi trễ</th>
                    <th className="p-2 text-left text-gray-700 font-semibold border-b border-gray-300">Số ngày nghỉ không phép</th>
                    <th className="p-2 text-left text-gray-700 font-semibold border-b border-gray-300">Tỷ lệ chấm công trung bình (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {timeBasedOverview.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition duration-200">
                      <td className="p-2 border-b border-gray-200">{item.period}</td>
                      <td className="p-2 border-b border-gray-200">{item.totalCheckedInEmployees}</td>
                      <td className="p-2 border-b border-gray-200">{item.totalHours.toFixed(2)}</td>
                      <td className="p-2 border-b border-gray-200">{item.totalLateDays}</td>
                      <td className="p-2 border-b border-gray-200">{item.totalAbsentDays}</td>
                      <td className="p-2 border-b border-gray-200">{item.averageAttendanceRate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {timeBasedOverview.length === 0 && (
              <div className="text-center p-4 text-gray-500">Không có dữ liệu</div>
            )}
          </div>
        </div>
      </div>

      {/* Bộ lọc và nút điều khiển */}
      <div className="flex flex-wrap gap-2 mb-4">
        <input
          type="text"
          placeholder="Tìm theo tên..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="p-2 border rounded-lg min-w-[200px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
        />
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
        />
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
        />
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 flex items-center shadow-md"
          onClick={refreshData}
        >
          <i className="fas fa-sync-alt mr-2"></i>Làm mới
        </button>
        <button
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200 flex items-center shadow-md"
          onClick={exportCSV}
        >
          <i className="fas fa-download mr-2"></i>Xuất CSV
        </button>
        <select
          value={rowsPerPage}
          onChange={(e) => setRowsPerPage(parseInt(e.target.value))}
          className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
        >
          {[5, 10, 20, 50].map(n => <option key={n} value={n}>{n} dòng</option>)}
        </select>
      </div>

      <div className="card relative shadow-lg rounded-xl overflow-hidden">
        <div className="spinner-overlay" id="attendanceSpinner">
          <div className="spinner-border text-blue-600" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
        </div>

        <div className="overflow-y-auto" style={{ maxHeight: '400px' }}>
          <table className="w-full bg-white rounded-lg">
            <thead className="sticky top-0 bg-gray-200 z-10">
              <tr>
                <th className="p-2 text-left text-gray-700 font-semibold">Tên</th>
                <th className="p-2 text-left text-gray-700 font-semibold">Ngày</th>
                <th className="p-2 text-left text-gray-700 font-semibold">Trạng thái</th>
                <th className="p-2 text-left text-gray-700 font-semibold">Giờ vào</th>
                <th className="p-2 text-left text-gray-700 font-semibold">Giờ ra</th>
                <th className="p-2 text-left text-gray-700 font-semibold">Giờ bắt đầu công ty</th>
                <th className="p-2 text-left text-gray-700 font-semibold">Giờ kết thúc công ty</th>
                <th className="p-2 text-left text-gray-700 font-semibold">Số giờ</th>
                <th className="p-2 text-left text-gray-700 font-semibold">Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAttendance.map((record, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-100 cursor-pointer transition duration-200"
                  onClick={() => { setSelectedEmployee(record.employee); setShowModal(true); }}
                >
                  <td className="p-2">{record.employee_name || '---'}</td>
                  <td className="p-2">{record.date}</td>
                  <td className="p-2">{record.status_display || record.status}</td>
                  <td className="p-2">{record.time_in || '-'}</td>
                  <td className="p-2">{record.time_out || '-'}</td>
                  <td className="p-2">{record.company_start_time || '-'}</td>
                  <td className="p-2">{record.company_end_time || '-'}</td>
                  <td className="p-2">{(Number(record.hours_worked) || 0).toFixed(2)}</td>
                  <td className="p-2">{record.note || 'Không có ghi chú'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {paginatedAttendance.length === 0 && (
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

      {showModal && selectedEmployee && (
        <div
          className="mt-5 fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 animate-fade-in"
          onClick={() => setShowModal(false)}
        >
          <div
            className="modal-content bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl transform animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header bg-blue-600 text-white rounded-t-xl p-4 flex justify-between items-center">
              <h5 className="modal-title text-xl font-bold">Chi tiết chấm công – {selectedEmployee.full_name}</h5>
              <button
                type="button"
                className="btn-close text-white hover:text-gray-200 transition duration-200"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body p-6 mt-3">
              <h6 className="font-semibold text-lg mb-4 text-gray-800">Tổng kết tháng:</h6>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-2">
                  <p><strong className="text-gray-700">Tổng số giờ làm:</strong> <span className="font-medium">{(typeof summaryData.totalHours === 'number' ? summaryData.totalHours : 0).toFixed(2)} giờ</span></p>
                  <p><strong className="text-gray-700">Số lần đi trễ:</strong> <span className="font-medium">{summaryData.totalLate || 0}</span></p>
                </div>
                <div className="space-y-2">
                  <p><strong className="text-gray-700">Số ngày nghỉ không phép:</strong> <span className="font-medium">{summaryData.totalAbsent || 0}</span></p>
                  <p><strong className="text-gray-700">Tỷ lệ đúng giờ:</strong> <span className="font-medium">{summaryData.onTimeRate || 0}%</span></p>
                </div>
              </div>
              <h6 className="font-semibold text-lg mb-4 text-gray-800">Lịch sử chi tiết chấm công</h6>
              <div className="overflow-y-auto max-h-64">
                <table className="w-full bg-white rounded-lg border-collapse">
                  <thead className="bg-gray-200 sticky top-0">
                    <tr>
                      <th className="p-2 text-left text-gray-700 font-semibold border-b border-gray-300">Ngày</th>
                      <th className="p-2 text-left text-gray-700 font-semibold border-b border-gray-300">Trạng thái</th>
                      <th className="p-2 text-left text-gray-700 font-semibold border-b border-gray-300">Giờ vào</th>
                      <th className="p-2 text-left text-gray-700 font-semibold border-b border-gray-300">Giờ ra</th>
                      <th className="p-2 text-left text-gray-700 font-semibold border-b border-gray-300">Giờ bắt đầu công ty</th>
                      <th className="p-2 text-left text-gray-700 font-semibold border-b border-gray-300">Giờ kết thúc công ty</th>
                      <th className="p-2 text-left text-gray-700 font-semibold border-b border-gray-300">Số giờ</th>
                      <th className="p-2 text-left text-gray-700 font-semibold border-b border-gray-300">Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceData
                      .filter(r => r.employee?.id === selectedEmployee.id)
                      .slice(-10)
                      .map((r, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 transition duration-200">
                          <td className="p-2 border-b border-gray-200">{r.date || '-'}</td>
                          <td className="p-2 border-b border-gray-200">{r.status_display || r.status || '-'}</td>
                          <td className="p-2 border-b border-gray-200">{r.time_in || '-'}</td>
                          <td className="p-2 border-b border-gray-200">{r.time_out || '-'}</td>
                          <td className="p-2 border-b border-gray-200">{r.company_start_time || '-'}</td>
                          <td className="p-2 border-b border-gray-200">{r.company_end_time || '-'}</td>
                          <td className="p-2 border-b border-gray-200">{(Number(r.hours_worked) || 0).toFixed(2)}</td>
                          <td className="p-2 border-b border-gray-200">{r.note || 'Không có ghi chú'}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="modal-footer bg-gray-50 rounded-b-xl p-4 flex justify-end">
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition duration-200 shadow-md"
                onClick={() => setShowModal(false)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;