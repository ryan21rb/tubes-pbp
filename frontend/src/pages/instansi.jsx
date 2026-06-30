import React, { useState, useEffect, useContext } from "react";
import { PhilanthropyContext } from "../context/PhilanthropyContext";
import logoPhilanthropy from "../assets/logophilantrophy.png";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  FileCheck, 
  History, 
  FileText, 
  LogOut, 
  Clock, 
  CheckCircle2, 
  Network, 
  AlertTriangle, 
  Eye, 
  X, 
  Layers, 
  Wallet, 
  Sun, 
  Moon,
  ImagePlus,
  User,
  Calendar,
  Bell
} from "lucide-react";

// DATA KONSISTEN DOMPET sistem TIAP Instansi Validator KONSORSIUM
const NODE_IDENTITIES = {
  Dinsos: { name: "Dinas Sosial", role: "Node 1", address: "0x08212C9a2FdB3E71c890123456789A1b2c34Fb3E" },
  Disdik: { name: "Dinas Pendidikan", role: "Node 2", address: "0x9df2881b2A345CDE678pqr901stu234vwx567yz11A2" },
  BPBD: { name: "BPBD", role: "Node 3", address: "0x4c3a567def789ghi012jkl345mno678pqr901stu88Eb" },
  Dinkes: { name: "Dinas Kesehatan", role: "Node 4", address: "0x12b5zyx654wvu321tsr098qpo765nml432kji109hgf876edc543ba7a99" }
};

