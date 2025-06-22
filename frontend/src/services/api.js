import axios from 'axios';

export const fetchBranchs = async () => {
    try {
        const API_URL = 'http://localhost:8003/api/branchs/';
        console.log("---------start----------");
        const response = await axios.get(API_URL);
        return response.data;
    } catch (error) {
        console.error('Lỗi chi tiết:', error.response?.data || error.message);
        throw new Error('Không thể tải dữ liệu Branch: ' + error.message);
    }
};

export const fetchContracts = async () => {
    try {
        const API_URL = 'http://localhost:8003/api/contracts/';
        console.log("---------start----------");
        const response = await axios.get(API_URL);
        return response.data;
    } catch (error) {
        console.error('Lỗi chi tiết:', error.response?.data || error.message);
        throw new Error('Không thể tải dữ liệu contracts: ' + error.message);
    }
};
export const fetchDepartments = async () => {
    try {
        const API_URL = 'http://localhost:8003/api/departments/';
        console.log("---------start----------");
        const response = await axios.get(API_URL);
        return response.data;
    } catch (error) {
        console.error('Lỗi chi tiết:', error.response?.data || error.message);
        throw new Error('Không thể tải dữ liệu departments: ' + error.message);
    }
};
export const fetchEvaluations = async () => {
    try {
        const API_URL = 'http://localhost:8003/api/evaluations/';
        console.log("---------start----------");
        const response = await axios.get(API_URL);
        return response.data;
    } catch (error) {
        console.error('Lỗi chi tiết:', error.response?.data || error.message);
        throw new Error('Không thể tải dữ liệu evaluations: ' + error.message);
    }
};
export const fetchEvents = async () => {
    try {
        const API_URL = 'http://localhost:8003/api/events/';
        console.log("---------start----------");
        const response = await axios.get(API_URL);
        return response.data;
    } catch (error) {
        console.error('Lỗi chi tiết:', error.response?.data || error.message);
        throw new Error('Không thể tải dữ liệu events: ' + error.message);
    }
};
export const fetchLeaves = async () => {
    try {
        const API_URL = 'http://localhost:8003/api/leaves/';
        console.log("---------start----------");
        const response = await axios.get(API_URL);
        return response.data;
    } catch (error) {
        console.error('Lỗi chi tiết:', error.response?.data || error.message);
        throw new Error('Không thể tải dữ liệu leaves: ' + error.message);
    }
};
export const fetchPayrolls = async () => {
    try {
        const API_URL = 'http://localhost:8003/api/payroll/';
        console.log("---------start----------");
        const response = await axios.get(API_URL);
        return response.data;
    } catch (error) {
        console.error('Lỗi chi tiết:', error.response?.data || error.message);
        throw new Error('Không thể tải dữ liệu payroll: ' + error.message);
    }
};
export const fetchPositions = async () => {
    try {
        const API_URL = 'http://localhost:8003/api/positions/';
        console.log("---------start----------");
        const response = await axios.get(API_URL);
        return response.data;
    } catch (error) {
        console.error('Lỗi chi tiết:', error.response?.data || error.message);
        throw new Error('Không thể tải dữ liệu positions: ' + error.message);
    }
};
export const fetchTrainings = async () => {
    try {
        const API_URL = 'http://localhost:8003/api/trainings/';
        console.log("---------start----------");
        const response = await axios.get(API_URL);
        return response.data;
    } catch (error) {
        console.error('Lỗi chi tiết:', error.response?.data || error.message);
        throw new Error('Không thể tải dữ liệu trainings: ' + error.message);
    }
};