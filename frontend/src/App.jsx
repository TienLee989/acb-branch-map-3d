import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Personnel from './components/Personnel';
import Branches from './components/Branches';
import Attendance from './components/Attendance';
import Reports from './components/Reports';
import Reminders from './components/Reminders';
import Footer from './components/Footer';
import Departments from './components/Departments'
import Leaves from './components/Leaves'
import './styles/index.css'; // chứa CSS fix layout
import { Style } from 'maplibre-gl';
import Evaluations from './components/Evaluations';
import Events from './components/Events';
import Trainings from './components/Trainings';
import Payroll from './components/Payroll';
import Contracts from './components/Contracts';

const App = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  useEffect(() => {
    window.showToast = (message) => {
      const toastEl = document.getElementById('actionToast');
      const messageEl = document.getElementById('toastMessage');
      if (toastEl && messageEl) {
        messageEl.innerText = message;
        const toast = new bootstrap.Toast(toastEl);
        toast.show();
      }
    };
  }, []);

  useEffect(() => {
    window.showSpinner = (id) => {
      const el = document.getElementById(`${id}Spinner`);
      if (el) el.classList.add('active');
    };
    window.hideSpinner = (id) => {
      const el = document.getElementById(`${id}Spinner`);
      if (el) el.classList.remove('active');
    };
  }, []);

  const handleSectionChange = (sectionId) => {
    setActiveSection(sectionId);
  };

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  return (
    <div className="app-container">
      <Header />
      <div className="app-body">
        <Sidebar
          activeSection={activeSection}
          onNavigate={handleSectionChange}
          toggleSidebar={toggleSidebar}
          isSidebarExpanded={isSidebarExpanded}
        />
        <main
          className={`main-content ${isSidebarExpanded ? 'sidebar-expanded' : 'sidebar-collapsed'}`}
          style={{ marginTop: '6em' }}
        >
          {activeSection === 'dashboard' && <Dashboard active />}
          {activeSection === 'branches' && <Branches active />}
          {activeSection === 'departments' && <Departments active />}

          {activeSection === 'personnel' && <Personnel active />}
          {activeSection === 'evaluations' && <Evaluations active />}
          {activeSection === 'events' && <Events active />}
          {activeSection === 'trainings' && <Trainings active />}
          {activeSection === 'leaves' && <Leaves active />}

          {activeSection === 'payroll' && <Payroll active />}
          {activeSection === 'contracts' && <Contracts active />}

          {activeSection === 'attendance' && <Attendance active />}
          {activeSection === 'reports' && <Reports active />}
          {activeSection === 'reminders' && <Reminders active />}
        </main>
      </div>
      <Footer />

      {/* Toast */}
      <div className="toast-container position-fixed bottom-0 end-0 p-3">
        <div id="actionToast" className="toast bg-success text-white" role="alert" aria-live="assertive" aria-atomic="true">
          <div className="toast-body" id="toastMessage"></div>
        </div>
      </div>
    </div>
  );
};

export default App;
