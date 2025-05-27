import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchBranchs } from '../services/api';

const BranchContext = createContext();

export function BranchProvider({ children }) {
    const [branchs, setBranchs] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBranchs()
            .then(data => setBranchs(data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    return (
        <BranchContext.Provider value={{ branchs, loading, selectedBranch, setSelectedBranch }}>
            {children}
        </BranchContext.Provider>
    );
}

export function useBranchData() {
    return useContext(BranchContext);
}
