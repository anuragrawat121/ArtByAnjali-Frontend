import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ConnectionStatus = () => {
    const [status, setStatus] = useState('checking');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const checkConnection = async () => {
            try {
                const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
                const response = await axios.get(`${API_URL}/status`);
                if (response.data.status === 'ok') {
                    setStatus('connected');
                    setMessage(response.data.message);
                }
            } catch (error) {
                setStatus('error');
                setMessage('Could not reach backend at ' + (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1'));
            }
        };

        checkConnection();
    }, []);

    const styles = {
        container: {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            padding: '10px 20px',
            borderRadius: '30px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '14px',
            fontWeight: '600',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            zIndex: 9999,
            backgroundColor: status === 'connected' ? '#dcfce7' : status === 'error' ? '#fee2e2' : '#f3f4f6',
            color: status === 'connected' ? '#166534' : status === 'error' ? '#991b1b' : '#374151',
            border: `1px solid ${status === 'connected' ? '#166534' : status === 'error' ? '#991b1b' : '#374151'}22`
        },
        dot: {
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: status === 'connected' ? '#22c55e' : status === 'error' ? '#ef4444' : '#9ca3af',
            animation: status === 'checking' ? 'pulse 1s infinite' : 'none'
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.dot}></div>
            <span>{status === 'connected' ? 'Backend Live' : status === 'error' ? 'Connection Failed' : 'Checking Backend...'}</span>
        </div>
    );
};

export default ConnectionStatus;
