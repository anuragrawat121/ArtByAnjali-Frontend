import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

const apiClient = axios.create({
    baseURL: API_URL,
    timeout: 15000, 
    headers: {
        'Content-Type': 'application/json'
    }
});

// Primary Artwork Fetch
export const getArtworks = () => apiClient.get('/artworks');

// Public Contact Form
export const submitContact = (data) => apiClient.post('/contact', data);

// Admin Artworks
export const addArtwork = (formData, key) => apiClient.post(`/artworks?key=${key}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});

// Admin Profile
export const getProfile = () => apiClient.get('/profile');
export const updateProfile = (formData, key) => apiClient.post(`/profile?key=${key}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});

// Admin Messages & Auth Verification
export const getMessages = (key) => apiClient.get(`/contact?key=${key}`);

// Delete Artwork
export const deleteArtwork = (id, key) => apiClient.delete(`/artworks/${id}?key=${key}`);

export default apiClient;
