// BranchList.jsx

import React, { useEffect, useState } from 'react';
import { fetchBranchs } from '../services/api';
import BranchMap from '../components/BranchMap';
import { BranchProvider, useBranchData } from '../hooks/useBranchData';

const BranchesContent = ({ active }) => {
  const [branchs, setBranchs] = useState([]);
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [floorFilter, setFloorFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [localSelected, setLocalSelected] = useState(null);

  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(0);

  const { setSelectedBranch } = useBranchData();

  const loadBranches = async () => {
    showSpinner('branches');
    try {
      const data = await fetchBranchs();
      setBranchs(data);
    } catch (error) {
      console.error('Lỗi tải chi nhánh:', error);
    } finally {
      setTimeout(() => {
        hideSpinner('branches');
        setLoading(false);
        showToast('Đã làm mới dữ liệu!');
      }, 1000);
    }
  };

  useEffect(() => {
    if (active) loadBranches();
  }, [active]);

  useEffect(() => {
    setCurrentPage(0);
  }, [search, branchFilter, floorFilter, departmentFilter, rowsPerPage]);

  const showBranchDetail = (branch) => {
    setSelectedBranch(branch);
    setLocalSelected(branch);
  };

  const filteredBranches = branchs.filter(branch =>
    branch.name.toLowerCase().includes(search.toLowerCase()) &&
    (!branchFilter || branch.name === branchFilter) &&
    (!floorFilter || branch.floors == floorFilter) &&
    (!departmentFilter || branch.departments?.toLowerCase().includes(departmentFilter.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredBranches.length / rowsPerPage);
  const paginatedBranches = filteredBranches.slice(
    currentPage * rowsPerPage,
    currentPage * rowsPerPage + rowsPerPage
  );

  const uniqueNames = [...new Set(branchs.map(b => b.name))];
  const uniqueFloors = [...new Set(branchs.map(b => b.floors))];
  const uniqueDepartments = [...new Set(branchs.map(b => b.departments))];

  return (
    <div id="branches" className={`section ${active ? '' : 'hidden'}`}>
      <h2 className="text-2xl font-bold mb-4">Thông tin Chi nhánh</h2>

      <div className="card mb-4 p-1" style={{ height: '25em' }}>
        <BranchMap branchs={branchs} loading={loading} selectedBranch={localSelected} />
      </div>

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
          {uniqueNames.map(n => <option key={n}>{n}</option>)}
        </select>
        <select value={floorFilter} onChange={(e) => setFloorFilter(e.target.value)} className="p-2 border rounded-lg">
          <option value="">-- Số tầng --</option>
          {uniqueFloors.map(f => <option key={f}>{f}</option>)}
        </select>
        <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)} className="p-2 border rounded-lg">
          <option value="">-- Phòng ban --</option>
          {uniqueDepartments.map(d => <option key={d}>{d}</option>)}
        </select>
        <button className="custom-btn" onClick={loadBranches}>
          <i className="fas fa-sync-alt mr-2"></i>Làm mới
        </button>
      </div>

      <div className="card relative shadow p-0">
        <div className="spinner-overlay" id="branchesSpinner">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
        </div>

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

        <div className="overflow-y-auto" style={{ maxHeight: '400px' }}>
          <table className="w-full bg-white rounded-lg">
            <thead className="sticky top-0 bg-gray-200 z-10">
              <tr>
                <th className="p-2 text-left">Tên Chi nhánh</th>
                <th className="p-2 text-left">Địa chỉ</th>
                <th className="p-2 text-left">Số tầng</th>
                <th className="p-2 text-left">Phòng ban</th>
                <th className="p-2 text-left">Nhân viên</th>
                <th className="p-2 text-left">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {paginatedBranches.map((branch, index) => (
                <tr key={index}>
                  <td className="p-2">{branch.name}</td>
                  <td className="p-2">{branch.address}</td>
                  <td className="p-2">{branch.floors}</td>
                  <td className="p-2">{branch.departments}</td>
                  <td className="p-2">{branch.employees}</td>
                  <td className="p-2">
                    <button className="custom-btn" onClick={() => showBranchDetail(branch)}>
                      <i className="fas fa-map-marker-alt mr-1"></i>Xem bản đồ
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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

const Branches = ({ active }) => (
  <BranchProvider>
    <BranchesContent active={active} />
  </BranchProvider>
);

export default Branches;
