import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { fetchContracts } from '../services/api';

const Contracts = ({ active }) => {
  const [contracts, setContracts] = useState([]);
  const [search, setSearch] = useState('');
  const [modalData, setModalData] = useState(null);
  const [modalMode, setModalMode] = useState('');

  const API_URL = 'http://localhost:8003/api/contracts/';

  const loadContracts = async () => {
    try {
      showSpinner('contracts');
      const data = await fetchContracts();
      setContracts(data);
    } catch (error) {
      console.error('Lỗi khi tải hợp đồng:', error);
    } finally {
      hideSpinner('contracts');
    }
  };

  useEffect(() => {
    if (active) loadContracts();
  }, [active]);

  const filteredContracts = contracts.filter(c =>
    c.employee?.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  const openModal = (mode, id = null) => {
    setModalMode(mode);
    let contract = {
      id: null,
      employee: null,
      type: '',
      start_date: '',
      end_date: '',
      base_salary: 0,
    };

    if (id !== null) {
      const found = contracts.find(c => c.id === id);
      if (found) contract = found;
    }

    setModalData(contract);

    setTimeout(() => {
      document.getElementById('contractEmployee').value = contract.employee?.id || '';
      document.getElementById('contractType').value = contract.type || '';
      document.getElementById('contractStart').value = contract.start_date || '';
      document.getElementById('contractEnd').value = contract.end_date || '';
      document.getElementById('contractSalary').value = contract.base_salary || '';
      document.getElementById('addContractModalLabel').innerText =
        mode === 'view' ? 'Xem Hợp đồng' : mode === 'edit' ? 'Sửa Hợp đồng' : 'Thêm Hợp đồng';

      const inputs = document.querySelectorAll('#addContractModal input, #addContractModal select');
      inputs.forEach(input => input.disabled = mode === 'view');

      new bootstrap.Modal(document.getElementById('addContractModal')).show();
    }, 0);
  };

  const deleteContract = async (id) => {
    try {
      await axios.delete(`${API_URL}${id}/`);
      setContracts(contracts.filter(c => c.id !== id));
      showToast('Đã xóa hợp đồng thành công!');
    } catch (error) {
      console.error('Lỗi khi xóa hợp đồng:', error);
    }
  };

  window.saveContract = async () => {
    if (modalMode === 'view') return;

    const employee_id = document.getElementById('contractEmployee').value;
    const type = document.getElementById('contractType').value;
    const start_date = document.getElementById('contractStart').value;
    const end_date = document.getElementById('contractEnd').value;
    const base_salary = parseFloat(document.getElementById('contractSalary').value);

    const contractData = { employee: employee_id, type, start_date, end_date, base_salary };

    try {
      if (modalMode === 'edit') {
        await axios.put(`${API_URL}${modalData.id}/`, contractData);
      } else {
        await axios.post(API_URL, contractData);
      }
      loadContracts();
      new bootstrap.Modal(document.getElementById('addContractModal')).hide();
      showToast('Đã lưu hợp đồng thành công!');
    } catch (error) {
      console.error('Lỗi khi lưu hợp đồng:', error);
    }
  };

  return (
    <div id="contracts" className={`section ${active ? '' : 'hidden'}`}>
      <h2 className="text-2xl font-bold mb-4">Quản lý Hợp đồng</h2>

      <div className="flex flex-wrap gap-2 mb-4">
        <input
          type="text"
          placeholder="Tìm theo tên nhân viên..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 border rounded-lg min-w-[200px]"
        />
        <button className="custom-btn" onClick={() => openModal('add')}>
          <i className="fas fa-plus mr-2"></i>Thêm Hợp đồng
        </button>
        <button className="custom-btn" onClick={loadContracts}>
          <i className="fas fa-sync-alt mr-2"></i>Làm mới
        </button>
      </div>

      <div className="card relative shadow">
        <div className="spinner-overlay" id="contractsSpinner">
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
                <th className="p-2 text-left">Từ ngày</th>
                <th className="p-2 text-left">Đến ngày</th>
                <th className="p-2 text-left">Lương</th>
                <th className="p-2 text-left">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredContracts.map(c => (
                <tr key={c.id}>
                  <td className="p-2">{c.employee?.full_name || `ID ${c.employee}`}</td>
                  <td className="p-2">{c.type}</td>
                  <td className="p-2">{c.start_date}</td>
                  <td className="p-2">{c.end_date}</td>
                  <td className="p-2">{c.base_salary.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</td>
                  <td className="p-2">
                    <button className="custom-btn-view me-2" onClick={() => openModal('view', c.id)}>
                      <i className="fas fa-eye"></i> Xem
                    </button>
                    <button className="custom-btn-edit me-2" onClick={() => openModal('edit', c.id)}>
                      <i className="fas fa-edit"></i> Sửa
                    </button>
                    <button className="custom-btn-del text-danger" onClick={() => deleteContract(c.id)}>
                      <i className="fas fa-trash"></i> Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Contracts;
