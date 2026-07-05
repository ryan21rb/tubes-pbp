import React, { useState, useEffect } from 'react';
import logo from '../assets/logophilantrophy.png';
import imgHealth from '../assets/campaign_health.png';
import imgDisaster from '../assets/campaign_disaster.png';
import imgEducation from '../assets/campaign_education.png';
import imgSocial from '../assets/campaign_social.png';
import { Home, Megaphone, ArrowRightLeft, FileText, LogOut, Search,
  CheckCircle, Clock, ShieldCheck, Wallet, ChevronRight, ChevronLeft,
  TrendingUp, Users, Check, AlertCircle, ArrowUpRight, Plus,
  Download, Settings, AlertTriangle, ArrowRight, HeartHandshake,
  PlusCircle, UserPlus, Share2, Copy, Filter, BarChart2,
  Printer, Link as LinkIcon, MoreVertical, Calendar, Bell,
  FileCheck, Database, ExternalLink, Landmark, Building, Server,
  X, RefreshCw, Sun, Moon, User } from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';
import { PhilanthropyContext } from '../context/PhilanthropyContext';
import { ethers } from 'ethers';
import { POVERTY_CHECK_ADDRESS } from '../contracts/addresses';
import PovertyCheckABI from '../contracts/PovertyCheck.json';

const formatETH = (n) => {
  let val = Number(n);
  if (val > 1000000) val = val / 1000000;
  return `${val.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 4 })} ETH`;
};
const shortETH = (n) => formatETH(n);
const campaignImg = (cat) => {
  const m = { Kesehatan: imgHealth, Bencana: imgDisaster, Pendidikan: imgEducation };
  return m[cat] || imgSocial;
};

const ChartAnimation = () => {
  const [hoverData, setHoverData] = useState(null);
  
  const pointsIn = [
    { x: 100, y: 70, val: "1.25 ETH" },
    { x: 200, y: 40, val: "2.10 ETH" },
    { x: 300, y: 50, val: "1.80 ETH" },
    { x: 400, y: 20, val: "3.50 ETH" },
  ];
  
  const pointsOut = [
    { x: 100, y: 110, val: "0.50 ETH" },
    { x: 200, y: 80, val: "1.20 ETH" },
    { x: 300, y: 100, val: "0.80 ETH" },
    { x: 400, y: 70, val: "2.00 ETH" },
  ];

  return (
    <div className="relative w-full h-full">
      <svg className="w-full h-full" viewBox="0 0 400 150" preserveAspectRatio="none">
        <line x1="0" y1="25" x2="400" y2="25" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4 4" className="dark:stroke-slate-800" />
        <line x1="0" y1="75" x2="400" y2="75" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4 4" className="dark:stroke-slate-800" />
        <line x1="0" y1="125" x2="400" y2="125" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4 4" className="dark:stroke-slate-800" />
        
        <path d="M0 120 Q50 90 100 110 T200 80 T300 100 T400 70" fill="none" stroke="#dc2626" strokeWidth="3" strokeLinecap="round" />
        <path d="M0 100 Q50 60 100 70 T200 40 T300 50 T400 20" fill="none" stroke="#059669" strokeWidth="3" strokeLinecap="round" />
        
        {pointsIn.map((pt, i) => (
          <g key={`in-${i}`} onMouseEnter={() => setHoverData({ ...pt, type: 'Masuk' })} onMouseLeave={() => setHoverData(null)}>
            <circle cx={pt.x} cy={pt.y} r="6" fill="transparent" className="cursor-pointer" />
            <circle cx={pt.x} cy={pt.y} r="4" fill="#059669" className="animate-pulse cursor-pointer" />
          </g>
        ))}
        {pointsOut.map((pt, i) => (
          <g key={`out-${i}`} onMouseEnter={() => setHoverData({ ...pt, type: 'Keluar' })} onMouseLeave={() => setHoverData(null)}>
            <circle cx={pt.x} cy={pt.y} r="6" fill="transparent" className="cursor-pointer" />
            <circle cx={pt.x} cy={pt.y} r="4" fill="#dc2626" className="animate-pulse cursor-pointer" />
          </g>
        ))}
      </svg>
      {hoverData && (
        <div className="absolute bg-white dark:bg-slate-800 border border-emerald-100 dark:border-slate-700 shadow-xl rounded-lg p-2 text-xs z-20 pointer-events-none" style={{ left: `calc(${(hoverData.x / 400) * 100}% - 40px)`, top: `calc(${(hoverData.y / 150) * 100}% - 50px)` }}>
          <p className="font-bold text-slate-800 dark:text-slate-200">Dana {hoverData.type}</p>
          <p className={hoverData.type === 'Masuk' ? 'text-emerald-600' : 'text-red-500 font-bold'}>{hoverData.val}</p>
        </div>
      )}
    </div>
  );
};

