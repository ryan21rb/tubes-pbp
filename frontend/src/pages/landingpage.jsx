import React, { useState, useEffect, useRef } from "react";
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

const CounterUp = ({ target, duration = 3500, prefix = "", suffix = "" }) => {
  const [count, setCount] = useState(0);
  const elementRef = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const end = parseInt(target.replace(/[^0-9]/g, ""), 10);
          let startTime = null;

          const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const progressRatio = Math.min(progress / duration, 1);
            const easeOutQuad = progressRatio * (2 - progressRatio);
            const currentCount = Math.floor(easeOutQuad * end);

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
    if (target.includes("127.5")) {
      const end = 127.5;
      if (num >= end) return "127.5";
      return num.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    }
    return num.toLocaleString("id-ID");
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
  const context = React.useContext(PhilanthropyContext);
  const connectWallet = context?.connectWallet;
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeNav, setActiveNav] = useState("Beranda");
  const [currentImage, setCurrentImage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [authMode, setAuthMode] = useState(null); // null, 'login', 'register'
  const [walletConnected, setWalletConnected] = useState(false);
  const [authForm, setAuthForm] = useState({ name: "", username: "", email: "", password: "", confirmPassword: "" });
  const [isConnecting, setIsConnecting] = useState(false);
  const [isWalletBlinking, setIsWalletBlinking] = useState(false);
  const heroImages = [donasi, arham, dita, ryan, logo];

  const navItems = [
    { name: "Beranda", href: "#beranda" },
    { name: "Cara Kerja", href: "#cara-kerja" },
    { name: "Keunggulan", href: "#keunggulan" },
    { name: "Program", href: "#campaign" },
    { name: "Tentang Kami", href: "#tentang-kami" },
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
        
        // Membuka pop-up Metamask untuk meminta izin koneksi akun
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        // Jika berhasil connect di Metamask, baru modal form muncul
        setIsConnecting(false);
        setAuthMode('login');
        
      } catch (error) {
        // Jika user batal connect di Metamask
        console.error("Koneksi dibatalkan pengguna atau terjadi error:", error);
        setIsConnecting(false);
      }
    } else {
      alert("Metamask belum terinstall! Silakan install ekstensi Metamask terlebih dahulu di browser Anda.");
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

  // Alur 2: Saat form di dalam Modal disubmit, panggil pop-up Metamask untuk persetujuan (Sign)
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    if (!window.ethereum) return alert("MetaMask diperlukan");
    
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const address = accounts[0];
      const message = `Saya menandatangani pesan ini untuk ${authMode === 'login' ? 'masuk' : 'mendaftar'} ke PhilanthropyChain.\n\nAlamat: ${address}\nWaktu: ${new Date().getTime()}`;
      
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, address],
      });
      
      if (signature) {
        const addressLower = address.toLowerCase();
        
        // Mock addresses for routing
        const yayasanAddress = "0xyayasan"; // Ganti dengan address asli yayasan
        const instansiAddresses = ["0xinstansi1", "0xinstansi2", "0xinstansi3", "0xinstansi4"];
        const penerimaAddresses = context?.penerimaAddresses || [];

        if (addressLower === yayasanAddress || addressLower === "0x8212c9a2fdb3e71c") {
           window.location.hash = "#/yayasan";
        } else if (instansiAddresses.includes(addressLower) || addressLower === "0x08212c9a2fdb3e71c") {
           window.location.hash = "#/instansi";
        } else if (penerimaAddresses.includes(addressLower)) {
           window.location.hash = "#/penerima";
        } else {
           window.location.hash = "#/donatur";
        }
      }
    } catch (error) {
      console.error(error);
      alert("Autentikasi MetaMask gagal atau dibatalkan.");
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
          <div className={`hidden md:flex items-center space-x-2 font-medium bg-transparent`}>
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

            {/* TOMBOL HUBUNGKAN WALLET */}
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
        className="pt-24 pb-16 md:pt-28 md:pb-24 w-full px-6 md:px-12"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-7xl mx-auto ">
          
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
            <div className="relative w-full max-w-[400px] aspect-square rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800">
              <img
                src={donasi} 
                alt="Donasi PhilanthropyChain"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-900/20 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* ================= STATISTIK LIVE ================= */}
      <section className="bg-slate-50/50 dark:bg-slate-950 transition-colors duration-300">
        <div className="max-w-8xl px-5 sm:px-8 lg:px-8 mx-auto">
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
                    ETH <CounterUp target="127.5" duration={3500} />
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
                    <CounterUp target="156" duration={3500} /> Orang
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
                    <CounterUp target="42" duration={3500} /> Campaign
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
                    <CounterUp target="98" suffix=".7%" duration={3500} />
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
        <div className="max-w-8xl px-4 sm:px-6 lg:px-8 mx-auto">
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

          <div className="flex flex-col md:flex-row md:flex-wrap lg:flex-nowrap justify-center items-center lg:items-stretch gap-6 lg:gap-3 w-full mx-auto">
            <div className="w-full md:w-[45%] lg:w-55 min-h-62.5 bg-emerald-50/80 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-3xl p-5 shadow-sm flex flex-col justify-between transition-all hover:-translate-y-1 duration-300">
              <div className="flex flex-col h-full justify-between flex-1">
                <div className="flex items-center space-x-2.5 mb-5">
                  <div className="text-emerald-700 dark:text-emerald-400 shrink-0">
                    <Compass size={24} strokeWidth={2.5} />
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 bg-emerald-100/60 dark:bg-emerald-900/40 px-2 py-0.5 rounded-full tracking-wider whitespace-nowrap">
                    01. Program Resmi
                  </span>
                </div>
                <p className="text-sm font-medium text-black dark:text-slate-300 leading-relaxed flex-1">
                  Yayasan membuat kampanye galang dana resmi yang transparan di sistem.
                </p>
              </div>
            </div>

            <div className="hidden lg:flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 self-center">
              <ChevronRight size={20} strokeWidth={3} />
            </div>

            <div className="w-full md:w-[45%] lg:w-55 min-h-62.5 bg-emerald-100/60 dark:bg-emerald-900/30 border border-emerald-200/40 dark:border-emerald-800/30 rounded-3xl p-5 shadow-sm flex flex-col justify-between transition-all hover:-translate-y-1 duration-300">
              <div className="flex flex-col h-full justify-between flex-1">
                <div className="flex items-center space-x-2.5 mb-5">
                  <div className="text-emerald-800 dark:text-emerald-400 shrink-0">
                    <Lock size={24} strokeWidth={2.5} />
                  </div>
                  <span className="text-[10px] font-bold text-emerald-900 dark:text-emerald-400 bg-emerald-200/50 dark:bg-emerald-900/50 px-2 py-0.5 rounded-full tracking-wider whitespace-nowrap">
                    02. Donasi Aman
                  </span>
                </div>
                <p className="text-sm font-medium text-black dark:text-slate-300 leading-relaxed flex-1">
                  Dana dari donatur otomatis terkunci di Smart Contract tanpa perantara rekening orang lain.
                </p>
              </div>
            </div>

            <div className="hidden lg:flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 self-center">
              <ChevronRight size={20} strokeWidth={3} />
            </div>

            <div className="w-full md:w-[45%] lg:w-55 min-h-62.5 bg-emerald-200/60 dark:bg-emerald-800/40 border border-emerald-300/30 dark:border-emerald-700/30 rounded-3xl p-5 shadow-sm flex flex-col justify-between transition-all hover:-translate-y-1 duration-300">
              <div className="flex flex-col h-full justify-between flex-1">
                <div className="flex items-center space-x-2.5 mb-5">
                  <div className="text-emerald-900 dark:text-emerald-400 shrink-0">
                    <FileCheck size={24} strokeWidth={2.5} />
                  </div>
                  <span className="text-[10px] font-bold text-emerald-950 dark:text-emerald-300 bg-emerald-300/40 dark:bg-emerald-800/50 px-2 py-0.5 rounded-full tracking-wider whitespace-nowrap">
                    03. Verifikasi Ketat
                  </span>
                </div>
                <p className="text-sm font-medium text-black dark:text-slate-200 leading-relaxed flex-1">
                  Berkas penerima bantuan divalidasi langsung oleh pihak berwenang seperti Rumah Sakit atau Kelurahan.
                </p>
              </div>
            </div>

            <div className="hidden lg:flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 self-center">
              <ChevronRight size={20} strokeWidth={3} />
            </div>

            <div className="w-full md:w-[45%] lg:w-55 min-h-62.5 bg-emerald-500 dark:bg-emerald-700 border border-emerald-600/20 rounded-3xl p-5 shadow-sm flex flex-col justify-between transition-all hover:-translate-y-1 duration-300 text-white">
              <div className="flex flex-col h-full justify-between flex-1">
                <div className="flex items-center space-x-2.5 mb-5">
                  <div className="text-emerald-200 dark:text-emerald-300 shrink-0">
                    <ShieldCheck size={24} strokeWidth={2.5} />
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-200 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full tracking-wider whitespace-nowrap">
                    04. Menjaga Privasi
                  </span>
                </div>
                <p className="text-sm font-medium text-white dark:text-emerald-100 leading-relaxed flex-1">
                  Verifikasi dilakukan secara digital sehingga privasi identitas nama asli penerima tetap aman dan terjaga.
                </p>
              </div>
            </div>

            <div className="hidden lg:flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 self-center">
              <ChevronRight size={20} strokeWidth={3} />
            </div>

            <div className="w-full md:w-[45%] lg:w-55 min-h-62.5 bg-emerald-600 dark:bg-emerald-600 border border-emerald-700/20 rounded-3xl p-5 shadow-md flex flex-col justify-between transition-all hover:-translate-y-1 duration-300 text-white">
              <div className="flex flex-col h-full justify-between flex-1">
                <div className="flex items-center space-x-2.5 mb-5">
                  <div className="text-emerald-200 dark:text-emerald-300 shrink-0">
                    <Coins size={24} strokeWidth={2.5} />
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-200 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full tracking-wider whitespace-nowrap">
                    05. Pencairan Transparan
                  </span>
                </div>
                <p className="text-sm font-medium text-white leading-relaxed flex-1">
                  Dana disalurkan langsung ke penerima dengan potongan biaya operasional jaringan yang terbuka.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FITUR UNGGULAN ================= */}
      <section id="keunggulan" className="py-10 bg-slate-50 dark:bg-slate-950">
        <div className="my-8 border-t border-slate-200 dark:border-slate-800"></div>
        <div className="max-w-7xl px-4 sm:px-6 lg:px-8 mx-auto">
          <div className="text-center max-w-5xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl sm:text-4xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight uppercase whitespace-nowrap">
              MENGAPA MEMILIH{" "}
              <span className="text-emerald-600 dark:text-emerald-400">
                Philanthropy Chain?
              </span>
            </h2>
            <p className="text-slate-500 text-base">
              Keunggulan teknologi terdepan untuk menghadirkan ekosistem donasi sosial paling kredibel.
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
        <div className="max-w-7xl px-4 sm:px-6 lg:px-8 mx-auto">
          <div className="text-center max-w-5xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight uppercase">
              PROGRAM DONASI <span className="text-emerald-600 dark:text-emerald-400">PILIHAN</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-base font-medium max-w-3xl mx-auto">
              Salurkan bantuan Anda secara langsung dan transparan melalui smart contract yang terverifikasi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
            {/* CAMPAIGN 1 - Panti Asuhan */}
            <div className="bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
              <div className="relative h-52 bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0">
                <img
                  src={imgSocial}
                  alt="Dukungan Panti Asuhan"
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
                    🏠 Dukungan Panti Asuhan Harapan Bangsa
                  </h3>

                  <div className="flex justify-between items-end text-xs font-semibold mb-2">
                    <div className="text-slate-500 dark:text-slate-400">
                      Terkumpul:{" "}
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold block text-sm mt-0.5">
                        0.1 ETH
                      </span>
                    </div>
                    <div className="text-right text-slate-500 dark:text-slate-400">
                      Target:{" "}
                      <span className="text-slate-900 dark:text-white font-bold block text-sm mt-0.5">
                        0.5 ETH
                      </span>
                    </div>
                  </div>

                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mb-6">
                    <div
                      className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: "40%" }}
                    ></div>
                  </div>
                </div>

                <button onClick={triggerWalletBlink} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-[0.98] transition-all">
                  DONASI <Coins size={16} />
                </button>
              </div>
            </div>

            {/* CAMPAIGN 2 - Peralatan Medis */}
            <div className="bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
              <div className="relative h-52 bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0">
                <img
                  src={imgHealth}
                  alt="Bantuan Peralatan Medis"
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
                    🏥 Bantuan Peralatan Medis untuk Klinik Sosial
                  </h3>

                  <div className="flex justify-between items-end text-xs font-semibold mb-2">
                    <div className="text-slate-500 dark:text-slate-400">
                      Terkumpul:{" "}
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold block text-sm mt-0.5">
                        2.4 ETH
                      </span>
                    </div>
                    <div className="text-right text-slate-500 dark:text-slate-400">
                      Target:{" "}
                      <span className="text-slate-900 dark:text-white font-bold block text-sm mt-0.5">
                        4.0 ETH
                      </span>
                    </div>
                  </div>

                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mb-6">
                    <div
                      className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: "60%" }}
                    ></div>
                  </div>
                </div>

                <button onClick={triggerWalletBlink} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-[0.98] transition-all">
                  DONASI <Coins size={16} />
                </button>
              </div>
            </div>

            {/* CAMPAIGN 3 - Beasiswa Pendidikan */}
            <div className="bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
              <div className="relative h-52 bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0">
                <img
                  src={imgEducation}
                  alt="Program Beasiswa Pendidikan"
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
                    📚 Program Beasiswa Pendidikan Generasi Cerdas
                  </h3>

                  <div className="flex justify-between items-end text-xs font-semibold mb-2">
                    <div className="text-slate-500 dark:text-slate-400">
                      Terkumpul:{" "}
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold block text-sm mt-0.5">
                        1.5 ETH
                      </span>
                    </div>
                    <div className="text-right text-slate-500 dark:text-slate-400">
                      Target:{" "}
                      <span className="text-slate-900 dark:text-white font-bold block text-sm mt-0.5">
                        3.5 ETH
                      </span>
                    </div>
                  </div>

                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mb-6">
                    <div
                      className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: "50%" }}
                    ></div>
                  </div>
                </div>

                <button onClick={triggerWalletBlink} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-[0.98] transition-all">
                  DONASI <Coins size={16} />
                </button>
              </div>
            </div>
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
        <div className="max-w-7xl px-4 sm:px-6 lg:px-8 mx-auto">
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
                  <span className="font-semibold text-slate-900 dark:text-white">PhilanthropyChain</span> adalah platform donasi transparan berbasis blockchain yang dirancang untuk menghubungkan donatur, lembaga sosial, dan penerima manfaat dalam satu ekosistem yang aman, terpercaya, dan akuntabel.
                </p>
                <p>
                  Dengan memanfaatkan teknologi blockchain, setiap proses donasi dapat dicatat secara transparan dan dapat ditelusuri, sehingga meningkatkan kepercayaan masyarakat terhadap penyaluran dana sosial.
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
                      Menjadi platform donasi digital terpercaya yang menghadirkan transparansi, keamanan, dan akuntabilitas dalam setiap proses penyaluran bantuan sosial.
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
      <section className="max-w-7xl px-4 sm:px-6 lg:px-8 mx-auto pb-20">
        <div className="bg-gradient-to-r from-emerald-700 to-emerald-900 rounded-3xl p-8 md:p-14 text-center text-white relative overflow-hidden shadow-2xl shadow-emerald-800/20">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl -ml-20 -mb-20"></div>

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Siap Menjadi Bagian dari Perubahan?
            </h2>
            <p className="text-emerald-100">
              Bergabunglah bersama kami untuk menciptakan ekosistem sosial yang jujur, terbuka, dan berdampak nyata bagi mereka yang membutuhkan.
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
        <div className="max-w-7xl px-4 sm:px-6 lg:px-8 mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
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
            <button onClick={() => setAuthMode(null)} className="absolute top-6 right-6 text-gray-400 hover:text-emerald-600 bg-gray-100 dark:bg-slate-800 p-2 rounded-full transition-colors">
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
              
              {authMode === 'register' && (
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
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Username</label>
                <input 
                  type="text" 
                  required
                  value={authForm.username}
                  onChange={(e) => setAuthForm({...authForm, username: e.target.value})}
                  className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all" 
                  placeholder="Masukkan username" 
                />
              </div>

              {authMode === 'register' && (
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
              )}

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
                className="w-full py-3.5 mt-2 rounded-xl font-black text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition-all shadow-lg shadow-emerald-600/30 flex justify-center items-center gap-2"
              >
                {authMode === 'login' ? 'Masuk' : 'Daftar Sekarang'}
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
    </div>
  );
}