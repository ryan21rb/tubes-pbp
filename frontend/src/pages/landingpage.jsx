import React, { useState, useEffect, useRef, useContext } from "react";
import { apiLogin, apiRegister } from '../services/api';
import ryan from '../assets/ryan.jpeg';
import dita from '../assets/dita.jpeg';
import arham from '../assets/arham.jpeg';
import donasi from '../assets/donasi.png';
import logo from '../assets/logophilantrophy.png';
import imgHealth from '../assets/campaign_health.png';
import imgDisaster from '../assets/campaign_disaster.png';
import imgEducation from '../assets/campaign_education.png';
import imgSocial from '../assets/campaign_social.png';
import {
  ShieldCheck,
  Users,
  BarChart3,
  Lock,
  Zap,
  FileText,
  Globe,
  Gem,
  Building,
  Heart,
  ArrowRight,
  Menu,
  X,
  DollarSign,
  CheckCircle2,
  Sun,
  Moon,
  ChevronRight,
  Compass,
  FileCheck,
  Coins,
  Handshake,
  Search,
  Eye,
} from "lucide-react";
import { PhilanthropyContext } from "../context/PhilanthropyContext";

const CounterUp = ({ target, duration = 3500, prefix = "", suffix = "", isDecimal = false }) => {
  const [count, setCount] = useState(0);
  const elementRef = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const end = parseFloat(target) || 0;
          let startTime = null;

          const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const progressRatio = Math.min(progress / duration, 1);
            const easeOutQuad = progressRatio * (2 - progressRatio);
            const currentCount = easeOutQuad * end;

            setCount(currentCount);

            if (progress < duration) {
              requestAnimationFrame(animate);
            } else {
              setCount(end);
            }
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) observer.observe(elementRef.current);
    return () => observer.disconnect();
  }, [target, duration, hasAnimated]);

  const formatNumber = (num) => {
    if (isDecimal) {
      return num.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    }
    return Math.floor(num).toLocaleString("id-ID");
  };

  return (
    <span ref={elementRef} className="font-bold">
      {prefix}
      {count === 0 ? "0" : formatNumber(count)}
      {suffix}
    </span>
  );
};

