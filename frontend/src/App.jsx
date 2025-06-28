import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Personnel from './components/Personnel';
import Branches from './components/Branches';
import Attendance from './components/Attendance';
import Reports from './components/Reports';
import Reminders from './components/Reminders';
import Footer from './components/Footer';
import Departments from './components/Departments';
import Leaves from './components/Leaves';
import Evaluations from './components/Evaluations';
import Events from './components/Events';
import Trainings from './components/Trainings';
import Payroll from './components/Payroll';
import Contracts from './components/Contracts';
import './styles/index.css';

const SectionWrapper = ({ children, isSidebarExpanded }) => {
  return (
    <main
      className={`main-content ${isSidebarExpanded ? 'sidebar-expanded' : 'sidebar-collapsed'}`}
      style={{ marginTop: '6em' }}
    >
      {children}
    </main>
  );
};

const AppInner = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  const activeSection = location.pathname.replace('/', '') || 'dashboard';

  useEffect(() => {
    window.showToast = (message, type = 'success') => {
      const toastEl = document.getElementById('actionToast');
      const messageEl = document.getElementById('toastMessage');

      if (toastEl && messageEl) {
        messageEl.innerText = message;

        toastEl.classList.remove('bg-success', 'bg-danger', 'bg-warning');
        toastEl.classList.add(
          type === 'error' ? 'bg-danger' : type === 'warning' ? 'bg-warning' : 'bg-success'
        );

        const toast = new bootstrap.Toast(toastEl);
        toast.show();
      }
    };

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
    navigate(`/${sectionId}`);
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

        <Routes>
          <Route path="/" element={<SectionWrapper isSidebarExpanded={isSidebarExpanded}><Dashboard active /></SectionWrapper>} />
          <Route path="/dashboard" element={<SectionWrapper isSidebarExpanded={isSidebarExpanded}><Dashboard active /></SectionWrapper>} />
          <Route path="/branches" element={<SectionWrapper isSidebarExpanded={isSidebarExpanded}><Branches active /></SectionWrapper>} />
          <Route path="/departments" element={<SectionWrapper isSidebarExpanded={isSidebarExpanded}><Departments active /></SectionWrapper>} />
          <Route path="/personnel" element={<SectionWrapper isSidebarExpanded={isSidebarExpanded}><Personnel active /></SectionWrapper>} />
          <Route path="/attendance" element={<SectionWrapper isSidebarExpanded={isSidebarExpanded}><Attendance active /></SectionWrapper>} />
          <Route path="/evaluations" element={<SectionWrapper isSidebarExpanded={isSidebarExpanded}><Evaluations active /></SectionWrapper>} />
          <Route path="/events" element={<SectionWrapper isSidebarExpanded={isSidebarExpanded}><Events active /></SectionWrapper>} />
          <Route path="/trainings" element={<SectionWrapper isSidebarExpanded={isSidebarExpanded}><Trainings active /></SectionWrapper>} />
          <Route path="/leaves" element={<SectionWrapper isSidebarExpanded={isSidebarExpanded}><Leaves active /></SectionWrapper>} />
          <Route path="/payroll" element={<SectionWrapper isSidebarExpanded={isSidebarExpanded}><Payroll active /></SectionWrapper>} />
          <Route path="/contracts" element={<SectionWrapper isSidebarExpanded={isSidebarExpanded}><Contracts active /></SectionWrapper>} />
          <Route path="/reports" element={<SectionWrapper isSidebarExpanded={isSidebarExpanded}><Reports active /></SectionWrapper>} />
          <Route path="/reminders" element={<SectionWrapper isSidebarExpanded={isSidebarExpanded}><Reminders active /></SectionWrapper>} />
        </Routes>
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

const App = () => (
  <Router>
    <AppInner />
  </Router>
);

export default App;
