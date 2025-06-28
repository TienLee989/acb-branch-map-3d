import React, { useState, useEffect } from 'react';
import { fetchPayrolls } from '../services/api';

const Payroll = ({ active }) => {
  const [payrolls, setPayrolls] = useState([]);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const loadPayrolls = async () => {
    try {
      showSpinner('payroll');
      const data = await fetchPayrolls();
      setPayrolls(data);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu lương:', error);
    } finally {
      hideSpinner('payroll');
    }
  };

  useEffect(() => {
    if (active) loadPayrolls();
  }, [active]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, rowsPerPage]);

  const filteredPayrolls = payrolls.filter(p =>
    p.employee?.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPayrolls.length / rowsPerPage);
  const paginatedPayrolls = filteredPayrolls.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <div id="payroll" className={`section ${active ? '' : 'hidden'}`}>
      <h2 className="text-2xl font-bold mb-4">Quản lý Lương</h2>

      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <input
          type="text"
          placeholder="Tìm theo tên nhân viên..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 border rounded-lg min-w-[200px]"
        />
        <button className="custom-btn" onClick={loadPayrolls}>
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
        <div className="spinner-overlay" id="payrollSpinner">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
        </div>
        <div className="overflow-y-auto" style={{ maxHeight: '400px' }}>
          <table className="w-full bg-white rounded-lg">
            <thead className="sticky top-0 bg-gray-200 z-10">
              <tr>
                <th className="p-2 text-left">Nhân viên</th>
                <th className="p-2 text-left">Tháng</th>
                <th className="p-2 text-left">Lương</th>
                <th className="p-2 text-left">Thưởng</th>
                <th className="p-2 text-left">Khấu trừ</th>
                <th className="p-2 text-left">Thực nhận</th>
                <th className="p-2 text-left">Ngày thanh toán</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPayrolls.map(p => (
                <tr key={p.id}>
                  <td className="p-2">{p.employee?.full_name}</td>
                  <td className="p-2">{p.year_month}</td>
                  <td className="p-2">{p.salary.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</td>
                  <td className="p-2">{p.bonus.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</td>
                  <td className="p-2">{p.deductions.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</td>
                  <td className="p-2">
                    {p.total_pay.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                  </td>
                  <td className="p-2">{p.pay_date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {paginatedPayrolls.length === 0 && (
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

export default Payroll;
