import React, { useState } from 'react';
import { useBranchData } from '../hooks/useBranchData';
import '../styles/BranchList.css';
import { parseWKTPolygon } from '../utils/wkt'; // Đảm bảo hàm này vẫn hỗ trợ POLYGON WKT

function BranchList() {
  const { branchs, loading, setSelectedBranch } = useBranchData();
  const [search, setSearch] = useState('');

  const filtered = branchs.filter(branch =>
    branch.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="branch-list">
      <input
        type="text"
        placeholder="🔍 Tìm kiếm Branch..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="search-input"
      />
      {loading ? (
        <div>Đang tải dữ liệu...</div>
      ) : (
        <ul className="branch-list-items">
          {filtered.map(branch => {
            const buildings = branch.buildings || [];
            const firstBuilding = buildings[0]; // Lấy tạm 1 building đầu tiên
            const coords = firstBuilding?.footprint
              ? parseWKTPolygon(firstBuilding.footprint)
              : null;

            return (
              <li
                key={branch.id}
                onClick={() => setSelectedBranch(branch)}
                className="branch-item"
              >
                <div className="branch-header">
                  <strong className="branch-name">{branch.name || 'Không có tên'}</strong>
                </div>
                <div className="branch-details">
                  <div className="branch-line">
                    📍 <span>{branch.address || 'Chưa có địa chỉ'}</span>
                  </div>
                  {firstBuilding?.manager_name && (
                    <div className="branch-line">
                      👤 <span>{firstBuilding.manager_name}</span>
                    </div>
                  )}
                  {coords && (
                    <div className="branch-coords">
                      📌 Tọa độ: <span>{coords.join(', ')}</span>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default BranchList;
