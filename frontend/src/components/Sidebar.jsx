import React from 'react';

const Sidebar = ({ onNavigate, toggleSidebar, activeSection, isSidebarExpanded }) => {
  return (
    <div
      className={`sidebar ${isSidebarExpanded ? 'expanded' : 'collapsed'} bg-light border-end`}
      id="sidebar"
    >
      <nav className="flex flex-col h-full p-3 gap-2 transition-all duration-300" style={{marginTop:'5em'}}>
        {[
          { key: 'dashboard', label: ' Tổng quan', icon: 'fas fa-home' },
          { key: 'personnel', label: ' Nhân sự', icon: 'fas fa-users' },
          { key: 'branches', label: ' Chi nhánh', icon: 'fas fa-building' },
          { key: 'attendance', label: ' Chấm công', icon: 'fas fa-clock' },
          { key: 'reports', label: ' Báo cáo', icon: 'fas fa-chart-bar' },
          { key: 'reminders', label: ' Nhắc việc', icon: 'fas fa-bell' }
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
