import React, { useEffect, useState, useRef } from 'react';
import Chart from 'chart.js/auto';
import { jsPDF } from 'jspdf';

const Reports = ({ active }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const ageChartRef = useRef(null);
  const contractChartRef = useRef(null);
  const movementChartRef = useRef(null);
  const quantityChartRef = useRef(null);

  const ageData = { "Dưới 30": 1804, "30-40": 574, "41-50": 45, "50+": 2, "Không xác định": 3 };
  const contractData = { "Hợp đồng chính thức": 1959, "Hợp đồng xác định thời hạn": 102, "Thử việc": 7, "Khác": 1 };
  const movementData = { dates: ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5"], join: [410, 603, 822, 907, 1301], leave: [2426, 2429, 1674, 1301, 907] };
  const quantityData = [410, 603, 822, 907, 1301, 1674, 2426, 2429];

  const destroyCharts = () => {
    [ageChartRef, contractChartRef, movementChartRef, quantityChartRef].forEach(ref => {
      if (ref.current) {
        ref.current.destroy();
        ref.current = null;
      }
    });
  };

  const initCharts = () => {
    destroyCharts();

    const ageCtx = document.getElementById('ageChart')?.getContext('2d');
    if (ageCtx) {
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

  const filterReports = () => {
    showSpinner('reports');
    setTimeout(() => {
      hideSpinner('reports');
      initCharts();
      showToast('Đã lọc báo cáo thành công!');
    }, 1000);
  };

  const refreshData = () => {
    showSpinner('reports');
    setTimeout(() => {
      hideSpinner('reports');
      initCharts();
      showToast('Đã làm mới dữ liệu!');
    }, 1000);
  };

  const exportReportPDF = () => {
    const doc = new jsPDF();
    doc.text('Báo cáo Nhân sự ACB', 10, 10);
    doc.text('Cơ cấu Nhân sự theo Độ tuổi', 10, 20);
    Object.keys(ageData).forEach((key, i) => doc.text(`${key}: ${ageData[key]}`, 10, 30 + i * 10));
    doc.text('Thống kê Hợp đồng theo Loại', 10, 90);
    Object.keys(contractData).forEach((key, i) => doc.text(`${key}: ${contractData[key]}`, 10, 100 + i * 10));
    doc.save('report.pdf');
    showToast('Đã xuất PDF thành công!');
  };

  useEffect(() => {
    if (active) {
      refreshData();
    } else {
      destroyCharts(); // Cleanup nếu tab bị ẩn
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return (
    <div id="reports" className={`section ${active ? '' : 'hidden'}`}>
      <h2 className="text-2xl font-bold mb-4">Báo cáo Nâng cao</h2>
      <div className="flex justify-between mb-4">
        <div className="flex space-x-2">
          <input type="date" className="p-2 border rounded-lg" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <input type="date" className="p-2 border rounded-lg" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          <button className="custom-btn" onClick={filterReports}>
            <i className="fas fa-filter mr-2"></i>Lọc
          </button>
        </div>
        <div>
          <button className="custom-btn me-2" onClick={refreshData}>
            <i className="fas fa-sync-alt mr-2"></i>Làm mới
          </button>
          <button className="custom-btn" onClick={exportReportPDF}>
            <i className="fas fa-file-pdf mr-2"></i>Xuất PDF
          </button>
        </div>
      </div>

      <div className="card relative">
        <div id="reportsSpinner" className="spinner-overlay">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-0">
          <div style={{height:'25em'}}>
            <h3 className="text-lg font-semibold mb-2">Cơ cấu Nhân sự theo Độ tuổi</h3>
            <canvas id="ageChart" width="100" height="100"></canvas>
          </div>
          <div style={{height:'25em'}}>
            <h3 className="text-lg font-semibold mb-2">Thống kê Hợp đồng theo Loại</h3>
            <canvas id="contractChart" width="100" height="100"></canvas>
          </div>
          <div className='mt-3'>
            <h3 className="text-lg font-semibold mb-2">Biến động Nhân sự</h3>
            <canvas id="movementChart"></canvas>
          </div>
          <div className='mt-3'>
            <h3 className="text-lg font-semibold mb-2">Số lượng Nhân sự</h3>
            <canvas id="quantityChart"></canvas>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
