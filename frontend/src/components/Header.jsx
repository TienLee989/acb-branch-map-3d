import React, { useState, useEffect } from 'react';

const Header = () => {
    const [currentTime, setCurrentTime] = useState('');

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const options = { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' };
            const time = now.toLocaleTimeString('vi-VN', { hour12: false });
            const date = now.toLocaleDateString('vi-VN', options);
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            setCurrentTime(`Ngày: ${date}, ${time} (${timezone})`);
        };
        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="header w-100 d-flex justify-content-center align-items-center pt-3 pb-1" style={{ position: 'absolute', top: 0, zIndex: 100, backgroundColor: '#ffffff', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
            <div>
                <h4 className="font-semibold mb-1">Hệ thống Quản lý nhân sự ACB Bank tại Việt Nam<small className="text-muted text-sm">v1.0.1</small></h4>
                <p id="currentTime" className="text-sm font-mono text-center">{currentTime}</p>
            </div>
        </div>
    );
};

export default Header;