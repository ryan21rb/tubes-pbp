import React, { useState, useEffect, useContext } from "react";
import logoPhilanthropy from "../assets/logophilantrophy.png";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, FileText, User, LogOut, Heart, 
  MessageCircleHeart, CheckCircle2, Clock, UploadCloud,
  X, Sun, Moon, ImagePlus, Wallet, ShieldCheck, ChevronRight, Check,
  Bell, Settings, ArrowLeft
} from "lucide-react";
import { PhilanthropyContext } from "../context/PhilanthropyContext";

const STAGES = [
  { id: 1, label: "Registrasi & Upload Berkas", icon: UploadCloud },
  { id: 2, label: "Verifikasi Instansi", icon: FileText },
  { id: 3, label: "Otentikasi Yayasan", icon: ShieldCheck },
  { id: 4, label: "Cairkan Dana", icon: Wallet },
  { id: 5, label: "Selesai", icon: CheckCircle2 },
];

const menuItems = [
  { id: "beranda", label: "Beranda", icon: LayoutDashboard },
  { id: "status", label: "Status Bantuan", icon: FileText },
  { id: "profil", label: "Profil & Pengaturan", icon: User },
];

export default function PenerimaPage({ onLogoutClick = () => {} }) {
  const context = useContext(PhilanthropyContext);
  if (!context) {
    return <div className="min-h-screen flex items-center justify-center">Loading context...</div>;
  }
  const { dataPengajuan, ajukanBantuan, dataProgram, dataDonatur, updateTahapBantuan, riwayatAktivitasGlobal, walletAddress, unreadNotifs, markNotifsRead, catatAktivitas } = context;

  const [activeTab, setActiveTab] = useState("beranda");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [userProfile, setUserProfile] = useState({ name: "Ahmad Sudirman", email: "ahmad.s@email.com", nik: "3201234567890001", role: "Penerima" });
  const [profileAvatar, setProfileAvatar] = useState(null);
  const [likedNotes, setLikedNotes] = useState([]);

  // Modal Ajukan Bantuan
  const [showFormModal, setShowFormModal] = useState(false);
  const [formStep, setFormStep] = useState(1); 
  const [formData, setFormData] = useState({ kategori: "Ekonomi" });
  
  // Cek apakah user sudah punya pengajuan
  const myPengajuan = dataPengajuan.find(p => p.nik === userProfile.nik);
  const myProgram = myPengajuan ? dataProgram.find(p => p.id === myPengajuan.programId) : null;
  const programTersedia = dataProgram.filter(p => p.kategori === formData.kategori && p.status === "Berjalan");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) setProfileAvatar(URL.createObjectURL(file));
  };

  const updateProfile = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    setUserProfile(prev => ({ 
      ...prev, 
      name: fd.get('name'), 
      email: fd.get('email')
    }));
    setShowEditProfile(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const submitPengajuan = () => {
    ajukanBantuan({
      nama: userProfile.name,
      nik: userProfile.nik,
      ...formData
    });
    setShowFormModal(false);
    setFormStep(1);
  };

  const getCurrentStepIndex = () => {
    if (!myPengajuan) return 1;
    const stage = STAGES.find(s => s.label === myPengajuan.tahapBantuan);
    return stage ? stage.id : 1;
  };

  const handleKlaimDana = () => {
    if (myPengajuan && myPengajuan.tahapBantuan === "Cairkan Dana") {
      updateTahapBantuan(myPengajuan.id, "Selesai");
      catatAktivitas("Klaim Dana", "Anda berhasil mengajukan klaim dana ke dompet Anda.", "Penerima");
      alert("Permintaan pencairan sedang diproses sistem.");
    }
  };

  const toggleLikeNote = (note) => {
    const isLiked = likedNotes.find(n => n.id === note.id);
    if (isLiked) {
      setLikedNotes(prev => prev.filter(n => n.id !== note.id));
    } else {
      setLikedNotes(prev => [...prev, note]);
      catatAktivitas("Menyukai Catatan", `Anda menyukai catatan dari ${note.nama}: "${note.doa}"`, "Penerima");
    }
  };



  return (
    <div style={{ fontFamily: "'Poppins', sans-serif" }} className={`min-h-screen transition-colors duration-300 ${isDarkMode ? "bg-slate-950 text-slate-100 dark" : "bg-slate-50 text-slate-900"}`}>
      
      {/* ===== SIDEBAR ===== */}
      <aside className="fixed w-[260px] h-full bg-white dark:bg-slate-900 border-r border-gray-100 dark:border-slate-800 p-6 flex flex-col z-40 transition-colors">
        <div className="flex items-center gap-3 mb-10 mt-2 px-2">
          <img src={logoPhilanthropy} alt="Logo" className="w-8 h-8 object-contain dark:drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
          <h1 className="text-lg font-black leading-tight">
            <span className="text-gray-900 dark:text-white">Philantrophy</span><span className="text-[#EAB308]">Chain</span>
          </h1>
        </div>

        <nav className="flex-1 space-y-2">
          {menuItems.map(m => (
            <button key={m.id} onClick={() => setActiveTab(m.id)} className={`w-full flex items-center gap-3 p-4 rounded-xl font-bold text-sm transition-all ${activeTab === m.id || (activeTab === 'detail_program' && m.id === 'beranda') ? "bg-emerald-700 text-white shadow-lg shadow-emerald-700/30" : "text-gray-600 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-slate-800"}`}>
              <m.icon size={20} /> {m.label}
            </button>
          ))}
        </nav>

        <button onClick={onLogoutClick} className="flex items-center gap-3 p-4 text-gray-500 font-bold text-sm hover:text-rose-600 transition"><LogOut size={18}/> Keluar</button>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1 ml-[260px] min-w-0 bg-slate-50 dark:bg-slate-950">
        
        {/* HEADER FLUSH TO TOP */}
        <header className="bg-white dark:bg-slate-900 shadow-sm border-b border-gray-100 dark:border-slate-800 sticky top-0 z-30 transition-colors">
          <div className="max-w-7xl mx-auto px-8 py-5 flex justify-between items-center w-full">
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-wider text-emerald-900 dark:text-emerald-400">
              {activeTab === 'detail_program' ? 'Detail Program' : activeTab === 'status' ? 'Status Bantuan' : activeTab === 'profil' ? 'Profil & Pengaturan' : 'Beranda'}
            </h2>
            <div className="flex items-center gap-3">
              <button onClick={() => { markNotifsRead(); setActiveTab('status'); }} className="p-2.5 rounded-full bg-gray-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-100 hover:text-emerald-600 transition relative">
                <Bell size={20} />
                {unreadNotifs > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unreadNotifs}</span>
                )}
              </button>
              
              {/* Dark Mode Toggle */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`relative flex items-center w-[4.5rem] h-9 p-1 border rounded-full transition-colors duration-300 focus:outline-none shadow-inner mx-2 ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-slate-100 border-slate-200"}`}
              >
                <div className={`absolute top-1 w-7 h-7 rounded-full shadow-md transition-transform duration-300 flex items-center justify-center ${isDarkMode ? "translate-x-8 bg-emerald-700" : "translate-x-0 bg-white"}`}>
                  {isDarkMode ? <Moon size={14} className="text-white" /> : <Sun size={14} className="text-[#F5A623]" />}
                </div>
              </button>
              <button onClick={() => setShowEditProfile(true)} className="w-10 h-10 rounded-full border-2 border-emerald-500 overflow-hidden hover:opacity-80 transition cursor-pointer bg-slate-100 dark:bg-slate-800 shrink-0 flex items-center justify-center">
                {profileAvatar ? <img src={profileAvatar} className="w-full h-full object-cover" /> : <User size={24} className="text-emerald-600"/>}
              </button>
            </div>
          </div>
        </header>

        <div className="p-8 lg:p-12 max-w-7xl mx-auto space-y-8">
        
        {/* ================= BERANDA ================= */}
        {activeTab === "beranda" && (
          <div className="space-y-8 animate-fade-in">
            
            <div className="px-2">
              <h2 className="text-3xl font-black text-slate-800 dark:text-white">Halo, {userProfile.name}</h2>
              <p className="text-gray-500 dark:text-slate-400 mt-1 font-medium">Semoga hari Anda menyenangkan. Kami siap merangkul dan membantu langkah Anda.</p>
            </div>
            
            {!myProgram && !myPengajuan && (
              <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-gray-100 dark:border-slate-800 text-center shadow-sm">
                <FileText size={48} className="mx-auto text-emerald-200 dark:text-emerald-900 mb-4" />
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Belum Ada Program Terpilih</h3>
                <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">Anda dapat mengajukan bantuan melalui halaman Donatur jika belum pernah mengajukan sebelumnya.</p>
              </div>
            )}

            {myProgram && (
              <div className="space-y-6">
                <h3 className="font-black text-xl text-slate-800 dark:text-white ml-2 flex items-center gap-2"><CheckCircle2 className="text-emerald-500"/> Program Yang Anda Ikuti</h3>
                <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                  <div className="relative h-64 overflow-hidden">
                    <img src={myProgram.gambar} alt="Program" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-linear-to-t from-slate-900/90 via-slate-900/40 to-transparent flex flex-col justify-end p-8">
                      <span className="text-xs font-bold text-white bg-emerald-600 px-3 py-1 rounded-full uppercase tracking-wider w-fit mb-3">{myProgram.kategori}</span>
                      <h3 className="text-3xl font-black text-white">{myProgram.judul}</h3>
                    </div>
                  </div>
                  <div className="p-8">
                    <div className="flex flex-col md:flex-row gap-8 items-center">
                      <div className="flex-1 w-full space-y-2">
                        <div className="flex justify-between text-sm font-bold">
                          <span className="text-emerald-600 dark:text-emerald-400">Terkumpul: {myProgram.terkumpul}</span>
                          <span className="text-slate-500">Target: {myProgram.targetDonasi}</span>
                        </div>
                        <div className="h-4 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                          <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${(myProgram.terkumpul / myProgram.targetDonasi) * 100}%` }}></div>
                        </div>
                      </div>
                      <button onClick={() => setActiveTab("detail_program")} className="w-full md:w-auto px-8 py-4 bg-slate-900 dark:bg-emerald-600 text-white font-bold rounded-xl shadow-lg hover:bg-slate-800 dark:hover:bg-emerald-500 active:scale-95 transition-all flex items-center justify-center gap-2 shrink-0">
                        Lihat Detail <ChevronRight size={18}/>
                      </button>
                    </div>
                  </div>
                </div>

                <h3 className="font-black text-xl text-slate-800 dark:text-white ml-2 pt-4 flex items-center gap-2"><MessageCircleHeart className="text-rose-500"/> Catatan Penyemangat dari Donatur</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dataDonatur.filter(d => d.programId === myProgram.id).map(doa => {
                    const isLiked = likedNotes.find(n => n.id === doa.id);
                    return (
                      <div key={doa.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-300 italic mb-4">"{doa.doa}"</p>
                        <div className="flex justify-between items-end border-t border-gray-50 dark:border-slate-800 pt-4 mt-2">
                          <div>
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">{doa.nama}</span>
                            <span className="text-[10px] text-gray-400">Berdonasi {doa.nominal}</span>
                          </div>
                          <button onClick={() => toggleLikeNote(doa)} className={`p-2 rounded-full transition-all ${isLiked ? "bg-rose-50 text-rose-500 dark:bg-rose-900/30" : "bg-gray-50 text-gray-400 hover:bg-rose-50 hover:text-rose-400 dark:bg-slate-800"}`}>
                            <Heart size={18} fill={isLiked ? "currentColor" : "none"} className={isLiked ? "scale-110 transition-transform" : ""} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= DETAIL PROGRAM ================= */}
        {activeTab === "detail_program" && myProgram && (
          <div className="space-y-8 animate-fade-in">
            
            <button onClick={() => setActiveTab("beranda")} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-emerald-600 transition-colors">
              <ArrowLeft size={16}/> Kembali ke Beranda
            </button>

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 p-8 shadow-sm">
              <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-6">Detail Donasi: {myProgram.judul}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-emerald-50 dark:bg-slate-800 p-6 rounded-2xl border border-emerald-100 dark:border-slate-700">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-1">Total Terkumpul</p>
                  <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400">{myProgram.terkumpul}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-1">Target</p>
                  <p className="text-xl font-bold text-slate-700 dark:text-slate-300">{myProgram.targetDonasi}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-1">Total Donatur</p>
                  <p className="text-xl font-bold text-slate-700 dark:text-slate-300">{dataDonatur.filter(d => d.programId === myProgram.id).length} OrangBaik</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= STATUS BANTUAN ================= */}
        {activeTab === "status" && (
          <div className="space-y-8 animate-fade-in">

            <section className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm">
              <h3 className="font-black text-2xl mb-12 text-slate-800 dark:text-white text-center">Alur Proses Bantuan Anda</h3>
              
              <div className="space-y-16">
                <div className="flex justify-between items-center relative mb-12 px-2 md:px-12">
                  <div className="absolute top-5 md:top-6 left-12 right-12 h-2 bg-gray-100 dark:bg-slate-800 rounded-full">
                    <motion.div className="h-full bg-amber-400 rounded-full shadow-sm" animate={{width: `${((getCurrentStepIndex() - 1) / 4) * 100}%`}} transition={{ duration: 1 }} />
                  </div>
                  {STAGES.map((s, i) => {
                    const stepIdx = getCurrentStepIndex();
                    const isCompleted = myPengajuan && s.id < stepIdx;
                    const isActive = myPengajuan && s.id === stepIdx;
                    return (
                      <div key={s.id} className="relative z-10 flex flex-col items-center gap-3 w-20 md:w-28">
                        <div className={`w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${isCompleted || isActive ? "bg-emerald-500 border-emerald-200 text-white shadow-lg shadow-emerald-500/40" : "bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-gray-300"}`}>
                          {isCompleted ? <Check size={24} strokeWidth={4} /> : <s.icon size={20} className={isActive ? "scale-110" : ""} />}
                        </div>
                        <p className={`text-[10px] md:text-xs text-center font-bold leading-tight ${isActive || isCompleted ? "text-emerald-700 dark:text-emerald-400" : "text-gray-400"}`}>{s.label}</p>
                      </div>
                    );
                  })}
                </div>
                
                {myPengajuan ? (
                  <div className="bg-emerald-50/50 dark:bg-emerald-900/10 p-8 rounded-3xl border border-emerald-100 dark:border-emerald-800/50">
                    <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
                      <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center shadow-inner shrink-0">
                        {getCurrentStepIndex() === 1 && <UploadCloud size={32} />}
                        {getCurrentStepIndex() === 2 && <FileText size={32} />}
                        {getCurrentStepIndex() === 3 && <ShieldCheck size={32} />}
                        {getCurrentStepIndex() === 4 && <Wallet size={32} />}
                        {getCurrentStepIndex() === 5 && <CheckCircle2 size={32} />}
                      </div>
                      <div className="text-center md:text-left">
                        <h4 className="text-xl font-black text-slate-800 dark:text-white">{myPengajuan.tahapBantuan}</h4>
                        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1 max-w-xl">
                          {myPengajuan.tahapBantuan === "Registrasi & Upload Berkas" && "Berkas Anda telah diterima dan sedang menunggu peninjauan awal."}
                          {myPengajuan.tahapBantuan === "Verifikasi Instansi" && "Instansi terkait sedang memverifikasi keabsahan data ZKP Anda. Membutuhkan persetujuan 2 node instansi."}
                          {myPengajuan.tahapBantuan === "Otentikasi Yayasan" && "Yayasan sedang meninjau kelayakan program bantuan Anda berdasarkan hasil verifikasi."}
                          {myPengajuan.tahapBantuan === "Cairkan Dana" && "Bantuan telah disetujui! Silakan klik tombol di bawah untuk mencairkan dana ke dompet Anda."}
                          {myPengajuan.tahapBantuan === "Selesai" && "Dana telah berhasil ditransfer ke dompet Anda. Terima kasih!"}
                        </p>
                      </div>
                    </div>
                    
                    <div className="max-w-md mx-auto">
                      <button 
                        onClick={handleKlaimDana}
                        disabled={myPengajuan.tahapBantuan !== "Cairkan Dana"}
                        className={`w-full font-black py-4 rounded-2xl shadow-lg transition-all ${myPengajuan.tahapBantuan === "Cairkan Dana" ? "bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 shadow-emerald-600/40 animate-pulse" : myPengajuan.tahapBantuan === "Selesai" ? "bg-emerald-100 text-emerald-700 cursor-default" : "bg-gray-100 dark:bg-slate-800 text-gray-400 cursor-not-allowed"}`}
                      >
                        {myPengajuan.tahapBantuan === "Selesai" ? "DANA SUDAH TERKIRIM" : myPengajuan.tahapBantuan === "Cairkan Dana" ? "KLAIM DANA BANTUAN" : "MENUNGGU PROSES..."}
                      </button>
                      <p className="text-center text-xs text-gray-500 mt-4">Tombol akan aktif setelah Yayasan menyetujui pencairan dana ke dompet Anda.</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText size={48} className="mx-auto text-gray-200 dark:text-slate-700 mb-4" />
                    <p className="text-gray-500 font-medium">Anda belum mengajukan bantuan.</p>
                  </div>
                )}
              </div>
            </section>

            <section className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm">
              <h3 className="font-black text-xl mb-6 text-slate-800 dark:text-white flex items-center gap-2"><Clock className="text-emerald-500"/> Riwayat Aktivitas</h3>
              <div className="space-y-4">
                {riwayatAktivitasGlobal.filter(r => r.tag === "Penerima" || (myPengajuan && r.deskripsi.includes(myPengajuan.id))).map((riwayat, idx) => (
                  <div key={idx} className="flex gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <div className="mt-1">
                      {riwayat.tag === 'Sistem' ? <Settings size={16} className="text-gray-400" /> :
                       riwayat.tag === 'Penerima' ? <CheckCircle2 size={16} className="text-emerald-500" /> :
                       <Clock size={16} className="text-[#F5A623]" />}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-800 dark:text-slate-200">{riwayat.judul}</p>
                      <p className="text-xs text-gray-500 mt-1">{riwayat.deskripsi}</p>
                      <div className="flex items-center gap-3 mt-3">
                        <span className="text-[10px] font-bold px-2 py-1 bg-gray-200 dark:bg-slate-700 rounded-md text-gray-600 dark:text-gray-300">{riwayat.tag}</span>
                        <span className="text-[10px] text-gray-400">{riwayat.waktu}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* ================= PROFIL & PENGATURAN ================= */}
        {activeTab === "profil" && (
          <div className="space-y-8 animate-fade-in">

            <div className="space-y-6">
              {/* DOMPETKU CARD */}
              <div className="bg-linear-to-r from-emerald-800 to-emerald-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div>
                    <p className="text-white-200 font-bold text-sm uppercase tracking-wider mb-2 flex items-center gap-2"><Wallet size={16}/> Dompetku</p>
                    <h3 className="text-4xl font-black mb-1">
                      {myPengajuan && myPengajuan.tahapBantuan === 'Selesai' && myProgram ? (myProgram.terkumpul * 0.95 / myProgram.targetPenerima) : 0}
                    </h3>
                    <p className="text-xs text-white-200/70">Saldo Dana Bantuan Tersedia</p>
                  </div>
                </div>
              </div>

              {/* PROFIL CARD */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden relative">
                <div className="px-10 pb-6 relative z-10 flex flex-col md:flex-row items-center md:items-end justify-between mt-8 gap-4">
                  <div className="flex flex-col md:flex-row items-center md:items-end gap-9 text-center md:text-left">
                    <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 border-4 border-white dark:border-slate-900 shadow-md flex items-center justify-center relative shrink-0">
                      {profileAvatar ? <img src={profileAvatar} className="w-full h-full object-cover rounded-full" /> : <User size={40} className="text-gray-400"/>}
                      <button onClick={() => setShowEditProfile(true)} className="absolute bottom-0 right-0 bg-amber-500 hover:bg-amber-600 text-white p-1.5 rounded-full border-2 border-white dark:border-slate-900 transition-colors"><Settings size={12}/></button>
                    </div>
                    <div className="mb-5">
                       <h3 className="text-3xl font-black text-slate-800 dark:text-white">{userProfile.name}</h3>
                       <p className="text-l text-gray-500 font-medium">{userProfile.email}</p>
                    </div>
                  </div>
                  <button onClick={() => setShowEditProfile(true)} className="px-6 py-2.5 bg-emerald-800 text-white rounded-xl font-bold hover:bg-emerald-900 shadow-md transition whitespace-nowrap mb-6">Edit Profil</button>
                </div>
              </div>

              {/* PENGATURAN CARD */}
              <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
                <h3 className="font-black text-xl text-slate-800 dark:text-white flex items-center gap-2"><Settings className="text-gray-400"/> Pengaturan</h3>
                <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <span className="font-bold text-sm text-slate-700 dark:text-slate-300">Mode Layar</span>
                  <button 
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className={`relative flex items-center w-16 h-8 p-1 rounded-full transition-colors duration-300 focus:outline-none shadow-inner ${isDarkMode ? "bg-emerald-600" : "bg-gray-300"}`}
                  >
                    <div className={`absolute top-1 bg-white w-6 h-6 rounded-full shadow-md transition-transform duration-300 flex items-center justify-center ${isDarkMode ? "translate-x-8" : "translate-x-0"}`}>
                      {isDarkMode ? <Moon size={12} className="text-emerald-600" /> : <Sun size={12} className="text-[#F5A623]" />}
                    </div>
                  </button>
                </div>
              </div>

              {/* RIWAYAT LIKES */}
              <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm">
                <h3 className="font-black text-xl mb-6 text-slate-800 dark:text-white flex items-center gap-2"><Heart className="text-rose-500" fill="currentColor"/> Catatan yang Anda Sukai ({likedNotes.length})</h3>
                <div className="space-y-4">
                  {likedNotes.length > 0 ? likedNotes.map(note => (
                    <div key={note.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-700">
                      <p className="text-sm italic font-medium text-slate-600 dark:text-slate-300 mb-2">"{note.doa}"</p>
                      <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">— {note.nama}</p>
                    </div>
                  )) : (
                    <p className="text-sm text-gray-500 italic">Anda belum menyukai catatan apapun dari donatur.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </main>

      {/* ===== MODAL EDIT PROFIL ===== */}
      <AnimatePresence>
        {showEditProfile && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div initial={{scale: 0.95, opacity: 0}} animate={{scale: 1, opacity: 1}} exit={{scale: 0.95, opacity: 0}} className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 max-w-sm w-full shadow-2xl border border-gray-100 dark:border-slate-800">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-black text-xl text-slate-800 dark:text-white">Edit Profil</h3>
                <button onClick={() => setShowEditProfile(false)} className="bg-gray-100 dark:bg-slate-800 p-2 rounded-full text-gray-500 hover:text-gray-800"><X size={16}/></button>
              </div>
              <form onSubmit={updateProfile} className="space-y-4">
                <div className="flex flex-col items-center mb-6">
                  <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-slate-800 overflow-hidden border-4 border-white dark:border-slate-900 shadow-md mb-4 relative">
                    {profileAvatar ? <img src={profileAvatar} className="w-full h-full object-cover" /> : <User size={40} className="mx-auto mt-7 text-gray-400"/>}
                  </div>
                  <label className="cursor-pointer text-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 text-xs font-bold flex items-center gap-2 border border-emerald-100 dark:border-emerald-800 px-4 py-2 rounded-xl hover:bg-emerald-100 transition">
                    <ImagePlus size={14} /> Upload Foto Baru
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                  </label>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase px-1">Nama Lengkap</label>
                  <input name="name" defaultValue={userProfile.name} required className="w-full mt-1 p-3 rounded-xl border border-gray-200 dark:border-slate-700 dark:bg-slate-800 font-medium text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase px-1">Email</label>
                  <input name="email" defaultValue={userProfile.email} required type="email" className="w-full mt-1 p-3 rounded-xl border border-gray-200 dark:border-slate-700 dark:bg-slate-800 font-medium text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase px-1">Alamat Web3</label>
                  <input value={walletAddress || "0x..."} disabled className="w-full mt-1 p-3 rounded-xl border border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50 text-gray-400 font-mono text-xs cursor-not-allowed" />
                </div>
                <button className="w-full bg-emerald-700 text-white font-bold py-3.5 mt-4 rounded-xl hover:bg-emerald-800 transition active:scale-95 shadow-lg shadow-emerald-700/20">Simpan Perubahan</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
