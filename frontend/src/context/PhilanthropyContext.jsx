import React, { createContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import {
  apiUploadDocument,
  apiFetchDashboardStats,
  apiFetchCampaigns,
  apiLogout,
} from '../services/api';

export const PhilanthropyContext = createContext();

export const PhilanthropyProvider = ({ children }) => {

  // --- STATE AUTH ---
  const [apiToken, setApiToken] = useState(() => localStorage.getItem('auth_token'));
  const [userRole, setUserRole] = useState(() => localStorage.getItem('user_role'));

  // --- STATE PENGAJUAN BANTUAN ---
  const [dataPengajuan, setDataPengajuan] = useState([]);

  // --- STATE PROGRAM BANTUAN (diisi dari API campaigns) ---
  const [dataProgram, setDataProgram] = useState([]);

  // --- STATE DONATUR / KOMENTAR (diisi dari API campaigns) ---
  const [dataDonatur, setDataDonatur] = useState([]);

  // --- STATE AKTIVITAS GLOBAL ---
  const [riwayatAktivitasGlobal, setRiwayatAktivitasGlobal] = useState([]);

  // --- STATE WALLET & NOTIFIKASI ---
  const [walletAddress, setWalletAddress] = useState('');
  const [walletBalance, setWalletBalance] = useState(0);
  const [unreadNotifs, setUnreadNotifs] = useState(0);

  // --- STATE DASHBOARD STATS (dari API) ---
  const [dashboardStats, setDashboardStats] = useState(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState(null);

  // --- STATE KAMPANYE (dari API) ---
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(false);
  const [campaignsError, setCampaignsError] = useState(null);

  // ============================================================
  // FETCH KAMPANYE DARI API (dipanggil saat mount)
  // ============================================================
  const fetchCampaigns = useCallback(async () => {
    setIsLoadingCampaigns(true);
    setCampaignsError(null);
    try {
      const res = await apiFetchCampaigns();
      // Mapping field backend → state React
      const campaigns = (res.data || []).map(c => ({
        id: c.id,
        judul: c.title,
        kategori: c.category,
        deskripsi: c.deskripsi || c.description || '',
        targetDonasi: parseFloat(c.target_donasi || c.target || 0),
        terkumpul: parseFloat(c.terkumpul || c.collected || 0),
        targetPenerima: parseInt(c.target_penerima || c.targetBeneficiaries || 0),
        penerimaTerdaftar: parseInt(c.jumlah_donatur || c.donors || 0),
        sisaHari: parseInt(c.sisa_hari || c.daysLeft || 0),
        status: c.status || 'Berjalan',
        gambar: c.image_url || null,
        namaYayasan: c.nama_yayasan || c.foundation_name || '',
        isVerified: c.is_verified || true,
        danaTeralokasi: parseFloat(c.dana_teralokasi || 0),
        // Data komentar/doa yang diembed dari API
        komentar: (c.comments || []).map(cm => ({
          id: cm.id,
          nama: cm.user_name || cm.name || 'Anonim',
          doa: cm.content || cm.text || '',
          nominal: parseFloat(cm.amount || 0),
          waktu: cm.created_at || 'Baru saja',
          aamiin: cm.aamiin_count || cm.aamiin || 0,
          programId: c.id,
        })),
      }));

      setDataProgram(campaigns);

      // Flatten semua komentar dari semua kampanye ke dataDonatur
      const allDonatur = campaigns.flatMap(c => c.komentar);
      setDataDonatur(allDonatur);

    } catch (err) {
      const msg = err.message || 'Gagal memuat data kampanye dari server.';
      setCampaignsError(msg);
      console.error('[fetchCampaigns] Error:', err);
    } finally {
      setIsLoadingCampaigns(false);
    }
  }, []);

  // Fetch kampanye saat app pertama kali dimuat
  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  // ============================================================
  // FETCH DASHBOARD STATS (dipanggil setelah wallet connect + login)
  // ============================================================
  const fetchDashboardStats = useCallback(async (token) => {
    const activeToken = token || apiToken;
    if (!activeToken) return; // Hanya fetch jika sudah login
    setIsLoadingStats(true);
    setStatsError(null);
    try {
      const res = await apiFetchDashboardStats();
      const stats = res.data || {};
      setDashboardStats(stats);

      // Sinkronisasi: jika stats punya data pengajuan user yang login
      if (stats.pengajuan) {
        setDataPengajuan(prev => {
          // Gabungkan data dari API dengan yang sudah ada (hindari duplikat)
          const existingIds = new Set(prev.map(p => p.id));
          const fromApi = Array.isArray(stats.pengajuan)
            ? stats.pengajuan.filter(p => !existingIds.has(p.id))
            : [];
          return [...fromApi, ...prev];
        });
      }

      // Sinkronisasi saldo ETH on-chain dari stats
      if (stats.eth_balance !== undefined) {
        setWalletBalance(parseFloat(stats.eth_balance));
      }

    } catch (err) {
      const msg = err.message || 'Gagal memuat statistik dashboard.';
      setStatsError(msg);
      console.error('[fetchDashboardStats] Error:', err);
    } finally {
      setIsLoadingStats(false);
    }
  }, [apiToken]);

  // ============================================================
  // WALLET LISTENER & AUTO-CONNECT
  // ============================================================
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
      const handleAccountsChanged = async (accounts) => {
        if (accounts.length > 0) {
          const address = accounts[0];
          try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const balanceWei = await provider.getBalance(address);
            const balanceEth = parseFloat(ethers.formatEther(balanceWei));
            setWalletAddress(address);
            setWalletBalance(balanceEth);
          } catch (e) {
            console.error(e);
          }
        } else {
          setWalletAddress('');
          setWalletBalance(0);
          setDashboardStats(null);
        }
      };

      const handleChainChanged = () => {
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      const checkConnection = async () => {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const accounts = await provider.send('eth_accounts', []);
          if (accounts.length > 0) {
            const address = accounts[0];
            const balanceWei = await provider.getBalance(address);
            const balanceEth = parseFloat(ethers.formatEther(balanceWei));
            setWalletAddress(address);
            setWalletBalance(balanceEth);
          }
        } catch (err) {
          console.error('Gagal memeriksa status koneksi wallet:', err);
        }
      };
      checkConnection();

      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, []);

  // Fetch stats otomatis saat apiToken tersedia (setelah login)
  useEffect(() => {
    if (apiToken) {
      fetchDashboardStats(apiToken);
    }
  }, [apiToken, fetchDashboardStats]);

  // ============================================================
  // CONNECT WALLET
  // ============================================================
  const connectWallet = async () => {
    if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send('eth_requestAccounts', []);
        const address = accounts[0];
        const balanceWei = await provider.getBalance(address);
        const balanceEth = parseFloat(ethers.formatEther(balanceWei));
        setWalletAddress(address);
        setWalletBalance(balanceEth);
        // Fetch dashboard stats setelah wallet konek (jika sudah punya token)
        if (apiToken) {
          await fetchDashboardStats(apiToken);
        }
        return address;
      } catch (error) {
        console.error('Gagal menghubungkan wallet:', error);
        return null;
      }
    } else {
      alert('Silakan pasang MetaMask di browser Anda!');
      return null;
    }
  };

  // ============================================================
  // SIMPAN TOKEN SETELAH LOGIN (dipanggil dari LandingPage)
  // ============================================================
  const setAuthToken = (token, role) => {
    localStorage.setItem('auth_token', token);
    if (role) localStorage.setItem('user_role', role);
    setApiToken(token);
    setUserRole(role);
  };

  // ============================================================
  // LOGOUT
  // ============================================================
  const logout = async () => {
    try {
      if (apiToken) await apiLogout();
    } catch (e) {
      console.error('Logout API error (diabaikan):', e);
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_role');
      setApiToken(null);
      setUserRole(null);
      setDashboardStats(null);
      setWalletAddress('');
      setWalletBalance(0);
    }
  };

  // ============================================================
  // NOTIFIKASI
  // ============================================================
  const markNotifsRead = () => setUnreadNotifs(0);

  const catatAktivitas = (judul, deskripsi, tag) => {
    const waktuSekarang = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    setRiwayatAktivitasGlobal(prev => [{ waktu: waktuSekarang, judul, deskripsi, tag }, ...prev]);
    setUnreadNotifs(prev => prev + 1);
  };

  // ============================================================
  // FUNGSI UNTUK PENERIMA — UPLOAD DOKUMEN KE IPFS VIA LARAVEL
  // ============================================================
  /**
   * Mengajukan bantuan dengan mengupload dokumen ke backend Laravel.
   * Backend akan meneruskan file ke Pinata IPFS dan mengembalikan CID.
   *
   * @param {object} formData - Data teks dari form (nama, nik, kategori, dll.)
   * @param {object} fileMap - Object berisi file: { ktp: File, sktm: File, ... }
   * @returns {Promise<{id: string, cid: string}>}
   */
  const ajukanBantuan = async (formData, fileMap = {}) => {
    setIsLoadingStats(true);
    try {
      // === 1. Siapkan FormData untuk multipart/form-data upload ===
      const multipart = new FormData();

      // Append data teks
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          multipart.append(key, value);
        }
      });
      // Append wallet address pengirim
      multipart.append('wallet_address', walletAddress || '');

      // Append file-file dokumen
      Object.entries(fileMap).forEach(([key, file]) => {
        if (file instanceof File) {
          multipart.append(key, file);
        }
      });

      // === 2. Kirim ke POST /api/v1/document/upload ===
      const response = await apiUploadDocument(multipart);
      const { cid, document_id } = response.data || {};

      if (!cid) {
        throw new Error('Backend tidak mengembalikan CID dokumen.');
      }

      // === 3. Simpan data pengajuan ke state lokal dengan CID dari IPFS ===
      const newPengajuan = {
        id: document_id || `DOC-${Math.floor(Math.random() * 9000) + 1000}`,
        ...formData,
        cid, // Content Identifier dari IPFS (digunakan untuk verifikasi ZKP)
        status: 'menunggu',
        signedNodes: [],
        rejectedNodes: [],
        processingTimeMinutes: 0,
        tanggalSistem: new Date().toLocaleDateString('id-ID', { weekday: 'long' }),
        tahapBantuan: 'Verifikasi Instansi',
        walletAddress: walletAddress || '',
      };

      setDataPengajuan(prev => [newPengajuan, ...prev]);
      catatAktivitas(
        `Pengajuan Baru: ${newPengajuan.id}`,
        `Bantuan diajukan oleh ${newPengajuan.nama} kategori ${newPengajuan.kategori}. CID: ${cid.substring(0, 12)}...`,
        'Penerima'
      );

      // === 4. CID siap dipakai untuk proses ZKP berikutnya ===
      // CID merepresentasikan hash dokumen yang tersimpan di IPFS (Pinata)
      // dan akan digunakan sebagai input untuk verifyPovertyStatus di Smart Contract
      console.info('[ZKP Ready] Document CID dari IPFS:', cid);

      return { id: newPengajuan.id, cid };

    } catch (err) {
      const msg = err.message || 'Pengajuan gagal dikirim ke server.';
      catatAktivitas('Pengajuan Gagal', msg, 'Sistem');
      throw err; // Lempar kembali agar komponen bisa tampilkan error UI
    } finally {
      setIsLoadingStats(false);
    }
  };

  // ============================================================
  // FUNGSI STATE MANAGEMENT INSTANSI & YAYASAN
  // ============================================================
  const updateTahapBantuan = (id, tahapBaru) => {
    setDataPengajuan(prev => prev.map(p => p.id === id ? { ...p, tahapBantuan: tahapBaru } : p));
  };

  const updateStatusPengajuan = (id, newSignedNodes, newRejectedNodes, statusBaru) => {
    setDataPengajuan(prev => prev.map(p => {
      if (p.id === id) {
        let tahapBantuan = p.tahapBantuan;
        if (statusBaru === 'disetujui') tahapBantuan = 'Otentikasi Yayasan';
        return { ...p, signedNodes: newSignedNodes, rejectedNodes: newRejectedNodes, status: statusBaru, tahapBantuan };
      }
      return p;
    }));
  };

  const tambahProgram = (programBaru) => {
    setDataProgram(prev => {
      const maxId = prev.reduce((max, p) => Math.max(max, typeof p.id === 'number' ? p.id : 0), 0);
      return [{ id: maxId + 1, ...programBaru }, ...prev];
    });
  };

  const updateProgram = (id, updates) => {
    setDataProgram(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const cairkanDana = (programId, totalCair) => {
    setDataProgram(prev => prev.map(p => {
      if (p.id === programId) {
        return { ...p, danaTeralokasi: (p.danaTeralokasi || 0) + totalCair };
      }
      return p;
    }));
    setDataPengajuan(prev => prev.map(p => {
      if (p.programId === programId && p.status === 'disetujui' && p.tahapBantuan === 'Otentikasi Yayasan') {
        return { ...p, tahapBantuan: 'Cairkan Dana' };
      }
      return p;
    }));
    catatAktivitas(`Pencairan Dana Program #${programId}`, `Dana sebesar ETH ${totalCair} telah didistribusikan ke penerima.`, 'Yayasan');
  };

  // ============================================================
  // FUNGSI DONATUR
  // ============================================================
  const klikAamiin = (doaId) => {
    setDataDonatur(prev => prev.map(d => {
      if (d.id === doaId) return { ...d, aamiin: d.aamiin + 1 };
      return d;
    }));
  };

  const tambahDonasi = (donasiData) => {
    const newDonasi = { id: Date.now(), waktu: 'Baru saja', aamiin: 0, ...donasiData };
    setDataDonatur(prev => [newDonasi, ...prev]);
    setDataProgram(prev => prev.map(p => {
      if (p.id === donasiData.programId) {
        return { ...p, terkumpul: p.terkumpul + donasiData.nominal };
      }
      return p;
    }));
    catatAktivitas('Donasi Masuk', `${donasiData.nama} berdonasi ETH ${donasiData.nominal}`, 'Donatur');
  };

  // ============================================================
  // FUNGSI KLAIM DANA PENERIMA
  // ============================================================
  const klaimDanaPenerima = (pengajuanId) => {
    setDataPengajuan(prev => prev.map(p => {
      if (p.id === pengajuanId && p.tahapBantuan === 'Cairkan Dana') {
        return { ...p, tahapBantuan: 'Selesai' };
      }
      return p;
    }));
    catatAktivitas('Dana Diklaim', `Penerima telah mengklaim dana bantuan untuk pengajuan ${pengajuanId}.`, 'Penerima');
  };

  // Daftar wallet address penerima yang aktif (untuk routing di landing page)
  const penerimaAddresses = dataPengajuan
    .filter(p => p.status === 'disetujui' || p.status === 'menunggu')
    .map(p => (p.walletAddress || '').toLowerCase());

  return (
    <PhilanthropyContext.Provider value={{
      // Data state
      dataPengajuan, setDataPengajuan,
      dataProgram, setDataProgram,
      dataDonatur, setDataDonatur,
      riwayatAktivitasGlobal,
      // Auth
      apiToken, userRole, setAuthToken, logout,
      // Wallet
      walletAddress, setWalletAddress, walletBalance, connectWallet,
      // Notifikasi
      unreadNotifs, markNotifsRead,
      // Loading & error states
      isLoadingStats, statsError,
      isLoadingCampaigns, campaignsError,
      // Dashboard stats dari API
      dashboardStats,
      // Fungsi utama
      ajukanBantuan,
      updateTahapBantuan,
      updateStatusPengajuan,
      tambahProgram,
      updateProgram,
      cairkanDana,
      klikAamiin,
      tambahDonasi,
      klaimDanaPenerima,
      catatAktivitas,
      fetchCampaigns,
      fetchDashboardStats,
      // Computed
      penerimaAddresses,
    }}>
      {children}
    </PhilanthropyContext.Provider>
  );
};
