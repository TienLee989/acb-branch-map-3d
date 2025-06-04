import React, { useEffect, useState, useRef } from 'react';
import Chart from 'chart.js/auto';
import { fetchBranchs } from '../services/api';

const Dashboard = ({ active }) => {
  const [branchs, setBranchs] = useState([]);
  const [loading, setLoading] = useState(true);

  const dashboardChartRef = useRef(null);
  const ageChartRef = useRef(null);
  const contractChartRef = useRef(null);
  const movementChartRef = useRef(null);
  const quantityChartRef = useRef(null);

  const personnelStatus = { "Thử việc": 126, "Chính thức": 2272, "Nghỉ thai sản": 0, "Khác": 10 };
  const ageData = { "Dưới 30": 1804, "30-40": 574, "41-50": 45, "50+": 2, "Không xác định": 3 };
  const contractData = { "Hợp đồng chính thức": 1959, "Hợp đồng xác định thời hạn": 102, "Thử việc": 7, "Khác": 1 };
  const movementData = { dates: ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5"], join: [410, 603, 822, 907, 1301], leave: [2426, 2429, 1674, 1301, 907] };
  const quantityData = [410, 603, 822, 907, 1301, 1674, 2426, 2429];

  useEffect(() => {
    if (!active) return;
    const loadBranchs = async () => {
      try {
        const data = await fetchBranchs();
        setBranchs(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadBranchs();
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

      const dashboardBranchCtx = document.getElementById('dashboardBranchChart')?.getContext('2d');
      if (dashboardBranchCtx) {
        destroyIfExists(dashboardChartRef);
        dashboardChartRef.current = new Chart(dashboardBranchCtx, {
          type: 'bar',
          data: {
            labels: branchs.map(b => b.name),
            datasets: [{
              label: 'Số nhân viên',
              data: branchs.map(b => b.employees),
              backgroundColor: '#3b82f6',
              borderColor: '#1e3a8a',
              borderWidth: 1
            }]
          },
          options: {
            scales: { y: { beginAtZero: true } },
            plugins: { legend: { display: false } }
          }
        });
      }

      const ageCtx = document.getElementById('ageChart')?.getContext('2d');
      if (ageCtx) {
        destroyIfExists(ageChartRef);
        ageChartRef.current = new Chart(ageCtx, {
          type: 'pie',
          data: {
            labels: Object.keys(ageData),
            datasets: [{
              data: Object.values(ageData),
              backgroundColor: ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#6b7280']
            }]
          },
          options: { plugins: { legend: { position: 'bottom' } } }
        });
      }

      const contractCtx = document.getElementById('contractChart')?.getContext('2d');
      if (contractCtx) {
        destroyIfExists(contractChartRef);
        contractChartRef.current = new Chart(contractCtx, {
          type: 'pie',
          data: {
            labels: Object.keys(contractData),
            datasets: [{
              data: Object.values(contractData),
              backgroundColor: ['#3b82f6', '#ef4444', '#f59e0b', '#10b981']
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
              { label: 'Tiếp nhận', data: movementData.join, borderColor: '#10b981', fill: false },
              { label: 'Nghỉ việc', data: movementData.leave, borderColor: '#ef4444', fill: false }
            ]
          },
          options: { scales: { y: { beginAtZero: true } } }
        });
      }

      const quantityCtx = document.getElementById('quantityChart')?.getContext('2d');
      if (quantityCtx) {
        destroyIfExists(quantityChartRef);
        quantityChartRef.current = new Chart(quantityCtx, {
          type: 'bar',
          data: {
            labels: movementData.dates.concat(["Tháng 6", "Tháng 7", "Tháng 8"]),
            datasets: [{
              label: 'Số lượng nhân sự',
              data: quantityData,
              backgroundColor: '#3b82f6',
              borderColor: '#1e3a8a',
              borderWidth: 1
            }]
          },
          options: {
            scales: { y: { beginAtZero: true } },
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
      [dashboardChartRef, ageChartRef, contractChartRef, movementChartRef, quantityChartRef].forEach(ref => {
        if (ref.current) {
          ref.current.destroy();
          ref.current = null;
        }
      });
    };
  }, [active, branchs, loading]);

  return (
    <div id="dashboard" className={`section ${active ? '' : 'hidden'}`}>
      <h2 className="text-2xl font-bold mb-4">Tổng quan</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card card-2">
          <h3 className="text-lg text-white font-semibold text-gray-700">Tổng Nhân viên</h3>
          <p className="text-2xl text-white font-bold text-gray-900">2,408</p>
        </div>
        <div className="card card-1">
          <h3 className="text-lg text-white font-semibold text-gray-700">Thử việc</h3>
          <p className="text-2xl text-white font-bold text-gray-900">126</p>
        </div>
        <div className="card card-3">
          <h3 className="text-lg text-white font-semibold text-gray-700">Chính thức</h3>
          <p className="text-2xl text-white font-bold text-gray-900">2,272</p>
        </div>
        <div className="card card-4">
          <h3 className="text-lg text-white font-semibold text-gray-700">Nghỉ thai sản</h3>
          <p className="text-2xl text-white font-bold text-gray-900">0</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">Nhân viên theo Chi nhánh</h3>
          <canvas id="dashboardBranchChart"></canvas>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">Biến động Nhân sự</h3>
          <canvas id="movementChart"></canvas>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">Số lượng Nhân sự</h3>
          <canvas id="quantityChart"></canvas>
        </div>
        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-semibold mb-2 text-gray-700">Cơ cấu Nhân sự theo Độ tuổi</h3>
              <canvas id="ageChart" width="200" height="200"></canvas>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2 text-gray-700">Thống kê Hợp đồng theo Loại</h3>
              <canvas id="contractChart" width="200" height="200"></canvas>
            </div>
          </div>
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