import React, { useEffect, useState, useRef } from 'react';
import Chart from 'chart.js/auto';
import { 
  fetchBranchs, 
  fetchEmployees, 
  fetchContracts, 
  fetchAttendances, 
  fetchEmployeeTrainings, 
  fetchDepartments
} from '../services/api';

const Dashboard = ({ active }) => {
  const [branchs, setBranchs] = useState([]);
  const [departments, setDeparments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [attendances, setAttendances] = useState([]);
  const [employeeTrainings, setEmployeeTrainings] = useState([]);
  const [loading, setLoading] = useState(true);

  const dashboardChartRef = useRef(null);
  const ageChartRef = useRef(null);
  const contractChartRef = useRef(null);
  const movementChartRef = useRef(null);
  const quantityChartRef = useRef(null);
  const trainingChartRef = useRef(null);
  const attendanceChartRef = useRef(null);

  useEffect(() => {
    if (!active) return;

    const loadData = async () => {
      try {
        setLoading(true);
        const [branchData,departmentData, employeeData, contractData, attendanceData, trainingData] = await Promise.all([
          fetchBranchs(),
          fetchDepartments(),
          fetchEmployees(),
          fetchContracts(),
          fetchAttendances(),
          fetchEmployeeTrainings(),
        ]);
        // Log dữ liệu để kiểm tra
        console.log('Branch Data:', branchData);
        console.log('Department Data:', departmentData);
        console.log('Employee Data:', employeeData);
        console.log('Contract Data:', contractData);
        console.log('Attendance Data:', attendanceData);
        console.log('Employee Training Data:', trainingData);

        // Đảm bảo dữ liệu là mảng
        setBranchs(Array.isArray(branchData) ? branchData : []);
        setDeparments(Array.isArray(departmentData) ? departmentData : []);
        setEmployees(Array.isArray(employeeData) ? employeeData : []);
        setContracts(Array.isArray(contractData) ? contractData : []);
        setAttendances(Array.isArray(attendanceData) ? attendanceData : []);
        setEmployeeTrainings(Array.isArray(trainingData) ? trainingData : []);
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [active]);

  useEffect(() => {
    if (!active || loading) return;

    const initCharts = () => {
      const destroyIfExists = (chartRef) => {
        if (chartRef.current) {
          chartRef.current.destroy();
          chartRef.current = null;
        }
      };

      // Personnel Status (from employees)
      const personnelStatus = Array.isArray(employees) ? employees.reduce((acc, emp) => {
        acc[emp.status] = (acc[emp.status] || 0) + 1;
        return acc;
      }, {}) : {};
      const totalEmployees = Array.isArray(employees) ? employees.length : 0;

      // Age Distribution
      const ageData = Array.isArray(employees) ? employees.reduce((acc, emp) => {
        const dob = emp.dob ? new Date(emp.dob) : null;
        if (dob) {
          const age = Math.floor((new Date() - dob) / (1000 * 60 * 60 * 24 * 365));
          if (age < 30) acc["Dưới 30"] = (acc["Dưới 30"] || 0) + 1;
          else if (age < 41) acc["30-40"] = (acc["30-40"] || 0) + 1;
          else if (age < 51) acc["41-50"] = (acc["41-50"] || 0) + 1;
          else acc["50+"] = (acc["50+"] || 0) + 1;
        } else {
          acc["Không xác định"] = (acc["Không xác định"] || 0) + 1;
        }
        return acc;
      }, { "Không xác định": 0 }) : { "Không xác định": 0 };

      // Contract Types
      const contractData = Array.isArray(contracts) ? contracts.reduce((acc, contract) => {
        acc[contract.type] = (acc[contract.type] || 0) + 1;
        return acc;
      }, {}) : {};

      // Movement (Join/Leave from attendances)
      const currentYear = new Date().getFullYear();
      const months = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5"];
      const movementData = Array.isArray(attendances) ? months.reduce((acc, _, i) => {
        const month = i + 1;
        acc.dates.push(months[i]);
        acc.join.push(attendances.filter(a => {
          const date = a.date ? new Date(a.date) : null;
          return date && date.getFullYear() === currentYear && date.getMonth() + 1 === month && a.status === 'Present';
        }).length);
        acc.leave.push(attendances.filter(a => {
          const date = a.date ? new Date(a.date) : null;
          return date && date.getFullYear() === currentYear && date.getMonth() + 1 === month && a.status === 'Absent';
        }).length);
        return acc;
      }, { dates: [], join: [], leave: [] }) : { dates: [], join: [], leave: [] };

      // Quantity Over Time (from hire_date)
      const quantityData = Array.isArray(employees) ? months.concat(["Tháng 6", "Tháng 7", "Tháng 8"]).map((_, i) => {
        const month = i + 1;
        return employees.filter(emp => {
          const hireDate = emp.hire_date ? new Date(emp.hire_date) : null;
          return hireDate && hireDate.getFullYear() === currentYear && hireDate.getMonth() + 1 <= month;
        }).length;
      }) : [];

      // Training Stats
      const trainingStats = Array.isArray(employeeTrainings) ? employeeTrainings.reduce((acc, training) => {
        acc[training.result] = (acc[training.result] || 0) + 1;
        return acc;
      }, {}) : {};

      // Attendance Stats (current month)
      const currentMonth = new Date().getMonth() + 1; // June 2025
      const attendanceStats = Array.isArray(attendances) ? attendances.reduce((acc, att) => {
        const date = att.date ? new Date(att.date) : null;
        const month = date ? date.getMonth() + 1 : null;
        if (month === currentMonth) {
          acc[att.status] = (acc[att.status] || 0) + 1;
        }
        return acc;
      }, {}) : {};

      // Initialize Charts
      const dashboardBranchCtx = document.getElementById('dashboardBranchChart')?.getContext('2d');
      if (dashboardBranchCtx) {
        destroyIfExists(dashboardChartRef);
        dashboardChartRef.current = new Chart(dashboardBranchCtx, {
          type: 'bar',
          data: {
            labels: Array.isArray(branchs) ? branchs.map(b => b.name) : [],
            datasets: [{
              label: 'Số nhân viên',
              data: Array.isArray(branchs) ? branchs.map(b => b.employees || 0) : [], // Cần logic đếm nhân viên theo chi nhánh
              backgroundColor: '#4B9CD3',
              borderColor: '#2A6F97',
              borderWidth: 1
            }]
          },
          options: {
            scales: { y: { beginAtZero: true, title: { display: true, text: 'Số lượng' } } },
            plugins: { legend: { display: false } }
          }
        });
      }

      const ageCtx = document.getElementById('ageChart')?.getContext('2d');
      if (ageCtx) {
        destroyIfExists(ageChartRef);
        ageChartRef.current = new Chart(ageCtx, {
          type: 'doughnut',
          data: {
            labels: Object.keys(ageData),
            datasets: [{
              data: Object.values(ageData),
              backgroundColor: ['#4B9CD3', '#F4A261', '#E76F51', '#2A9D8F', '#8D99AE']
            }]
          },
          options: { plugins: { legend: { position: 'bottom' } } }
        });
      }

      const contractCtx = document.getElementById('contractChart')?.getContext('2d');
      if (contractCtx) {
        destroyIfExists(contractChartRef);
        contractChartRef.current = new Chart(contractCtx, {
          type: 'doughnut',
          data: {
            labels: Object.keys(contractData),
            datasets: [{
              data: Object.values(contractData),
              backgroundColor: ['#4B9CD3', '#E76F51', '#2A9D8F', '#F4A261']
            }]
          },
          options: { plugins: { legend: { position: 'bottom' } } }
        });
      }

      const movementCtx = document.getElementById('movementChart')?.getContext('2d');
      if (movementCtx) {
        destroyIfExists(movementChartRef);
        movementChartRef.current = new Chart(movementCtx, {
          type: 'line',
          data: {
            labels: movementData.dates,
            datasets: [
              { label: 'Tiếp nhận', data: movementData.join, borderColor: '#2A9D8F', fill: false, tension: 0.4 },
              { label: 'Nghỉ việc', data: movementData.leave, borderColor: '#E76F51', fill: false, tension: 0.4 }
            ]
          },
          options: { scales: { y: { beginAtZero: true, title: { display: true, text: 'Số người' } } } }
        });
      }

      const quantityCtx = document.getElementById('quantityChart')?.getContext('2d');
      if (quantityCtx) {
        destroyIfExists(quantityChartRef);
        quantityChartRef.current = new Chart(quantityCtx, {
          type: 'bar',
          data: {
            labels: months.concat(["Tháng 6", "Tháng 7", "Tháng 8"]),
            datasets: [{
              label: 'Số lượng nhân sự',
              data: quantityData,
              backgroundColor: '#4B9CD3',
              borderColor: '#2A6F97',
              borderWidth: 1
            }]
          },
          options: {
            scales: { y: { beginAtZero: true, title: { display: true, text: 'Số lượng' } } },
            plugins: { legend: { display: false } }
          }
        });
      }

      const trainingCtx = document.getElementById('trainingChart')?.getContext('2d');
      if (trainingCtx) {
        destroyIfExists(trainingChartRef);
        trainingChartRef.current = new Chart(trainingCtx, {
          type: 'pie',
          data: {
            labels: Object.keys(trainingStats),
            datasets: [{
              data: Object.values(trainingStats),
              backgroundColor: ['#2A9D8F', '#F4A261', '#E76F51']
            }]
          },
          options: { plugins: { legend: { position: 'bottom' } } }
        });
      }

      const attendanceCtx = document.getElementById('attendanceChart')?.getContext('2d');
      if (attendanceCtx) {
        destroyIfExists(attendanceChartRef);
        attendanceChartRef.current = new Chart(attendanceCtx, {
          type: 'bar',
          data: {
            labels: ['Đúng giờ', 'Trễ', 'Nghỉ'],
            datasets: [{
              label: 'Số lượng',
              data: ['Present', 'Late', 'Absent'].map(status => attendanceStats[status] || 0),
              backgroundColor: ['#2A9D8F', '#F4A261', '#E76F51']
            }]
          },
          options: {
            scales: { y: { beginAtZero: true, title: { display: true, text: 'Số lượng' } } },
            plugins: { legend: { display: false } }
          }
        });
      }
    };

    showSpinner('dashboard');
    setTimeout(() => {
      hideSpinner('dashboard');
      initCharts();
    }, 1000);

    return () => {
      [dashboardChartRef, ageChartRef, contractChartRef, movementChartRef, quantityChartRef, trainingChartRef, attendanceChartRef].forEach(ref => {
        if (ref.current) {
          ref.current.destroy();
          ref.current = null;
        }
      });
    };
  }, [active, loading, branchs, employees, contracts, attendances, employeeTrainings]);

  return (
    <div id="dashboard" className={`section ${active ? '' : 'hidden'}`}>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Tổng quan Hệ thống HR</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-600 text-white p-4 rounded-lg shadow-lg">
          <h3 className="text-md font-semibold">Nhân viên</h3>
          <p className="text-3xl font-bold mt-2">{Array.isArray(employees) ? employees.length : 0}</p>
        </div>
        <div className="bg-green-600 text-white p-4 rounded-lg shadow-lg">
          <h3 className="text-md font-semibold">Đơn vị</h3>
          <p className="text-3xl font-bold mt-2">{Array.isArray(branchs) ? branchs.length : 0}</p>
        </div>
        <div className="bg-yellow-600 text-white p-4 rounded-lg shadow-lg">
          <h3 className="text-md font-semibold">Chi nhánh</h3>
          <p className="text-3xl font-bold mt-2">{Array.isArray(departments) ? employees.length : 0}</p>
        </div>
        <div className="bg-red-600 text-white p-4 rounded-lg shadow-lg">
          <h3 className="text-md font-semibold">Nghỉ thai sản</h3>
          <p className="text-3xl font-bold mt-2">{Array.isArray(employees) ? employees.filter(emp => emp.status === 'Nghỉ thai sản').length : 0}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Nhân viên theo Chi nhánh</h3>
          <canvas id="dashboardBranchChart" className="w-full h-64"></canvas>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Thống kê Chấm công</h3>
          <canvas id="attendanceChart" className="w-full h-64"></canvas>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Cơ cấu theo Độ tuổi</h3>
          <canvas id="ageChart" className="w-full h-64"></canvas>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Thống kê Hợp đồng</h3>
          <canvas id="contractChart" className="w-full h-64"></canvas>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Biến động Nhân sự</h3>
          <canvas id="movementChart" className="w-full h-64"></canvas>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Số lượng Nhân sự</h3>
          <canvas id="quantityChart" className="w-full h-64"></canvas>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Thống kê Đào tạo</h3>
          <canvas id="trainingChart" className="w-full h-64"></canvas>
        </div>
      </div>
      <div className="spinner-overlay" id="dashboardSpinner">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;