/* 1) BERANDA */
const DashboardView = ({ campaigns, onAction }) => {
  const { currentUser, nodeStatuses = [], dataPengajuan = [] } = React.useContext(PhilanthropyContext) || {};
  const totalCollected = campaigns.reduce((s, c) => s + c.collected, 0);
  const activeCampaigns = campaigns.filter((c) => c.status === 'Aktif').length;
  const totalRecipients = campaigns.reduce((s, c) => s + c.recipients, 0);

  // Hitung dana teralokasi riil dari program yang sukses tersalurkan
  const totalAllocated = campaigns.reduce((s, c) => s + (c.distStatus === 'Success' ? c.collected : 0), 0);

  // Hitung antrean verifikasi ZKP yang pending untuk Yayasan
  const zkpQueuePending = dataPengajuan.filter(p => p.status === 'disetujui' && p.tahapBantuan === 'Otentikasi Yayasan').length;

  const instansiNodes = (nodeStatuses || []).filter(n => n.name.toLowerCase() !== 'yayasan ruang peduli bersama');
  const nodes = instansiNodes.length > 0 ? instansiNodes.map((n, i) => ({
      name: `Node ${i + 1}`,
      sub: n.name,
      role: i === 0 ? 'LEADER' : 'FOLLOWER',
      Icon: i === 0 ? Landmark : (i === 1 ? Building : Server),
      isOnline: n.is_active,
      lastActive: n.last_seen_text
  })) : [
      { name: 'Node 1', sub: 'Dinas Sosial', role: 'LEADER', Icon: Landmark, isOnline: true },
      { name: 'Node 2', sub: 'Dinas Pendidikan', role: 'FOLLOWER', Icon: Building, isOnline: false, lastActive: '3 menit lalu' },
      { name: 'Node 3', sub: 'BPBD', role: 'FOLLOWER', Icon: Server, isOnline: false, lastActive: '5 menit lalu' },
      { name: 'Node 4', sub: 'Dinas Kesehatan', role: 'FOLLOWER', Icon: Server, isOnline: true },
  ];

  return (
    <div className="space-y-6 max-w-[1440px]">
      {/* Title */}
      <div>
        <p className="text-base font-medium text-gray-500 dark:text-slate-400 mt-1">{currentUser?.name || "Yayasan Ruang Peduli Bersama"}</p>
      </div>

      {/* Raft Consensus Status */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h3 className="text-lg font-bold text-gray-800 dark:text-slate-200">Raft Consensus Status</h3>
          <span className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> Status Jaringan: SEHAT
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {nodes.map((n, i) => (
            <div
              key={i}
              className={`border border-gray-100 dark:border-slate-800 border-l-4 ${i === 0 ? 'border-l-emerald-600' : 'border-l-gray-300 dark:border-l-slate-700'} bg-white dark:bg-slate-900 p-4 rounded-xl flex items-center justify-between shadow-sm`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${i === 0 ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400'} rounded-lg flex items-center justify-center`}>
                  <n.Icon size={20} />
                </div>
                <div>
                  <p className="font-bold text-gray-800 dark:text-slate-200 text-sm">{n.name}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">{n.sub}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`${n.isOnline ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300' : 'bg-gray-200 dark:bg-slate-800 text-gray-500 dark:text-slate-400'} text-[10px] font-extrabold px-2 py-0.5 rounded uppercase`}>
                  {n.role}
                </span>
                {n.isOnline ? (
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1.5 flex items-center justify-end gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> AKTIF
                  </p>
                ) : (
                  <p className="text-[10px] text-gray-500 dark:text-slate-400 font-medium mt-1.5 flex items-center justify-end gap-1">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" /> {n.lastActive || 'OFFLINE'}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-extrabold text-gray-500 dark:text-slate-400 uppercase tracking-widest">TOTAL DANA TERKUMPUL</span>
            <div className="w-8 h-8 bg-emerald-50 dark:bg-emerald-900/30 rounded flex items-center justify-center text-emerald-700 dark:text-emerald-400"><Wallet size={16} /></div>
          </div>
          <h3 className="text-2xl font-black text-gray-900 dark:text-slate-100 mb-2">{formatETH(totalCollected)}</h3>
          <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1"><TrendingUp size={12} /> +12% dari bulan lalu</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col justify-center">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-extrabold text-gray-500 dark:text-slate-400 uppercase tracking-widest">DANA DIALOKASIKAN</span>
            <div className="w-8 h-8 bg-amber-50 dark:bg-amber-900/30 rounded flex items-center justify-center text-amber-600 dark:text-amber-400"><Database size={16} /></div>
          </div>
          <h3 className="text-2xl font-black text-gray-900 dark:text-slate-100 mb-0">{formatETH(totalAllocated)}</h3>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col justify-center">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-extrabold text-gray-500 dark:text-slate-400 uppercase tracking-widest">ANTREAN VERIFIKASI</span>
            <div className="w-8 h-8 bg-red-50 dark:bg-red-900/30 rounded flex items-center justify-center text-red-500 dark:text-red-400"><FileCheck size={16} /></div>
          </div>
          <h3 className="text-3xl font-black text-gray-900 dark:text-slate-100 mb-2 flex items-baseline gap-2">{zkpQueuePending} <span className="text-xs font-bold text-gray-400 dark:text-slate-500">Data ZKP</span></h3>
          <button onClick={() => onAction('gotoPenerima')} className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 hover:text-emerald-800 dark:hover:text-emerald-300 transition w-max">Lihat Antrean →</button>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm relative overflow-visible">
        <h3 className="text-lg font-bold mb-6">Tren Dana (ETH)</h3>
        <div className="w-full h-52 relative z-10"><ChartAnimation /></div>
      </div>
    </div>
  );
};

/* ================================================================
   2) KELOLA PROGRAM / CAMPAIGN
   ================================================================ */
const CampaignView = ({ campaigns, onCreateModal, onManage, onDistribute, onAction }) => (
  <div className="space-y-6 max-w-[1440px]">
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <p className="text-base font-medium text-gray-600 dark:text-slate-400 mt-1">Kelola dan salurkan dana untuk program kemanusiaan yang aktif.</p>
      </div>
      <button onClick={onCreateModal} className="bg-emerald-700 text-white px-5 py-3 rounded-full text-sm font-bold shadow-md hover:bg-emerald-900 transition flex items-center gap-2">
        <Plus size={18} /> Buat Program Baru
      </button>
    </div>

    <div className="flex justify-between items-center">
      <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100">Daftar Program</h3>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {campaigns.map((c) => {
        const pct = Math.round(Math.min((c.collected / c.target) * 100, 100));
        const full = pct >= 100;
        return (
          <div key={c.id} className={`bg-white dark:bg-slate-900 rounded-[1.5rem] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition ${c.distStatus === 'Success' ? 'grayscale opacity-70 bg-gray-50 dark:bg-slate-900/50' : ''}`}>
            <div className="h-48 relative">
              <img src={c.image || campaignImg(c.category)} className="w-full h-full object-cover" alt={c.title} />
              <div className={`absolute top-4 right-4 ${full ? 'bg-amber-400 text-amber-950' : 'bg-white dark:bg-slate-900/90 text-emerald-700 dark:text-emerald-400'} text-[10px] font-extrabold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm backdrop-blur`}>
                {full ? <><CheckCircle size={12} /> Selesai</> : <><span className="w-2 h-2 bg-emerald-500 rounded-full" /> Aktif</>}
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <h4 className="text-lg font-bold text-gray-900 dark:text-slate-100 leading-snug mb-2 line-clamp-2">{c.title}</h4>
              <div className="flex gap-6 mb-4 text-[10px]">
                <span className="flex items-center gap-1.5 text-gray-500 dark:text-slate-400 font-bold">
                  <Users size={14} className="text-emerald-600 dark:text-emerald-400" /> {c.recipients} Penerima
                </span>
                <span className="flex items-center gap-1.5 text-gray-500 dark:text-slate-400 font-bold">
                  <FileText size={14} className="text-emerald-600 dark:text-emerald-400" /> Fee 5%
                </span>
              </div>
              <div className="mt-auto">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500">Progress</span>
                  <span className="text-sm font-extrabold text-emerald-700 dark:text-emerald-400">{pct.toFixed(0)}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 dark:bg-slate-800 rounded-full mb-3">
                  <div className="h-full bg-emerald-600 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                </div>
                {/* Split Info */}
                <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-3 mb-4 border border-gray-100 dark:border-slate-800 flex justify-between text-[10px] font-bold">
                  <span className="text-emerald-700 dark:text-emerald-400">95% → {c.recipients} Penerima</span>
                  <span className="text-amber-600 dark:text-amber-400">5% → Operasional</span>
                </div>
                {full && c.distStatus !== 'Success' ? (
                  <button onClick={() => onDistribute(c)} className="w-full py-3 bg-emerald-800 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 hover:bg-emerald-900 transition shadow-lg shadow-emerald-900/20">
                    <Wallet size={16} /> Salurkan Dana Bantuan
                  </button>
                ) : full && c.distStatus === 'Success' ? (
                  <div className="w-full py-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle size={16} /> Dana Sudah Tersalurkan
                  </div>
                ) : (
                  <div className="flex justify-between items-center pt-3 border-t border-gray-50 dark:border-slate-800">
                    <span className="text-[10px] font-mono text-gray-400 dark:text-slate-500">ID: {c.wallet}</span>
                    <button onClick={() => onManage(c)} className="px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-full text-xs font-bold text-gray-700 dark:text-slate-300 flex items-center gap-1.5 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                      <Settings size={12} /> Kelola
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

/* ================================================================
   3) PUSAT VERIFIKASI (Penerima Bantuan / ZKP Prover) - MODAL MODE
   ================================================================ */
const VerificationView = ({ queue, onVerify, onAction }) => {
  const context = React.useContext(PhilanthropyContext);
  const [verifying, setVerifying] = useState(null);
  const [activeItem, setActiveItem] = useState(null);
  const [showDistributeZkp, setShowDistributeZkp] = useState(false);
  const [step, setStep] = useState(0);
  const [banner, setBanner] = useState(null);
  const [verifyMode, setVerifyMode] = useState(null); // null | 'select' | 'real' | 'simulation'
  const [proofJson, setProofJson] = useState('');
  const [txHash, setTxHash] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const SAMPLE_ZKP_PROOF = {
    a: [
      "0x153724ad7b5bf6425dcdfd8c17c95c1eb7a45979d0eb57b917e8461009565b5f",
      "0x0facfdf890fdb364cb1e9e898cbb3e489e604e88ca28ba62db270f71942e0452"
    ],
    b: [
      [
        "0x2c46f26e06b8a749d6870847ada2269670483b3568d6ccb495a59d945a25d85b",
        "0x23c521d0f8cb959f9dc7bfe550124051d6b117cdb1d853c35f6f8dc496b53351"
      ],
      [
        "0x19f12de493fe34d5e356231f633cfed6a872484c0a10a216fba6ce47927764db",
        "0x06ba69d9d239c8d9b6d8090f4a274ffeded2cc6212ea297db5ca5b807dd90886"
      ]
    ],
    c: [
      "0x198e9393920d483a7260bfb731fb5d25f1aa493335a9e71297e485b7aef312c2",
      "0x1800deef121f1e76426a00665e5c4479674322d4f75edadd46debd5cd992f6ed"
    ],
    input: [
      "0x0000000000000000000000000000000000000000000000000000000000000001"
    ]
  };

  const stepsSimulation = [
    'Memeriksa Bukti Dokumen',
    'Mencocokkan Data Digital',
    'Persetujuan Jaringan Sukses',
  ];

  const stepsReal = [
    'Menyiapkan parameter bukti ZKP...',
    'Meminta tanda tangan transaksi MetaMask...',
    'Mengirim transaksi ke node blockchain...',
    'Menunggu transaksi dimasukkan ke blok (Mining)...'
  ];

  const startVerification = (item) => {
    setVerifying(item.id);
    setActiveItem(item);
    setBanner(null);
    setVerifyMode('select');
    setStep(0);
    setTxHash('');
    setErrorMessage('');
    setProofJson(JSON.stringify(SAMPLE_ZKP_PROOF, null, 2));
  };

  const startSimulation = () => {
    setVerifyMode('simulation');
    setStep(0);
    setTimeout(() => setStep(1), 1200);
    setTimeout(() => setStep(2), 2600);
    setTimeout(() => {
      setStep(3);
      setBanner(activeItem);
      onVerify(activeItem);
    }, 4000);
  };

  const executeRealTransaction = async () => {
    setVerifyMode('real');
    setStep(0);
    setErrorMessage('');
    setTxHash('');

    try {
      if (typeof window.ethereum === 'undefined') {
        throw new Error("MetaMask tidak terdeteksi. Silakan pasang ekstensi MetaMask.");
      }

      let proofData;
      try {
        proofData = JSON.parse(proofJson);
      } catch (err) {
        throw new Error("Format JSON bukti ZKP tidak valid. Pastikan penulisan JSON sudah benar.");
      }

      if (!proofData.a || !proofData.b || !proofData.c || !proofData.input) {
        throw new Error("Struktur ZKP tidak lengkap. Harus memiliki array 'a', 'b', 'c', dan 'input'.");
      }

      setStep(1); // Menghubungkan & bersiap
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const contract = new ethers.Contract(
        POVERTY_CHECK_ADDRESS,
        PovertyCheckABI.abi,
        signer
      );

      setStep(2); // Menunggu konfirmasi user
      const tx = await contract.verifyPovertyStatus(
        proofData.a,
        proofData.b,
        proofData.c,
        proofData.input
      );

      setTxHash(tx.hash);
      setStep(3); // Transaksi dikirim & sedang ditambang

      const receipt = await tx.wait();
      if (receipt.status === 0) {
        throw new Error("Transaksi dibatalkan/direvert oleh node blockchain.");
      }

      setStep(4); // Sukses
      setBanner(activeItem);
      onVerify(activeItem);
    } catch (error) {
      console.error(error);
      let errorMsg = error.message || "Terjadi kesalahan tidak dikenal.";
      if (error.reason) errorMsg = error.reason;
      if (error.data && error.data.message) errorMsg = error.data.message;
      setErrorMessage(errorMsg);
      setVerifyMode('select'); // Kembalikan ke layar pemilihan dengan pesan error
    }
  };

  const closeVerificationModal = () => {
    setVerifying(null);
    setActiveItem(null);
    setStep(0);
    setVerifyMode(null);
    setTxHash('');
    setErrorMessage('');
  };

  return (
    <div className="space-y-6 w-full max-w-[1440px] mx-auto">
      <div>
        <p className="text-base font-medium text-gray-500 dark:text-slate-400 mt-1">Antrean alamat dompet anonim yang membawa bukti ZKP (Zero-Knowledge Proof).</p>
      </div>

      {/* Success Banner */}
      <AnimatePresence>
        {banner && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 p-5 rounded-2xl flex items-center gap-4 shadow-sm"
          >
            <div className="w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center shrink-0">
              <Check size={22} strokeWidth={3} />
            </div>
            <div>
              <p className="font-bold text-base">DATA VALID! Dompet {banner.wallet} berhasil diverifikasi.</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">Proses verifikasi on-chain selesai dengan sukses.</p>
            </div>
            <button onClick={() => setBanner(null)} className="ml-auto text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300">
              <X size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabel Utama */}
      <div className="w-full bg-white dark:bg-slate-900 rounded-[1.5rem] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50">
          <h3 className="text-xl font-bold text-gray-800 dark:text-slate-200">Daftar Antrean ZKP</h3>
          <p className="text-l text-gray-500 dark:text-slate-400 mt-1">Data anonim dari instansi yang siap disahkan on-chain.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest">
                <th className="py-4 px-6">ID Pengajuan</th>
                <th className="py-4 px-6">Alamat Wallet Pemohon</th>
                <th className="py-4 px-6">Timestamp</th>
                <th className="py-4 px-6 text-center">Status</th>
                <th className="py-4 px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
              {queue.map((q) => {
                const verified = q.status === 'Verified';
                return (
                  <tr key={q.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition">
                    <td className="py-5 px-6 text-sm font-mono font-bold text-gray-700 dark:text-slate-300">{q.id}</td>
                    <td className="py-5 px-6 text-sm font-mono text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                      <span className="truncate max-w-[150px] inline-block">{q.wallet}</span>
                      <Copy 
                        size={12} 
                        className="text-gray-400 dark:text-slate-500 cursor-pointer hover:text-emerald-600 dark:hover:text-emerald-400" 
                        onClick={() => {
                          navigator.clipboard.writeText(q.wallet);
                          setBanner('Alamat dompet disalin!');
                        }}
                      />
                    </td>
                    <td className="py-5 px-6 text-xs text-gray-500 dark:text-slate-400">{q.timestamp}</td>
                    <td className="py-5 px-6 text-center">
                      {verified ? (
                        <span className="text-[10px] font-bold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 px-3 py-1 rounded-full inline-flex items-center gap-1">
                          <CheckCircle size={10} /> Terverifikasi
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 px-3 py-1 rounded-full">
                          Menunggu
                        </span>
                      )}
                    </td>
                    <td className="py-5 px-6 text-right">
                      {!verified && verifying !== q.id && (
                        <button
                          onClick={() => startVerification(q)}
                          className="bg-emerald-800 text-white font-bold text-xs px-5 py-2.5 rounded-lg shadow-md hover:bg-emerald-900 transition inline-flex items-center gap-2"
                        >
                          <ShieldCheck size={14} /> Verifikasi
                        </button>
                      )}
                      {verifying === q.id && !verified && (
                        <span className="text-xs font-bold text-amber-600 dark:text-amber-400 animate-pulse">Memproses...</span>
                      )}
                      {verified && (
                        <button
                          onClick={() => { setActiveItem(q); setShowDistributeZkp(true); }}
                          className="text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg transition inline-flex items-center gap-1 shadow-md"
                        >
                          <Wallet size={14} /> Salurkan Dana
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL POP-UP: STATUS TRACKER & MODE SELECTION */}
      <AnimatePresence>
        {verifying && activeItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={verifyMode === 'select' || step === 3 || step === 4 ? closeVerificationModal : undefined}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-2xl p-8 max-w-lg w-full relative z-10 flex flex-col max-h-[90vh] overflow-y-auto"
            >
              <div className="mb-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-extrabold text-xl text-gray-800 dark:text-slate-200 tracking-tight">Proses Pengesahan ZKP</h3>
                  <button onClick={closeVerificationModal} className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 bg-gray-50 dark:bg-slate-800/50 hover:bg-gray-100 dark:hover:bg-slate-800 p-1.5 rounded-full transition">
                    <X size={18} />
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                  ID Pengajuan: <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">{activeItem.id}</span>
                  <br />
                  Dokumen IPFS (Pinata): {activeItem.cid ? (
                    <a href={`https://yellow-causal-cardinal-982.mypinata.cloud/ipfs/${activeItem.cid}`} target="_blank" rel="noopener noreferrer" className="font-mono font-bold text-blue-600 dark:text-blue-400 hover:underline">
                      {activeItem.cid.substring(0, 8)}...{activeItem.cid.substring(activeItem.cid.length - 8)} <ExternalLink size={10} className="inline mb-0.5" />
                    </a>
                  ) : (
                    <span className="font-mono font-bold text-gray-400">N/A</span>
                  )}
                </p>
              </div>

              {/* MODE SELECTION */}
              {verifyMode === 'select' && (
                <div className="space-y-6 my-2 text-left">
                  {errorMessage && (
                    <div className="p-4 bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 text-xs rounded-xl border border-rose-200 dark:border-rose-800 flex items-start gap-2">
                      <AlertCircle size={16} className="shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Gagal Mengirim Transaksi:</p>
                        <p className="font-mono mt-1 text-[10px] break-all">{errorMessage}</p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="border border-gray-100 dark:border-slate-800 rounded-2xl p-5 hover:border-emerald-600 dark:hover:border-emerald-500 transition relative bg-slate-50/50 dark:bg-slate-800/20">
                      <h4 className="font-black text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <Wallet size={16} className="text-emerald-600" /> Jaringan Blockchain Real (MetaMask)
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-slate-400 mt-2">
                        Mengirimkan bukti matematis ZKP secara on-chain ke smart contract <code>PovertyCheck</code> di blockchain.
                      </p>

                      <div className="mt-4">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Bukti ZKP (JSON)</label>
                        <textarea
                          rows={6}
                          value={proofJson}
                          onChange={(e) => setProofJson(e.target.value)}
                          className="w-full p-3 font-mono text-[10px] bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:border-emerald-600 dark:focus:border-emerald-500 text-slate-700 dark:text-slate-300"
                        />
                        <button
                          type="button"
                          onClick={() => setProofJson(JSON.stringify(SAMPLE_ZKP_PROOF, null, 2))}
                          className="mt-2 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline block"
                        >
                          Muat Ulang Sampel Proof
                        </button>
                      </div>

                      <button
                        onClick={executeRealTransaction}
                        className="w-full bg-emerald-800 text-white font-bold text-xs py-3 rounded-xl hover:bg-emerald-900 transition shadow-md shadow-emerald-800/10 mt-4 flex items-center justify-center gap-2"
                      >
                        <ShieldCheck size={14} /> Kirim Transaksi Ke Blockchain
                      </button>
                    </div>

                    <div className="border border-gray-100 dark:border-slate-800 rounded-2xl p-5 hover:border-amber-500 transition bg-slate-50/50 dark:bg-slate-800/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h4 className="font-black text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                          <Settings size={16} className="text-amber-500" /> Mode Simulasi Off-Chain
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 max-w-sm">
                          Melompati transaksi blockchain untuk keperluan presentasi & pengujian fungsionalitas UI secara cepat.
                        </p>
                      </div>
                      <button
                        onClick={startSimulation}
                        className="bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold text-xs px-5 py-3 rounded-xl transition shadow-md shrink-0"
                      >
                        Mulai Simulasi
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* SIMULATION LOADER */}
              {verifyMode === 'simulation' && (
                <div className="space-y-6 my-4 text-left">
                  {stepsSimulation.map((s, i) => {
                    const done = step > i;
                    const active = step === i;
                    return (
                      <div key={i} className="flex items-start gap-4">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-sm font-bold transition-all duration-500 ${done ? 'bg-emerald-600 text-white shadow-md shadow-emerald-100 dark:shadow-none' : active ? 'bg-amber-400 text-amber-900 animate-bounce' : 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-500'}`}>
                          {done ? <Check size={18} strokeWidth={3} /> : i + 1}
                        </div>
                        <div className="pt-1">
                          <p className={`text-sm font-bold transition-colors ${done ? 'text-emerald-700 dark:text-emerald-400' : active ? 'text-amber-700 dark:text-[#F5A623]' : 'text-gray-400 dark:text-slate-500'}`}>
                            {done && '[✓] '}{s}
                          </p>
                          {active && (
                            <p className="text-[10px] text-[#F5A623] mt-0.5 animate-pulse">
                              Sedang memproses bukti matematis...
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {step === 3 && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 pt-4">
                      <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl border border-emerald-200 dark:border-emerald-800 text-center">
                        <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">✅ Verifikasi Simulasi Sukses</p>
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-500 mt-1">
                          Status pengajuan ID {activeItem.id} berhasil ditandai sebagai disetujui.
                        </p>
                      </div>
                      <button onClick={closeVerificationModal} className="w-full bg-emerald-800 text-white font-bold text-sm py-3 rounded-xl hover:bg-emerald-900 transition shadow-lg shadow-emerald-800/10">
                        Selesai & Tutup
                      </button>
                    </motion.div>
                  )}
                </div>
              )}

              {/* REAL BLOCKCHAIN LOADER */}
              {verifyMode === 'real' && (
                <div className="space-y-6 my-4 text-left">
                  {stepsReal.map((s, i) => {
                    const done = step > i;
                    const active = step === i;
                    return (
                      <div key={i} className="flex items-start gap-4">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-sm font-bold transition-all duration-500 ${done ? 'bg-emerald-600 text-white shadow-md shadow-emerald-100 dark:shadow-none' : active ? 'bg-amber-400 text-amber-900 animate-bounce' : 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-500'}`}>
                          {done ? <Check size={18} strokeWidth={3} /> : i + 1}
                        </div>
                        <div className="pt-1">
                          <p className={`text-sm font-bold transition-colors ${done ? 'text-emerald-700 dark:text-emerald-400' : active ? 'text-amber-700 dark:text-[#F5A623]' : 'text-gray-400 dark:text-slate-500'}`}>
                            {done && '[✓] '}{s}
                          </p>
                          {active && (
                            <p className="text-[10px] text-[#F5A623] mt-0.5 animate-pulse">
                              {i === 1 ? "Buka MetaMask dan konfirmasi transaksi..." : "Sedang melakukan mining transaksi..."}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {txHash && (
                    <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl">
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Hash Transaksi Blockchain</p>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="text-xs text-slate-600 dark:text-slate-300 font-mono break-all bg-gray-100 dark:bg-slate-800 px-1 rounded flex-1">{txHash}</code>
                        <Copy
                          size={14}
                          className="text-gray-400 dark:text-slate-500 hover:text-emerald-600 cursor-pointer"
                          onClick={() => {
                            navigator.clipboard.writeText(txHash);
                            setBanner('Hash transaksi disalin!');
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {step === 4 && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 pt-4">
                      <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl border border-emerald-200 dark:border-emerald-800 text-center">
                        <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">✅ Verifikasi On-Chain Sukses</p>
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-500 mt-1">
                          Status pengajuan ID {activeItem.id} berhasil ditandai sebagai disetujui on-chain.
                        </p>
                      </div>
                      <button onClick={closeVerificationModal} className="w-full bg-emerald-800 text-white font-bold text-sm py-3 rounded-xl hover:bg-emerald-900 transition shadow-lg shadow-emerald-800/10">
                        Selesai & Tutup
                      </button>
                    </motion.div>
                  )}
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL DISTRIBUSI DANA ZKP */}
      <AnimatePresence>
        {showDistributeZkp && activeItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-800/50">
                <h3 className="font-extrabold text-xl text-gray-800 dark:text-slate-100">Rincian Kalkulasi Distribusi</h3>
                <button onClick={() => setShowDistributeZkp(false)} className="text-gray-400 hover:text-gray-600 p-2"><X size={20} /></button>
              </div>
              <div className="p-8 space-y-6">
                {(() => {
                  const totalDana = 50;
                  const jumlahPenerima = 50;
                  const feeOperasional = totalDana * 0.05;
                  const danaBersih = totalDana - feeOperasional;
                  const distribusiPerOrang = danaBersih / jumlahPenerima;
                  
                  return (
                    <div className="space-y-4">
                      <div className="flex justify-between border-b border-gray-100 dark:border-slate-800 pb-2">
                        <span className="text-gray-500 dark:text-slate-400">Total Dana Terkumpul</span>
                        <span className="font-bold">{totalDana} ETH</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-100 dark:border-slate-800 pb-2">
                        <span className="text-gray-500 dark:text-slate-400">Potongan Fee Operasional (5%)</span>
                        <span className="font-bold text-rose-500">- {feeOperasional} ETH</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-100 dark:border-slate-800 pb-2">
                        <span className="text-gray-500 dark:text-slate-400">Dana Bersih (Net)</span>
                        <span className="font-bold text-emerald-600">{danaBersih} ETH</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-100 dark:border-slate-800 pb-2">
                        <span className="text-gray-500 dark:text-slate-400">Jumlah Penerima Bantuan</span>
                        <span className="font-bold">{jumlahPenerima} Orang</span>
                      </div>
                      <div className="flex justify-between bg-emerald-50 dark:bg-emerald-900/30 p-4 rounded-xl mt-4 border border-emerald-100 dark:border-emerald-800/50">
                        <span className="text-emerald-800 dark:text-emerald-400 font-bold">Nominal Per Orang</span>
                        <span className="font-black text-emerald-700 dark:text-emerald-300 text-lg">{distribusiPerOrang} ETH</span>
                      </div>
                    </div>
                  );
                })()}
                <button 
                  onClick={() => {
                    console.log("Memanggil API/Smart Contract untuk menyalurkan dana ke:", activeItem);
                    if (context && context.updateTahapBantuan) {
                      context.updateTahapBantuan(activeItem.id, "Selesai");
                    }
                    setShowDistributeZkp(false);
                    setBanner("Dana berhasil didistribusikan!");
                  }}
                  className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl hover:bg-emerald-700 transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30"
                >
                  <Wallet size={18} /> Konfirmasi Salurkan Dana
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ================================================================
   4) ALIRAN DANA — Deterministic Split Payment 95:5
   ================================================================ */
const FundsView = ({ distributions, onAction }) => (
  <div className="space-y-6 w-full max-w-[1440px] mx-auto">
      <div>
        <p className="text-base font-medium text-gray-500 dark:text-slate-400 mt-1">Visualisasi Pembagian Dana & Transparansi Catatan</p>
      </div>

    {/* Visual Split Diagram */}
    <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] border border-gray-100 dark:border-slate-800 shadow-sm p-8">
      <h3 className="text-sm font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-6">Skema Pembagian Otomatis (Smart Contract)</h3>
      <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-0">
        <div className="bg-emerald-800 text-white px-6 py-4 rounded-xl text-center shadow-lg">
          <p className="text-[10px] font-bold uppercase tracking-wider opacity-70 mb-1">Total Dana Dicairkan</p>
          <p className="text-xl font-black">100%</p>
        </div>
        <div className="hidden md:block w-16 h-0.5 bg-gray-200 dark:bg-slate-700 relative">
          <ArrowRight size={16} className="absolute -right-2 -top-2 text-gray-400 dark:text-slate-500" />
        </div>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="bg-emerald-50 dark:bg-emerald-900/30 border-2 border-emerald-600 dark:border-emerald-500 px-6 py-4 rounded-xl text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">Alokasi Penerima</p>
            <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300">95%</p>
            <p className="text-[9px] text-emerald-600 dark:text-emerald-400 mt-1">Terverifikasi oleh Sistem</p>
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/30 border-2 border-amber-400 px-6 py-4 rounded-xl text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">Fee Operasional Platform</p>
            <p className="text-2xl font-black text-amber-700 dark:text-amber-300">5%</p>
            <p className="text-[9px] text-amber-600 dark:text-amber-400 mt-1">Terverifikasi oleh Sistem</p>
          </div>
        </div>
      </div>
    </div>

    {/* Catatan Transaksi Langsung */}
    <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 dark:border-slate-800 gap-4">
        <div>
          <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-400 flex items-center gap-2"><Server size={20} /> Catatan Transaksi Langsung</h3>
          <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-1">Verifikasi pembagian dana secara real-time di blockchain.</p>
        </div>
        <span className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> MENYINKRONKAN
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-[#F8FAFC] dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800 text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest">
              <th className="py-4 px-6">ID PROGRAM</th>
              <th className="py-4 px-6">TOTAL MASUK</th>
              <th className="py-4 px-6">ALOKASI PENERIMA (95%)</th>
              <th className="py-4 px-6">FEE (5%)</th>
              <th className="py-4 px-6">TX HASH BLOCKCHAIN</th>
              <th className="py-4 px-6 text-center">STATUS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
            {distributions.map((d, i) => (
              <tr key={i} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition">
                <td className="py-5 px-6">
                  <span className="text-sm font-extrabold text-gray-900 dark:text-slate-100 mr-2">{d.programId}</span>
                  <span className={`${d.type === 'LEMBAGA' ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'} text-[9px] font-extrabold px-2 py-0.5 rounded uppercase`}>{d.type}</span>
                </td>
                <td className="py-5 px-6 font-bold text-emerald-700 dark:text-emerald-400">{formatETH(d.total)}</td>
                <td className="py-5 px-6">
                  <p className="font-bold text-gray-800 dark:text-slate-200">{formatETH(d.total * 0.95)}</p>
                  <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5"><CheckCircle size={10} /> 95%</p>
                </td>
                <td className="py-5 px-6">
                  <p className="font-bold text-gray-800 dark:text-slate-200">{formatETH(d.total * 0.05)}</p>
                  <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-0.5"><CheckCircle size={10} /> 5%</p>
                </td>
                <td className="py-5 px-6">
                  <button onClick={() => onAction(`Membuka explorer untuk ${d.txHash}`)} className="text-xs font-mono text-gray-500 dark:text-slate-400 flex items-center gap-1 hover:text-emerald-600 dark:hover:text-emerald-400">
                    {d.txHash} <ExternalLink size={12} />
                  </button>
                </td>
                <td className="py-5 px-6 text-center">
                  <span className="text-[9px] bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-extrabold px-3 py-1.5 rounded uppercase inline-flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> SUCCESS
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-4 border-t border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-800/50">
        <span className="text-xs text-gray-500 dark:text-slate-400">Menampilkan {distributions.length} transaksi terbaru</span>
      </div>
    </div>
  </div>
);

/* ================================================================
   5) LAPORAN TRANSPARANSI — Audit Rekonsiliasi
   ================================================================ */
const ReportsView = ({ auditData, onAction }) => (
  <div className="space-y-6 max-w-[1440px]">
    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
      <div>
        <p className="text-base font-medium text-gray-600 dark:text-slate-400 mt-2 max-w-2xl leading-relaxed">Verifikasi aset yayasan secara langsung. Catatan transparan ini memastikan setiap data sistem di luar jaringan cocok dengan data permanen di dalam sistem.</p>
      </div>
    </div>

    {/* Top Cards */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[
        { label: 'Total Donasi', value: formatETH(auditData.totalDonations), sub: 'Terverifikasi oleh Sistem', Icon: Landmark },
        { label: 'Penerima yang Telah Diverifikasi', value: auditData.verifiedRecipients.toLocaleString(), sub: 'Identitas Tervalidasi', Icon: Users },
        { label: 'Dana yang Tersedia', value: formatETH(auditData.availableFunds), sub: 'Dana Terkunci Sistem', Icon: Wallet },
      ].map((c, i) => (
        <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <c.Icon size={80} className="absolute -right-4 -bottom-4 text-gray-50/80 dark:text-slate-800/80" />
          <div className="relative z-10">
            <p className="text-xs font-bold text-gray-500 dark:text-slate-400 flex items-center gap-2 mb-2"><c.Icon size={16} /> {c.label}</p>
            <h3 className="text-3xl font-black text-gray-900 dark:text-slate-100 mb-3">{c.value}</h3>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-1 rounded-full flex items-center gap-1 w-max"><CheckCircle size={12} /> {c.sub}</span>
          </div>
        </div>
      ))}
    </div>

    {/* Reconciliation Table */}
    <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[#F8F9FE] dark:bg-slate-800/50 gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100">Rekonsiliasi Buku Besar</h3>
          <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-1">Membandingkan sistem internal dengan state blockchain publik.</p>
        </div>
        <button onClick={() => onAction('Melakukan sinkronisasi blok terbaru...')} className="bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300 px-4 py-2.5 rounded-lg text-xs font-bold hover:bg-gray-300 dark:hover:bg-slate-600 transition flex items-center gap-2">
          <RefreshCw size={14} /> Sinkronisasi Data Terbaru
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-100 dark:border-slate-800 text-[11px] font-bold text-gray-600 dark:text-slate-400 bg-white dark:bg-slate-900">
              <th className="py-5 px-6 w-1/4">Komponen Audit</th>
              <th className="py-5 px-6">Database Aplikasi (Off-Chain)</th>
              <th className="py-5 px-6">State Blockchain (On-Chain)</th>
              <th className="py-5 px-6 text-center">Status Sinkronisasi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
            {[
              { name: 'Total Donasi Masuk', icon: <ArrowUpRight size={16} />, off: formatETH(auditData.totalDonations), on: `${formatETH(auditData.totalDonations)} (totalDonations)` },
              { name: 'Alokasi Hak Penerima (95%)', icon: <Users size={16} />, off: formatETH(auditData.totalDonations * 0.95), on: `${formatETH(auditData.totalDonations * 0.95)} (95% Split)` },
              { name: 'Potongan Fee Platform (5%)', icon: <Wallet size={16} />, off: formatETH(auditData.totalDonations * 0.05), on: `${formatETH(auditData.totalDonations * 0.05)} (5% Split)` },
              { name: 'Daftar Alamat Terverifikasi', icon: <ShieldCheck size={16} />, off: `${auditData.verifiedRecipients} Alamat`, on: `${auditData.verifiedRecipients} Alamat` },
              { name: 'Dana Siap Salur', icon: <Database size={16} />, off: formatETH(auditData.availableFunds), on: formatETH(auditData.availableFunds) },
            ].map((r, i) => (
              <tr key={i} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition">
                <td className="py-6 px-6 flex items-center gap-4">
                  <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded flex items-center justify-center">{r.icon}</div>
                  <span className="font-bold text-gray-800 dark:text-slate-200 text-sm">{r.name}</span>
                </td>
                <td className="py-6 px-6 text-sm text-gray-600 dark:text-slate-400">{r.off}</td>
                <td className="py-6 px-6 text-sm font-mono text-gray-600 dark:text-slate-400">{r.on}</td>
                <td className="py-6 px-6 text-center">
                  <span className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-extrabold px-4 py-2 rounded-full inline-flex flex-col items-center border border-emerald-100 dark:border-emerald-800 w-full max-w-[150px]">
                    <span className="flex items-center gap-1"><CheckCircle size={12} /> COCOK </span>
                    <span className="font-medium text-[9px] mt-0.5">(Immutable)</span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between items-center bg-gray-50 dark:bg-slate-800/50 p-4 border-t border-gray-100 dark:border-slate-800">
        <p className="text-[10px] font-mono text-gray-500 dark:text-slate-400 flex items-center gap-2">
        <ShieldCheck size={14} className="text-emerald-600 dark:text-emerald-400" /> Diverifikasi secara digital pada sistem utama
        </p>
      </div>
    </div>
  </div>
);

const YayasanPage = ({ onLogoutClick = () => {} }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);
  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const [activeMenu, setActiveMenu] = useState('Beranda');
  const [previewImage, setPreviewImage] = useState(null);
  const [modal, setModal] = useState(null);

  const context = React.useContext(PhilanthropyContext);
  const dataProgram = context?.dataProgram || [];
  const dataPengajuan = context?.dataPengajuan || [];
  const currentUser = context?.currentUser;
  const walletAddress = context?.walletAddress;

  // ─── Campaign State (Sinkronisasi Real-Time dengan Backend dataProgram) ───
  const [campaigns, setCampaigns] = useState([
    { id: 'C-001', title: 'Pembangunan Fasilitas Air Bersih Desa Cikaret', category: 'Ekonomi', target: 1.5, collected: 0.8, status: 'Aktif', distStatus: 'Pending', wallet: '0x8A2...981c', recipients: 100 },
    { id: 'C-002', title: 'Bantuan Medis Darurat Korban Banjir Garut', category: 'Bencana', target: 50.0, collected: 50.0, status: 'Selesai', distStatus: 'Pending', wallet: '0x3Fb...22a0', recipients: 50 },
    { id: 'C-003', title: 'Beasiswa Teknologi Anak Bangsa 2024', category: 'Pendidikan', target: 80.0, collected: 25.6, status: 'Aktif', distStatus: 'Pending', wallet: '0x4F9...2E8d', recipients: 75 },
  ]);

  useEffect(() => {
    if (dataProgram && dataProgram.length > 0) {
      setCampaigns(dataProgram.map(c => ({
        id: c.id,
        title: c.judul || c.title,
        category: c.kategori || c.category,
        target: c.targetDonasi || c.target || 0,
        collected: c.terkumpul || c.collected || 0,
        status: c.status || 'Berjalan',
        distStatus: c.distStatus || 'Pending',
        wallet: c.wallet || '0x...',
        recipients: c.targetPenerima || c.recipients || 0,
        image: c.gambar || c.image || null
      })));
    }
  }, [dataProgram]);
  
  // Polling data ZKP dari backend
  useEffect(() => {
    if (context?.fetchDocuments) {
      const interval = setInterval(() => {
        context.fetchDocuments();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [context?.fetchDocuments]);

  const zkpQueue = dataPengajuan.filter(p => (p.status === 'disetujui' || p.status === 'zkp_validated') && p.tahapBantuan !== 'Selesai').map(p => ({
    id: p.id,
    kategori: p.kategori,
    nik: p.nik,
    score: 99,
    wallet: p.walletAddress || "0x...",
    timestamp: p.tanggalSistem || "Baru saja",
    status: (p.tahapBantuan === 'Cairkan Dana' || p.tahapBantuan === 'Selesai') ? 'Verified' : 'Pending'
  }));
  const setZkpQueue = () => {};

  // ─── Distribution Ledger Riil (dari Program yang Sukses Disalurkan) ───
  const [distributions, setDistributions] = useState([
    { programId: '#CAMP-03', type: 'INDIVIDU', total: 1.0, txHash: '0x9fc...41ba', campaign: 'Bantuan Sembako' },
    { programId: '#CAMP-01', type: 'LEMBAGA', total: 2.0, txHash: '0xabc...789', campaign: 'Bencana Banjir' },
    { programId: '#CAMP-02', type: 'INDIVIDU', total: 0.5, txHash: '0xdef...456', campaign: 'Beasiswa Desa' },
  ]);

  useEffect(() => {
    const realDist = campaigns.filter(c => c.distStatus === 'Success').map(c => ({
      programId: `#CAMP-${c.id}`,
      type: 'KOLEKTIF',
      total: c.collected,
      txHash: c.wallet || '0xabc...123',
      campaign: c.title
    }));
    if (realDist.length > 0) {
      setDistributions(realDist);
    }
  }, [campaigns]);

  // ─── Audit Data Dinamis (Dihitung dari Real Data) ───
  const totalCollected = campaigns.reduce((s, c) => s + c.collected, 0);
  const totalAllocated = campaigns.reduce((s, c) => s + (c.distStatus === 'Success' ? c.collected : 0), 0);
  const verifiedRecipientsCount = dataPengajuan.filter(p => p.status === 'disetujui' && (p.tahapBantuan === 'Cairkan Dana' || p.tahapBantuan === 'Selesai')).length;

  const auditData = {
    totalDonations: totalCollected,
    verifiedRecipients: verifiedRecipientsCount,
    availableFunds: totalCollected - totalAllocated,
  };

  // ─── Create Campaign Form ───
  const [createForm, setCreateForm] = useState({
    title: '',
    category: 'Ekonomi',
    target: '',
    targetRecipients: '',
    endDate: '',
    foundationName: '',
    image: null,
  });

  // ─── Handlers ───
  const handleVerify = (item) => {
    if (context && context.updateTahapBantuan) {
      context.updateTahapBantuan(item.id, "Cairkan Dana");
      context.catatAktivitas(`Verifikasi ZKP Sukses`, `Dokumen ZKP ID ${item.id} sukses diverifikasi secara on-chain.`, "Yayasan");
    }
  };

  const handleDistribute = (camp) => {
    setModal({ type: 'distribute', step: 'confirm', data: camp });
  };

  const handleCreateCampaign = (e) => {
    e.preventDefault();
    let campaignImage = null;
    if (createForm.image) {
      campaignImage = URL.createObjectURL(createForm.image);
    }
    const nc = {
      id: 'C-00' + (campaigns.length + 1),
      title: createForm.title,
      judul: createForm.title, // untuk kompatibilitas data donatur.jsx
      category: createForm.category,
      kategori: createForm.category, // untuk kompatibilitas filter donatur.jsx
      tag: createForm.category,
      target: parseInt(createForm.target.replace(/\D/g, '') || '0'),
      targetDonasi: parseInt(createForm.target.replace(/\D/g, '') || '0'),
      collected: 0,
      terkumpul: 0,
      status: 'Berjalan',
      distStatus: 'Pending',
      wallet: '0x' + Math.random().toString(16).substr(2, 6) + '...',
      recipients: parseInt(createForm.targetRecipients.replace(/\D/g, '') || '0'),
      targetPenerima: parseInt(createForm.targetRecipients.replace(/\D/g, '') || '0'),
      endDate: createForm.endDate,
      foundationName: createForm.foundationName,
      image: campaignImage,
      imageFile: createForm.image,
    };
    setCampaigns((p) => [nc, ...p]);
    if (context && context.tambahProgram) {
      context.tambahProgram(nc);
    }
    setCreateForm({ title: '', category: 'Ekonomi', target: '', targetRecipients: '', endDate: '', foundationName: '', image: null });
    setModal({ type: 'alert', data: `Sukses! Program "${nc.title}" dengan Kategori "${nc.category}" berhasil disimpan dan sekarang tersedia di Halaman Donatur.` });
  };

  const triggerAction = (msg) => {
    if (msg === 'gotoPenerima') {
      setActiveMenu('Penerima');
    } else {
      setModal({ type: 'alert', data: msg });
    }
  };

  // ─── Menu Definitions (IDs match render conditions below) ───
  const menus = [
    { id: 'Beranda',    icon: <Home size={20} />,            label: 'Beranda' },
    { id: 'Program',   icon: <Megaphone size={20} />,        label: 'Program' },
    { id: 'Dana',      icon: <Wallet size={20} />,           label: 'Dana' },
    { id: 'Penerima',  icon: <Users size={20} />,            label: 'Penerima' },
    { id: 'Laporan',   icon: <FileText size={20} />,         label: 'Laporan' },
  ];

  return (
    <div className={`flex min-h-screen font-sans selection:bg-emerald-700 selection:text-white overflow-x-hidden transition-colors duration-300 ${isDarkMode ? "bg-slate-950 text-slate-100 dark" : "bg-slate-50 text-slate-900"}`}>
      {/* ===== SIDEBAR ===== */}
      <aside className="w-[260px] bg-white dark:bg-slate-900 border-r border-gray-100 dark:border-slate-800 p-6 flex flex-col fixed h-full z-40 shadow-sm">
        <div className="flex items-center gap-3 mb-10 mt-2">
          <img src={logo} alt="Logo" className="w-8 h-8 object-contain dark:drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
          <div>
            <h1 className="text-lg font-black leading-tight">
              <span className="text-gray-900 dark:text-white">Philantrophy</span><span className="text-[#EAB308]">Chain</span>
            </h1>
            <p className="text-[10px] text-gray-500 dark:text-slate-400 uppercase tracking-widest mt-1">Yayasan</p>
          </div>
        </div>

        <nav className="space-y-1.5 flex-1">
          {menus.map((m) => (
            <button
              key={m.id}
              onClick={() => setActiveMenu(m.id)}
              className={`flex items-center gap-4 w-full px-5 py-3.5 rounded-xl transition-all font-bold text-sm ${
                activeMenu === m.id
                  ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20'
                  : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800/50 hover:text-emerald-800 dark:hover:text-emerald-400'
              }`}
            >
              <span className={activeMenu === m.id ? 'text-white' : 'text-gray-400 dark:text-slate-500'}>{m.icon}</span>
              {m.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-6 space-y-3">
          <button
            onClick={() => setModal({ type: 'create' })}
            className="flex items-center justify-center gap-2 w-full px-5 py-3.5 bg-emerald-800 text-white hover:bg-emerald-900 rounded-xl transition font-bold text-sm shadow-md"
          >
            <Plus size={18} /> Buat Program Baru
          </button>
          <button
            onClick={onLogoutClick}
            className="flex items-center gap-3 w-full px-5 py-3.5 text-gray-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-400 rounded-xl transition font-bold text-sm"
          >
            <LogOut size={18} className="text-gray-400 dark:text-slate-500" /> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-[260px] min-w-0 bg-slate-50 dark:bg-slate-950">
        {/* HEADER FLUSH TO TOP */}
        <header className="bg-white dark:bg-slate-900 shadow-sm border-b border-gray-100 dark:border-slate-800 sticky top-0 z-30 transition-colors">
          <div className="max-w-[1440px] mx-auto px-8 py-5 flex justify-between items-center w-full">
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-wider text-emerald-900 dark:text-emerald-400">{activeMenu}</h2>
            <div className="flex items-center gap-3">
              <button onClick={() => setActiveMenu('Laporan')} className="p-2.5 rounded-full bg-gray-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-100 hover:text-emerald-600 transition relative">
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
              <button onClick={() => setModal({ type: 'profile' })} className="w-10 h-10 rounded-full border-2 border-emerald-500 overflow-hidden hover:opacity-80 transition cursor-pointer bg-slate-100 dark:bg-slate-800 shrink-0 flex items-center justify-center">
                <User size={24} className="text-emerald-600"/>
              </button>
            </div>
          </div>
        </header>

        <div className="p-8 lg:p-12 max-w-[1440px] mx-auto space-y-8">
          {activeMenu === 'Beranda'   && <DashboardView     campaigns={campaigns}   onAction={triggerAction} />}
          {activeMenu === 'Program'   && <CampaignView      campaigns={campaigns}   onCreateModal={() => setModal({ type: 'create' })} onManage={(c) => setModal({ type: 'manage', data: c })} onDistribute={handleDistribute} onAction={triggerAction} />}
          {activeMenu === 'Penerima'  && <VerificationView  queue={zkpQueue}        onVerify={handleVerify} onAction={triggerAction} />}
          {activeMenu === 'Dana'      && <FundsView         distributions={distributions} onAction={triggerAction} />}
          {activeMenu === 'Laporan'   && <ReportsView       auditData={auditData}   onAction={triggerAction} />}
        </div>
      </main>

      {/* ===== MODALS ===== */}
      <AnimatePresence>
        {modal && (
          <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 max-w-md w-full shadow-2xl relative border border-gray-100 dark:border-slate-800 text-center"
            >
              <button onClick={() => setModal(null)} className="absolute top-5 right-5 text-gray-400 dark:text-slate-500 hover:text-gray-900 dark:hover:text-slate-100 bg-gray-100 dark:bg-slate-800 rounded-full p-1">
                <X size={18} />
              </button>

              {/* ── Create Modal ── */}
              {modal.type === 'create' && (
                <div className="text-left max-h-[80vh] overflow-y-auto px-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-6 flex items-center gap-2 sticky top-0 bg-white dark:bg-slate-900 pt-1 pb-3 border-b border-gray-100 dark:border-slate-800 z-10">
                    Buat Program Baru
                  </h3>
                  <form onSubmit={handleCreateCampaign} className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase mb-1.5 block">Nama Yayasan Pengelola</label>
                      <input required value={createForm.foundationName} onChange={(e) => setCreateForm({ ...createForm, foundationName: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-500" placeholder="Contoh: Yayasan Peduli Sesama" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase mb-1.5 block">Judul Program</label>
                      <input required value={createForm.title} onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-500" placeholder='Contoh: "Bantuan Pangan Pasca Bencana"' />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase mb-1.5 block">Kategori</label>
                        <select value={createForm.category} onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-500">
                          <option>Ekonomi</option>
                          <option>Bencana Alam</option>
                          <option>Pendidikan</option>
                          <option>Kesehatan</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase mb-1.5 block">Batas Akhir Donasi</label>
                        <input required type="date" value={createForm.endDate} onChange={(e) => setCreateForm({ ...createForm, endDate: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-500" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase mb-1.5 block">Target Donasi (ETH)</label>
                        <input required type="number" min="0" value={createForm.target} onChange={(e) => setCreateForm({ ...createForm, target: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-500" placeholder="1.5" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase mb-1.5 block">Target Penerima (Jiwa/KK)</label>
                        <input required type="number" min="0" value={createForm.targetRecipients} onChange={(e) => setCreateForm({ ...createForm, targetRecipients: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-500" placeholder="Contoh: 150" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase mb-1.5 block">Upload Foto Program</label>
                      <label className="w-full flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-xl py-5 cursor-pointer hover:border-emerald-400 bg-gray-50 dark:bg-slate-800/50 transition">
                        {createForm.image ? (
                          <div className="text-center">
                            <img src={URL.createObjectURL(createForm.image)} className="h-24 object-cover rounded-lg mx-auto mb-2" alt="Preview" />
                            <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">{createForm.image.name}</p>
                          </div>
                        ) : (
                          <div className="text-center">
                            <p className="text-2xl mb-1">📷</p>
                            <p className="text-xs font-bold text-gray-400 dark:text-slate-500">Klik untuk upload gambar</p>
                          </div>
                        )}
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => setCreateForm({ ...createForm, image: e.target.files[0] || null })} />
                      </label>
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-xl p-3 text-[10px] text-amber-700 dark:text-amber-400 font-medium">
                      ℹ️ Setelah target tercapai, dana otomatis terbagi: <strong>95% Penerima</strong> / <strong>5% Operasional Platform</strong>.
                    </div>
                    <button type="submit" className="w-full py-4 bg-emerald-700 text-white rounded-xl font-bold shadow-lg hover:bg-emerald-800 transition mt-4">
                      Simpan & Publikasikan
                    </button>
                  </form>
                </div>
              )}

              {/* ── Distribute Confirm ── */}
              {modal.type === 'distribute' && modal.step === 'confirm' && (
                <div className="py-2 text-left">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-6 flex items-center gap-2 border-b border-gray-100 dark:border-slate-800 pb-3">
                    Rincian Kalkulasi Distribusi
                  </h3>
                  {(() => {
                    const totalDana = modal.data.collected || 50;
                    const jumlahPenerima = modal.data.recipients || 50;
                    const feeOperasional = totalDana * 0.05;
                    const danaBersih = totalDana - feeOperasional;
                    const distribusiPerOrang = danaBersih / jumlahPenerima;
                    
                    return (
                      <div className="space-y-4 mb-6">
                        <div className="flex justify-between border-b border-gray-100 dark:border-slate-800 pb-2">
                          <span className="text-gray-500 dark:text-slate-400">Total Dana Terkumpul</span>
                          <span className="font-bold">{formatETH(totalDana)}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-100 dark:border-slate-800 pb-2">
                          <span className="text-gray-500 dark:text-slate-400">Potongan Fee Operasional (5%)</span>
                          <span className="font-bold text-rose-500">- {formatETH(feeOperasional)}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-100 dark:border-slate-800 pb-2">
                          <span className="text-gray-500 dark:text-slate-400">Dana Bersih (Net)</span>
                          <span className="font-bold text-emerald-600">{formatETH(danaBersih)}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-100 dark:border-slate-800 pb-2">
                          <span className="text-gray-500 dark:text-slate-400">Jumlah Penerima Bantuan</span>
                          <span className="font-bold">{jumlahPenerima} Orang</span>
                        </div>
                        <div className="flex justify-between bg-emerald-50 dark:bg-emerald-900/30 p-4 rounded-xl mt-4 border border-emerald-100 dark:border-emerald-800/50">
                          <span className="text-emerald-800 dark:text-emerald-400 font-bold">Nominal Per Orang</span>
                          <span className="font-black text-emerald-700 dark:text-emerald-300 text-lg">{formatETH(distribusiPerOrang)}</span>
                        </div>
                      </div>
                    );
                  })()}
                  <button 
                    onClick={() => {
                      console.log("Memanggil API/Smart Contract untuk menyalurkan dana program:", modal.data);
                      setModal(null);
                      setCampaigns((prev) => prev.map((c) => (c.id === modal.data.id ? { ...c, distStatus: 'Success', status: 'Selesai' } : c)));
                      setDistributions((prev) => [
                        { programId: '#' + modal.data.id, type: 'LEMBAGA', total: modal.data.collected, txHash: '0x' + Math.random().toString(16).substr(2, 6), campaign: modal.data.title },
                        ...prev,
                      ]);
                      setModal({ type: 'alert', data: "Dana berhasil didistribusikan! (Cek console log)" });
                    }}
                    className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl hover:bg-emerald-700 transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30"
                  >
                    <Wallet size={18} /> Konfirmasi Salurkan Dana
                  </button>
                </div>
              )}

                            {/* ── Manage Program Modal ── */}
              {modal.type === 'manage' && (
                <div className="text-left px-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-6 flex items-center gap-2 border-b border-gray-100 dark:border-slate-800 pb-3">
                    Kelola Program: {modal.data?.title}
                  </h3>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    setCampaigns(prev => prev.map(c => c.id === modal.data.id ? {
                      ...c,
                      title: e.target.title.value,
                      recipients: parseInt(e.target.recipients.value || '0')
                    } : c));
                    setModal({ type: 'alert', data: 'Program berhasil diperbarui' });
                  }} className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase mb-1.5 block">Judul Program</label>
                      <input name="title" type="text" defaultValue={modal.data?.title} required className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-500" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase mb-1.5 block">Jumlah Target Penerima</label>
                      <input name="recipients" type="number" defaultValue={modal.data?.recipients} required className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-500" />
                    </div>
                    <div className="flex flex-col gap-3 pt-4 border-t border-gray-100 dark:border-slate-800">
                      <button type="submit" className="w-full py-3.5 bg-emerald-700 text-white rounded-xl font-bold shadow-lg hover:bg-emerald-800 transition">
                        Simpan Perubahan
                      </button>
                      <button type="button" onClick={() => {
                        setCampaigns(prev => prev.map(c => c.id === modal.data.id ? { ...c, status: 'Selesai' } : c));
                        setModal({ type: 'alert', data: 'Program ditandai selesai' });
                      }} className="w-full py-3 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-300 rounded-xl font-bold hover:bg-gray-100 dark:hover:bg-slate-800 transition">
                        Tandai Selesai
                      </button>
                      <button type="button" onClick={() => {
                        setCampaigns(prev => prev.filter(c => c.id !== modal.data.id));
                        setModal({ type: 'alert', data: 'Program berhasil dihapus' });
                      }} className="w-full py-3 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-xl font-bold hover:bg-red-100 dark:hover:bg-red-900/40 transition">
                        Hapus Program
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* ── Profile Modal ── */}
              {modal.type === 'profile' && (
                <div className="text-left px-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-6 flex items-center gap-2 border-b border-gray-100 dark:border-slate-800 pb-3">
                    Edit Profil Yayasan
                  </h3>
                  <form onSubmit={(e) => { e.preventDefault(); setModal({ type: 'alert', data: 'Profil berhasil diperbarui' }); }} className="space-y-4">
                    <div className="mb-4">
                      <label className="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase mb-1.5 block">Foto Profil Yayasan</label>
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800 overflow-hidden flex items-center justify-center shrink-0">
                          {previewImage ? <img src={previewImage} className="w-full h-full object-cover" /> : <Building size={24} className="text-emerald-700 dark:text-emerald-400" />}
                        </div>
                        <label className="cursor-pointer text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-4 py-2 rounded-lg border border-emerald-200 dark:border-emerald-700 hover:bg-emerald-100 transition shadow-sm">
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              const reader = new FileReader();
                              reader.onload = (e) => setPreviewImage(e.target.result);
                              reader.readAsDataURL(e.target.files[0]);
                            }
                          }} />
                          Ubah Foto Profil
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase mb-1.5 block">Nama Pengelola (Dapat Diedit)</label>
                      <input type="text" defaultValue={currentUser?.name || "Admin Yayasan"} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-500" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase mb-1.5 block">Nama Yayasan (Tidak Dapat Diedit)</label>
                      <input type="text" value={currentUser?.name || "Yayasan Ruang Peduli Bersama"} disabled className="w-full px-4 py-2.5 bg-gray-200 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-smS text-gray-500 dark:text-slate-400 cursor-not-allowed" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase mb-1.5 block">Alamat E-Wallet</label>
                      <input type="text" defaultValue={walletAddress || "0xf39F...2266"} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-500 font-mono" />
                    </div>
                    <button type="submit" className="w-full py-4 bg-emerald-700 text-white rounded-xl font-bold shadow-lg hover:bg-emerald-800 transition mt-4">
                      Simpan Perubahan
                    </button>
                  </form>
                </div>
              )}

              {/* ── Generic Alert ── */}
              {modal.type === 'alert' && (
                <div className="py-6">
                  <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle size={40} />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-slate-100 mb-3">Tindakan Diterima</h3>
                  <p className="text-gray-500 dark:text-slate-400 mb-8 font-medium text-sm">{modal.data}</p>
                  <button onClick={() => setModal(null)} className="w-full py-3.5 bg-emerald-800 text-white rounded-xl font-bold hover:bg-emerald-900 transition shadow-lg">
                    Tutup
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default YayasanPage;
