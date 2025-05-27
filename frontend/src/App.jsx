import React from 'react';
import BranchMap from './components/BranchMap';
import BranchList from './components/BranchList';
import { BranchProvider } from './hooks/useBranchData';
import './styles/App.css';

function App() {
  return (
    <BranchProvider>
      <div className="app">
        <h1 className="title">
          🏦 Hệ thống Branch tại TP. Hồ Chí Minh
          <small className="version">v1.0.1</small>
        </h1>
        <div className="content">
          <BranchList />
          <BranchMap />
        </div>
      </div>
    </BranchProvider>
  );
}

export default App;
