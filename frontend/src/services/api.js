/**
 * api.js — Axios HTTP Client untuk PhilanthropyChain dApp
 * Menangani semua komunikasi antara React frontend dan Laravel 13 Backend.
 */

// Menggunakan Fetch API bawaan browser (tidak perlu install axios terpisah)
// Jika ingin pakai axios, jalankan: npm install axios

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

/**
 * Mengambil token Sanctum dari localStorage.
 */
const getToken = () => localStorage.getItem('auth_token');

/**
 * Helper: Membuat headers default dengan Authorization Bearer token.
 */
const buildHeaders = (isMultipart = false) => {
  const token = getToken();
  const headers = {};
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  headers['Accept'] = 'application/json';
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

/**
 * Helper umum: Wrapper fetch dengan error handling terpusat.
 */
const request = async (method, endpoint, body = null, isMultipart = false) => {
  const config = {
    method,
    headers: buildHeaders(isMultipart),
  };

  if (body) {
    config.body = isMultipart ? body : JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, config);

  // Handle 401: Token expired / tidak valid → hapus token
  if (response.status === 401) {
    localStorage.removeItem('auth_token');
    // Redirect ke landing page jika session habis
    window.location.hash = '#/';
    throw new Error('Sesi telah berakhir. Silakan login kembali.');
  }

  const data = await response.json();

  if (!response.ok) {
    // Lempar pesan error dari backend Laravel
    throw new Error(data.message || `HTTP Error: ${response.status}`);
  }

  return data;
};

// ============================================================
// AUTH ENDPOINTS
// ============================================================

/**
 * Register pengguna baru dengan signature MetaMask.
 * @param {object} payload - { name, email, wallet_address, signature, message, role }
 */
export const apiRegister = (payload) =>
  request('POST', '/auth/register', payload);

/**
 * Login pengguna dengan signature MetaMask.
 * @param {object} payload - { wallet_address, signature, message }
 */
export const apiLogin = (payload) =>
  request('POST', '/auth/login', payload);

/**
 * Logout pengguna (membatalkan token Sanctum di backend).
 */
export const apiLogout = () =>
  request('POST', '/auth/logout');

// ============================================================
// DOCUMENT UPLOAD (IPFS via Pinata)
// ============================================================

/**
 * Upload dokumen berkas penerima bantuan ke IPFS melalui Laravel.
 * @param {FormData} formData - FormData berisi data pemohon + file-file dokumen
 * @returns {Promise<{cid: string, document_id: string}>}
 */
export const apiUploadDocument = async (formData) => {
  const token = getToken();
  const headers = { Accept: 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  // Penting: Jangan set Content-Type manual untuk multipart/form-data
  // Browser akan set boundary otomatis

  const response = await fetch(`${BASE_URL}/document/upload`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (response.status === 401) {
    localStorage.removeItem('auth_token');
    window.location.hash = '#/';
    throw new Error('Sesi telah berakhir. Silakan login kembali.');
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Upload dokumen gagal.');
  }

  return data; // Mengandung { data: { cid, document_id } }
};

// ============================================================
// CAMPAIGN ENDPOINTS
// ============================================================

/**
 * Mengambil daftar semua kampanye dari backend (termasuk komentar & laporan).
 * Endpoint ini PUBLIC (tidak butuh token).
 */
export const apiFetchCampaigns = () =>
  request('GET', '/campaigns');

/**
 * Menambahkan komentar/doa ke sebuah kampanye.
 * @param {number} campaignId - ID kampanye
 * @param {object} payload - { content: string }
 */
export const apiAddComment = (campaignId, payload) =>
  request('POST', `/campaigns/${campaignId}/comments`, payload);

/**
 * Melaporkan alokasi dana ke sebuah kampanye.
 * @param {number} campaignId - ID kampanye
 * @param {object} payload - { tx_hash, amount, description }
 */
export const apiAddReport = (campaignId, payload) =>
  request('POST', `/campaigns/${campaignId}/reports`, payload);

// ============================================================
// DASHBOARD STATS
// ============================================================

/**
 * Mengambil data statistik dashboard: profil user, status berkas, saldo ETH on-chain.
 * Membutuhkan token Sanctum (harus login).
 */
export const apiFetchDashboardStats = () =>
  request('GET', '/dashboard/stats');

// ============================================================
// BLOCKCHAIN RPC INTEGRATIONS
// ============================================================

/**
 * Verifikasi transaksi blockchain via hash dari MetaMask.
 * @param {object} payload - { tx_hash: string }
 */
export const apiVerifyTransaction = (payload) =>
  request('POST', '/blockchain/verify-tx', payload);

/**
 * Membaca saldo ETH sebuah address langsung dari Hyperledger Besu via backend.
 * @param {string} address - Wallet address (0x...)
 */
export const apiFetchBalance = (address) =>
  request('GET', `/blockchain/balance/${address}`);

// ============================================================
// DEFAULT EXPORT (AXIOS-LIKE)
// ============================================================
const api = {
  get: (endpoint) => request('GET', endpoint.replace('/api/v1', '')),
  post: (endpoint, body, isMultipart) => request('POST', endpoint.replace('/api/v1', ''), body, isMultipart),
  put: (endpoint, body) => request('PUT', endpoint.replace('/api/v1', ''), body),
  delete: (endpoint) => request('DELETE', endpoint.replace('/api/v1', '')),
};

export default api;