export default function LandingPage({ onLoginClick }) {
  const context = useContext(PhilanthropyContext);
  const connectWallet = context?.connectWallet;
  const setAuthToken = context?.setAuthToken;
  const VIP_NODES = context?.VIP_NODES || [];
  const setWalletAddress = context?.setWalletAddress;
  const apiToken = context?.apiToken;
  const userRole = context?.userRole;

  const [liveStats, setLiveStats] = useState({
    total_collected_eth: 127.5,
    total_beneficiaries: 156,
    total_campaigns: 42,
    transparency_percentage: 98.7
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const baseApiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
        const response = await fetch(`${baseApiUrl}/public/stats`);
        if (response.ok) {
          const resJson = await response.json();
          if (resJson && resJson.data) {
            setLiveStats(resJson.data);
          }
        }
      } catch (err) {
        console.error("Gagal memuat statistik live dari backend:", err);
      }
    };
    fetchStats();
  }, []);

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeNav, setActiveNav] = useState("Beranda");
  const [alertMsg, setAlertMsg] = useState(null);
  const [currentImage, setCurrentImage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [authMode, setAuthMode] = useState(null); // null, 'login', 'register'
  const [walletConnected, setWalletConnected] = useState(false);
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'donatur', instansi_type: '' });
  const [isConnecting, setIsConnecting] = useState(false);
  const [isWalletBlinking, setIsWalletBlinking] = useState(false);
  // State khusus auth API
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);
  const heroImages = [donasi, arham, dita, ryan, logo];

  const navItems = [
    { name: "Beranda", href: "#beranda" },
    { name: "Cara Kerja", href: "#cara-kerja" },
    { name: "Keunggulan", href: "#keunggulan" },
    { name: "Program", href: "#campaign" },
    { name: "Tentang Kami", href: "#tentang-kami" },
  ];

  const campaignsList = (context?.dataProgram && context.dataProgram.length > 0)
    ? context.dataProgram.slice(0, 3).map(p => ({
        id: p.id,
        judul: p.judul || p.title || "Program Bantuan Kemanusiaan",
        terkumpul: p.terkumpul || 0,
        targetDonasi: p.targetDonasi || 0,
        gambar: p.gambar || (() => {
          const cat = (p.kategori || '').toLowerCase();
          if (cat.includes('kesehatan')) return imgHealth;
          if (cat.includes('bencana')) return imgDisaster;
          if (cat.includes('pendidikan')) return imgEducation;
          return imgSocial;
        })(),
        category: p.kategori || "Ekonomi"
      }))
    : [
        {
          id: 1,
          judul: "🏠 Dukungan Panti Asuhan Harapan Bangsa",
          terkumpul: 0.1,
          targetDonasi: 0.5,
          gambar: imgSocial,
          category: "Ekonomi"
        },
        {
          id: 2,
          judul: "Bantuan Peralatan Medis untuk Klinik Ekonomi",
          terkumpul: 2.4,
          targetDonasi: 4.0,
          gambar: imgHealth,
          category: "Kesehatan"
        },
        {
          id: 3,
          judul: "📚 Program Beasiswa Pendidikan Generasi Cerdas",
          terkumpul: 1.5,
          targetDonasi: 3.5,
          gambar: imgEducation,
          category: "Pendidikan"
        }
      ];

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 3000); // Ganti gambar setiap 3 detik
    return () => clearInterval(timer);
  }, [heroImages.length]);

  // Alur 1: Memanggil pop-up Metamask DULU sebelum modal form muncul
  const handleConnectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        setIsConnecting(true); // Animasi loading "Menunggu Konfirmasi..."
        
        // Membuka pop-up Metamask untuk meminta izin koneksi akun (FORCE POP-UP)
        await window.ethereum.request({
          method: 'wallet_requestPermissions',
          params: [{ eth_accounts: {} }]
        });
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const address = accounts[0].toLowerCase();
        
        // Jika berhasil connect di Metamask, cek apakah dia VIP
        if (VIP_NODES.map(v => v.toLowerCase()).includes(address)) {
           // Login instan VIP (bypass auth form dengan set mock token)
           const role = address === '0x507610fdf65637c1752657664dfea2865e589b88' ? 'yayasan' : 'instansi';
           if (setAuthToken) setAuthToken('vip_bypass', role);

           if (setWalletAddress) setWalletAddress(address);
           if (connectWallet) await connectWallet();
           
           // Bypass routing (Instansi vs Yayasan)
           if (role === 'yayasan') {
             window.location.hash = '#/yayasan';
           } else {
             window.location.hash = '#/instansi';
           }
        } else {
           // Bukan VIP, munculkan form Login / Register (Tidak dipindah)
           setIsConnecting(false);
           setAuthMode('login');
        }
        
      } catch (error) {
        // Jika user batal connect di Metamask
        console.error("Koneksi dibatalkan pengguna atau terjadi error:", error);
        setIsConnecting(false);
      }
    } else {
      setAlertMsg("Metamask belum terinstall! Silakan install ekstensi Metamask terlebih dahulu di browser Anda.");
    }
  };

  // Alur Pemicu: Jika tombol "Mulai Berdonasi" diklik, tombol wallet berkedip shadow putih
  const triggerWalletBlink = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsWalletBlinking(true);
    setTimeout(() => {
      setIsWalletBlinking(false);
    }, 3000); 
  };

  // ================================================================
  // HANDLE AUTH SUBMIT — Email + Password + Mandatory MetaMask Signature
  // ================================================================
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    if (!window.ethereum) {
      return setAlertMsg('MetaMask diperlukan untuk melakukan autentikasi di PhilanthropyChain.');
    }
    setAuthError(null);
    setIsAuthLoading(true);

    try {
      // === LANGKAH 1: Minta akun & tanda tangan MetaMask (Wajib) ===
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const address = accounts[0];
      const timestamp = new Date().getTime();
      const message = `Saya menandatangani pesan ini untuk ${authMode === 'login' ? 'masuk' : 'mendaftar'} ke PhilanthropyChain.\n\nAlamat: ${address}\nWaktu: ${timestamp}`;

      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, address],
      });

      // === LANGKAH 2: Kirim ke Laravel Backend (email + password) ===
      let response;
      if (authMode === 'register') {
        if (authForm.password !== authForm.confirmPassword) {
          throw new Error('Password dan konfirmasi password tidak cocok.');
        }
        const payload = {
          name: authForm.name,
          email: authForm.email,
          password: authForm.password,
          role: authForm.role || 'donatur',
          instansi_type: authForm.role === 'instansi' ? authForm.instansi_type : null,
          wallet_address: address, // Gunakan alamat MetaMask yang ditandatangani
        };
        response = await apiRegister(payload);
      } else {
        const payload = {
          email: authForm.email,
          password: authForm.password,
          wallet_address: address,
        };
        response = await apiLogin(payload);
        
        // Handshake MetaMask: Pastikan wallet yang aktif sama dengan wallet yang terdaftar di database
        const registeredWallet = response?.user?.wallet_address || response?.data?.user?.wallet_address;
        if (registeredWallet && registeredWallet.toLowerCase() !== address.toLowerCase()) {
          throw new Error(`Alamat MetaMask aktif (${address.substring(0, 6)}...) tidak cocok dengan wallet terdaftar untuk akun ini (${registeredWallet.substring(0, 6)}...). Silakan ganti akun MetaMask Anda terlebih dahulu.`);
        }
      }

      // === LANGKAH 3: Ekstrak & simpan JWT token ===
      const token = response?.access_token || response?.token || response?.data?.token;
      const role = response?.role || response?.user?.role || response?.data?.role || 'donatur';
      const instansiType = response?.instansi_type || response?.user?.instansi_type || null;
      const user = response?.user || response?.data?.user || null;

      if (!token) {
        throw new Error('Server tidak mengembalikan token autentikasi. Pastikan backend berjalan.');
      }

      // Simpan token, role, instansi_type, & user ke localStorage & update context
      if (setAuthToken) setAuthToken(token, role, instansiType, user);

      // Hubungkan wallet ke context juga
      if (connectWallet) await connectWallet();

      // === LANGKAH 4: Redirect berdasarkan role dari response API ===
      const roleLower = (role || '').toLowerCase();
      if (roleLower === 'yayasan') {
        window.location.hash = '#/yayasan';
      } else if (roleLower === 'instansi') {
        window.location.hash = '#/instansi';
      } else if (roleLower === 'penerima') {
        window.location.hash = '#/penerima';
      } else {
        // Default: donatur
        window.location.hash = '#/donatur';
      }

      setAuthMode(null); // Tutup modal

    } catch (error) {
      console.error('[handleAuthSubmit] Error:', error);
      if (error.code === 4001) {
        setAuthError('Anda membatalkan tanda tangan MetaMask. Coba lagi untuk masuk.');
      } else {
        setAuthError(error.message || 'Autentikasi gagal. Periksa koneksi backend dan coba lagi.');
      }
    } finally {
      setIsAuthLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif" }} className={`min-h-screen selection:bg-emerald-700 selection:text-white overflow-x-hidden transition-colors duration-300 ${isDarkMode ? "bg-slate-950 text-slate-100 dark" : "bg-slate-50 text-slate-900"}`}>
      
      {/* ================= NAVBAR ================= */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? (isDarkMode ? "bg-slate-900/90 backdrop-blur-md shadow-lg py-3" : "bg-white/90 backdrop-blur-md shadow-lg py-3") : isDarkMode ? "bg-slate-900 py-5" : "bg-white py-5"}`}>
        <div className="w-full max-w-[1440px] mx-auto px-6 md:px-12 flex items-center justify-between">
          
          {/* Logo */}
<div className="flex items-center gap-4 cursor-pointer group">
  <img 
    src={logo} 
    alt="Logo" 
    className="w-8 h-8 object-contain dark:drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]" 
  />
  <div>
    <h1 className="text-lg font-black leading-tight">
      <span className={isDarkMode ? "text-white" : "text-gray-900"}>Philantrophy</span>
      <span className="text-[#EAB308]">Chain</span>
    </h1>
    {/* Optional: Tambahkan label kecil di bawah jika perlu */}
    <p className="text-[10px] text-gray-500 dark:text-slate-400 uppercase tracking-widest mt-1">
      Platform Donasi
    </p>
  </div>
</div>

          {/* Desktop Nav Links */}
          <div className={`hidden md:flex items-center space-x-4 lg:space-x-6 font-medium bg-transparent`}>
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={() => setActiveNav(item.name)}
                className={`px-4 py-1.5 rounded-full transition-all duration-300 ${
                  activeNav === item.name
                    ? "bg-emerald-700 text-white font-bold"
                    : `${isDarkMode ? "text-slate-400 hover:text-white" : "text-slate-600 dark:text-slate-300 hover:text-emerald-700 hover:bg-emerald-50"}`
                }`}
              >
                {item.name}
              </a>
            ))}
          </div>

          {/* Kolom Kanan: Toggle & Tombol Masuk */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className={`relative flex items-center w-20 h-10 p-1 border rounded-full transition-colors duration-300 focus:outline-none shadow-inner ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-slate-100 border-slate-200"}`}
              aria-label="Toggle Dark Mode"
            >
              <div className={`absolute top-1 w-8 h-8 rounded-full shadow-md transition-transform duration-300 flex items-center justify-center ${isDarkMode ? "translate-x-10 bg-emerald-700" : "translate-x-0 bg-white"}`}>
                {isDarkMode ? <Moon size={18} className="text-white" /> : <Sun size={18} className="text-amber-500" />}
              </div>
              <div className="w-full flex justify-between px-2 text-slate-400 pointer-events-none">
                <Sun size={16} className={`${isDarkMode ? "opacity-100" : "opacity-0"} transition-opacity`} />
                <Moon size={16} className={`${isDarkMode ? "opacity-0" : "opacity-100"} transition-opacity`} />
              </div>
            </button>

            {/* TOMBOL HUBUNGKAN WALLET / MASUK DASHBOARD */}
            {apiToken ? (
              <button
                onClick={() => {
                  const roleLower = (userRole || '').toLowerCase();
                  if (roleLower === 'yayasan') window.location.hash = '#/yayasan';
                  else if (roleLower === 'instansi') window.location.hash = '#/instansi';
                  else if (roleLower === 'penerima') window.location.hash = '#/penerima';
                  else window.location.hash = '#/donatur';
                }}
                className="px-6 py-2 rounded-full font-bold text-sm tracking-wide transition-all duration-300 flex items-center justify-center gap-2 bg-emerald-600 text-white border border-transparent hover:bg-emerald-500 active:scale-95 shadow-[0_0_10px_rgba(255,255,255,0.15)] hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]"
              >
                MASUK DASHBOARD
              </button>
            ) : (
              <button
                onClick={handleConnectWallet}
                disabled={isConnecting}
                className={`px-6 py-2 rounded-full font-bold text-sm tracking-wide transition-all duration-300 flex items-center justify-center gap-2
                  bg-emerald-600 text-white border border-transparent
                  hover:bg-emerald-500 active:scale-95 disabled:opacity-90 disabled:cursor-wait
                  ${isWalletBlinking ? "animate-pulse shadow-[0_0_20px_rgba(255,255,255,0.7)] scale-105" : "shadow-[0_0_10px_rgba(255,255,255,0.15)] dark:shadow-[0_0_15px_rgba(255,255,255,0.05)]"}
                  ${isConnecting ? "shadow-[0_0_20px_rgba(52,211,153,0.5)] scale-105" : ""}`}
              >
                {isConnecting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Menunggu Konfirmasi...
                  </>
                ) : (
                  "HUBUNGKAN WALLET"
                )}
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`p-2 hover:text-emerald-700 focus:outline-none ${isDarkMode ? "text-slate-300" : "text-slate-600 dark:text-slate-300"}`}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* ================= HERO SECTION ================= */}
      <section
        id="beranda"
        className="pt-24 pb-16 md:pt-28 md:pb-24 w-full"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-[1440px] mx-auto px-6 md:px-12">
          
          {/* Kiri - Teks */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.15]">
              DONASI AMAN, <br />
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                TRANSPARAN,
              </span>{" "}
              DAN <br />
              TEPAT SASARAN
            </h1>

            <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl mx-auto lg:mx-1">
              Platform donasi ini hadir dengan transparansi penuh yang dapat dipantau secara terbuka, sehingga Anda mengetahui dengan pasti ke mana setiap rupiah disalurkan. Kami menjamin kerahasiaan identitas penerima bantuan agar martabat dan data pribadi mereka tetap terjaga dengan aman. Sistem ini dirancang untuk memastikan bantuan sampai tepat sasaran kepada mereka yang benar-benar membutuhkan tanpa celah manipulasi. Bersama kami, mari wujudkan langkah berbagi yang berarti.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={triggerWalletBlink}
                className="w-full sm:w-auto bg-emerald-700 text-white font-bold px-8 py-4 rounded-xl shadow-xl shadow-emerald-600/30 hover:bg-emerald-600 transition-all active:scale-95"
              >
                MULAI BERDONASI
              </button>
              <a
                href="#cara-kerja"
                className="w-full sm:w-auto flex items-center justify-center space-x-2 border-2 border-emerald-600 text-emerald-700 dark:text-emerald-400 font-bold px-8 py-4 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-all group"
              >
                <span>PELAJARI LEBIH</span>
                <ArrowRight size={18} className="transform group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>

          {/* Kanan - Gambar Persegi */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[400px] aspect-square rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800 transition-all duration-500 hover:scale-[1.03] hover:shadow-[0_0_40px_rgba(16,185,129,0.4)] dark:hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] cursor-pointer group">
              <img
                src={donasi} 
                alt="Donasi PhilanthropyChain"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-900/20 to-transparent transition-opacity duration-500 group-hover:opacity-75" />
            </div>
          </div>
        </div>
      </section>

      {/* ================= STATISTIK LIVE ================= */}
      <section className="bg-slate-50/50 dark:bg-slate-950 transition-colors duration-300">
        <div className="max-w-[1440px] px-5 sm:px-8 lg:px-8 mx-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm transition-colors duration-300">
            <div className="flex justify-center -mt-12 md:-mt-14 mb-8">
              <div className="inline-flex items-center gap-2.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 px-4 py-1.5 rounded-full border border-emerald-100/60 dark:border-emerald-900/50 shadow-sm">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
                </span>
                <h2 className="text-[11px] font-bold uppercase tracking-widest animate-pulse">
                  STATISTIK LIVE
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="p-5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 flex items-center space-x-4 border border-emerald-100/30 dark:border-emerald-900/20 transition-all hover:-translate-y-1 active:scale-98 active:shadow-md active:shadow-emerald-600/10 duration-300 cursor-pointer">
                <div className="p-3 bg-emerald-600 dark:bg-emerald-700 rounded-xl text-white shadow-sm flex items-center justify-center shrink-0">
                  <DollarSign size={24} />
                </div>
                <div className="flex flex-col min-w-0">
                  <p className="text-xs font-bold text-emerald-700/80 dark:text-emerald-400/80 uppercase tracking-wider mb-0.5">
                    Total Donasi Tersalurkan
                  </p>
                  <h3 className="text-xl md:text-2xl font-bold tracking-tight text-emerald-950 dark:text-emerald-100 whitespace-nowrap">
                    <CounterUp target={liveStats.total_collected_eth.toString()} isDecimal={true} duration={3500} /> ETH 
                  </h3>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 flex items-center space-x-4 border border-emerald-100/30 dark:border-emerald-900/20 transition-all hover:-translate-y-1 active:scale-98 active:shadow-md active:shadow-emerald-600/10 duration-300 cursor-pointer">
                <div className="p-3 bg-emerald-600 dark:bg-emerald-700 rounded-xl text-white shadow-sm flex items-center justify-center shrink-0">
                  <Users size={24} />
                </div>
                <div className="flex flex-col min-w-0">
                  <p className="text-xs font-bold text-emerald-700/80 dark:text-emerald-400/80 uppercase tracking-wider mb-0.5">
                    Penerima Manfaat Terbantu
                  </p>
                  <h3 className="text-xl md:text-2xl font-bold tracking-tight text-emerald-950 dark:text-emerald-100 whitespace-nowrap">
                    <CounterUp target={liveStats.total_beneficiaries.toString()} duration={3500} /> Orang
                  </h3>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 flex items-center space-x-4 border border-emerald-100/30 dark:border-emerald-900/20 transition-all hover:-translate-y-1 active:scale-98 active:shadow-md active:shadow-emerald-600/10 duration-300 cursor-pointer">
                <div className="p-3 bg-emerald-600 dark:bg-emerald-700 rounded-xl text-white shadow-sm flex items-center justify-center shrink-0">
                  <BarChart3 size={24} />
                </div>
                <div className="flex flex-col min-w-0">
                  <p className="text-xs font-bold text-emerald-700/80 dark:text-emerald-400/80 uppercase tracking-wider mb-0.5">
                    Berhasil Tersalurkan
                  </p>
                  <h3 className="text-xl md:text-2xl font-bold tracking-tight text-emerald-950 dark:text-emerald-100 whitespace-nowrap">
                    <CounterUp target={liveStats.total_campaigns.toString()} duration={3500} /> Campaign
                  </h3>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 flex items-center space-x-4 border border-emerald-100/30 dark:border-emerald-900/20 transition-all hover:-translate-y-1 active:scale-98 active:shadow-md active:shadow-emerald-600/10 duration-300 cursor-pointer">
                <div className="p-3 bg-emerald-600 dark:bg-emerald-700 rounded-xl text-white shadow-sm flex items-center justify-center shrink-0">
                  <ShieldCheck size={24} />
                </div>
                <div className="flex flex-col min-w-0">
                  <p className="text-xs font-bold text-emerald-700/80 dark:text-emerald-400/80 uppercase tracking-wider mb-0.5">
                    Transparansi Dana
                  </p>
                  <h3 className="text-xl md:text-2xl font-bold tracking-tight text-emerald-950 dark:text-emerald-100 whitespace-nowrap">
                    <CounterUp target={liveStats.transparency_percentage.toString()} isDecimal={true} suffix="%" duration={3500} />
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CARA KERJA ================= */}
      <section
        id="cara-kerja"
        className="py-15 dark:bg-slate-950 transition-colors duration-300"
      >
        <div className="pt-16 border-t border-slate-200 dark:border-slate-800 mt-1 mb-1"></div>
        <div className="max-w-[1440px] px-4 sm:px-6 lg:px-8 mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight uppercase">
              ALUR DISTRIBUSI{" "}
              <span className="text-emerald-600 dark:text-emerald-400">
                AMAN & TRANSPARAN
              </span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-base font-medium">
              Sistem end-to-end pendistribusian dana amanah masyarakat melalui 5 langkah blockchain terenkripsi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 w-full mx-auto relative z-10">
            {/* Step 1 - Very Light */}
            <div className="relative group bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:border-emerald-300 dark:hover:border-emerald-700 transition-all duration-300 flex flex-col">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-100/50 dark:from-emerald-900/20 rounded-bl-[100px] rounded-tr-3xl z-0 group-hover:from-emerald-200/50 dark:group-hover:from-emerald-800/30 transition-colors"></div>
              
              <div className="flex items-center space-x-3 mb-5 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-all">
                  <Compass size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <div className="text-[10px] font-black text-emerald-600/70 dark:text-emerald-500/70 uppercase tracking-widest">Langkah 01</div>
                  <h3 className="font-bold text-emerald-900 dark:text-emerald-200 text-sm">Program Resmi</h3>
                </div>
              </div>
              
              <p className="text-sm text-emerald-700 dark:text-emerald-400/80 leading-relaxed flex-1 relative z-10">
                Yayasan membuat kampanye galang dana resmi yang transparan di sistem.
              </p>
            </div>

            {/* Step 2 - Light/Medium */}
            <div className="relative group bg-emerald-100 dark:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800/50 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:border-emerald-400 dark:hover:border-emerald-600 transition-all duration-300 flex flex-col">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-200/50 dark:from-emerald-800/20 rounded-bl-[100px] rounded-tr-3xl z-0 group-hover:from-emerald-300/50 dark:group-hover:from-emerald-700/30 transition-colors"></div>
              
              <div className="flex items-center space-x-3 mb-5 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shrink-0 group-hover:scale-110 transition-all">
                  <Lock size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <div className="text-[10px] font-black text-emerald-700/70 dark:text-emerald-400/70 uppercase tracking-widest">Langkah 02</div>
                  <h3 className="font-bold text-emerald-950 dark:text-emerald-100 text-sm">Donasi Aman</h3>
                </div>
              </div>
              
              <p className="text-sm text-emerald-800 dark:text-emerald-300 leading-relaxed flex-1 relative z-10">
                Dana donatur terkunci di Smart Contract tanpa perantara rekening orang lain.
              </p>
            </div>

            {/* Step 3 - Medium */}
            <div className="relative group bg-emerald-500 dark:bg-emerald-800 border border-emerald-600 dark:border-emerald-700 rounded-3xl p-6 shadow-md hover:shadow-xl hover:bg-emerald-400 dark:hover:bg-emerald-700 transition-all duration-300 flex flex-col text-white">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-white/10 rounded-bl-[100px] rounded-tr-3xl z-0 group-hover:from-white/20 transition-colors"></div>
              
              <div className="flex items-center space-x-3 mb-5 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 dark:bg-emerald-700 text-white flex items-center justify-center shrink-0 group-hover:scale-110 transition-all">
                  <FileCheck size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <div className="text-[10px] font-black text-emerald-100/70 dark:text-emerald-300/70 uppercase tracking-widest">Langkah 03</div>
                  <h3 className="font-bold text-white text-sm">Verifikasi Ketat</h3>
                </div>
              </div>
              
              <p className="text-sm text-emerald-50 dark:text-emerald-100 leading-relaxed flex-1 relative z-10">
                Berkas penerima divalidasi langsung oleh pihak berwenang terkait secara terpusat.
              </p>
            </div>

            {/* Step 4 - Dark */}
            <div className="relative group bg-emerald-700 dark:bg-emerald-700 border border-emerald-800 dark:border-emerald-600 rounded-3xl p-6 shadow-md hover:shadow-xl hover:bg-emerald-600 dark:hover:bg-emerald-600 transition-all duration-300 flex flex-col text-white">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-white/10 rounded-bl-[100px] rounded-tr-3xl z-0 group-hover:from-white/20 transition-colors"></div>
              
              <div className="flex items-center space-x-3 mb-5 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-emerald-800 dark:bg-emerald-600 text-white flex items-center justify-center shrink-0 group-hover:scale-110 transition-all">
                  <ShieldCheck size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <div className="text-[10px] font-black text-emerald-200/70 dark:text-emerald-200/70 uppercase tracking-widest">Langkah 04</div>
                  <h3 className="font-bold text-white text-sm">Menjaga Privasi</h3>
                </div>
              </div>
              
              <p className="text-sm text-emerald-100 dark:text-emerald-50 leading-relaxed flex-1 relative z-10">
                Verifikasi digital menjaga privasi identitas nama asli penerima agar tetap rahasia.
              </p>
            </div>

            {/* Step 5 - Darkest */}
            <div className="relative group bg-slate-900 dark:bg-slate-900 border border-slate-800 dark:border-emerald-900 rounded-3xl p-6 shadow-md hover:shadow-xl hover:bg-slate-800 dark:hover:bg-slate-800 transition-all duration-300 flex flex-col text-white">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-500/10 rounded-bl-[100px] rounded-tr-3xl z-0 group-hover:from-emerald-500/20 transition-colors"></div>
              
              <div className="flex items-center space-x-3 mb-5 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-emerald-900 dark:bg-emerald-800 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-all">
                  <Coins size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <div className="text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest">Langkah 05</div>
                  <h3 className="font-bold text-white text-sm">Transparan</h3>
                </div>
              </div>
              
              <p className="text-sm text-slate-300 dark:text-emerald-100/70 leading-relaxed flex-1 relative z-10">
                Dana disalurkan langsung ke penerima dengan potongan biaya jaringan yang terbuka.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FITUR UNGGULAN ================= */}
      <section id="keunggulan" className="py-10 bg-slate-50 dark:bg-slate-950">
        <div className="my-8 border-t border-slate-200 dark:border-slate-800"></div>
        <div className="max-w-[1440px] px-4 sm:px-6 lg:px-8 mx-auto">
          <div className="text-center max-w-5xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl sm:text-4xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight uppercase whitespace-nowrap">
              MENGAPA MEMILIH{" "}
              <span className="text-emerald-600 dark:text-emerald-400">
                Philanthropy Chain?
              </span>
            </h2>
            <p className="text-slate-500 text-base">
              Keunggulan teknologi terdepan untuk menghadirkan ekosistem donasi ekonomi paling kredibel.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {/* Card Fitur 1 - Transparansi */}
            <div className="bg-white dark:bg-slate-900 border border-emerald-100 dark:border-slate-800 rounded-2xl p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-700 text-white flex items-center justify-center mb-5 shadow-lg shadow-emerald-600/20 group-hover:scale-110 transition-transform">
                  <Search size={22} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Transparan</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 dark:text-slate-400 leading-relaxed">
                  Setiap transaksi donasi tercatat secara digital dan dapat dipantau secara terbuka untuk memastikan dana tersalurkan dengan jelas.
                </p>
              </div>
            </div>

            {/* Card Fitur 2 - Keamanan Data */}
            <div className="bg-white dark:bg-slate-900 border border-emerald-100 dark:border-slate-800 rounded-2xl p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-700 text-white flex items-center justify-center mb-5 shadow-lg shadow-emerald-600/20 group-hover:scale-110 transition-transform">
                  <Lock size={22} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Aman</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 dark:text-slate-400 leading-relaxed">
                  Teknologi blockchain membantu menjaga keamanan data dan transaksi dari manipulasi maupun akses yang tidak sah.
                </p>
              </div>
            </div>

            {/* Card Fitur 3 - Dilacak */}
            <div className="bg-white dark:bg-slate-900 border border-emerald-100 dark:border-slate-800 rounded-2xl p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-700 text-white flex items-center justify-center mb-5 shadow-lg shadow-emerald-600/20 group-hover:scale-110 transition-transform">
                  <Eye size={22} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Dapat Dilacak</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 dark:text-slate-400 leading-relaxed">
                  Donatur dapat memantau perjalanan dana mulai dari donasi hingga proses penyaluran.
                </p>
              </div>
            </div>

            {/* Card Fitur 4 - Riwayat Tidak Bisa Diubah */}
            <div className="bg-white dark:bg-slate-900 border border-emerald-100 dark:border-slate-800 rounded-2xl p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-700 text-white flex items-center justify-center mb-5 shadow-lg shadow-emerald-600/20 group-hover:scale-110 transition-transform">
                  <FileText size={22} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Riwayat Tidak Bisa Diubah</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 dark:text-slate-400 leading-relaxed">
                  Setiap transaksi tersimpan secara permanen sehingga tidak dapat dimanipulasi atau dihapus oleh pihak mana pun.
                </p>
              </div>
            </div>

            {/* Card Fitur 5 - Penyaluran Cepat */}
            <div className="bg-white dark:bg-slate-900 border border-emerald-100 dark:border-slate-800 rounded-2xl p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-700 text-white flex items-center justify-center mb-5 shadow-lg shadow-emerald-600/20 group-hover:scale-110 transition-transform">
                  <Zap size={22} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Penyaluran Cepat</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 dark:text-slate-400 leading-relaxed">
                  Dana disalurkan secara efisien setelah proses verifikasi selesai tanpa prosedur yang berbelit.
                </p>
              </div>
            </div>

            {/* Card Fitur 6 - Tepat Sasaran */}
            <div className="bg-white dark:bg-slate-900 border border-emerald-100 dark:border-slate-800 rounded-2xl p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-700 text-white flex items-center justify-center mb-5 shadow-lg shadow-emerald-600/20 group-hover:scale-110 transition-transform">
                  <CheckCircle2 size={22} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Tepat Sasaran</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 dark:text-slate-400 leading-relaxed">
                  Bantuan diberikan kepada penerima manfaat yang telah diverifikasi sesuai kebutuhan program.
                </p>
              </div>
            </div>

            {/* Card Fitur 7 - Terpercaya */}
            <div className="bg-white dark:bg-slate-900 border border-emerald-100 dark:border-slate-800 rounded-2xl p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-700 text-white flex items-center justify-center mb-5 shadow-lg shadow-emerald-600/20 group-hover:scale-110 transition-transform">
                  <Handshake size={22} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Terpercaya</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 dark:text-slate-400 leading-relaxed">
                  Proses yang transparan dan terverifikasi membantu meningkatkan kepercayaan seluruh pihak yang terlibat.
                </p>
              </div>
            </div>

            {/* Card Fitur 8 - Privasi Terlindungi */}
            <div className="bg-white dark:bg-slate-900 border border-emerald-100 dark:border-slate-800 rounded-2xl p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-700 text-white flex items-center justify-center mb-5 shadow-lg shadow-emerald-600/20 group-hover:scale-110 transition-transform">
                  <ShieldCheck size={22} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Privasi Terlindungi</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 dark:text-slate-400 leading-relaxed">
                  Informasi pribadi penerima manfaat tetap aman dan hanya dapat diakses oleh pihak yang berwenang.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CAMPAIGN AKTIF ================= */}
      <section id="campaign" className="py-10 dark:bg-slate-950 transition-colors duration-300">
        <div className="my-8 border-t border-slate-200 dark:border-slate-800"></div>
        <div className="max-w-[1440px] px-4 sm:px-6 lg:px-8 mx-auto">
          <div className="text-center max-w-5xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight uppercase">
              PROGRAM DONASI <span className="text-emerald-600 dark:text-emerald-400">PILIHAN</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-base font-medium max-w-3xl mx-auto">
              Salurkan bantuan Anda secara langsung dan transparan melalui smart contract yang terverifikasi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
            {campaignsList.map((camp) => {
              const percent = Math.min(((camp.terkumpul || 0) / (camp.targetDonasi || 1)) * 100, 100);
              return (
                <div key={camp.id} className="bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
                  <div className="relative h-52 bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0">
                    <img
                      src={camp.gambar}
                      alt={camp.judul}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                    <div className="absolute top-4 right-4 bg-emerald-600/95 backdrop-blur-xs text-white text-[11px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-md tracking-wide">
                      <ShieldCheck size={14} strokeWidth={2.5} />
                      Blockchain Verified
                    </div>
                  </div>

                  <div className="p-6 flex flex-col justify-between flex-1">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 line-clamp-2 leading-snug">
                        {camp.judul}
                      </h3>

                      <div className="flex justify-between items-end text-xs font-semibold mb-2">
                        <div className="text-slate-500 dark:text-slate-400">
                          Terkumpul:{" "}
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold block text-sm mt-0.5">
                            {camp.terkumpul} ETH
                          </span>
                        </div>
                        <div className="text-right text-slate-500 dark:text-slate-400">
                          Target:{" "}
                          <span className="text-slate-900 dark:text-white font-bold block text-sm mt-0.5">
                            {camp.targetDonasi} ETH
                          </span>
                        </div>
                      </div>

                      <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mb-6">
                        <div
                          className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>

                    <button onClick={triggerWalletBlink} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-[0.98] transition-all">
                      DONASI <Coins size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 1. LIGHTBOX */}
      {isZoomed && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 cursor-zoom-out animate-in fade-in duration-300"
          onClick={() => setIsZoomed(false)}
        >
          <img 
            src={logo} 
            alt="Zoomed Logo" 
            className="max-w-[90vw] max-h-[90vh] object-contain shadow-2xl animate-in zoom-in-50 duration-300"
          />
        </div>
      )}

      {/* 2. SECTION UTAMA */}
      <section id="tentang-kami" className="py-10 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <div className="pt-16 border-t border-slate-200 dark:border-slate-800 mt-1 mb-4"></div>
        <div className="max-w-[1440px] px-4 sm:px-6 lg:px-8 mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* SISI KIRI: LOGO (Pure Foto) */}
            <div className="lg:col-span-4 flex flex-col items-center">
              <img 
                src={logo} 
                alt="PhilanthropyChain Logo" 
                className="w-full max-w-[300px] h-auto cursor-zoom-in rounded-4xl transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl active:scale-95 active:shadow-inner"
                onClick={() => setIsZoomed(true)}
              />
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300 dark:text-slate-400 mt-6 text-center max-w-xs">
                Membangun Masa Depan Donasi yang Transparan, Aman, dan Berkelanjutan
              </p>
            </div>

            {/* SISI KANAN: KONTEN */}
            <div className="lg:col-span-8 space-y-8">
              <div className="space-y-2">
                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white uppercase tracking-tight">
                  TENTANG <span className="text-emerald-600">PHILANTHROPYCHAIN</span>
                </h2>
                <h3 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white dark:text-slate-100 tracking-tight">
                  Membangun Kepercayaan dalam Donasi Digital
                </h3>
              </div>

              <div className="space-y-4 text-slate-600 dark:text-slate-300 dark:text-slate-300 text-base leading-relaxed">
                <p>
                  <span className="font-semibold text-slate-900 dark:text-white">PhilanthropyChain</span> adalah platform donasi transparan berbasis blockchain yang dirancang untuk menghubungkan donatur, lembaga ekonomi, dan penerima manfaat dalam satu ekosistem yang aman, terpercaya, dan akuntabel.
                </p>
                <p>
                  Dengan memanfaatkan teknologi blockchain, setiap proses donasi dapat dicatat secara transparan dan dapat ditelusuri, sehingga meningkatkan kepercayaan masyarakat terhadap penyaluran dana ekonomi.
                </p>
              </div>

              {/* Bagian Visi & Misi */}
              <div className="space-y-4 pt-4">
                <h4 className="text-sm font-bold text-emerald-600 flex items-center gap-2 uppercase tracking-widest">
                  <ShieldCheck size={18} /> Visi & Misi
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Visi Card */}
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm h-full flex flex-col">
                    <h4 className="text-sm font-bold text-emerald-700 mb-3 uppercase tracking-widest">Visi</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300 dark:text-slate-300 leading-relaxed flex-grow">
                      Menjadi platform donasi digital terpercaya yang menghadirkan transparansi, keamanan, dan akuntabilitas dalam setiap proses penyaluran bantuan ekonomi.
                    </p>
                  </div>

                  {/* Misi Card */}
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm h-full flex flex-col">
                    <h4 className="text-sm font-bold text-emerald-700 mb-3 uppercase tracking-widest">Misi</h4>
                    <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300 dark:text-slate-300 flex-grow">
                      {[
                        "Meningkatkan transparansi pengelolaan dana donasi",
                        "Memastikan bantuan tersalurkan tepat sasaran",
                        "Meningkatkan kepercayaan antara donatur dan lembaga",
                        "Memanfaatkan blockchain untuk ekosistem yang aman dan akuntabel"
                      ].map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────── BLOK 2: TIM PENGEMBANG ──────────────── */}
      <div className="pt-16 border-t border-slate-200 dark:border-slate-800 mt-8 mb-4">
        {/* Header Section Tim Pengembang */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tracking-widest uppercase block">
            KOLABORASI & INOVASI
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight uppercase">
            TIM{" "}
            <span className="text-emerald-600 dark:text-emerald-400">
              PENGEMBANG
            </span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base font-medium">
            Talenta muda yang berdedikasi menciptakan transparansi dan
            akuntabilitas dalam ekosistem donasi digital.
          </p>
        </div>

        {/* Grid 3 Kolom Sejajar Anggota Tim */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10 max-w-5xl mx-auto">
          
          {/* ANGGOTA 1: Ryan Rahmabakti */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-3xl p-6 text-center shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group">
            <div className="relative w-40 h-40 mx-auto mb-5 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-emerald-500/20 group-hover:border-emerald-500 transition-colors duration-300">
              <img
                src={ryan}
                alt="Ryan Rahmabakti"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                Ryan Rahmabakti
              </h3>
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Backend Engineer
              </p>
            </div>
          </div>

          {/* ANGGOTA 2: Dita Ramadhanti */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-3xl p-6 text-center shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group">
            <div className="relative w-40 h-40 mx-auto mb-5 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-emerald-500/20 group-hover:border-emerald-500 transition-colors duration-300">
              <img
                src={dita}
                alt="Dita Ramadhanti"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                Dita Ramadhanti
              </h3>
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Frontend Developer
              </p>
            </div>
          </div>

          {/* ANGGOTA 3: Muhamad Arham Juanriana */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-3xl p-6 text-center shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group">
            <div className="relative w-40 h-40 mx-auto mb-5 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-emerald-500/20 group-hover:border-emerald-500 transition-colors duration-300">
              <img
                src={arham}
                alt="Muhamad Arham Juanriana"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                Muhamad Arham Juanriana
              </h3>
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Smart Contract Developer
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ================= CALL TO ACTION ================= */}
      <section className="max-w-[1440px] px-4 sm:px-6 lg:px-8 mx-auto pb-20">
        <div className="bg-gradient-to-r from-emerald-700 to-emerald-900 rounded-3xl p-8 md:p-14 text-center text-white relative overflow-hidden shadow-2xl shadow-emerald-800/20">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl -ml-20 -mb-20"></div>

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Siap Menjadi Bagian dari Perubahan?
            </h2>
            <p className="text-emerald-100">
              Bergabunglah bersama kami untuk menciptakan ekosistem ekonomi yang jujur, terbuka, dan berdampak nyata bagi mereka yang membutuhkan.
            </p>
            <button
              onClick={triggerWalletBlink}
              className="bg-white text-emerald-700 px-8 py-4 rounded-xl font-bold shadow-xl hover:bg-slate-100 transition-all active:scale-95"
            >
              MULAI SEKARANG
            </button>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-slate-900 text-slate-400 py-8 border-t border-slate-800">
        <div className="max-w-[1440px] px-4 sm:px-6 lg:px-8 mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center space-x-2">
            <ShieldCheck size={16} className="text-emerald-500" />
            <span className="font-bold text-white">PhilanthropyChain</span>
          </div>
          <p>
            © 2026 PhilanthropyChain. All rights reserved. Built with
            Hyperledger Besu & Privacy Preserving ZK-SNARKs.
          </p>
        </div>
      </footer>

      {/* ================= MODAL AUTH ================= */}
      {authMode && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 md:p-10 max-w-md w-full shadow-2xl border border-gray-100 dark:border-slate-800 relative transform transition-all">
            <button onClick={() => { setAuthMode(null); setAuthError(null); }} className="absolute top-6 right-6 text-gray-400 hover:text-emerald-600 bg-gray-100 dark:bg-slate-800 p-2 rounded-full transition-colors">
              <X size={20} />
            </button>
            
            <div className="flex items-center gap-2 mb-8">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl text-emerald-600 dark:text-emerald-400">
                <ShieldCheck size={24} />
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                {authMode === 'login' ? 'Selamat Datang' : 'Buat Akun'}
              </h2>
            </div>
            
            <form onSubmit={handleAuthSubmit} className="space-y-4">

              {/* Error Banner dari API */}
              {authError && (
                <div className="flex items-start gap-3 p-3.5 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-rose-500 shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                  <p className="text-xs font-semibold text-rose-700 dark:text-rose-300 leading-relaxed">{authError}</p>
                </div>
              )}
              
              {authMode === 'register' && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Nama Lengkap</label>
                    <input 
                      type="text" 
                      required
                      value={authForm.name}
                      onChange={(e) => setAuthForm({...authForm, name: e.target.value})}
                      className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all" 
                      placeholder="Masukkan nama lengkap" 
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Pilih Peran (Role)</label>
                    <select
                      value={authForm.role}
                      onChange={(e) => setAuthForm({...authForm, role: e.target.value, instansi_type: ''})}
                      className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    >
                      <option value="donatur">Donatur</option>
                      <option value="yayasan">Yayasan</option>
                      <option value="penerima">Penerima Bantuan</option>
                      <option value="instansi">Instansi Validator</option>
                    </select>
                  </div>

                  {authForm.role === 'instansi' && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Tipe Instansi</label>
                      <select
                        value={authForm.instansi_type}
                        onChange={(e) => setAuthForm({...authForm, instansi_type: e.target.value})}
                        className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                        required
                      >
                        <option value="">-- Pilih Tipe Instansi --</option>
                        <option value="dinsos">Dinas Sosial (Dinsos)</option>
                        <option value="diknas">Dinas Pendidikan (Diknas)</option>
                        <option value="bpbd">BPBD</option>
                        <option value="dinkes">Dinas Kesehatan (Dinkes)</option>
                      </select>
                    </div>
                  )}
                </>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Email</label>
                <input 
                  type="email" 
                  required
                  value={authForm.email}
                  onChange={(e) => setAuthForm({...authForm, email: e.target.value})}
                  className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all" 
                  placeholder="nama@email.com" 
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Password</label>
                <input 
                  type="password" 
                  required
                  value={authForm.password}
                  onChange={(e) => setAuthForm({...authForm, password: e.target.value})}
                  className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all" 
                  placeholder="••••••••" 
                />
              </div>

              {authMode === 'register' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Konfirmasi Password</label>
                  <input 
                    type="password" 
                    required
                    value={authForm.confirmPassword}
                    onChange={(e) => setAuthForm({...authForm, confirmPassword: e.target.value})}
                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all" 
                    placeholder="••••••••" 
                  />
                </div>
              )}

              <button 
                type="submit" 
                disabled={isAuthLoading}
                className="w-full py-3.5 mt-2 rounded-xl font-black text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition-all shadow-lg shadow-emerald-600/30 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-wait disabled:active:scale-100"
              >
                {isAuthLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Memproses...
                  </>
                ) : (
                  <>
                    <ShieldCheck size={16} />
                    {authMode === 'login' ? 'Masuk' : 'Daftar Sekarang'}
                  </>
                )}
              </button>

            </form>
            
            <div className="mt-5 text-center">
              <button 
                onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                className="text-sm font-bold text-slate-500 hover:text-emerald-600 transition-colors"
              >
                {authMode === 'login' ? 'Belum punya akun? Daftar sekarang' : 'Sudah punya akun? Masuk di sini'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL GLOBAL ALERT LANDING PAGE */}
      {alertMsg && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden text-center transform transition-transform duration-300 scale-100">
            <div className="p-6">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                ℹ️
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-2">Informasi</h3>
              <p className="text-gray-500 dark:text-slate-400 text-sm">{alertMsg}</p>
            </div>
            <button onClick={() => setAlertMsg(null)} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold transition">Tutup</button>
          </div>
        </div>
      )}
    </div>
  );
}
