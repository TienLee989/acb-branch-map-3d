import axios from 'axios';

const API_URL = 'http://localhost:8003/api/branchs/';

export const fetchBranchs = async () => {
    try {
        console.log("---------start----------");
        const response = await axios.get(API_URL);
        return response.data;
    } catch (error) {
        console.error('Lỗi chi tiết:', error.response?.data || error.message);
        throw new Error('Không thể tải dữ liệu Branch: ' + error.message);
    }
};