export default function ValidatorDashboard({ onLogoutClick = () => {} }) {
  const [activeTab, setActiveTab] = useState("beranda");
  const [filterStatus, setFilterStatus] = useState("semua");
  const [selectedPengajuan, setSelectedPengajuan] = useState(null);
  const [isSigning, setIsSigning] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileAvatar, setProfileAvatar] = useState(null);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Mengunci identitas node aktif saat ini
  const [profileName, setProfileName] = useState("Dinsos");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editNameVal, setEditNameVal] = useState("Dinsos");

  // State real-time timestamp off untuk Node yang pasif
  const [nodeOfflineStartTimes] = useState({
    Disdik: Date.now() - (1 * 60 * 1000), // 15 Menit lalu
    BPBD: Date.now() - (1 * 60 * 60 * 1000), // 2 Jam lalu
    Dinkes: Date.now() - (24 * 60 * 60 * 1000) // 1 Hari lalu
  });

  // Ticker real-time untuk perhitungan waktu (1 detik sekali)
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // ====== DATA MASTER STATE JALUR PIPELINE (100% REAL & DINAMIS) ======
  const { dataPengajuan = [], updateStatusPengajuan, riwayatAktivitasGlobal = [], catatAktivitas } = useContext(PhilanthropyContext) || {};

  // LOCAL STATE WRAPPER: Agar UI langsung berubah cepat saat tombol diklik tanpa nunggu delay context
  const [localPengajuan, setLocalPengajuan] = useState([]);
  
  useEffect(() => {
    if (dataPengajuan.length > 0) {
      
    }
  }, [dataPengajuan]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // ====== MENU SIDEBAR DEFINITION ======
  const menus = [
    { id: "beranda", icon: <LayoutDashboard size={22} />, label: "Beranda" },
    { id: "verifikasi", icon: <FileCheck size={22} />, label: "Verifikasi" },
    { id: "riwayat", icon: <History size={22} />, label: "Riwayat" },
    { id: "laporan", icon: <FileText size={22} />, label: "Laporan" },
  ];

  const currentNodeCategoryAuthority = "Ekonomi";

  // ====== LOGIKA KOMPUTASI REAL-TIME SINKRON ======
  const totalBerkas = localPengajuan.length;
  // Berkas Menunggu = Belum disign kita, belum direject kita, dan status sistem bukan ditolak
  const berkasMenunggu = localPengajuan.filter((item) => !item.signedNodes?.includes(profileName) && !(item.rejectedNodes || []).includes(profileName) && item.status !== "ditolak").length;
  // Berkas Disetujui (Tanda Tangan Diberikan) = Yang SUDAH kita sign
  const berkasDisetujui = localPengajuan.filter((item) => item.signedNodes?.includes(profileName)).length;
  // Berkas Ditolak = Yang SUDAH kita reject
  const berkasDitolak = localPengajuan.filter((item) => (item.rejectedNodes || []).includes(profileName)).length;
  
  const berkasSelesai = berkasDisetujui + berkasDitolak;
  const persentasePersetujuan = berkasSelesai > 0 ? Math.round((berkasDisetujui / berkasSelesai) * 100) : 0;
  const persentaseProgress = totalBerkas > 0 ? Math.round((berkasSelesai / totalBerkas) * 100) : 0;

  // Logika Waktu Rata-Rata Validasi & Skala Klasifikasi Efisiensi Sistem
  const hitungRataRataWaktu = () => {
    if (totalBerkas === 0) return { nilai: 0, label: "—", warna: "text-gray-400" };
    const totalWaktu = localPengajuan.reduce((acc, item) => acc + (item.processingTimeMinutes || 10), 0);
    const rataRata = (totalWaktu / totalBerkas).toFixed(1);
    
    if (rataRata <= 10) return { nilai: rataRata, label: "⚡ Sangat Cepat", warna: "text-emerald-600 dark:text-emerald-400" };
    if (rataRata <= 20) return { nilai: rataRata, label: "⏱️ Standar Optimal", warna: "text-[#F5A623] dark:text-amber-400" };
    return { nilai: rataRata, label: "🐢 Lambat/Padat", warna: "text-rose-500 dark:text-rose-400" };
  };
  const rataRataValidasi = hitungRataRataWaktu();

  // Logika Pemetaan Grafik Tren Kategori (PERHARI INI)
  const kategoriLabels = ["Ekonomi", "Kesehatan", "Pendidikan", "Bencana"];
  const kategoriData = kategoriLabels.map(kat => localPengajuan.filter(item => item.kategori === kat).length);
  const maxGrafikValue = Math.max(...kategoriData, 100);
  const yTicks = [0, Math.ceil(maxGrafikValue * 0.25), Math.ceil(maxGrafikValue * 0.5), Math.ceil(maxGrafikValue * 0.75), maxGrafikValue];
  
  const todayDate = new Date().toLocaleDateString("id-ID", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const dataDifilter = localPengajuan.filter((item) => {
    if (filterStatus === "semua") return true;
    return item.status === filterStatus;
  });

  const handleProfileAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setProfileAvatar(URL.createObjectURL(file));
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setProfileName(editNameVal);
    setShowProfileModal(false);
  };

  const obfuscateName = (name) => {
    if (!name) return "";
    return name.split(" ").map(word => word.charAt(0) + "***").join(" ");
  };

  // Fungsi Kalkulasi Waktu Realtime untuk Node Offline
  const formatDowntime = (nodeId) => {
    const startTime = nodeOfflineStartTimes[nodeId];
    if (!startTime) return "Offline"; 
    const diffMs = currentTime - startTime;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "Baru saja offline";
    if (diffMins < 60) return `Terakhir ${diffMins} menit lalu`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Terakhir ${diffHours} jam lalu`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `Terakhir ${diffDays} hari lalu`;
  };

  const nodesStatus = [
    { id: "Dinsos", name: "Node 1", sub: "Dinas Sosial", isSelf: profileName === "Dinsos", active: profileName === "Dinsos", timeMsg: profileName === "Dinsos" ? "Aktif" : formatDowntime("Disdik") },
    { id: "Disdik", name: "Node 2", sub: "Dinas Pendidikan", isSelf: profileName === "Disdik", active: profileName === "Disdik", timeMsg: profileName === "Disdik" ? "Aktif" : formatDowntime("Disdik") },
    { id: "BPBD", name: "Node 3", sub: "BPBD", isSelf: profileName === "BPBD", active: profileName === "BPBD", timeMsg: profileName === "BPBD" ? "Aktif" : formatDowntime("BPBD") },
    { id: "Dinkes", name: "Node 4", sub: "Dinas Kesehatan", isSelf: profileName === "Dinkes", active: profileName === "Dinkes", timeMsg: profileName === "Dinkes" ? "Aktif" : formatDowntime("Dinkes") },
  ];

  // LOGIKA AKSI REALTIME - TOLAK & SAHKAN (DENGAN LOADING)
  const handleTolak = () => {
    if(!selectedPengajuan) return;
    setIsRejecting(true);
    
    const currentDayName = new Date().toLocaleDateString("id-ID", { weekday: 'long' }); 

    setTimeout(() => {
      const newRejectedNodes = selectedPengajuan.rejectedNodes?.includes(profileName) ? selectedPengajuan.rejectedNodes : [...(selectedPengajuan.rejectedNodes || []), profileName];
      const isRejected = newRejectedNodes.length >= 2;
      const updatedStatus = isRejected ? "ditolak" : "menunggu";
      const updatedItem = { ...selectedPengajuan, status: updatedStatus, rejectedNodes: newRejectedNodes, tanggalSistem: currentDayName };
      
      
      
      if(updateStatusPengajuan) updateStatusPengajuan(selectedPengajuan.id, selectedPengajuan.signedNodes || [], newRejectedNodes, updatedStatus);
      if(catatAktivitas) catatAktivitas(`Penolakan Dokumen ${selectedPengajuan.id}`, `Penolakan berkas dicatat oleh Instansi ${NODE_IDENTITIES[profileName]?.name}.`, "Instansi");
      
      setIsRejecting(false);
      setSelectedPengajuan(null);
    }, 800);
  };

  const handleSahkan = () => {
    if(!selectedPengajuan) return;
    setIsSigning(true);
    
    const currentDayName = new Date().toLocaleDateString("id-ID", { weekday: 'long' }); 

    setTimeout(() => {
      const newSignedNodes = selectedPengajuan.signedNodes?.includes(profileName) ? selectedPengajuan.signedNodes : [...(selectedPengajuan.signedNodes || []), profileName];
      const isFullySigned = newSignedNodes.length >= 4;
      const newRejectedNodes = selectedPengajuan.rejectedNodes || [];
      const newStatus = isFullySigned ? "disetujui" : selectedPengajuan.status;
      const updatedItem = { ...selectedPengajuan, signedNodes: newSignedNodes, status: newStatus, tanggalSistem: currentDayName };
      
      

      if(updateStatusPengajuan) updateStatusPengajuan(selectedPengajuan.id, newSignedNodes, newRejectedNodes, newStatus);
      if(catatAktivitas) catatAktivitas(`Persetujuan Dokumen ${selectedPengajuan.id}`, `Persetujuan dokumen berhasil dicatat oleh Instansi ${NODE_IDENTITIES[profileName]?.name}.`, "Instansi");

      setIsSigning(false);
      setSelectedPengajuan(null);
    }, 800);
  };

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif" }} className={`flex min-h-screen selection:bg-emerald-700 selection:text-white overflow-x-hidden transition-colors duration-300 ${isDarkMode ? "bg-slate-950 text-slate-100 dark" : "bg-slate-50 text-slate-900"}`}>

      {/* Tooltip Hovered Point untuk Grafik */}
      {hoveredPoint && (
        <div className="fixed z-[150] bg-gray-900/95 backdrop-blur-md text-white px-5 py-4 rounded-xl shadow-2xl pointer-events-none transform -translate-x-1/2 -translate-y-[130%] border border-gray-700" style={{ left: hoveredPoint.x, top: hoveredPoint.y }}>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: hoveredPoint.color }} />
            <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">{hoveredPoint.label}</span>
          </div>
          <div className="text-2xl font-black">{hoveredPoint.val} <span className="text-sm text-gray-400 dark:text-slate-500 font-bold">Berkas Diproses</span></div>
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-900/95 rotate-45 border-r border-b border-gray-700" />
        </div>
      )}

      {/* ===== SIDEBAR ===== */}
      <aside className="w-[260px] bg-white dark:bg-slate-900 border-r border-gray-100 dark:border-slate-800 p-6 flex flex-col fixed h-full z-40 shadow-sm">
        <div className="flex items-center gap-4 mb-10 mt-2">
          <img src={logoPhilanthropy} className="w-8 h-8 object-contain dark:drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]" alt="Logo" />
          <div>
            <h1 className="text-lg font-black leading-tight">
              <span className="text-gray-900 dark:text-white">Philantrophy</span><span className="text-[#EAB308]">Chain</span>
            </h1>
            <p className="text-[10px] text-gray-500 dark:text-slate-400 uppercase tracking-widest mt-1">Instansi</p>
          </div>
        </div>

        <nav className="space-y-2 flex-1">
          {menus.map((m) => (
            <button
              key={m.id}
              onClick={() => setActiveTab(m.id)}
              className={`flex items-center gap-4 w-full px-6 py-4 rounded-xl transition-all font-bold text-sm ${
                activeTab === m.id
                  ? "bg-emerald-700 text-white shadow-md shadow-emerald-700/20"
                  : "text-gray-600 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-slate-800/50 hover:text-emerald-800 dark:hover:text-emerald-400"
              }`}
            >
              <span className={activeTab === m.id ? "text-white" : "text-gray-400 dark:text-slate-500"}>{m.icon}</span>
              <span className="text-[15px]">{m.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-gray-100 dark:border-slate-800">
          <button onClick={onLogoutClick} className="flex items-center gap-3 w-full px-5 py-4 text-gray-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-700 dark:hover:text-red-400 rounded-xl transition font-bold text-[15px]">
            <LogOut size={20} className="text-gray-400 dark:text-slate-500" /> Logout
          </button>
        </div>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1 ml-[260px] min-w-0 bg-slate-50 dark:bg-slate-950">
        {/* HEADER FLUSH TO TOP */}
        <header className="bg-white dark:bg-slate-900 shadow-sm border-b border-gray-100 dark:border-slate-800 sticky top-0 z-30 transition-colors">
          <div className="max-w-[1440px] mx-auto px-8 py-5 flex justify-between items-center w-full">
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-wider text-emerald-900 dark:text-emerald-400">
              {activeTab === 'beranda' ? 'Beranda' : activeTab === 'verifikasi' ? 'Verifikasi' : activeTab === 'riwayat' ? 'Riwayat' : 'Laporan'}
            </h2>
            <div className="flex items-center gap-3">
              <button onClick={() => setActiveTab('riwayat')} className="p-2.5 rounded-full bg-gray-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-100 hover:text-emerald-600 transition relative">
                <Bell size={20} />
              </button>
              
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleTheme}
                className={`relative flex items-center w-[4.5rem] h-9 p-1 border rounded-full transition-colors duration-300 focus:outline-none shadow-inner mx-2 ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-slate-100 border-slate-200"}`}
              >
                <div className={`absolute top-1 w-7 h-7 rounded-full shadow-md transition-transform duration-300 flex items-center justify-center ${isDarkMode ? "translate-x-8 bg-emerald-700" : "translate-x-0 bg-white"}`}>
                  {isDarkMode ? <Moon size={14} className="text-white" /> : <Sun size={14} className="text-[#F5A623]" />}
                </div>
              </button>
              <button onClick={() => { setShowProfileModal(true); setEditNameVal(profileName); setIsEditingProfile(false); }} className="w-10 h-10 rounded-full border-2 border-emerald-500 overflow-hidden hover:opacity-80 transition cursor-pointer bg-slate-100 dark:bg-slate-800 shrink-0 flex items-center justify-center">
                {profileAvatar ? (
                  <img src={profileAvatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User size={24} className="text-emerald-600"/>
                )}
              </button>
            </div>
          </div>
        </header>

        <div className="p-8 lg:p-12 max-w-[1440px] mx-auto space-y-8">

          {/* ================= BERANDA ================= */}
          {activeTab === "beranda" && (
            <div className="space-y-8">
              <div>
                <p className="text-lg font-medium text-gray-600 dark:text-slate-300 mt-1">{NODE_IDENTITIES[profileName]?.name || profileName} — Instansi Validator {NODE_IDENTITIES[profileName]?.role}</p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-4">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-slate-200">Status Node Konsorsium (4 Node)</h3>
                  <span className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" /> Jaringan Sehat
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {nodesStatus.map((n, i) => (
                    <div key={i} className={`border border-gray-100 dark:border-slate-800 border-l-[5px] ${n.active ? 'border-l-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-l-gray-300 dark:border-l-slate-700 bg-white dark:bg-slate-900'} p-5 rounded-2xl flex flex-col justify-between shadow-sm min-h-[110px]`}>
                      <div className="flex items-center gap-4 mb-3">
                        <div className={`w-10 h-5 ${n.active ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400' : 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400'} rounded-xl flex items-center justify-center shrink-0`}>
                          <Network size={22} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-extrabold text-gray-800 dark:text-slate-200 text-sm truncate">{n.name}</p>
                          <p className="text-xs font-medium text-gray-500 dark:text-slate-400 truncate mt-1">{n.sub}</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-end mt-auto pt-2">
                        {n.isSelf ? (
                          <span className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-400 text-[10px] font-black px-2 py-1 rounded uppercase">ANDA</span>
                        ) : <div />}
                        <div className={`text-xs font-bold flex items-center justify-end gap-1.5 ${n.active ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-slate-500'}`}>
                          {n.active && <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />} {n.timeMsg}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { label: "MENUNGGU VERIFIKASI", value: berkasMenunggu, sub: "Berkas Baru", Icon: Clock, color: "emerald", darkColor: "emerald" },
                  { label: "TANDA TANGAN DIBERIKAN", value: berkasDisetujui, sub: "Total Valid", Icon: CheckCircle2, color: "emerald", darkColor: "emerald" },
                  { label: "MENUNGGU KONSENSUS", value: berkasDitolak, sub: "Berkas Gagal", Icon: Network, color: "emerald", darkColor: "emerald" },
                ].map((card, i) => (
                  <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-l font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest">{card.label}</span>
                      <div className={`w-10 h-10 bg-${card.color}-50 dark:bg-${card.darkColor}-900/30 rounded-xl flex items-center justify-center text-${card.color}-700 dark:text-${card.darkColor}-400`}>
                        <card.Icon size={20} />
                      </div>
                    </div>
                    <h3 className="text-4xl font-black text-gray-900 dark:text-slate-100 mb-1 flex items-baseline gap-3">{card.value} <span className="text-sm font-bold text-gray-400 dark:text-slate-500">{card.sub}</span></h3>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm">
                  <div className="flex items-start gap-5 mb-2">
                    <div className="w-15 h-15 bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center shrink-0">
                      <AlertTriangle size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-extrabold text-rose-700 dark:text-rose-400 uppercase tracking-wide flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" /> Prioritas Hari Ini
                      </h3>
                      <p className="text-base text-gray-500 dark:text-slate-400 mt-2">
                        Terdapat <span className="text-rose-600 dark:text-rose-400 font-bold">{berkasMenunggu} berkas</span> mendesak yang memerlukan tinjauan teknis dan tanda tangan digital.
                      </p>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 p-6 rounded-2xl mb-6">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-bold text-gray-700 dark:text-slate-300">{totalBerkas} Berkas Terdaftar</span>
                      <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800 px-3 py-1.5 rounded-xl">{berkasSelesai} / {totalBerkas} Selesai</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-slate-700 h-3 rounded-full overflow-hidden">
                      <div className="bg-emerald-600 dark:bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${persentaseProgress}%` }} />
                    </div>
                  </div>
                  <button onClick={() => setActiveTab("verifikasi")} className="bg-emerald-700 dark:bg-emerald-600 hover:bg-emerald-800 dark:hover:bg-emerald-700 text-white font-extrabold text-sm px-8 py-4 rounded-xl tracking-wider uppercase flex items-center gap-3 transition-all shadow-lg shadow-emerald-700/20 dark:shadow-none">
                    <FileCheck size={18} /> Mulai Verifikasi
                  </button>
                </div>

                <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col items-center text-center">
  <h3 className="text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-8 w-full text-left">Laporan Performa</h3>
  
  <div className="relative w-24 h-24 flex items-center justify-center mb-2">
    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
      <path className="text-gray-200 dark:text-slate-700" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
      <path className="text-emerald-700 dark:text-emerald-500" strokeWidth="3.2" strokeDasharray={`${persentasePersetujuan}, 100`} strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
    </svg>
    <span className="absolute text-2xl font-black text-gray-800 dark:text-slate-200">{persentasePersetujuan}%</span>
  </div>
  <div className="mb-1">
    <h4 className="text-sm font-bold text-gray-900 dark:text-slate-100 mb-1">Tingkat Persetujuan</h4>
    <p className="text-xs text-gray-500 dark:text-slate-400">
      <span className="text-emerald-600 font-bold">{berkasDisetujui} disetujui</span> / 
      <span className="text-rose-500 font-bold ml-1">{berkasDitolak} ditolak</span>
    </p>
  </div>
  <div className="grid grid-cols-2 gap-4 w-full mt-2">
    <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-100 dark:border-slate-800/50">
      <p className="text-2xl font-black text-gray-800 dark:text-slate-200 font-mono">{totalBerkas}</p>
      <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">Total Verifikasi</p>
    </div>
    <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-100 dark:border-slate-800/50">
      <p className="text-2xl font-black text-gray-800 dark:text-slate-200 font-mono">{berkasSelesai}</p>
      <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">Selesai Diproses</p>
    </div>
  </div>
</div>
              </div>

              {/* Riwayat Aktivitas Section */}
              <section className="bg-white dark:bg-slate-900 border border-[#0F766E] dark:border-emerald-800 border-l-8 border-l-emerald-600 p-8 rounded-3xl shadow-sm relative overflow-hidden flex flex-col space-y-6 w-full">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-5 z-10">
                  <h3 className="font-extrabold text-lg text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-3">
                    <span className="text-2xl"> 🕒 </span> Riwayat Sinkronisasi Aktivitas Instansi
                  </h3>
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-2 text-xs font-mono text-[#0F766E] dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800 px-4 py-2 rounded-full font-bold">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                      </span>
                      Live
                    </span>
                    <button onClick={() => setActiveTab("riwayat")} className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40 hover:bg-emerald-200 dark:hover:bg-emerald-900/60 px-5 py-2.5 rounded-xl transition-colors border border-emerald-200 dark:border-emerald-800">
                      Lihat Semua
                    </button>
                  </div>
                </div>
                <div className="relative ml-5 pl-8 border-l-4 border-slate-200/70 dark:border-slate-700/70 space-y-8 py-2 z-10">
                  {riwayatAktivitasGlobal.slice(0, 3).map((log, index) => (
                    <div key={index} className="relative group cursor-default">
                      <div className="absolute -left-[44px] top-1 w-6 h-6 rounded-full bg-emerald-700 dark:bg-emerald-600 border-[5px] border-white dark:border-slate-900 ring-4 ring-emerald-100 dark:ring-emerald-900/40 z-10 transition-transform group-hover:scale-110"></div>
                      <div className="space-y-2 transition-all group-hover:translate-x-2 duration-200">
                        <span className="text-sm font-mono font-bold text-slate-400 block tracking-wider">[{log.waktu}]</span>
                        <h4 className="text-lg font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-2">{log.judul}</h4>
                        <p className="text-base text-slate-500 dark:text-slate-400 font-medium max-w-4xl leading-relaxed">{log.deskripsi}</p>
                        <div className="pt-1">
                          <span className="inline-block text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800 px-3 py-1.5 rounded shadow-sm">
                            {log.tag}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

            </div>
          )}

          {/* ================= VERIFIKASI BERKAS ================= */}
          {activeTab === "verifikasi" && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-lg font-medium text-gray-600 dark:text-slate-300 mt-1">Audit Integritas Data & Validasi Dokumen Pemohon</p>
                </div>
                <div className="flex items-center gap-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
                  <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-xl flex items-center justify-center"><Layers size={24} /></div>
                  <div>
                    <p className="text-xs text-gray-400 dark:text-slate-500 font-bold uppercase tracking-wider">Antrean Aktif</p>
                    <p className="text-lg font-black text-gray-800 dark:text-slate-200">{berkasMenunggu} Dokumen</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50 flex justify-between items-center">
                  <h3 className="font-bold text-xl text-gray-800 dark:text-slate-200">Daftar Antrean Dokumen</h3>
                  <div className="flex gap-2">
                    {["semua", "menunggu", "disetujui", "ditolak"].map(status => (
                      <button key={status} onClick={() => setFilterStatus(status)} className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase transition-all ${filterStatus === status ? "bg-emerald-700 text-white" : "bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800"}`}>
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-center text-base">
                    <thead>
                      <tr className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest text-center">
                        <th className="py-6 px-4 text-center">ID Dokumen</th>
                        <th className="py-6 px-4 text-center">Nama Pemohon</th>
                        <th className="py-6 px-4 text-center">Kategori</th>
                        <th className="py-6 px-4 text-center">Validasi Persetujuan Instansi</th>
                        <th className="py-6 px-4 text-center">Status</th>
                        <th className="py-6 px-4 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                      {dataDifilter.map((item) => {
                        const isMyAuth = item.kategori === currentNodeCategoryAuthority;
                        const displayName = isMyAuth ? item.nama : obfuscateName(item.nama);
                        const respondedCount = new Set([...(item.signedNodes||[]), ...(item.rejectedNodes || [])]).size;

                        return (
                          <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition text-center">
                            <td className="py-6 px-4 text-sm font-mono font-bold text-gray-700 dark:text-slate-300">{item.id}</td>
                            <td className="py-6 px-4 font-bold text-gray-800 dark:text-slate-200">{displayName}</td>
                            <td className="py-6 px-4 text-sm text-gray-500 dark:text-slate-400 font-medium">{item.kategori}</td>
                            <td className="py-6 px-4">
                              <div className="flex items-center justify-center gap-3">
                                <div className="w-24 h-2.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                  <div className="h-full bg-emerald-600 dark:bg-emerald-500 transition-all duration-500 rounded-full" style={{ width: `${(respondedCount / 4) * 100}%` }} />
                                </div>
                                <span className="font-mono font-bold text-sm text-gray-600 dark:text-slate-400">{respondedCount}/4</span>
                              </div>
                            </td>
                            <td className="py-6 px-4">
                              <span className={`text-xs font-bold px-4 py-2 rounded-full inline-block ${item.status === "disetujui" ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800" : item.status === "ditolak" ? "bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800" : "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800"}`}>
                                {item.status.toUpperCase()}
                              </span>
                            </td>
                            <td className="py-6 px-4 text-center">
                              <button
                                onClick={() => { setSelectedPengajuan(item); setIsSigning(false); setIsRejecting(false); }}
                                className="bg-emerald-800 dark:bg-emerald-700 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-md hover:bg-emerald-900 dark:hover:bg-emerald-600 transition inline-flex items-center justify-center gap-2"
                              >
                                <Eye size={16} /> Detail
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= RIWAYAT AKTIVITAS LENGKAP ================= */}
          {activeTab === "riwayat" && (
            <div className="space-y-8">
              <div>
                <p className="text-base text-gray-500 dark:text-slate-400 mt-1">Audit Ledger Secara Menyeluruh Untuk Transparansi Publik Dana Pengajuan.</p>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50 flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-700 dark:text-slate-300 uppercase tracking-widest">Daftar Log Transaksi Rantai Blok</span>
                  <span className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800 rounded-full text-xs font-bold flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> Live Synchronized
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-center text-base">
                    <thead>
                      <tr className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest text-center">
                        <th className="py-6 px-8 text-center">Block Hash</th>
                        <th className="py-6 px-8 text-center">Aktivitas & Aksi</th>
                        <th className="py-6 px-8 text-center">Detail Pengajuan</th>
                        <th className="py-6 px-8 text-center">Waktu (WIB)</th>
                        <th className="py-6 px-8 text-center">Status Transaksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                      {riwayatAktivitasGlobal.map((log, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition">
                          <td className="py-6 px-8 font-mono text-sm text-gray-400 dark:text-slate-500">0x7f2a{idx}c...9e3b</td>
                          <td className="py-6 px-8">
                            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-slate-200 border border-gray-200 dark:border-slate-700 rounded-lg text-sm font-bold">
                              {log.judul}
                            </span>
                          </td>
                          <td className="py-6 px-8">
                            <p className="font-bold text-gray-800 dark:text-slate-200 text-sm max-w-sm">{log.deskripsi}</p>
                          </td>
                          <td className="py-6 px-8 text-sm font-mono text-gray-500 dark:text-slate-400">[{log.waktu}]</td>
                          <td className="py-6 px-8">
                            <span className="inline-block px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800 rounded-lg text-xs font-bold">{log.tag}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= LAPORAN ANALITIK REALTIME ================= */}
          {activeTab === "laporan" && (
            <div className="space-y-8">
              <div>
                <p className="text-base text-gray-500 dark:text-slate-400 mt-1">Audit Otomatis Performa Verifikasi Berkas</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                  <div>
                    <p className="text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-3">Total Pengajuan Masuk</p>
                    <h3 className="text-4xl font-black">{totalBerkas} <span className="text-sm font-bold text-gray-400">Berkas</span></h3>
                  </div>
                  <div className="flex items-center gap-2 mt-4 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                     <Calendar size={16} /> Per Hari Ini
                  </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                  <div>
                    <p className="text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-3">Rasio Kuorum Persetujuan</p>
                    <h3 className="text-4xl font-black">{persentasePersetujuan}%</h3>
                  </div>
                  <p className="text-sm font-bold mt-4">
                    <span className="text-emerald-600 dark:text-emerald-400">{berkasDisetujui} Disetujui</span>
                    <span className="text-gray-400 mx-2">/</span>
                    <span className="text-rose-600 dark:text-rose-400">{berkasDitolak} Ditolak</span>
                  </p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                  <div>
                    <p className="text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-3">Waktu Rata-Rata Validasi</p>
                    <h3 className={`text-4xl font-black ${rataRataValidasi.warna}`}>{rataRataValidasi.nilai} <span className="text-sm font-bold text-gray-400">Menit</span></h3>
                  </div>
                  <span className={`text-sm font-bold block mt-4 ${rataRataValidasi.warna}`}>{rataRataValidasi.label}</span>
                </div>
              </div>

              {/* Chart Grafis SVG Dinamis Kategori (Per Hari Ini) */}
              <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-10 border border-gray-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-8 mb-4 gap-2">
                  <div>
                    <h3 className="text-base font-black uppercase tracking-widest mb-1 text-emerald-800 dark:text-emerald-400">Grafik Perbandingan Kategori Berkas Harian</h3>
                    <p className="text-xs text-gray-400 font-bold mt-2">Data Terkini: {todayDate}</p>
                  </div>
                  <span className="text-xs text-gray-400 font-bold bg-gray-50 dark:bg-slate-800/50 px-4 py-2 rounded-xl border border-gray-100 dark:border-slate-800 flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> Sinkronisasi Data Langsung
                  </span>
                </div>
                
                <div className="w-full relative h-[400px]">
                  <svg className="w-full h-full" viewBox="0 0 1000 400" preserveAspectRatio="none">
                    {yTicks.map((tick, i) => {
                      const y = 360 - (tick / maxGrafikValue) * 320; 
                      return (
                        <g key={i}>
                          <line x1="60" y1={y} x2="960" y2={y} stroke={isDarkMode ? "#334155" : "#f3f4f6"} strokeWidth="2" strokeDasharray="6,6" />
                          <text x="40" y={y + 5} fontSize="14" fill="#9ca3af" textAnchor="end" fontFamily="Poppins" fontWeight="bold">{tick}</text>
                        </g>
                      );
                    })}
                    
                    <g>
                      {/* Polyline menghubungkan 4 kategori */}
                      <polyline 
                        points={kategoriData.map((val, i) => `${60 + i * ((960 - 60) / 3)},${360 - (val / maxGrafikValue) * 320}`).join(" ")} 
                        fill="none" 
                        stroke="#059669" 
                        strokeWidth="4" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                      />
                      {kategoriData.map((val, i) => {
                        const cx = 60 + i * ((960 - 60) / 3);
                        const cy = 360 - (val / maxGrafikValue) * 320;
                        return (
                          <g key={`pt-${i}`}>
                            {/* Hover Hitbox lebih besar */}
                            <circle 
                              cx={cx} cy={cy} r="40" fill="transparent" 
                              className="cursor-pointer"
                              onMouseEnter={(e) => setHoveredPoint({ x: e.clientX, y: e.clientY, val, label: kategoriLabels[i], color: "#059669" })}
                              onMouseLeave={() => setHoveredPoint(null)}
                            />
                            <circle cx={cx} cy={cy} r="8" fill="#059669" stroke={isDarkMode ? "#0f172a" : "white"} strokeWidth="2" className="pointer-events-none drop-shadow-md" />
                          </g>
                        );
                      })}
                    </g>
                  </svg>
                  <div className="absolute bottom-0 left-0 right-0 flex justify-between px-[60px] text-sm font-bold text-gray-400 pt-2 uppercase tracking-widest">
                    <span>Ekonomi</span><span>Kesehatan</span><span>Pendidikan</span><span>Bencana</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ===== MODAL: DETAIL Persetujuan DATA ANTREAN ===== */}
      <AnimatePresence>
        {selectedPengajuan && (
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 max-w-xl w-full shadow-2xl relative border border-gray-100 dark:border-slate-800"
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="font-extrabold text-gray-900 dark:text-slate-100 text-2xl">Pusat Persetujuan & Verifikasi</h3>
                  <p className="text-sm text-gray-400 font-mono mt-1">Dokumen ID: {selectedPengajuan.id}</p>
                </div>
                <button onClick={() => setSelectedPengajuan(null)} className="text-gray-400 hover:text-gray-600 bg-gray-100 dark:bg-slate-800 p-2.5 rounded-full transition">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                {selectedPengajuan.kategori === currentNodeCategoryAuthority ? (
                  <div className="space-y-5 text-sm bg-emerald-50/50 dark:bg-emerald-900/10 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-800/50">
                    <h4 className="font-bold text-emerald-800 dark:text-emerald-400 border-b border-emerald-200 dark:border-emerald-800/50 pb-3 mb-3 text-base">Data Lengkap Pendaftar</h4>
                    <div className="grid grid-cols-2 gap-y-4 gap-x-4 text-gray-700 dark:text-slate-300">
                      <div><span className="text-gray-400 block text-[10px] uppercase font-bold mb-1">Nama Lengkap</span> <span className="font-bold text-base">{selectedPengajuan.nama}</span></div>
                      <div><span className="text-gray-400 block text-[10px] uppercase font-bold mb-1">Kategori Sistem</span> <span className="font-bold text-base">{selectedPengajuan.kategori}</span></div>
                      <div><span className="text-gray-400 block text-[10px] uppercase font-bold mb-1">NIK</span> <span className="font-bold text-base">{selectedPengajuan.nik}</span></div>
                      <div><span className="text-gray-400 block text-[10px] uppercase font-bold mb-1">Umur</span> <span className="font-bold text-base">{selectedPengajuan.umur} Tahun</span></div>
                      <div className="col-span-2"><span className="text-gray-400 block text-[10px] uppercase font-bold mb-1">Alamat Lengkap</span> <span className="font-bold text-base">{selectedPengajuan.alamat}</span></div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 space-y-3 text-sm">
                    <p className="text-amber-800 dark:text-amber-400 font-bold text-base">Bukan Kategori Domain Anda</p>
                    <p className="text-gray-600 dark:text-slate-400 text-xs leading-relaxed">Identitas mentah dienkripsi penuh lokal. Silakan memverifikasi validitas tanda tangan sistem.</p>
                  </div>
                )}

                <div className="space-y-4 pt-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-gray-800 dark:text-slate-200 text-base">Status Otorisasi Rantai Kuorum</span>
                    <span className="font-mono font-black text-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1.5 rounded-lg border border-emerald-100 dark:border-emerald-800">
                      {new Set([...(selectedPengajuan.signedNodes||[]), ...(selectedPengajuan.rejectedNodes || [])]).size}/4 Node
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-3 text-xs font-bold text-center">
                    {["Dinsos", "Disdik", "BPBD", "Dinkes"].map((nodeKey) => {
                      const isSigned = selectedPengajuan.signedNodes?.includes(nodeKey);
                      const isRejected = selectedPengajuan.rejectedNodes?.includes(nodeKey);
                      let styleClass = "bg-gray-50 dark:bg-slate-800 text-gray-400 border-gray-100 dark:border-slate-700";
                      if (isSigned) styleClass = "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 border-emerald-200";
                      if (isRejected) styleClass = "bg-rose-50 dark:bg-rose-900/20 text-rose-600 border-rose-200";
                      return (
                        <div key={nodeKey} className={`p-4 rounded-2xl border ${styleClass}`}>
                          <p className="text-sm">{NODE_IDENTITIES[nodeKey].name.split(" ")[0]}</p>
                          <p className="text-[10px] font-medium mt-1">{isSigned ? "Signed" : isRejected ? "Rejected" : "Pending"}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {selectedPengajuan.status === "menunggu" && !(selectedPengajuan.rejectedNodes || []).includes(profileName) && !(selectedPengajuan.signedNodes || []).includes(profileName) ? (
                <div className="mt-8 pt-6 border-t dark:border-slate-800 flex justify-end gap-3">
                  <button onClick={handleTolak} disabled={isSigning || isRejecting} className="px-6 py-3 text-sm font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/30 dark:hover:bg-rose-900/50 rounded-xl transition disabled:opacity-50 flex items-center gap-2">
                    {isRejecting && <span className="w-4 h-4 border-2 border-rose-600 border-t-transparent rounded-full animate-spin" />}
                    {isRejecting ? "Memproses..." : "Tolak Pengajuan"}
                  </button>
                  <button onClick={handleSahkan} disabled={isSigning || isRejecting} className="px-8 py-3 text-sm font-extrabold text-white bg-emerald-700 dark:bg-emerald-600 hover:bg-emerald-800 dark:hover:bg-emerald-500 rounded-xl transition shadow-lg shadow-emerald-700/20 flex items-center gap-2 disabled:opacity-50">
                    {isSigning && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                    {isSigning ? "Memproses..." : "Sahkan Dokumen"}
                  </button>
                </div>
              ) : (
                <div className="mt-8 pt-6 border-t dark:border-slate-800">
                  <div className="text-sm font-bold text-gray-400 text-center uppercase tracking-widest">Aksi Telah Dikunci Sistem</div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ===== MODAL EDIT PROFIL ====== */}
<AnimatePresence>
  {showProfileModal && (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      {/* Lebar dinaikkan ke max-w-2xl agar lebih proporsional secara horizontal */}
      <motion.div 
        initial={{ scale: 0.95 }} 
        animate={{ scale: 1 }} 
        exit={{ opacity: 0 }} 
        className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 md:p-10 max-w-2xl w-full shadow-2xl border border-gray-100 dark:border-slate-800"
      >
        {/* Header Modal */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-black text-2xl text-gray-900 dark:text-slate-100 flex items-center gap-3">
            <User size={24} className="text-emerald-700" /> Edit Profil
          </h3>
          <button onClick={() => setShowProfileModal(false)} className="text-gray-400 hover:text-gray-600 bg-gray-100 dark:bg-slate-800 p-2 rounded-full transition">
            <X size={20} />
          </button>
        </div>

        {/* Form diubah menjadi Grid System (Membagi ruang kiri & kanan) */}
        <form onSubmit={handleSaveProfile} className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* SISI KIRI: Area Foto Profil (md:col-span-4) */}
          <div className="md:col-span-4 flex flex-col items-center justify-center py-2 border-b md:border-b-0 md:border-r border-gray-100 dark:border-slate-800 md:pr-6">
            <div className="w-28 h-28 rounded-full bg-gray-100 dark:bg-slate-800 overflow-hidden border-4 border-emerald-50 dark:border-emerald-900 mb-4 relative flex-shrink-0">
              {profileAvatar ? (
                <img src={profileAvatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <User size={48} />
                </div>
              )}
            </div>
            <label className="cursor-pointer text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 border border-emerald-100 dark:border-emerald-800 px-4 py-2.5 rounded-xl hover:bg-emerald-50 dark:hover:bg-slate-800 transition text-center whitespace-nowrap">
              <ImagePlus size={14} /> Upload Foto Profil
              <input name="avatar" type="file" accept="image/*" className="hidden" onChange={handleProfileAvatarChange} />
            </label>
          </div>

          {/* SISI KANAN: Kumpulan Form Input (md:col-span-8) */}
          <div className="md:col-span-8 space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Nama Instansi</label>
              <input 
                type="text" 
                value={editNameVal} 
                onChange={(e) => setEditNameVal(e.target.value)} 
                className="w-full mt-2 p-3.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold focus:ring-2 focus:ring-emerald-500 text-sm text-gray-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Node Otoritas</label>
              {/* FIX: Menggunakan {profileName} agar teks bernilai mutlak tetap, tidak berubah mengikuti ketikan di Nama Instansi */}
              <div className="w-full mt-2 p-3.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-100 dark:bg-slate-800 font-bold text-gray-400 dark:text-slate-500 text-sm cursor-not-allowed select-none">
                {NODE_IDENTITIES[profileName]?.role || "Node 1"} - {profileName || "Dinsos"}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">E-Wallet Metamask Terhubung</label>
              <div className="w-full mt-2 p-3.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-100 dark:bg-slate-800 font-mono font-bold text-gray-400 dark:text-slate-500 text-sm cursor-not-allowed truncate select-none">
                {NODE_IDENTITIES[profileName]?.address || "0x..."}
              </div>
            </div>
            
            {/* Tombol Simpan Perubahan ikut digeser ke sisi kanan bawah agar menghemat tinggi layar */}
            <button type="submit" className="w-full bg-emerald-700 dark:bg-emerald-600 text-white font-black py-3.5 rounded-xl hover:bg-emerald-800 transition mt-4 text-sm shadow-lg shadow-emerald-700/20">
              Simpan Perubahan
            </button>
          </div>

        </form>
      </motion.div>
    </div>
  )}
</AnimatePresence>
</div>   
  );
}
