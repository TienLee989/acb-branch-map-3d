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
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [positionFilter, setPositionFilter] = useState('');
  const [employeeDepartmentFilter, setEmployeeDepartmentFilter] = useState('');
  const [roomFilter, setRoomFilter] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(0);

  const { setSelectedBranch } = useBranchData();

  const loadBranches = async () => {
    document.getElementById('branchesSpinner')?.classList.remove('hidden');
    try {
      const data = await fetchBranchs();
      setBranchs(data);
    } catch (error) {
      console.error('Lỗi tải chi nhánh:', error);
    } finally {
      setTimeout(() => {
        document.getElementById('branchesSpinner')?.classList.add('hidden');
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

  const showBuildingDetail = (building) => {
    setSelectedBuilding(building);
    setEmployeeSearch('');
    setPositionFilter('');
    setEmployeeDepartmentFilter('');
    setRoomFilter('');
  };

  const filteredBranches = branchs.filter(branch =>
    branch.name.toLowerCase().includes(search.toLowerCase()) &&
    (!branchFilter || branch.name === branchFilter) &&
    (!floorFilter || String(branch.floors) === floorFilter) &&
    (!departmentFilter || branch.departments?.toLowerCase().includes(departmentFilter.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredBranches.length / rowsPerPage);
  const paginatedBranches = filteredBranches.slice(
    currentPage * rowsPerPage,
    currentPage * rowsPerPage + rowsPerPage
  );

  const uniqueNames = [...new Set(branchs.map(b => b.name))];
  const uniqueFloors = [...new Set(branchs.map(b => b.floors))];
  const uniqueDepartments = [...new Set(branchs.map(b => b.departments).filter(Boolean))];

  const getBuildingStats = (building) => {
    const rooms = branchs.flatMap(b => b.rooms || []).filter(r => r.building === building.id);
    const employees = branchs.flatMap(b => b.employees_detail || []).filter(e => e.building === building.name);
    return {
      roomCount: rooms.length,
      employeeCount: employees.length,
    };
  };

  const filteredEmployees = (building) => {
    return branchs
      .flatMap(b => b.employees_detail || [])
      .filter(e => e.building === building.name)
      .filter(e =>
        e.name.toLowerCase().includes(employeeSearch.toLowerCase()) &&
        (!positionFilter || e.position === positionFilter) &&
        (!employeeDepartmentFilter || e.department === employeeDepartmentFilter) &&
        (!roomFilter || e.room === roomFilter)
      );
  };

  const uniquePositions = [...new Set(branchs.flatMap(b => b.employees_detail || []).map(e => e.position))];
  const uniqueEmployeeDepartments = [...new Set(branchs.flatMap(b => b.employees_detail || []).map(e => e.department))];
  const uniqueRooms = [...new Set(branchs.flatMap(b => b.rooms || []).map(r => r.name))];

  return (
    <div id="branches" className={`section ${active ? '' : 'hidden'} p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen`}>
      <h2 className="text-4xl font-extrabold mb-8 text-gray-900 tracking-tight">Thông tin Chi nhánh</h2>

      <div className="flex flex-wrap gap-4 mb-8 bg-white p-6 rounded-xl shadow-md">
        <input
          type="text"
          placeholder="Tìm theo tên chi nhánh..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-3 border border-gray-300 rounded-lg min-w-[250px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
        />
        <select
          value={branchFilter}
          onChange={(e) => setBranchFilter(e.target.value)}
          className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
        >
          <option value="">-- Chi nhánh --</option>
          {uniqueNames.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        <select
          value={floorFilter}
          onChange={(e) => setFloorFilter(e.target.value)}
          className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
        >
          <option value="">-- Số tầng --</option>
          {uniqueFloors.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
        >
          <option value="">-- Phòng ban --</option>
          {uniqueDepartments.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <button
          className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 flex items-center shadow-md"
          onClick={loadBranches}
        >
          <i className="fas fa-sync-alt mr-2"></i>Làm mới
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-xl relative">
        <div className="spinner-overlay hidden" id="branchesSpinner">
          <div className="spinner-border text-blue-600" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
        </div>

        <div className="flex justify-between p-6">
          <span className="font-semibold text-gray-700">Hiển thị:</span>
          <select
            value={rowsPerPage}
            onChange={(e) => setRowsPerPage(parseInt(e.target.value))}
            className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
          >
            {[5, 10, 20, 50].map(num => (
              <option key={num} value={num}>{num} dòng</option>
            ))}
          </select>
        </div>

        <div className="overflow-y-auto" style={{ maxHeight: '500px' }}>
          <table className="w-full bg-white rounded-lg">
            <thead className="sticky top-0 bg-gray-100 z-10">
              <tr>
                <th className="p-4 text-left text-gray-700 font-semibold">Tên Chi nhánh</th>
                <th className="p-4 text-left text-gray-700 font-semibold">Địa chỉ</th>
                <th className="p-4 text-left text-gray-700 font-semibold">Số tầng</th>
                <th className="p-4 text-left text-gray-700 font-semibold">Phòng ban</th>
                <th className="p-4 text-left text-gray-700 font-semibold">Nhân viên</th>
                <th className="p-4 text-left text-gray-700 font-semibold">Tòa nhà</th>
                <th className="p-4 text-left text-gray-700 font-semibold">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {paginatedBranches.map((branch) => (
                <tr key={branch.id} className="hover:bg-gray-50 transition duration-150">
                  <td className="p-4 font-medium">{branch.name}</td>
                  <td className="p-4">{branch.address}</td>
                  <td className="p-4">{branch.floors}</td>
                  <td className="p-4">{branch.departments}</td>
                  <td className="p-4">{branch.employees}</td>
                  <td className="p-4">{branch.buildings?.length || 0} tòa nhà</td>
                  <td className="p-4">
                    {branch.buildings?.map((building) => (
                      <button
                        key={building.id}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200 flex items-center shadow-sm mb-2"
                        onClick={() => showBuildingDetail(building)}
                        data-bs-toggle="modal"
                        data-bs-target="#buildingDetailModal"
                      >
                        <i className="fas fa-info-circle mr-2"></i>Chi tiết
                      </button>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-center mt-6 mb-6">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              className={`mx-1 px-4 py-2 rounded-lg ${i === currentPage ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 hover:bg-gray-300'} transition duration-200`}
              onClick={() => setCurrentPage(i)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Building Detail Modal */}
      <div className="modal fade" id="buildingDetailModal" tabIndex="-1" aria-labelledby="buildingDetailModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-xl">
          <div className="modal-content rounded-xl">
            <div className="modal-header bg-blue-50">
              <h5 className="modal-title text-1xl font-bold text-gray-800" id="buildingDetailModalLabel">Chi tiết Tòa nhà</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Đóng"></button>
            </div>
            <div className="modal-body p-6">
              {selectedBuilding ? (
                <div className="relative">
                  <div className="ml-0 mt-4 pl-6 pt-2 pb-4 pr-6 bg-white rounded-lg shadow-md">
                    <h6 className="text-xl font-semibold mb-4 text-gray-800">{selectedBuilding.name}</h6>
                    <div className="row">
                      {/* Cột 1 - thông tin */}
                      <div className="col-4">
                        {/* <h2 className="font-bold">Tòa nhà {selectedBuilding.name}</h2> */}
                        <div><strong className="text-gray-700">Địa chỉ:</strong> {selectedBuilding.address}</div>
                        <div><strong className="text-gray-700">Số tầng:</strong> {selectedBuilding.floor_count}</div>
                        <div><strong className="text-gray-700">Chiều cao tầng:</strong> {selectedBuilding.floor_height_m} m</div>
                        <div><strong className="text-gray-700">Tổng chiều cao:</strong> {selectedBuilding.total_height_m} m</div>
                        <div><strong className="text-gray-700">Diện tích:</strong> {selectedBuilding.area_m2} m²</div>
                        <div><strong className="text-gray-700">Quản lý:</strong> {selectedBuilding.manager_name}</div>
                        <div><strong className="text-gray-700">Số phòng:</strong> {getBuildingStats(selectedBuilding).roomCount}</div>
                        <div><strong className="text-gray-700">Số nhân viên:</strong> {getBuildingStats(selectedBuilding).employeeCount}</div>
                        <div>
                          <strong className="text-gray-700">Màu sắc:</strong>
                          <span className="inline-block w-5 h-5 rounded-full ml-2" style={{ backgroundColor: selectedBuilding.color_code }}></span>
                          {/* {selectedBuilding.color_code} */}
                        </div>

                        <h6 className="text-lg font-semibold mt-6 mb-3 text-gray-800">Danh sách phòng</h6>
                        <ul className="list-disc pl-5 mb-6">
                          {branchs.flatMap(b => b.rooms || []).filter(r => r.building === selectedBuilding.id).map(room => (
                            <li key={room.id} className="text-gray-600">{room.name} (Tầng {room.floor}, {room.area_m2} m², {room.usage_type})</li>
                          ))}
                        </ul>
                      </div>

                      {/* Cột 2 - bản đồ chiếm full chiều cao */}
                      <div className="col-8">
                        <div className="p-0 w-full rounded-xl border border-gray-300 shadow overflow-hidden">
                          <BranchMap
                            branchs={branchs}
                            loading={loading}
                            selectedBranch={{ buildings: [selectedBuilding] }}
                            zoom={16}
                            center={{ lat: parseFloat(selectedBuilding.lat), lng: parseFloat(selectedBuilding.lng) }}
                          />
                        </div>
                      </div>
                    </div>
                    <h6 className="text-lg font-semibold mb-3 text-gray-800">Danh sách nhân viên</h6>
                    <div className="flex flex-wrap gap-4 mb-4">
                      <input
                        type="text"
                        placeholder="Tìm theo tên nhân viên..."
                        value={employeeSearch}
                        onChange={(e) => setEmployeeSearch(e.target.value)}
                        className="p-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                      />
                      <select
                        value={positionFilter}
                        onChange={(e) => setPositionFilter(e.target.value)}
                        className="p-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                      >
                        <option value="">-- Chức danh --</option>
                        {uniquePositions.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                      <select
                        value={employeeDepartmentFilter}
                        onChange={(e) => setEmployeeDepartmentFilter(e.target.value)}
                        className="p-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                      >
                        <option value="">-- Phòng ban --</option>
                        {uniqueEmployeeDepartments.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                      <select
                        value={roomFilter}
                        onChange={(e) => setRoomFilter(e.target.value)}
                        className="p-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                      >
                        <option value="">-- Phòng --</option>
                        {uniqueRooms.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                    <div className="overflow-y-auto" style={{ maxHeight: '300px' }}>
                      <table className="w-full bg-white rounded-lg">
                        <thead className="sticky top-0 bg-gray-100">
                          <tr>
                            <th className="p-3 text-left text-gray-700 font-semibold">Tên</th>
                            <th className="p-3 text-left text-gray-700 font-semibold">Chức danh</th>
                            <th className="p-3 text-left text-gray-700 font-semibold">Phòng ban</th>
                            <th className="p-3 text-left text-gray-700 font-semibold">Phòng</th>
                            <th className="p-3 text-left text-gray-700 font-semibold">Tầng</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredEmployees(selectedBuilding).map(employee => (
                            <tr key={employee.id} className="hover:bg-gray-50 transition duration-150">
                              <td className="p-3">{employee.name}</td>
                              <td className="p-3">{employee.position}</td>
                              <td className="p-3">{employee.department}</td>
                              <td className="p-3">{employee.room}</td>
                              <td className="p-3">{employee.floor}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600">Không có thông tin tòa nhà.</p>
              )}
            </div>
            <div className="modal-footer bg-gray-50">
              <button
                type="button"
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition duration-200 shadow-sm"
                data-bs-dismiss="modal"
              >
                Đóng
              </button>
            </div>
          </div>
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