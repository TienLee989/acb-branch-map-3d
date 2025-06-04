import React, { useState, useEffect } from 'react';

const Personnel = ({ active }) => {
  const [personnelData, setPersonnelData] = useState([
    { name: "Nguyễn Văn A", position: "Nhân viên", department: "Tín dụng", branch: "CN Hà Nội" },
    { name: "Trần Thị B", position: "Quản lý", department: "Kế toán", branch: "CN TP.HCM" },
    { name: "Lê Văn C", position: "Nhân viên", department: "Hành chính", branch: "CN Hà Nội" },
    { name: "Phạm Văn D", position: "Trưởng phòng", department: "Tín dụng", branch: "CN Đà Nẵng" },
    { name: "Ngô Thị E", position: "Nhân viên", department: "Hành chính", branch: "CN Cần Thơ" },
    { name: "Lê Văn F", position: "Nhân viên", department: "Hành chính", branch: "CN Hà Nội" },
    { name: "Phạm Văn G", position: "Trưởng phòng", department: "Tín dụng", branch: "CN Đà Nẵng" },
    { name: "Ngô Thị H", position: "Nhân viên", department: "Hành chính", branch: "CN Cần Thơ" },
    { name: "Lê Văn I", position: "Nhân viên", department: "Hành chính", branch: "CN Hà Nội" },
    { name: "Phạm Văn K", position: "Trưởng phòng", department: "Tín dụng", branch: "CN Đà Nẵng" },
    { name: "Ngô Thị L", position: "Nhân viên", department: "Hành chính", branch: "CN Cần Thơ" }
  ]);

  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [positionFilter, setPositionFilter] = useState('');
  const [modalData, setModalData] = useState(null);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(0);

  const uniqueBranches = [...new Set(personnelData.map(p => p.branch))];
  const uniqueDepartments = [...new Set(personnelData.map(p => p.department))];
  const uniquePositions = [...new Set(personnelData.map(p => p.position))];

  const refreshData = () => {
    showSpinner('personnel');
    setTimeout(() => {
      hideSpinner('personnel');
      showToast('Đã làm mới dữ liệu!');
    }, 1000);
  };

  const filteredPersonnel = personnelData.filter(person => {
    return (
      person.name.toLowerCase().includes(search.toLowerCase()) &&
      (!branchFilter || person.branch === branchFilter) &&
      (!departmentFilter || person.department === departmentFilter) &&
      (!positionFilter || person.position === positionFilter)
    );
  });

  const totalPages = Math.ceil(filteredPersonnel.length / rowsPerPage);
  const paginatedPersonnel = filteredPersonnel.slice(
    currentPage * rowsPerPage,
    currentPage * rowsPerPage + rowsPerPage
  );

  const editPersonnel = (name) => {
    const person = personnelData.find(p => p.name === name);
    setModalData(person);
    setTimeout(() => {
      document.getElementById('personName').value = person.name;
      document.getElementById('personPosition').value = person.position;
      document.getElementById('personDepartment').value = person.department;
      document.getElementById('personBranch').value = person.branch;
      document.getElementById('addPersonnelModalLabel').innerText = 'Sửa Nhân viên';
      new bootstrap.Modal(document.getElementById('addPersonnelModal')).show();
    }, 0);
  };

  const deletePersonnel = (name) => {
    const updated = personnelData.filter(p => p.name !== name);
    setPersonnelData(updated);
    showToast('Đã xóa nhân viên thành công!');
  };

  window.savePersonnel = () => {
    const name = document.getElementById('personName').value;
    const position = document.getElementById('personPosition').value;
    const department = document.getElementById('personDepartment').value;
    const branch = document.getElementById('personBranch').value;

    const exists = personnelData.find(p => p.name === name);
    let updated;
    if (exists) {
      updated = personnelData.map(p => (p.name === name ? { name, position, department, branch } : p));
    } else {
      updated = [...personnelData, { name, position, department, branch }];
    }

    setPersonnelData(updated);
    new bootstrap.Modal(document.getElementById('addPersonnelModal')).hide();
    showToast('Đã lưu nhân viên thành công!');
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
      </div>

      <div className="card relative shadow p-0">
        <div className="spinner-overlay" id="personnelSpinner">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
        </div>

        {/* Pagination size selector */}
        <div className="flex justify-between p-2">
          <span className="font-medium">Hiển thị:</span>
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

        {/* Scrollable Table */}
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
                <tr key={person.name}>
                  <td className="p-2">{person.name}</td>
                  <td className="p-2">{person.position}</td>
                  <td className="p-2">{person.department}</td>
                  <td className="p-2">{person.branch}</td>
                  <td className="p-2">
                    <button className="custom-btn-edit me-2" onClick={() => editPersonnel(person.name)}>
                      <i className="fas fa-edit"></i> Sửa
                    </button>
                    <button className="custom-btn-del text-danger" onClick={() => deletePersonnel(person.name)}>
                      <i className="fas fa-trash"></i> Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Buttons */}
        <div className="flex justify-center mt-2 mb-2">
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
    </div>
  );
};

export default Personnel;
