import React from 'react';

const Sidebar = ({ onNavigate, toggleSidebar, activeSection, isSidebarExpanded }) => {
  return (
    <div
      className={`sidebar ${isSidebarExpanded ? 'expanded' : 'collapsed'} bg-light border-end`}
      id="sidebar"
    >
      <nav className="flex flex-col h-full p-3 gap-2 transition-all duration-300" style={{marginTop:'5em'}}>
        {[
        { key: 'dashboard', label: ' Tổng quan', icon: 'fas fa-chart-pie' },
        { key: 'branches', label: ' Chi nhánh', icon: 'fas fa-code-branch' },
        { key: 'departments', label: ' Phòng ban', icon: 'fas fa-building' },
        { key: 'personnel', label: ' Nhân sự', icon: 'fas fa-users' },
        { key: 'attendance', label: ' Chấm công', icon: 'fas fa-clock' },
        { key: 'evaluations', label: ' Đánh giá', icon: 'fas fa-star' },
        { key: 'events', label: ' Sự kiện', icon: 'fas fa-calendar-check' },
        { key: 'trainings', label: ' Training', icon: 'fas fa-chalkboard-teacher' },
        { key: 'leaves', label: ' Nghỉ phép', icon: 'fas fa-plane-departure' },
        { key: 'payroll', label: ' Lương', icon: 'fas fa-wallet' },
        { key: 'contracts', label: ' Hợp đồng', icon: 'fas fa-file-contract' },
        { key: 'reports', label: ' Báo cáo', icon: 'fas fa-chart-line' }
      ].map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => onNavigate(key)}
            className={`btn text-start flex items-center gap-2 ${
              activeSection === key ? 'fw-bold text-primary' : ''
            }`}
          >
            <i className={`${icon}`}></i>
            <span>{isSidebarExpanded && label}</span>
          </button>
        ))}

        <hr className="my-2" />

        <button onClick={toggleSidebar} className="flex items-center gap-2 ml-3">
          <i className="fas fa-bars"></i>
          <span>{isSidebarExpanded ? 'Thu gọn' : ''}</span>
        </button>
      </nav>
    </div>
  );
};

export default Sidebar;
