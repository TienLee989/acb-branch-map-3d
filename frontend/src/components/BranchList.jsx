import React, { useState } from 'react';
import { useBranchData } from '../hooks/useBranchData';
import '../styles/BranchList.css';
import { parseWKTPolygon } from '../utils/wkt'; // Hàm mới cho POLYGON

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
                // <ul>
                //     {filtered.map(branch => (
                //         <li key={branch.id} onClick={() => setSelectedBranch(branch)}>
                //             <strong>{branch.name || 'Không có tên'}</strong>
                //             <div className="coords">
                //                 {parseWKTPolygon(branch.geom)?.join(', ')}
                //             </div>
                //         </li>
                //     ))}
                // </ul>
                <ul className="branch-list-items">
                    {filtered.map(branch => {
                        const coords = parseWKTPolygon(branch.geom);
                        const services = branch.tags?.services?.join(', ');

                        return (
                            <li key={branch.id} onClick={() => setSelectedBranch(branch)} className="branch-item">
                                <div className="branch-header">
                                    <strong className="branch-name">{branch.name || 'Không có tên'}</strong>
                                </div>
                                <div className="branch-details">
                                    <div className="branch-line">
                                        📍 <span>{branch.address || 'Chưa có địa chỉ'}</span>
                                    </div>
                                    <div className="branch-line">
                                        ☎️ <span>{branch.phone || 'Không có số điện thoại'}</span>
                                    </div>
                                    {services && (
                                        <div className="branch-line">
                                            🛠 <span>{services}</span>
                                        </div>
                                    )}
                                    {coords && (
                                        <div className="branch-coords">
                                            📌 Tọa độ: <span>{parseWKTPolygon(branch.geom)?.join(', ')}</span>
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
