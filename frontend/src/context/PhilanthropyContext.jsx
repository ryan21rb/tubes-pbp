import React, { createContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';

export const PhilanthropyContext = createContext();

export const PhilanthropyProvider = ({ children }) => {
  // --- STATE PENGAJUAN BANTUAN (Dari Penerima ke Instansi & Yayasan) ---
  const [dataPengajuan, setDataPengajuan] = useState([
    {
      id: "DOC-8821",
      nama: "Ahmad Pratama",
      nik: "3201112223334444",
      umur: 45,
      pekerjaan: "Buruh Harian Lepas",
      alamat: "Jl. Merdeka No. 12, Bandung",
      kategori: "Ekonomi",
      status: "menunggu", 
      signedNodes: [], 
      rejectedNodes: [],
      processingTimeMinutes: 12,
      tanggalSistem: "Senin",
      tahapBantuan: "Verifikasi Instansi",
      programId: 1,
      walletAddress: "0xpenerima1"
    },
    {
      id: "DOC-8822",
      nama: "Siti Rahmawati",
      nik: "3202223334445555",
      umur: 38,
      pekerjaan: "Ibu Rumah Tangga",
      alamat: "Kecamatan Sukajadi, RT 02/01",
      kategori: "Kesehatan",
      status: "menunggu",
      signedNodes: ["Dinkes"], 
      rejectedNodes: [],
      processingTimeMinutes: 24,
      tanggalSistem: "Selasa",
      tahapBantuan: "Verifikasi Instansi",
      programId: 1,
      walletAddress: "0xpenerima2"
    },
    {
      id: "DOC-8823",
      nama: "Budi Hartono",
      nik: "3203334445556666",
      umur: 20,
      pekerjaan: "Mahasiswa",
      alamat: "Jl. Pendidikan, Jakarta",
      kategori: "Pendidikan",
      status: "disetujui",
      signedNodes: ["Dinsos", "BPBD", "Dinkes", "Disdik"], 
      rejectedNodes: [],
      processingTimeMinutes: 8,
      tanggalSistem: "Rabu",
      tahapBantuan: "Otentikasi Yayasan",
      programId: 3,
      walletAddress: "0xpenerima3"
    },
  ]);

  // --- STATE PROGRAM BANTUAN (Dari Yayasan ke Donatur & Penerima) ---
  const [dataProgram, setDataProgram] = useState([
    {
      id: 1,
      kategori: "Kesehatan",
      judul: "Bantuan Medis Darurat Ibu Hamil",
      deskripsi: "Penyaluran dana untuk operasi sesar darurat ibu kurang mampu di pelosok.",
      targetDonasi: 2.5,
      terkumpul: 1.5,
      targetPenerima: 20,
      penerimaTerdaftar: 18,
      danaTeralokasi: 0,
      status: "Berjalan",
      gambar: "https://images.unsplash.com/photo-1538183183536-7c2445e95cd8?w=800&q=80"
    },
    {
      id: 2,
      kategori: "Bencana Alam",
      judul: "Pemulihan Pasca Gempa Cianjur",
      deskripsi: "Pembangunan kembali fasilitas umum dan rumah warga terdampak gempa.",
      targetDonasi: 7.5,
      terkumpul: 4.25,
      targetPenerima: 100,
      penerimaTerdaftar: 45,
      danaTeralokasi: 0,
      status: "Berjalan",
      gambar: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=800&q=80"
    },
    {
      id: 3,
      kategori: "Pendidikan",
      judul: "Beasiswa Anak Putus Sekolah",
      deskripsi: "Bantuan biaya pendidikan untuk anak-anak berprestasi dari keluarga tidak mampu.",
      targetDonasi: 3.5,
      terkumpul: 3.5,
      targetPenerima: 50,
      penerimaTerdaftar: 50,
      danaTeralokasi: 0,
      status: "Tercapai",
      gambar: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&q=80"
    }
  ]);

  // --- STATE DONASI & DOA (Dari Donatur) ---
  const [dataDonatur, setDataDonatur] = useState([
    { id: 101, nama: "Hamba Allah", nominal: 500000, waktu: "2 jam yang lalu", doa: "Semoga lekas sembuh dan diangkat penyakitnya.", programId: 1, aamiin: 12 },
    { id: 102, nama: "Budi Santoso", nominal: 1000000, waktu: "5 jam yang lalu", doa: "Semoga sedikit bantuan ini bisa meringankan beban keluarga.", programId: 2, aamiin: 5 },
    { id: 103, nama: "Siti Aisyah", nominal: 250000, waktu: "1 hari yang lalu", doa: "Belajar yang rajin ya adik-adik, semoga kelak menjadi orang sukses.", programId: 3, aamiin: 28 },
    { id: 104, nama: "Anonim", nominal: 100000, waktu: "2 hari yang lalu", doa: "Semoga bencana cepat berlalu dan semua diberi ketabahan.", programId: 2, aamiin: 2 },
  ]);

  const [riwayatAktivitasGlobal, setRiwayatAktivitasGlobal] = useState([
    { waktu: "13:26", judul: "Penyelarasan Data Berhasil", deskripsi: "Data terbaru berhasil disinkronkan dengan seluruh instansi.", tag: "Sistem" },
    { waktu: "12:48", judul: "Validasi Dokumen DOC-8823", deskripsi: "Dokumen telah disetujui oleh seluruh Instansi terkait.", tag: "Instansi" },
  ]);

  // --- STATE WALLET & NOTIFIKASI ---
  const [walletAddress, setWalletAddress] = useState("");
  const [walletBalance, setWalletBalance] = useState(0);
  const [unreadNotifs, setUnreadNotifs] = useState(0);

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
          setWalletAddress("");
          setWalletBalance(0);
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
          const accounts = await provider.send("eth_accounts", []);
          if (accounts.length > 0) {
            const address = accounts[0];
            const balanceWei = await provider.getBalance(address);
            const balanceEth = parseFloat(ethers.formatEther(balanceWei));
            setWalletAddress(address);
            setWalletBalance(balanceEth);
          }
        } catch (err) {
          console.error("Gagal memeriksa status koneksi wallet:", err);
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

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        const address = accounts[0];
        const balanceWei = await provider.getBalance(address);
        const balanceEth = parseFloat(ethers.formatEther(balanceWei));
        setWalletAddress(address);
        setWalletBalance(balanceEth);
        return address;
      } catch (error) {
        console.error("Gagal menghubungkan wallet:", error);
        return null;
      }
    } else {
      alert("Silakan pasang MetaMask di browser Anda!");
      return null;
    }
  };

  const markNotifsRead = () => {
    setUnreadNotifs(0);
  };

  // FUNGSI UNTUK PENERIMA
  const ajukanBantuan = (formData) => {
    const newPengajuan = {
      id: `DOC-${Math.floor(Math.random() * 9000) + 1000}`,
      ...formData,
      status: "menunggu",
      signedNodes: [],
      rejectedNodes: [],
      processingTimeMinutes: 0,
      tanggalSistem: new Date().toLocaleDateString("id-ID", { weekday: 'long' }),
      tahapBantuan: "Verifikasi Instansi", // Dimulai langsung ke verifikasi instansi setelah reg
      walletAddress: walletAddress || "0xbaru"
    };
    setDataPengajuan(prev => [newPengajuan, ...prev]);
    catatAktivitas(`Pengajuan Baru: ${newPengajuan.id}`, `Bantuan diajukan oleh ${newPengajuan.nama} kategori ${newPengajuan.kategori}`, "Penerima");
    return newPengajuan.id;
  };

  const updateTahapBantuan = (id, tahapBaru) => {
    setDataPengajuan(prev => prev.map(p => p.id === id ? { ...p, tahapBantuan: tahapBaru } : p));
  };

  // FUNGSI UNTUK INSTANSI
  const updateStatusPengajuan = (id, newSignedNodes, newRejectedNodes, statusBaru) => {
    setDataPengajuan(prev => prev.map(p => {
      if (p.id === id) {
        let tahapBantuan = p.tahapBantuan;
        if (statusBaru === 'disetujui') tahapBantuan = "Otentikasi Yayasan";
        return { ...p, signedNodes: newSignedNodes, rejectedNodes: newRejectedNodes, status: statusBaru, tahapBantuan };
      }
      return p;
    }));
  };

  // FUNGSI UNTUK YAYASAN
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
        return { ...p, danaTeralokasi: p.danaTeralokasi + totalCair };
      }
      return p;
    }));
    
    setDataPengajuan(prev => prev.map(p => {
      if (p.programId === programId && p.status === 'disetujui' && p.tahapBantuan === 'Otentikasi Yayasan') {
        return { ...p, tahapBantuan: "Cairkan Dana" };
      }
      return p;
    }));
    catatAktivitas(`Pencairan Dana Program #${programId}`, `Dana sebesar ETH ${totalCair} telah didistribusikan ke penerima.`, "Yayasan");
  };

  // FUNGSI UNTUK DONATUR
  const klikAamiin = (doaId) => {
    setDataDonatur(prev => prev.map(d => {
      if (d.id === doaId) {
        return { ...d, aamiin: d.aamiin + 1 };
      }
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

  // FUNGSI UNTUK PENERIMA KLAIM DANA
  const klaimDanaPenerima = (pengajuanId) => {
    setDataPengajuan(prev => prev.map(p => {
      if (p.id === pengajuanId && p.tahapBantuan === 'Cairkan Dana') {
        return { ...p, tahapBantuan: 'Selesai' };
      }
      return p;
    }));
    catatAktivitas('Dana Diklaim', `Penerima telah mengklaim dana bantuan untuk pengajuan ${pengajuanId}.`, 'Penerima');
  };

  const catatAktivitas = (judul, deskripsi, tag) => {
    const waktuSekarang = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    setRiwayatAktivitasGlobal(prev => [{ waktu: waktuSekarang, judul, deskripsi, tag }, ...prev]);
    setUnreadNotifs(prev => prev + 1);
  };

  const penerimaAddresses = dataPengajuan
    .filter(p => p.status === 'disetujui' || p.status === 'menunggu')
    .map(p => (p.walletAddress || "").toLowerCase());

  return (
    <PhilanthropyContext.Provider value={{
      dataPengajuan, setDataPengajuan, ajukanBantuan, updateTahapBantuan, updateStatusPengajuan,
      dataProgram, setDataProgram, tambahProgram, updateProgram, cairkanDana,
      dataDonatur, setDataDonatur, klikAamiin, tambahDonasi,
      riwayatAktivitasGlobal, catatAktivitas, klaimDanaPenerima,
      walletAddress, setWalletAddress, walletBalance, connectWallet, unreadNotifs, markNotifsRead,
      penerimaAddresses
    }}>
      {children}
    </PhilanthropyContext.Provider>
  );
};
