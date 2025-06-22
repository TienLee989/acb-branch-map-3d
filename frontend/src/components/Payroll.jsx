import React, { useState, useEffect } from 'react';
import { fetchPayrolls } from '../services/api';

const Payroll = ({ active }) => {
  const [payrolls, setPayrolls] = useState([]);
  const [search, setSearch] = useState('');

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

  const filteredPayrolls = payrolls.filter(p =>
    p.employee?.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div id="payroll" className={`section ${active ? '' : 'hidden'}`}>
      <h2 className="text-2xl font-bold mb-4">Quản lý Lương</h2>

      <div className="flex flex-wrap gap-2 mb-4">
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
      </div>

      <div className="card relative shadow">
        <div className="spinner-overlay" id="payrollSpinner">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
        </div>

        <table className="w-full bg-white rounded-lg">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 text-left">Nhân viên</th>
              <th className="p-2 text-left">Tháng</th>
              <th className="p-2 text-left">Lương</th>
              <th className="p-2 text-left">Thưởng</th>
              <th className="p-2 text-left">Khấu trừ</th>
              <th className="p-2 text-left">Thực nhận</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayrolls.map(p => (
              <tr key={p.id}>
                <td className="p-2">{p.employee?.full_name}</td>
                <td className="p-2">{p.year_month}</td>
                <td className="p-2">{p.salary_total.toLocaleString()}</td>
                <td className="p-2">{p.bonus.toLocaleString()}</td>
                <td className="p-2">{p.deductions.toLocaleString()}</td>
                <td className="p-2">{(p.salary_total + p.bonus - p.deductions).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Payroll;
