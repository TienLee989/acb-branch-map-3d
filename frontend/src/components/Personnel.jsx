import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Personnel = ({ active }) => {
  const [personnelData, setPersonnelData] = useState([]);
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [positionFilter, setPositionFilter] = useState('');
  const [modalData, setModalData] = useState(null);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    if (active) fetchPersonnel();
  }, [active]);

  const fetchPersonnel = async () => {
    try {
      showSpinner('personnel');
      const res = await axios.get('http://localhost:8003/api/employees/');
      setPersonnelData(res.data);
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu nhân sự:', err);
    } finally {
      hideSpinner('personnel');
    }
  };

  const uniqueBranches = [...new Set(personnelData.map(p => p.branch_name))];
  const uniqueDepartments = [...new Set(personnelData.map(p => p.department_name))];
  const uniquePositions = [...new Set(personnelData.map(p => p.position_title))];

  const refreshData = () => {
    fetchPersonnel();
    showToast('Đã làm mới dữ liệu!');
  };

  const filteredPersonnel = personnelData.filter(person => {
    return (
      person.full_name.toLowerCase().includes(search.toLowerCase()) &&
      (!branchFilter || person.branch_name === branchFilter) &&
      (!departmentFilter || person.department_name === departmentFilter) &&
      (!positionFilter || person.position_title === positionFilter)
    );
  });

  const totalPages = Math.ceil(filteredPersonnel.length / rowsPerPage);
  const paginatedPersonnel = filteredPersonnel.slice(
    currentPage * rowsPerPage,
    currentPage * rowsPerPage + rowsPerPage
  );
  const viewPersonnel = (id) => {
    const person = personnelData.find(p => p.id === id);
    if (!person) return;

    setModalData(person);
    setTimeout(() => {
      document.getElementById('detailFullName').textContent = person.full_name || 'N/A';
      document.getElementById('detailGender').textContent = person.gender || 'N/A';
      document.getElementById('detailDob').textContent = person.dob || 'N/A';
      document.getElementById('detailPhone').textContent = person.phone || 'N/A';
      document.getElementById('detailEmail').textContent = person.email || 'N/A';
      document.getElementById('detailPosition').textContent = person.position_title || 'N/A';
      document.getElementById('detailDepartment').textContent = person.department_name || 'N/A';
      document.getElementById('detailBranch').textContent = person.branch_name || 'N/A';
      document.getElementById('detailFloor').textContent = person.floor_number || 'N/A';
      document.getElementById('detailRoomCode').textContent = person.room_code || 'N/A';
      document.getElementById('detailHireDate').textContent = person.hire_date || 'N/A';
      document.getElementById('detailStatus').textContent = person.status || 'N/A';
      document.getElementById('detailAvatar').src = person.avatar_url || '/avatars/default.jpg';
      new bootstrap.Modal(document.getElementById('personnelDetailModal')).show();
    }, 0);
  };
  const editPersonnel = (id) => {
    const person = personnelData.find(p => p.id === id);
    setModalData(person);
    setTimeout(() => {
      document.getElementById('personName').value = person.full_name;
      document.getElementById('personPosition').value = person.position_title;
      document.getElementById('personDepartment').value = person.department_name;
      document.getElementById('personBranch').value = person.branch_name;
      document.getElementById('addPersonnelModalLabel').innerText = 'Sửa Nhân viên';
      new bootstrap.Modal(document.getElementById('addPersonnelModal')).show();
    }, 0);
  };

  const deletePersonnel = async (id) => {
    try {
      await axios.delete(`http://localhost:8003/api/employees/${id}/`);
      setPersonnelData(personnelData.filter(p => p.id !== id));
      showToast('Đã xóa nhân viên thành công!');
    } catch (err) {
      console.error('Lỗi khi xóa nhân viên:', err);
    }
  };

  window.savePersonnel = async () => {
    const full_name = document.getElementById('personName').value;
    const position_title = document.getElementById('personPosition').value;
    const department_name = document.getElementById('personDepartment').value;
    const branch_name = document.getElementById('personBranch').value;

    const payload = { full_name, position_title, department_name, branch_name };

    try {
      if (modalData?.id) {
        await axios.put(`http://localhost:8003/api/employees/${modalData.id}/`, payload);
      } else {
        await axios.post('http://localhost:8003/api/employees/', payload);
      }
      fetchPersonnel();
      new bootstrap.Modal(document.getElementById('addPersonnelModal')).hide();
      showToast('Đã lưu nhân viên thành công!');
    } catch (err) {
      console.error('Lỗi khi lưu nhân viên:', err);
    }
  };

  useEffect(() => {
    setCurrentPage(0);
  }, [search, branchFilter, departmentFilter, positionFilter, rowsPerPage]);

  return (
    <div id="personnel" className={`section ${active ? '' : 'hidden'}`}>
      <h2 className="text-2xl font-bold mb-4">Thông tin Nhân sự</h2>

      <div className="flex flex-wrap gap-2 mb-4">
        <input
          type="text"
          placeholder="Tìm theo tên..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 border rounded-lg min-w-[200px]"
        />
        <select value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)} className="p-2 border rounded-lg">
          <option value="">-- Chi nhánh --</option>
          {uniqueBranches.map(b => <option key={b}>{b}</option>)}
        </select>
        <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)} className="p-2 border rounded-lg">
          <option value="">-- Phòng ban --</option>
          {uniqueDepartments.map(d => <option key={d}>{d}</option>)}
        </select>
        <select value={positionFilter} onChange={(e) => setPositionFilter(e.target.value)} className="p-2 border rounded-lg">
          <option value="">-- Vị trí --</option>
          {uniquePositions.map(p => <option key={p}>{p}</option>)}
        </select>
        <button className="custom-btn" onClick={refreshData}>
          <i className="fas fa-sync-alt mr-2"></i>Làm mới
        </button>
        <button
          className="custom-btn"
          data-bs-toggle="modal"
          data-bs-target="#addPersonnelModal"
          onClick={() => setModalData(null)}
        >
          <i className="fas fa-plus mr-2"></i>Thêm Nhân viên
        </button>
        <select
            value={rowsPerPage}
            onChange={(e) => setRowsPerPage(parseInt(e.target.value))}
            className="border rounded p-1"
          >
            {[5, 10, 20, 50].map(num => (
              <option key={num} value={num}>{num} dòng</option>
            ))}
          </select>
      </div>

      <div className="card relative shadow">
        <div className="spinner-overlay" id="personnelSpinner">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
        </div>

        <div className="overflow-y-auto" style={{ maxHeight: '400px' }}>
          <table className="w-full bg-white rounded-lg">
            <thead className="sticky top-0 bg-gray-200 z-10">
              <tr>
                <th className="p-2 text-left">Tên</th>
                <th className="p-2 text-left">Vị trí</th>
                <th className="p-2 text-left">Phòng ban</th>
                <th className="p-2 text-left">Chi nhánh</th>
                <th className="p-2 text-left">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPersonnel.map(person => (
                <tr key={person.id}>
                  <td className="p-2">{person.full_name}</td>
                  <td className="p-2">{person.position_title}</td>
                  <td className="p-2">{person.department_name}</td>
                  <td className="p-2">{person.branch_name}</td>
                  <td className="p-2">
                    <button className="custom-btn-view me-2" onClick={() => viewPersonnel(person.id)}>
                      <i className="fas fa-eye"></i> Xem
                    </button>
                    <button className="custom-btn-edit me-2" onClick={() => editPersonnel(person.id)}>
                      <i className="fas fa-edit"></i> Sửa
                    </button>
                    <button className="custom-btn-del text-danger" onClick={() => deletePersonnel(person.id)}>
                      <i className="fas fa-trash"></i> Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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

export default Personnel;
