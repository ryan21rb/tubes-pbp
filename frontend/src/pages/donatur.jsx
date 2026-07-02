import React, { useState, useEffect, useContext } from 'react';
import { PhilanthropyContext } from '../context/PhilanthropyContext';
import { ethers } from 'ethers';
import api from '../services/api';
import logo from '../assets/logophilantrophy.png';
import carousel1 from '../assets/carousel1.png';
import carousel2 from '../assets/carousel2.png';
import carousel3 from '../assets/carousel3.png';
import imgHealth from '../assets/campaign_health.png';
import imgDisaster from '../assets/campaign_disaster.png';
import imgEducation from '../assets/campaign_education.png';
import imgSocial from '../assets/campaign_social.png';
import { Home, Megaphone, History, User, LogOut, Wallet, Search,
  CheckCircle, Calendar, Heart, ExternalLink, ArrowUpRight, ArrowRight,
  ArrowDownLeft, Shield, Clock, Eye, Filter,
  ChevronDown, ChevronRight, Award, FileText, HandCoins, Coins,
  BadgeCheck, CircleDollarSign, Globe, AlertCircle, X, Loader2,
  ShieldCheck, Landmark, ChevronLeft, Droplet,
  HeartHandshake, BookOpen, Wind, MessageCircleHeart, Info,
  Bookmark, Check, CheckCircle2, ImagePlus, Edit3, Bell, Settings, Plus, Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';

import { apiGetMyDocumentStatus } from '../services/api';

// ============================================================
// KONSTANTA TAG & HELPER (tetap statis, hanya untuk styling UI)
// ============================================================

const TAG_COLORS = {
  Kesehatan: { bg: "bg-emerald-50 dark:bg-emerald-900/30", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-200 dark:border-emerald-800", dot: "bg-emerald-500", icon: <HeartHandshake size={14} /> },
  Bencana: { bg: "bg-amber-50 dark:bg-amber-900/30", text: "text-amber-600 dark:text-amber-400", border: "border-amber-200 dark:border-amber-800", dot: "bg-amber-500", icon: <Wind size={14} /> },
  Pendidikan: { bg: "bg-blue-50 dark:bg-blue-900/30", text: "text-blue-600 dark:text-blue-400", border: "border-blue-200 dark:border-blue-800", dot: "bg-blue-500", icon: <BookOpen size={14} /> },
  Ekonomi: { bg: "bg-teal-50 dark:bg-teal-900/30", text: "text-teal-600 dark:text-teal-400", border: "border-teal-200 dark:border-teal-800", dot: "bg-teal-500", icon: <Droplet size={14} /> },
};

const VERIFIED_BY_MAPPING = {
  Kesehatan: "Dinas Kesehatan",
  Bencana: "BPBD",
  Pendidikan: "Dinas Pendidikan",
  Ekonomi: "Dinas Sosial",
};

// ============================================================
// KOMPONEN: IMAGE CAROUSEL
// ============================================================
const ImageCarousel = () => {
  const [index, setIndex] = useState(0);
  const slides = [carousel1, carousel2, carousel3];

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="relative w-full h-30 md:h-80 overflow-hidden rounded-[5rem] shadow-xl mb-10 group">
      <AnimatePresence mode='wait'>
        <motion.img
          key={index}
          src={slides[index]}
          alt={`Banner ${index + 1}`}
          className="absolute w-full h-full object-cover"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2.5 z-10">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`rounded-full transition-all duration-300 ${i === index ? 'w-8 h-2.5 bg-amber-400' : 'w-2.5 h-2.5 bg-white dark:bg-slate-900/50 hover:bg-white dark:bg-slate-900/80'}`}
          />
        ))}
      </div>
    </div>
  );
};

// ============================================================
// KOMPONEN: CAMPAIGN CARD
// ============================================================
const CampaignCard = ({ camp, isBookmarked, onToggleBookmark, onClick }) => {
  const tagStyle = TAG_COLORS[camp.tag] || TAG_COLORS.Ekonomi;

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white dark:bg-slate-900 rounded-[1.5rem] shadow-sm border border-gray-100 dark:border-slate-800 hover:shadow-xl hover:shadow-emerald-900/10 transition-all duration-300 overflow-hidden flex flex-col h-full"
    >
      <div className="h-40 w-full relative overflow-hidden bg-gray-100 dark:bg-slate-800 cursor-pointer" onClick={() => onClick(camp)}>
        <img src={camp.image} alt={camp.title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white dark:bg-slate-900/95 backdrop-blur-sm px-2.5 py-1 rounded-lg shadow-sm border border-white/20 dark:border-slate-700/50">
          <span className={`${tagStyle.text} flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide`}>
            {tagStyle.icon} {camp.tag}
          </span>
        </div>
        <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-gray-900/70 backdrop-blur-sm px-2.5 py-1 rounded-lg text-white">
          <Calendar size={12} className="text-amber-400" />
          <span className="text-[10px] font-semibold">{camp.daysLeft} hari</span>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex flex-col gap-1 mb-3">
          {camp.verified && (
            <div className="flex items-center gap-1.5">
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-800">
                <BadgeCheck size={12} className="text-emerald-500" /> Terverifikasi
              </span>
              <span className="text-[10px] text-gray-500 dark:text-slate-400 font-semibold truncate flex-1 flex items-center gap-1">
                {camp.yayasan}
              </span>
            </div>
          )}
        </div>
        <h4 onClick={() => onClick(camp)} className="font-bold text-[15px] text-gray-900 dark:text-slate-100 leading-snug mb-1 line-clamp-2 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors cursor-pointer">{camp.title}</h4>
        <div className="mt-auto">
          <div className="w-full bg-gray-100 dark:bg-slate-800 rounded-full h-2 mb-3 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-emerald-500"
              initial={{ width: 0 }}
              animate={{ width: `${camp.percent}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
          <div className="flex justify-between items-end mb-4">
            <div>
              <p className="text-[10px] text-gray-500 dark:text-slate-400 font-medium uppercase tracking-wider mb-0.5">Terkumpul</p>
              <p className="font-bold text-emerald-800 dark:text-emerald-400 text-sm">{camp.collected} ETH</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-gray-800 dark:text-slate-200">{camp.percent}%</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => onClick(camp)} className="flex-1 bg-emerald-700 dark:bg-emerald-600 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-800 dark:hover:bg-emerald-700 transition-all shadow-md shadow-emerald-900/20 flex items-center justify-center gap-2">
              <Heart size={16} /> Donasi
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onToggleBookmark(camp.id); }}
              className={`p-2.5 rounded-xl border-2 transition-all flex items-center justify-center ${isBookmarked ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/30 text-[#F5A623]' : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-400 dark:text-slate-500 hover:border-gray-300 dark:hover:border-slate-600'}`}
            >
              <Bookmark size={18} className={isBookmarked ? "fill-amber-400 text-amber-400" : ""} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================================
// VIEW 1: BERANDA
// ============================================================
const BerandaView = ({ campaigns, onCampaignClick, setActiveMenu, bookmarkedCampaigns, onToggleBookmark, prayers, onAamiin }) => {
  const mendesakCampaigns = campaigns.slice(0, 4);
  const categories = [
    { name: "Kesehatan", icon: <HeartHandshake size={24} />, color: "text-rose-500 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-900/30", borderColor: "border-rose-200 dark:border-rose-800" },
    { name: "Bencana", icon: <Wind size={24} />, color: "text-[#F5A623] dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/30", borderColor: "border-amber-200 dark:border-amber-800" },
    { name: "Pendidikan", icon: <BookOpen size={24} />, color: "text-blue-500 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/30", borderColor: "border-blue-200 dark:border-blue-800" },
    { name: "Ekonomi", icon: <Droplet size={24} />, color: "text-emerald-500 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/30", borderColor: "border-emerald-200 dark:border-emerald-800" }
  ];
  const [favCategory, setFavCategory] = useState("Kesehatan");
  const favCampaigns = campaigns.filter(c => c.tag === favCategory).slice(0, 3);

  return (
    <div className="space-y-2 pb-5">
      <ImageCarousel />
      <section>
        <div className="flex justify-between items-end mb-4">
          <div>
            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-slate-100 flex items-center gap-2"><AlertCircle className="text-[#F5A623]" /> Donasi Mendesak</h3>
            <p className="text-gray-500 dark:text-slate-400 mt-1">Pilih program yang sangat membutuhkan bantuan saat ini.</p>
          </div>
          <button onClick={() => setActiveMenu('Program Donasi')} className="text-emerald-700 dark:text-emerald-400 font-bold hover:text-emerald-800 dark:hover:text-emerald-300 flex items-center gap-1 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg transition-colors">
            Lihat Semua <ChevronRight size={16} />
          </button>
        </div>
        <div className="flex gap-6 overflow-x-auto pb-4 snap-x hide-scrollbar">
          {mendesakCampaigns.map((camp) => (
            <div key={camp.id} className="min-w-[280px] w-[280px] snap-start shrink-0">
              <CampaignCard camp={camp} isBookmarked={bookmarkedCampaigns.includes(camp.id)} onToggleBookmark={onToggleBookmark} onClick={onCampaignClick} />
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-slate-800 shadow-sm">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-extrabold text-gray-900 dark:text-slate-100 mb-2">Pilih Kategori Favoritmu</h3>
          <p className="text-gray-500 dark:text-slate-400">Salurkan kebaikan sesuai dengan isu yang paling Anda pedulikan.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {categories.map(cat => (
            <button
              key={cat.name}
              onClick={() => setFavCategory(cat.name)}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl w-28 transition-all duration-300 ${favCategory === cat.name ? `${cat.bg} border-2 ${cat.borderColor} shadow-md transform -translate-y-1` : 'bg-gray-50 dark:bg-slate-800/50 border-2 border-transparent hover:bg-gray-100 dark:hover:bg-slate-800 grayscale hover:grayscale-0'}`}
            >
              <div className={`${favCategory === cat.name ? cat.color : 'text-gray-400 dark:text-slate-500'}`}>{cat.icon}</div>
              <span className={`text-xs font-bold ${favCategory === cat.name ? 'text-gray-900 dark:text-slate-100' : 'text-gray-500 dark:text-slate-400'}`}>{cat.name}</span>
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {favCampaigns.map((camp) => (
            <CampaignCard key={camp.id} camp={camp} isBookmarked={bookmarkedCampaigns.includes(camp.id)} onToggleBookmark={onToggleBookmark} onClick={onCampaignClick} />
          ))}
        </div>
      </section>

      <section>
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-2xl font-extrabold text-gray-900 dark:text-slate-100 flex items-center gap-2"><MessageCircleHeart className="text-emerald-500" /> Doa-doa #OrangBaik</h3>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar">
          {prayers.map(doa => (
            <div key={doa.id} className="min-w-[300px] bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm snap-start shrink-0">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center"><User size={14} className="text-gray-400 dark:text-slate-500" /></div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-slate-100">{doa.name}</p>
                    <p className="text-[10px] text-gray-400 dark:text-slate-500">{doa.time}</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-700 dark:text-slate-300 italic mb-4">"{doa.text}"</p>
              <div className="flex items-center justify-between pt-3 border-t border-gray-50 dark:border-slate-800">
                <span className="text-xs text-gray-500 dark:text-slate-400 font-medium">{doa.aamiin} orang mengaminkan</span>
                <button onClick={() => onAamiin(doa.id)} className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-full text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors active:scale-95">
                  <Heart size={12} /> Aamiin
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

// ============================================================
// VIEW 2: GALANG DANA (DAFTAR PROGRAM)
// ============================================================
const GalangDanaView = ({ campaigns, searchTerm, setSearchTerm, filterTag, setFilterTag, onCampaignClick, bookmarkedCampaigns, onToggleBookmark }) => {
  const filteredCampaigns = campaigns.filter((c) => {
    const matchSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchTag = filterTag === 'Semua' ||
      c.tag === filterTag ||
      (filterTag === 'Bencana Alam' && (c.tag === 'Bencana' || c.tag === 'Bencana Alam'));
    return matchSearch && matchTag;
  });
  const kategoriList = ['Semua', 'Kesehatan', 'Bencana Alam', 'Pendidikan', 'Ekonomi'];

  return (
    <div className="space-y-8 pb-10">
      <div className="w-full space-y-4">
        <div className="w-full relative">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Cari program donasi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all shadow-sm dark:text-slate-100"
          />
        </div>
        <div className="flex flex-wrap gap-2.5 pt-1">
          {kategoriList.map((cat) => {
            const isActive = filterTag === cat;
            return (
              <button
                key={cat}
                onClick={() => setFilterTag(cat)}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${isActive ? 'bg-emerald-700 dark:bg-emerald-600 text-white shadow-md shadow-emerald-900/10' : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-slate-400 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800/50 hover:text-gray-900 dark:hover:text-slate-100'}`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm">
        <h2 className="text-xl font-extrabold mb-6 text-gray-900 dark:text-slate-100 text-center">3 Langkah Mudah Berdonasi</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-xl mb-3"><Wallet size={20} /></div>
            <h4 className="font-bold text-gray-900 dark:text-slate-100 mb-1">(1) Hubungkan Wallet</h4>
            <p className="text-xs text-gray-500 dark:text-slate-400">Gunakan MetaMask untuk memastikan transaksi tercatat transparan.</p>
          </div>
          <div className="text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-xl mb-3"><HeartHandshake size={20} /></div>
            <h4 className="font-bold text-gray-900 dark:text-slate-100 mb-1">(2) Pilih Program</h4>
            <p className="text-xs text-gray-500 dark:text-slate-400">Eksplorasi berbagai program kemanusiaan yang terverifikasi.</p>
          </div>
          <div className="text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-xl mb-3"><ShieldCheck size={20} /></div>
            <h4 className="font-bold text-gray-900 dark:text-slate-100 mb-1">(3) Konfirmasi</h4>
            <p className="text-xs text-gray-500 dark:text-slate-400">Sumbangkan dana Anda secara instan dengan sistem otomatis.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
        {filteredCampaigns.map((camp) => (
          <CampaignCard key={camp.id} camp={camp} isBookmarked={bookmarkedCampaigns.includes(camp.id)} onToggleBookmark={onToggleBookmark} onClick={onCampaignClick} />
        ))}
      </div>

      {filteredCampaigns.length === 0 && (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-800">
          <Search size={48} className="text-gray-200 dark:text-slate-700 mx-auto mb-4" />
          <p className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-2">Tidak ada program ditemukan</p>
          <p className="text-gray-500 dark:text-slate-400">Coba ubah kata kunci pencarian atau pilih filter kategori lainnya.</p>
        </div>
      )}
    </div>
  );
};

// ============================================================
// VIEW 3: AKTIVITAS SAYA
// ============================================================
const AktivitasView = ({ activities }) => {
  return (
    <div className="w-full">
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100">Histori Perjalanan Kebaikan Anda</h3>
          <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-full">{activities.length} Aktivitas Tercatat</span>
        </div>
        <div className="divide-y divide-gray-50 dark:divide-slate-800">
          {activities.length === 0 ? (
            <div className="p-10 text-center text-gray-500 dark:text-slate-400">Belum ada aktivitas.</div>
          ) : (
            activities.map((act) => (
              <div key={act.id} className="p-6 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition flex gap-4 items-start">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${act.type === 'donasi' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400' : act.type === 'doa' ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400' : 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'}`}>
                  {act.type === 'donasi' && <Coins size={20} />}
                  {act.type === 'doa' && <MessageCircleHeart size={20} />}
                  {act.type === 'pengajuan' && <FileText size={20} />}
                </div>
                <div className="flex-1">
                  <p className="text-gray-900 dark:text-slate-100 font-medium leading-relaxed">{act.text}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs text-gray-400 dark:text-slate-500 font-semibold">{act.date}</span>
                    {act.IDTrx && <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded flex items-center gap-1"><Shield size={10} /> ID Trx: {act.IDTrx}</span>}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================
// VIEW 4: PROFIL SAYA
// ============================================================
const ProfilView = ({ userProfile, onEditProfile, bookmarkedCampaigns, myDonatedCampaigns, userPrayers, campaigns, onCampaignClick, onToggleBookmark }) => {
  const [activeTab, setActiveTab] = useState('kontribusi');
  const bookmarkedCamps = campaigns.filter(c => bookmarkedCampaigns.includes(c.id));
  const donatedCamps = campaigns.filter(c => myDonatedCampaigns.includes(c.id));

  return (
    <div className="w-full space-y-5">
      <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-gray-100 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="h-30 bg-emerald-800 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_white_10%,_transparent_20%)] bg-[length:20px_20px]"></div>
          <div className="absolute right-0 top-0 w-64 h-64 bg-amber-400 rounded-full blur-[80px] opacity-20 -translate-y-1/2 translate-x-1/3"></div>
        </div>
        <div className="px-10 pb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6 -mt-16 relative z-10">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
            <div className="w-32 h-32 bg-white dark:bg-slate-900 p-1.5 rounded-full shadow-lg relative group">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-800 overflow-hidden">
                {userProfile.avatar ? (
                  <img src={userProfile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><User size={48} className="text-gray-400 dark:text-slate-500" /></div>
                )}
              </div>
              <button onClick={onEditProfile} className="absolute bottom-0 right-0 w-8 h-8 bg-amber-400 text-amber-900 rounded-full flex items-center justify-center shadow-md hover:bg-amber-500 transition-colors">
                <Edit3 size={14} />
              </button>
            </div>
            <div className="pb-1 md:translate-y-2.5 transition-transform">
              <h3 className="text-3xl font-extrabold text-gray-900 dark:text-slate-100">{userProfile.name}</h3>
              <p className="text-gray-500 dark:text-slate-400 font-medium">{userProfile.email}</p>
            </div>
          </div>
          <div className="flex justify-center pb-3">
            <button onClick={onEditProfile} className="bg-emerald-800 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-900 transition-colors flex items-center gap-2 shadow-md shadow-emerald-900/20">
              Edit Profil
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-100 dark:border-slate-800 shadow-sm text-center transition-all">
          <div className="w-11 h-11 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center mx-auto mb-3">
            <CircleDollarSign size={22} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-gray-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-1">Total Didonasikan</p>
          <p className="text-xl font-extrabold text-gray-900 dark:text-slate-100">0.20 ETH</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-100 dark:border-slate-800 shadow-sm text-center transition-all">
          <div className="w-11 h-11 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Megaphone size={22} className="text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-gray-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-1">Program Didukung</p>
          <p className="text-xl font-extrabold text-gray-900 dark:text-slate-100">4</p>
          <p className="text-xs font-medium text-gray-400 dark:text-slate-500 mt-0.5">Program Berbeda</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-100 dark:border-slate-800 shadow-sm text-center transition-all">
          <div className="w-11 h-11 bg-amber-50 dark:bg-amber-900/30 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Award size={22} className="text-[#F5A623] dark:text-amber-400" />
          </div>
          <p className="text-gray-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-1">Peringkat Donatur</p>
          <p className="text-xl font-extrabold text-gray-900 dark:text-slate-100">#42</p>
          <p className="text-xs font-medium text-gray-400 dark:text-slate-500 mt-0.5">dari 1.250 Donatur</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden p-6">
        <div className="flex border-b border-gray-100 dark:border-slate-800 mb-6 gap-8 px-4">
          <button onClick={() => setActiveTab('kontribusi')} className={`pb-4 text-sm font-bold border-b-4 transition-colors ${activeTab === 'kontribusi' ? 'border-emerald-600 text-emerald-800 dark:text-emerald-400' : 'border-transparent text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-300'}`}>
            Kontribusi Donasi ({donatedCamps.length})
          </button>
          <button onClick={() => setActiveTab('favorit')} className={`pb-4 text-sm font-bold border-b-4 transition-colors ${activeTab === 'favorit' ? 'border-emerald-600 text-emerald-800 dark:text-emerald-400' : 'border-transparent text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-300'}`}>
            Program Favorit ({bookmarkedCamps.length})
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {activeTab === 'kontribusi' && (donatedCamps.length > 0 ? donatedCamps.map(camp => (
            <CampaignCard key={camp.id} camp={camp} isBookmarked={bookmarkedCampaigns.includes(camp.id)} onToggleBookmark={onToggleBookmark} onClick={onCampaignClick} />
          )) : <div className="col-span-full py-10 text-center text-gray-400 dark:text-slate-500 font-medium">Belum ada donasi yang diberikan.</div>)}
          {activeTab === 'favorit' && (bookmarkedCamps.length > 0 ? bookmarkedCamps.map(camp => (
            <CampaignCard key={camp.id} camp={camp} isBookmarked={bookmarkedCampaigns.includes(camp.id)} onToggleBookmark={onToggleBookmark} onClick={onCampaignClick} />
          )) : <div className="col-span-full py-10 text-center text-gray-400 dark:text-slate-500 font-medium">Belum ada program yang disimpan.</div>)}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm p-8">
        <h3 className="text-xl font-extrabold text-gray-900 dark:text-slate-100 mb-6 flex items-center gap-2"><MessageCircleHeart className="text-[#F5A623]" /> Jejak Kebaikan & Doa</h3>
        <div className="space-y-4">
          {userPrayers.map((doa, i) => (
            <div key={i} className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-100 dark:border-slate-800">
              <p className="text-gray-800 dark:text-slate-200 font-medium italic mb-2">"{doa.text}"</p>
              <p className="text-xs text-gray-500 dark:text-slate-400 font-semibold">Dikirimkan pada program: <span className="text-emerald-700 dark:text-emerald-400">{doa.campaign}</span></p>
            </div>
          ))}
          {userPrayers.length === 0 && <p className="text-gray-400 dark:text-slate-500 italic">Belum ada doa atau catatan yang Anda tinggalkan.</p>}
        </div>
      </div>
    </div>
  );
};

const DetailCampaignView = ({ camp, onBack, onDonateSuccess }) => {
  const [activeTab, setActiveTab] = useState('about');
  const [modalState, setModalState] = useState(null); // 'donate' | 'success' | null
  const [alertMsg, setAlertMsg] = useState(null);
  const context = useContext(PhilanthropyContext);
  const [donateAmount, setDonateAmount] = useState('');
  const [doaText, setDoaText] = useState('');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  const handleDonateChange = (e) => {
    const val = e.target.value;
    if (val === '' || /^\d*\.?\d*$/.test(val)) setDonateAmount(val);
  };

  const isBalanceInsufficient = donateAmount && parseFloat(donateAmount) > userBalance;

  const handleProcessDonation = async () => {
    setModalState('loading');
    
    try {
      if (!window.ethereum) {
        throw new Error("MetaMask tidak terdeteksi. Silakan install MetaMask.");
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // 1 & 2. Interaksi Smart Contract & MetaMask
      // Mengirim ETH ke alamat Smart Contract atau Campaign Wallet
      const tx = await signer.sendTransaction({
        to: import.meta.env.VITE_DONATION_CONTRACT_ADDRESS || "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
        value: ethers.parseEther(donateAmount.toString())
      });

      // Menunggu transaksi masuk block (mining)
      await tx.wait();

      // 3. Sinkronisasi Backend ke Laravel
      await api.post('/api/v1/donations', {
        programId: camp.id,
        donateAmount: donateAmount,
        txHash: tx.hash,
        doa: doaText || ''
      });

      // 4. Update State UI
      setModalState('success');
      onAddActivity({
        id: Date.now(),
        type: 'donasi',
        text: `Anda baru saja berdonasi pada program ${camp.title} sebesar ETH ${donateAmount}`,
        date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
        IDTrx: tx.hash
      });
      if (doaText.trim()) {
        onAddActivity({
          id: Date.now() + 1,
          type: 'doa',
          text: `Anda mengirimkan doa: "${doaText}" pada program ${camp.title}`,
          date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
        }, true);
      }
    } catch (error) {
      console.error(error);
      let errorMsg = "Transaksi gagal diproses.";
      
      // Penanganan Error (User denied, blockchain error, API error)
      if (error.code === 4001 || error.message?.includes("User denied transaction signature") || error.message?.includes("user rejected")) {
        errorMsg = "Transaksi dibatalkan oleh pengguna (User denied transaction signature).";
      } else if (error.message?.includes("insufficient funds")) {
        errorMsg = "Saldo tidak mencukupi untuk melakukan transaksi ini.";
      } else if (error.response) {
        errorMsg = "Transaksi di blockchain berhasil, namun gagal sinkronisasi ke server (API error).";
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      setAlertMsg(errorMsg);
      setModalState(null); // Tutup modal jika gagal agar user bisa mengulang
    }
  };

  return (
    <div className="fixed inset-0 bg-[#F9FAFB] dark:bg-slate-950 z-50 flex flex-col h-screen">
      <div className="flex-none px-10 py-6 border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-50 dark:bg-slate-800/50 text-gray-500 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors">
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-slate-100 truncate max-w-xl">{camp.title}</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"><ShieldCheck size={14} /> {camp.yayasan}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative max-w-[1400px] mx-auto w-full">
        <div className="flex-1 overflow-y-auto p-10 hide-scrollbar">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="rounded-[2.5rem] overflow-hidden shadow-md">
              <img src={camp.image} alt={camp.title} className="w-full h-[450px] object-cover" />
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-10 shadow-sm border border-gray-100 dark:border-slate-800">
              <div className="flex gap-2 mb-4">
                <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-emerald-200 dark:border-emerald-800">
                  <BadgeCheck size={16} className="text-emerald-600 dark:text-emerald-400" /> Terverifikasi oleh {VERIFIED_BY_MAPPING[camp.tag]}
                </span>
              </div>
              <h1 className="text-4xl font-extrabold text-gray-900 dark:text-slate-100 mb-8 leading-tight">{camp.title}</h1>
              <div className="prose prose-lg prose-emerald dark:prose-invert max-w-none text-gray-600 dark:text-slate-400 leading-relaxed">
                <p>{camp.desc}</p>
                <p>Seluruh dana yang terkumpul akan disalurkan secara langsung melalui sistem otomatis kepada penerima manfaat tanpa perantara, memastikan 100% transparansi dan efisiensi. Laporan perkembangan program akan diunggah secara berkala dan diverifikasi oleh institusi terkait.</p>
                <h3 className="dark:text-slate-200">Detail Institusi Pembina</h3>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-[500px] bg-white dark:bg-slate-900 border-l border-gray-200 dark:border-slate-800 overflow-y-auto hide-scrollbar flex-none">
          <div className="p-8">
            <div className="bg-emerald-700 dark:bg-emerald-800 rounded-[2rem] p-8 text-white mb-8 relative overflow-hidden shadow-xl shadow-emerald-900/20">
              <div className="absolute right-0 top-0 w-32 h-32 bg-amber-400 rounded-full blur-[50px] opacity-20 -translate-y-1/2 translate-x-1/2"></div>
              <h3 className="text-xl font-bold mb-6 text-emerald-50">Target Pendanaan</h3>
              <div className="mb-6">
                <div className="flex justify-between items-end mb-2">
                  <p className="text-4xl font-extrabold text-white">{camp.collected} ETH</p>
                </div>
                <p className="text-sm text-emerald-50 font-medium mb-4">terkumpul dari <span className="font-bold text-white">{camp.target} ETH</span></p>
                <div className="w-full bg-emerald-950 rounded-full h-3 mb-3 border border-emerald-800">
                  <div className="bg-amber-400 h-full rounded-full shadow-[0_0_10px_rgba(251,191,36,0.5)] relative" style={{ width: `${camp.percent}%` }}>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white dark:bg-slate-900 rounded-full border-2 border-amber-400"></div>
                  </div>
                </div>
                <div className="flex justify-between text-sm font-semibold mt-4">
                  <div className="flex flex-col"><span className="text-emerald-50 text-xs font-normal">Donatur</span><span>{camp.donors} Orang</span></div>
                  <div className="flex flex-col"><span className="text-emerald-50 text-xs font-normal">Penerima Manfaat</span><span>{camp.targetBeneficiaries} Target</span></div>
                  <div className="flex flex-col text-right"><span className="text-emerald-50 text-xs font-normal">Sisa Waktu</span><span>{camp.daysLeft} Hari</span></div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100">Formulir Donasi</h3>
              <div className="bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-gray-500 dark:text-slate-400">
                  <Wallet size={16} className="text-emerald-600 dark:text-emerald-400" /> Saldo MetaMask Anda
                </div>
                <span className="text-base font-extrabold text-gray-900 dark:text-slate-100">{userBalance} ETH</span>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-2 block">Nominal Donasi (Rupiah)</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-bold text-xs">ETH</div>
                  <input
                    type="text"
                    placeholder="50000"
                    value={donateAmount}
                    onChange={handleDonateChange}
                    className={`w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-slate-800/50 border-2 rounded-2xl text-lg font-extrabold focus:outline-none focus:bg-white dark:focus:bg-slate-900 transition-all text-gray-900 dark:text-slate-100 ${isBalanceInsufficient ? 'border-red-400 focus:border-red-500 dark:border-red-500/50 dark:focus:border-red-500' : 'border-gray-100 dark:border-slate-800 focus:border-emerald-500'}`}
                  />
                </div>
                {isBalanceInsufficient && (
                  <p className="text-red-500 dark:text-red-400 text-xs font-bold mt-2 flex items-center gap-1"><AlertCircle size={12} /> Saldo Anda tidak cukup untuk donasi ini.</p>
                )}
              </div>
              <div className="grid grid-cols-4 gap-2">
                {['0.01', '0.05', '0.1', '0.5'].map(val => (
                  <button key={val} onClick={() => setDonateAmount(val)} className={`py-2.5 rounded-xl text-sm font-bold transition ${donateAmount === val ? 'bg-emerald-600 text-white shadow-md' : 'bg-gray-50 dark:bg-slate-800/50 text-gray-600 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-700 dark:hover:text-emerald-400 border border-gray-100 dark:border-slate-800'}`}>
                    {val}
                  </button>
                ))}
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-2 mt-4 block">Sematkan Doa (Opsional)</label>
                <textarea
                  placeholder="Tulis doa atau dukungan Anda..."
                  value={doaText}
                  onChange={(e) => setDoaText(e.target.value)}
                  rows="4"
                  className="w-full px-5 py-4 bg-gray-50 dark:bg-slate-800/50 border-2 border-gray-100 dark:border-slate-800 rounded-2xl text-sm font-medium focus:outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 transition-all resize-none text-gray-800 dark:text-slate-200"
                ></textarea>
              </div>
              <button
                onClick={() => setModalState('confirm')}
                disabled={!donateAmount || isBalanceInsufficient}
                className={`w-full py-4 rounded-2xl text-lg font-extrabold transition-all flex items-center justify-center gap-2 shadow-xl ${!donateAmount || isBalanceInsufficient ? 'bg-gray-200 dark:bg-slate-700 text-gray-400 dark:text-slate-500 cursor-not-allowed shadow-none' : 'bg-amber-400 text-amber-950 hover:bg-amber-500 shadow-amber-400/30'}`}
              >
                <Heart size={20} className={donateAmount && !isBalanceInsufficient ? "fill-amber-950" : ""} /> Lanjutkan Donasi
              </button>
              <p className="text-[11px] text-gray-400 dark:text-slate-500 text-center font-medium flex items-center justify-center gap-1">
                <ShieldCheck size={14} /> Transaksi diamankan oleh Sistem Otomatis
              </p>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {modalState && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 max-w-md w-full shadow-2xl relative">
              {modalState === 'confirm' && (
                <div className="text-center">
                  <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-6"><AlertCircle size={40} /></div>
                  <h3 className="text-2xl font-extrabold text-gray-900 dark:text-slate-100 mb-2">Konfirmasi Donasi</h3>
                  <p className="text-gray-600 dark:text-slate-400 mb-8">Benarkah Anda akan berdonasi di program ini dengan nominal <span className="font-bold text-emerald-700 dark:text-emerald-400 text-lg">{donateAmount}</span>?</p>
                  <div className="flex gap-3">
                    <button onClick={() => setModalState(null)} className="flex-1 py-3.5 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-slate-700 transition">Batal</button>
                    <button onClick={handleProcessDonation} className="flex-1 py-3.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200 dark:shadow-none transition">Ya, Kirim Donasi</button>
                  </div>
                </div>
              )}
              {modalState === 'loading' && (
                <div className="text-center py-8">
                  <Loader2 size={60} className="animate-spin text-emerald-500 dark:text-emerald-400 mx-auto mb-6" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-2">Memproses Transaksi</h3>
                  <p className="text-gray-500 dark:text-slate-400">Menghubungkan ke sistem, mohon tunggu...</p>
                </div>
              )}
              {modalState === 'success' && (
                <div className="text-center py-6">
                  <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6"><Check size={50} strokeWidth={3} /></div>
                  <h3 className="text-3xl font-extrabold text-gray-900 dark:text-slate-100 mb-3">Donasi Anda Berhasil</h3>
                  <p className="text-gray-500 dark:text-slate-400 mb-8">Terima kasih atas kebaikan Anda. Transaksi telah tercatat secara permanen di sistem transparan.</p>
                  <button onClick={() => { setModalState(null); onBack(); }} className="w-full py-4 bg-gray-900 dark:bg-slate-800 text-white rounded-xl font-bold hover:bg-emerald-600 dark:hover:bg-emerald-700 transition shadow-lg">Tutup & Kembali</button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL GLOBAL ALERT CAMPAIGN DETAIL */}
      <AnimatePresence>
        {alertMsg && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden text-center">
              <div className="p-6">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                  ℹ️
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-2">Informasi</h3>
                <p className="text-gray-500 dark:text-slate-400 text-sm">{alertMsg}</p>
              </div>
              <button onClick={() => setAlertMsg(null)} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold transition">Tutup</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================================
// KOMPONEN UTAMA: DONATUR PAGE (SHELL / LAYOUT)
// ============================================================
const DonaturPage = ({ onLogoutClick = () => {} }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [alertMsg, setAlertMsg] = useState(null);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  useEffect(() => {
    const fetchMyStatus = async () => {
      try {
        const res = await apiGetMyDocumentStatus();
        if (res?.data?.status === 'success' && res.data.data) {
          setSubmissionStatus(res.data.data.status);
        }
      } catch (err) {
        // fail silently for polling
      }
    };
    
    fetchMyStatus();
    const interval = setInterval(fetchMyStatus, 5000);
    return () => clearInterval(interval);
  }, []);
  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // === CAMPAIGNS & PRAYERS dari PhilanthropyContext (data API) ===
  const { 
    dataPengajuan = [],
    dataProgram, 
    dataDonatur, 
    walletAddress, 
    walletBalance,
    ajukanBantuan,
    catatAktivitas,
    unreadNotifs,
    markNotifsRead,
    isLoadingCampaigns, 
    campaignsError, 
    fetchCampaigns,
    riwayatAktivitasGlobal = []
  } = useContext(PhilanthropyContext) || {};

  const [isSubmittingPengajuan, setIsSubmittingPengajuan] = useState(false);

  useEffect(() => {
    if (!dataProgram || dataProgram.length === 0) {
      console.log("dataProgram is empty:", dataProgram);
    }
  }, [dataProgram]);

  // Map dataProgram (dari API) ke format yang dipakai komponen UI
  const campaigns = (dataProgram || []).map(p => ({
    id: p.id,
    title: p.judul || p.title || '',
    tag: p.kategori || p.tag || 'Ekonomi',
    percent: Math.min(((p.terkumpul || 0) / (p.targetDonasi || 1)) * 100, 100),
    verified: p.isVerified !== false,
    target: p.targetDonasi || 0,
    collected: p.terkumpul || 0,
    donors: p.penerimaTerdaftar || 0,
    targetBeneficiaries: p.targetPenerima || 0,
    daysLeft: p.sisaHari || (p.status === 'Berjalan' ? 12 : 0),
    desc: p.deskripsi || '',
    matchedBeneficiary: false,
    // Fallback gambar lokal berdasarkan kategori jika tidak ada image_url dari API
    image: p.gambar || (() => {
      const cat = (p.kategori || '').toLowerCase();
      if (cat.includes('kesehatan')) return imgHealth;
      if (cat.includes('bencana')) return imgDisaster;
      if (cat.includes('pendidikan')) return imgEducation;
      return imgSocial;
    })(),
    yayasan: p.namaYayasan || 'Yayasan Philanthropy Chain',
  }));

  // Prayers/komentar dari dataDonatur yang diembed di campaigns
  const [prayers, setPrayers] = useState([]);
  const [prayersLoaded, setPrayersLoaded] = useState(false);

  useEffect(() => {
    if (dataDonatur && dataDonatur.length > 0 && !prayersLoaded) {
      // Transform dataDonatur ke format prayers untuk UI
      const mapped = dataDonatur.slice(0, 10).map(d => ({
        id: d.id,
        name: d.nama || 'Anonim',
        time: d.waktu || 'Baru saja',
        text: d.doa || '',
        aamiin: d.aamiin || 0,
      })).filter(p => p.text);
      if (mapped.length > 0) {
        setPrayers(mapped);
        setPrayersLoaded(true);
      }
    }
  }, [dataDonatur, prayersLoaded]);
  const handleAamiin = (id) => {
    setPrayers(prev => prev.map(p => p.id === id ? { ...p, aamiin: p.aamiin + 1 } : p));
  };
  
  const [activeMenu, setActiveMenu] = useState('Beranda');
  const [bantuanStatus, setBantuanStatus] = useState('idle'); // idle, pending, verified
  const [showFormModal, setShowFormModal] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [formData, setFormData] = useState({ kategori: "Ekonomi" });
  const [fileData, setFileData] = useState({});
  const programTersedia = dataProgram ? dataProgram.filter(p => (p.kategori === formData.kategori || p.category === formData.kategori) && p.status === "Berjalan") : [];
  
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTag, setFilterTag] = useState('Semua');
  const [bookmarkedCampaigns, setBookmarkedCampaigns] = useState([1, 4]);
  const [myDonatedCampaigns, setMyDonatedCampaigns] = useState([1, 2, 6]);
  const [userProfile, setUserProfile] = useState({ name: "Budi Santoso", email: "budi.santoso@email.com", avatar: null });
  const [userPrayers, setUserPrayers] = useState([
    { text: "Sedikit rezeki semoga bisa membantu beban saudara kita di sana.", campaign: "Pembangunan Hunian Sementara Cianjur" }
  ]);
  const [myActivities, setMyActivities] = useState([
    { id: 1, type: 'donasi', text: 'Anda baru saja berdonasi pada program Pembangunan Hunian Sementara Cianjur sebesar 0.01 ETH', date: '15 Jun 2026', IDTrx: '0xabc123...456' },
  ]);

  const [selectedCampaignDetail, setSelectedCampaignDetail] = useState(null);

  const handleToggleBookmark = (id) => {
    setBookmarkedCampaigns(prev => prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]);
  };

  const handleAddActivity = (act, isPrayer = false) => {
    setMyActivities(prev => [act, ...prev]);
    if (isPrayer && selectedCampaignDetail) {
      setUserPrayers(prev => [{ text: act.text.replace(/Anda mengirimkan doa: "|".*/g, ''), campaign: selectedCampaignDetail.title }, ...prev]);
    }
  };

  const submitPengajuan = async () => {
    if (ajukanBantuan) {
      try {
        setIsSubmittingPengajuan(true);
        await ajukanBantuan({
          nama: userProfile.name,
          nik: userProfile.nik,
          ...formData
        }, fileData);
        catatAktivitas("Pengajuan Bantuan", "Anda telah mengajukan bantuan.", "Donatur");
        setBantuanStatus('pending');
        setShowFormModal(false);
        setFormStep(1);
      } catch (err) {
        setAlertMsg(err.message || 'Gagal mengirim pengajuan.');
      } finally {
        setIsSubmittingPengajuan(false);
      }
    }
  };

  const renderTopBar = (title) => (
    <header className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 mb-8 transition-colors">
      <h2 className="text-xl md:text-2xl font-black uppercase tracking-wider pl-4 text-slate-800 dark:text-white">{title}</h2>
      <div className="flex items-center gap-3 pr-2">
        <button onClick={() => { markNotifsRead && markNotifsRead(); setActiveMenu('Aktivitas Saya'); }} className="p-2.5 rounded-full bg-gray-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-100 hover:text-emerald-600 transition relative">
          <Bell size={20} />
          {unreadNotifs > 0 && (
            <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unreadNotifs}</span>
          )}
        </button>
        
        <button onClick={() => setShowEditProfile(true)} className="w-10 h-10 rounded-full border-2 border-emerald-500 overflow-hidden hover:opacity-80 transition cursor-pointer bg-slate-100 dark:bg-slate-800 shrink-0">
          {userProfile.avatar ? <img src={userProfile.avatar} className="w-full h-full object-cover" /> : <User size={24} className="mx-auto mt-1.5 text-emerald-600"/>}
        </button>
      </div>
    </header>
  );

  const renderBantuanButtonText = () => {
    if (bantuanStatus === 'pending') return 'Menunggu Verifikasi';
    if (bantuanStatus === 'verified') return 'Penerima (Terverifikasi)';
    return 'Ajukan Bantuan';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const updateProfile = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const avatarFile = e.target.avatar?.files?.[0];
    setUserProfile(prev => ({
      ...prev,
      name: fd.get('name') || prev.name,
      email: fd.get('email') || prev.email,
      avatar: avatarFile ? URL.createObjectURL(avatarFile) : prev.avatar,
    }));
    setShowEditProfile(false);
  };

  const menuItems = [
    { id: 'Beranda', label: 'Beranda', icon: <Home size={20} /> },
    { id: 'Program Donasi', label: 'Program Donasi', icon: <Megaphone size={20} /> },
    { id: 'Aktivitas Saya', label: 'Aktivitas Saya', icon: <History size={20} /> },
    { id: 'Profil', label: 'Profil', icon: <User size={20} /> },
  ];

  if (selectedCampaignDetail) {
    return <DetailCampaignView camp={selectedCampaignDetail} userBalance={1.24} onBack={() => setSelectedCampaignDetail(null)} onAddActivity={handleAddActivity} />;
  }

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif" }} className={`flex min-h-screen selection:bg-emerald-700 selection:text-white overflow-x-hidden transition-colors duration-300 ${isDarkMode ? "bg-slate-950 text-slate-100 dark" : "bg-slate-50 text-slate-900"}`}>

      {/* ===== SIDEBAR ===== */}
      <aside className="w-[260px] bg-white dark:bg-slate-900 border-r border-gray-100 dark:border-slate-800 p-6 flex flex-col fixed h-full z-40 shadow-sm">

        {/* Logo */}
        <div className="flex items-center gap-3 mb-10 mt-2 px-2">
          <img src={logo} alt="Logo" className="w-8 h-8 object-contain dark:drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
          <h1 className="text-lg font-black leading-tight">
            <span className="text-gray-900 dark:text-white">Philantrophy</span><span className="text-[#EAB308]">Chain</span>
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2">
          {menuItems.map((m) => {
            const isActive = activeMenu === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setActiveMenu(m.id)}
                className={`flex items-center gap-4 w-full px-5 py-3.5 rounded-xl transition-all font-bold text-sm ${isActive ? 'bg-emerald-700 dark:bg-emerald-600 text-white shadow-md shadow-emerald-700/20' : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800/50 hover:text-emerald-800 dark:hover:text-emerald-400'}`}
              >
                <span className={isActive ? 'text-white' : 'text-gray-400 dark:text-slate-500'}>{m.icon}</span>
                {m.label}
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="mt-auto pt-6 space-y-3">
          <button
            onClick={() => {
              if (bantuanStatus === 'verified') {
                window.location.hash = '#/penerima';
              } else if (bantuanStatus === 'idle') {
                setShowFormModal(true);
              }
            }}
            className={`flex items-center justify-center gap-2 w-full px-5 py-3.5 rounded-xl transition font-bold text-sm shadow-md ${bantuanStatus === 'pending' ? 'bg-amber-400 text-amber-950 cursor-not-allowed' : bantuanStatus === 'verified' ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/30' : bantuanStatus === 'rejected' ? 'bg-red-100 text-red-600 border border-red-200 cursor-not-allowed' : 'bg-emerald-800 dark:bg-emerald-700 text-white hover:bg-emerald-900 dark:hover:bg-emerald-800'}`}
          >
            {bantuanStatus === 'idle' && <Plus size={18} />}
            {bantuanStatus === 'pending' && <Clock size={18} />}
            {bantuanStatus === 'verified' && <CheckCircle size={18} />}
            {bantuanStatus === 'rejected' && <X size={18} />}
            {renderBantuanButtonText()}
          </button>
          <button
            onClick={onLogoutClick}
            className="flex items-center gap-3 w-full px-5 py-3.5 text-gray-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-700 dark:hover:text-red-400 rounded-xl transition font-bold text-sm"
          >
            <LogOut size={18} className="text-gray-400 dark:text-slate-500" /> Logout
          </button>
        </div>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1 ml-[260px] min-w-0 bg-slate-50 dark:bg-slate-950">
        
        {/* HEADER FLUSH TO TOP */}
        <header className="bg-white dark:bg-slate-900 shadow-sm border-b border-gray-100 dark:border-slate-800 sticky top-0 z-30 transition-colors">
          <div className="max-w-[1440px] mx-auto px-8 py-5 flex justify-between items-center w-full">
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-wider text-emerald-900 dark:text-emerald-400">
              {activeMenu}
            </h2>
            <div className="flex items-center gap-3">
              <button onClick={() => { markNotifsRead && markNotifsRead(); setActiveMenu('Aktivitas Saya'); }} className="p-2.5 rounded-full bg-gray-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-100 hover:text-emerald-600 transition relative">
                <Bell size={20} />
                {unreadNotifs > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unreadNotifs}</span>
                )}
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
              <button onClick={() => setShowEditProfile(true)} className="w-10 h-10 rounded-full border-2 border-emerald-500 overflow-hidden hover:opacity-80 transition cursor-pointer bg-slate-100 dark:bg-slate-800 shrink-0 flex items-center justify-center">
                {userProfile.avatar ? <img src={userProfile.avatar} className="w-full h-full object-cover" /> : <User size={24} className="text-emerald-600"/>}
              </button>
            </div>
          </div>
        </header>

        <div className="p-8 lg:p-12 max-w-[1440px] mx-auto space-y-8">
          
          {activeMenu === 'Beranda' && (
            <BerandaView
              campaigns={campaigns}
              onCampaignClick={setSelectedCampaignDetail}
              setActiveMenu={setActiveMenu}
              bookmarkedCampaigns={bookmarkedCampaigns}
              onToggleBookmark={handleToggleBookmark}
              prayers={prayers}
              onAamiin={handleAamiin}
            />
          )}
          {activeMenu === 'Program Donasi' && (
            <GalangDanaView
              campaigns={campaigns}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filterTag={filterTag}
              setFilterTag={setFilterTag}
              onCampaignClick={setSelectedCampaignDetail}
              bookmarkedCampaigns={bookmarkedCampaigns}
              onToggleBookmark={handleToggleBookmark}
            />
          )}
          {activeMenu === 'Aktivitas Saya' && (
            <AktivitasView activities={myActivities} />
          )}
          {activeMenu === 'Profil' && (
            <ProfilView
              userProfile={userProfile}
              onEditProfile={() => setShowEditProfile(true)}
              bookmarkedCampaigns={bookmarkedCampaigns}
              myDonatedCampaigns={myDonatedCampaigns}
              userPrayers={userPrayers}
              campaigns={campaigns}
              onCampaignClick={setSelectedCampaignDetail}
              onToggleBookmark={handleToggleBookmark}
            />
          )}
          
        </div>
      </main>

      {/* ===== MODAL: EDIT PROFIL ===== */}
      <AnimatePresence>
        {showEditProfile && (
          <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 max-w-md w-full shadow-2xl relative border border-gray-100 dark:border-slate-800">
              <button onClick={() => setShowEditProfile(false)} className="absolute top-5 right-5 text-gray-400 dark:text-slate-500 hover:text-gray-900 dark:hover:text-slate-100 bg-gray-100 dark:bg-slate-800 rounded-full p-1.5"><X size={18} /></button>
              <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-6 flex items-center gap-2">
                <Edit3 size={20} className="text-emerald-600 dark:text-emerald-400" /> Edit Profil
              </h3>
              <form onSubmit={updateProfile} className="space-y-4">
                {/* Upload Avatar */}
                <div className="flex flex-col items-center gap-3 mb-4">
                  <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-slate-800 overflow-hidden border-4 border-emerald-100 dark:border-emerald-800 relative">
                    {userProfile.avatar
                      ? <img src={userProfile.avatar} alt="avatar" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center"><User size={36} className="text-gray-400 dark:text-slate-500" /></div>
                    }
                  </div>
                  <label className="cursor-pointer bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 px-4 py-2 rounded-xl text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition flex items-center gap-2">
                    <ImagePlus size={14} /> Upload Foto Profil
                    <input name="avatar" type="file" accept="image/*" className="hidden" />
                  </label>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase mb-1.5 block">Nama Lengkap</label>
                  <input name="name" defaultValue={userProfile.name} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-emerald-600 dark:text-slate-100" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase mb-1.5 block">Email</label>
                  <input name="email" defaultValue={userProfile.email} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-emerald-600 dark:text-slate-100" />
                </div>
                <button type="submit" className="w-full py-3.5 bg-emerald-700 dark:bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-800 dark:hover:bg-emerald-700 transition shadow-lg mt-2">
                  Simpan Perubahan
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ===== MODAL AJUKAN BANTUAN (MULTI-STEP) ===== */}
      <AnimatePresence>
        {showFormModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div initial={{y: 20, opacity: 0}} animate={{y: 0, opacity: 1}} exit={{y: 20, opacity: 0}} className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 max-w-lg w-full shadow-2xl border border-gray-100 dark:border-slate-800 max-h-[90vh] overflow-y-auto hide-scrollbar">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-black text-xl text-slate-800 dark:text-white">Form Pengajuan Bantuan</h3>
                  <p className="text-xs font-bold text-emerald-600 mt-1">Langkah {formStep} dari 3</p>
                </div>
                <button onClick={() => {setShowFormModal(false); setFormStep(1);}} className="bg-gray-100 dark:bg-slate-800 p-2 rounded-full text-gray-500 hover:text-gray-800"><X size={16}/></button>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                if (formStep === 3) submitPengajuan();
                else setFormStep(formStep + 1);
              }}>
                {formStep === 1 && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 border-b pb-2">Informasi Dasar Pemohon</h4>
                    {/* Nama Lengkap */}
<div className="space-y-1.5">
  <label className="text-xs font-bold text-gray-500">Nama Lengkap</label> 
  <input 
    type="text" 
    name="nama" 
    onChange={handleInputChange} 
    placeholder="Contoh: Budi Santoso" 
    required 
    className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-700 dark:bg-slate-800 text-sm font-medium outline-none focus:border-emerald-500" 
  />
</div>

{/* NIK (Hanya Angka) */}
<div className="space-y-1.5">
  <label className="text-xs font-bold text-gray-500">NIK (16 Digit)</label>
  <input 
    type="text" 
    name="nik"
    inputMode="numeric"
    value={formData.nik || userProfile.nik || ""} 
    onChange={(e) => {
      // Memastikan hanya angka yang masuk ke state
      const val = e.target.value.replace(/[^0-9]/g, ''); 
      if (val.length <= 16) {
        setFormData({...formData, nik: val});
      }
    }}
    placeholder="Masukkan 16 digit NIK"
    required 
    maxLength="16"
    className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-700 dark:bg-slate-800 text-sm font-medium outline-none focus:border-emerald-500" 
  />
  <p className="text-[10px] text-gray-400">Pastikan NIK sesuai dengan KTP Anda</p>
</div>
                    <div className="grid grid-cols-2 gap-4">
      {/* Input Telepon (Angka saja, 10-15 Digit) */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-gray-500">Nomor Telepon</label>
        <input 
          type="tel" 
          name="telepon" 
          required 
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, ''); 
            if (val.length <= 15) setFormData({...formData, telepon: val});
          }}
          value={formData.telepon || ""}
          placeholder="0812..." 
          className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-700 dark:bg-slate-800 text-sm font-medium outline-none focus:border-emerald-500" 
        />
      </div>
                      <div className="space-y-1.5">
        <label className="text-xs font-bold text-gray-500">Tanggal Lahir</label>
        <input 
          type="date" 
          name="tglLahir" 
          required 
          onChange={handleInputChange} 
          className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-700 dark:bg-slate-800 text-sm font-medium outline-none focus:border-emerald-500" 
        />
      </div>
    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500">Tipe Pengajuan</label>
                      <select name="tipe" required onChange={(e) => setFormData({...formData, tipe: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-700 dark:bg-slate-800 text-sm font-medium outline-none focus:border-emerald-500">
                        <option value="Individu">Individu</option>
                        <option value="Kelompok">Kelompok / Organisasi</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500">Kategori Bantuan</label>
                      <select name="kategori" required value={formData.kategori} onChange={(e) => setFormData({...formData, kategori: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-700 dark:bg-slate-800 text-sm font-medium outline-none focus:border-emerald-500">
                        <option value="Ekonomi">Ekonomi</option>
                        <option value="Bencana Alam">Bencana Alam</option>
                        <option value="Kesehatan">Kesehatan</option>
                        <option value="Pendidikan">Pendidikan</option>
                      </select>
                    </div>
                    
                    <div className="flex gap-3 pt-4">
                      <button type="button" onClick={() => {setShowFormModal(false); setFormStep(1);}} className="flex-1 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition">Batal</button>
                      <button type="submit" className="flex-1 py-3 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition flex items-center justify-center gap-2">Lanjutkan <ChevronRight size={16}/></button>
                    </div>
                  </div>
                )}

                {formStep === 2 && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 border-b pb-2">Dokumen Spesifik Kategori {formData.kategori}</h4>

                    <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 p-3 rounded-xl mb-4 flex items-start gap-3">
                      <ShieldCheck className="text-emerald-500 shrink-0 mt-0.5" size={16} />
                      <p className="text-[10px] text-emerald-800 dark:text-emerald-300 leading-relaxed">
                        <span className="font-bold">Keamanan Terdesentralisasi:</span> Status kelayakan Anda akan dicatat & diverifikasi secara <b className="text-emerald-600 dark:text-emerald-400">On-Chain di Hyperledger Besu</b>. Dokumen pendukung fisik dienkripsi & disimpan secara <b className="text-emerald-600 dark:text-emerald-400">Off-Chain di jaringan Pinata (IPFS)</b>.
                      </p>
                    </div>
                    
                    {formData.kategori === 'Ekonomi' && (
                      <>
                        <input type="text" name="noSktm" required onChange={(e) => setFormData({...formData, noSktm: e.target.value})} placeholder="Nomor Surat SKTM" className="w-full p-3 rounded-xl border dark:border-slate-700 dark:bg-slate-800 text-sm" />
                        <input type="number" name="pendapatan" required onChange={(e) => setFormData({...formData, pendapatan: e.target.value})} placeholder="Total Pendapatan Bulanan (ETH)" className="w-full p-3 rounded-xl border dark:border-slate-700 dark:bg-slate-800 text-sm" />
                        <input type="number" name="tanggungan" required onChange={(e) => setFormData({...formData, tanggungan: e.target.value})} placeholder="Jumlah Tanggungan (Orang)" className="w-full p-3 rounded-xl border dark:border-slate-700 dark:bg-slate-800 text-sm" />
                        <div className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800 p-4 rounded-xl space-y-3 mt-4">
                          <p className="text-xs font-bold text-emerald-800 dark:text-emerald-400">Upload Dokumen Pendukung</p>
                          <label className="block text-[10px] text-gray-500 font-bold uppercase">Foto KTP Pemohon</label>
                          <input type="file" name="ktp" onChange={(e) => setFileData({...fileData, ktp: e.target.files[0]})} required className="w-full text-xs" />
                          <label className="block text-[10px] text-gray-500 font-bold uppercase mt-2">Surat SKTM Asli</label>
                          <input type="file" name="sktm" onChange={(e) => setFileData({...fileData, sktm: e.target.files[0]})} required className="w-full text-xs" />
                          <label className="block text-[10px] text-gray-500 font-bold uppercase mt-2">Slip Gaji / Surat Pernyataan Pendapatan</label>
                          <input type="file" name="slip_gaji" onChange={(e) => setFileData({...fileData, slip_gaji: e.target.files[0]})} required className="w-full text-xs" />
                        </div>
                      </>
                    )}
                    {formData.kategori === 'Bencana Alam' && (
                      <>
                        <input type="number" name="kerugian" required onChange={(e) => setFormData({...formData, kerugian: e.target.value})} placeholder="Estimasi Kerugian Material (ETH)" className="w-full p-3 rounded-xl border dark:border-slate-700 dark:bg-slate-800 text-sm" />
                        <input type="text" name="koordinat" required onChange={(e) => setFormData({...formData, koordinat: e.target.value})} placeholder="Alamat / Koordinat Lokasi" className="w-full p-3 rounded-xl border dark:border-slate-700 dark:bg-slate-800 text-sm" />
                        <input type="date" name="tglBencana" required onChange={(e) => setFormData({...formData, tglBencana: e.target.value})} className="w-full p-3 rounded-xl border dark:border-slate-700 dark:bg-slate-800 text-sm text-gray-500" />
                        <div className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800 p-4 rounded-xl space-y-3 mt-4">
                          <p className="text-xs font-bold text-emerald-800 dark:text-emerald-400">Upload Bukti Bencana</p>
                          <label className="block text-[10px] text-gray-500 font-bold uppercase">Foto Kerusakan Radius</label>
                          <input type="file" name="foto_kerusakan" onChange={(e) => setFileData({...fileData, foto_kerusakan: e.target.files[0]})} required className="w-full text-xs" />
                          <label className="block text-[10px] text-gray-500 font-bold uppercase mt-2">Foto Bukti Fisik / Korban</label>
                          <input type="file" name="bukti_fisik" onChange={(e) => setFileData({...fileData, bukti_fisik: e.target.files[0]})} required className="w-full text-xs" />
                          <label className="block text-[10px] text-gray-500 font-bold uppercase mt-2">Surat Keterangan Bencana Desa</label>
                          <input type="file" name="suket_bencana" onChange={(e) => setFileData({...fileData, suket_bencana: e.target.files[0]})} required className="w-full text-xs" />
                        </div>
                      </>
                    )}
                    {formData.kategori === 'Kesehatan' && (
                      <>
                        <input type="text" name="namaRs" required onChange={(e) => setFormData({...formData, namaRs: e.target.value})} placeholder="Nama Rumah Sakit" className="w-full p-3 rounded-xl border dark:border-slate-700 dark:bg-slate-800 text-sm" />
                        <input type="text" name="noRujukan" required onChange={(e) => setFormData({...formData, noRujukan: e.target.value})} placeholder="Nomor Surat Rujukan" className="w-full p-3 rounded-xl border dark:border-slate-700 dark:bg-slate-800 text-sm" />
                        <input type="number" name="biayaMedis" required onChange={(e) => setFormData({...formData, biayaMedis: e.target.value})} placeholder="Total Biaya Medis Dibutuhkan (ETH)" className="w-full p-3 rounded-xl border dark:border-slate-700 dark:bg-slate-800 text-sm" />
                        <div className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800 p-4 rounded-xl space-y-3 mt-4">
                          <p className="text-xs font-bold text-emerald-800 dark:text-emerald-400">Upload Rekam Medis</p>
                          <label className="block text-[10px] text-gray-500 font-bold uppercase">Foto Rekam Medis</label>
                          <input type="file" name="rekam_medis" onChange={(e) => setFileData({...fileData, rekam_medis: e.target.files[0]})} required className="w-full text-xs" />
                          <label className="block text-[10px] text-gray-500 font-bold uppercase mt-2">Surat Rujukan Dokter/RS</label>
                          <input type="file" name="rujukan" onChange={(e) => setFileData({...fileData, rujukan: e.target.files[0]})} required className="w-full text-xs" />
                          <label className="block text-[10px] text-gray-500 font-bold uppercase mt-2">Nota Estimasi Biaya RS</label>
                          <input type="file" name="nota_biaya" onChange={(e) => setFileData({...fileData, nota_biaya: e.target.files[0]})} required className="w-full text-xs" />
                        </div>
                      </>
                    )}
                    {formData.kategori === 'Pendidikan' && (
                      <>
                        <input type="text" name="kampus" required onChange={(e) => setFormData({...formData, kampus: e.target.value})} placeholder="Nama Institusi / Universitas / Sekolah" className="w-full p-3 rounded-xl border dark:border-slate-700 dark:bg-slate-800 text-sm" />
                        <input type="number" name="nim" required onChange={(e) => setFormData({...formData, nim: e.target.value})} placeholder="NIM / NISN Pemohon" className="w-full p-3 rounded-xl border dark:border-slate-700 dark:bg-slate-800 text-sm" />
                        <input type="number" name="tunggakan" required onChange={(e) => setFormData({...formData, tunggakan: e.target.value})} placeholder="Nominal Tunggakan SPP/UKT (ETH)" className="w-full p-3 rounded-xl border dark:border-slate-700 dark:bg-slate-800 text-sm" />
                        <div className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800 p-4 rounded-xl space-y-3 mt-4">
                          <p className="text-xs font-bold text-emerald-800 dark:text-emerald-400">Upload Bukti Pendidikan</p>
                          <label className="block text-[10px] text-gray-500 font-bold uppercase">Surat Tagihan/Tunggakan Resmi</label>
                          <input type="file" name="tagihan" onChange={(e) => setFileData({...fileData, tagihan: e.target.files[0]})} required className="w-full text-xs" />
                          <label className="block text-[10px] text-gray-500 font-bold uppercase mt-2">KHS / Raport Terakhir</label>
                          <input type="file" name="khs" onChange={(e) => setFileData({...fileData, khs: e.target.files[0]})} required className="w-full text-xs" />
                        </div>
                      </>
                    )}

                    <div className="flex gap-3 pt-4">
                      <button type="button" onClick={() => setFormStep(1)} className="flex-1 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition">Kembali</button>
                      <button type="submit" className="flex-1 py-3 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition flex items-center justify-center gap-2">Lanjutkan <ChevronRight size={16}/></button>
                    </div>
                  </div>
                )}

                {formStep === 3 && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 border-b pb-2">Pilih Program Terkait</h4>
                    <p className="text-xs text-gray-500 mb-4">Pilih salah satu program dari Yayasan yang sesuai dengan kategori pengajuan Anda ({formData.kategori}).</p>
                    
                    <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                      {programTersedia.length > 0 ? programTersedia.map(prog => (
                        <label key={prog.id} className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition ${formData.programId === prog.id ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20" : "border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800"}`}>
                          <input type="radio" name="programId" required value={prog.id} onChange={(e) => setFormData({...formData, programId: parseInt(e.target.value)})} className="mt-1 accent-emerald-600" />
                          <div>
                            <p className="font-bold text-sm text-slate-800 dark:text-slate-200">{prog.judul}</p>
                            <p className="text-[10px] text-gray-500 mt-1 line-clamp-2">{prog.deskripsi}</p>
                          </div>
                        </label>
                      )) : (
                        <div className="p-4 bg-amber-50 text-amber-700 rounded-xl text-xs font-bold border border-amber-200 text-center">
                          Maaf, belum ada program Yayasan yang aktif untuk kategori {formData.kategori}.
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button type="button" onClick={() => setFormStep(2)} className="flex-1 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition">Kembali</button>
                      {(() => {
                        if (submissionStatus === 'menunggu') {
                          return (
                            <button disabled className="flex-1 py-3 rounded-xl font-bold text-white bg-yellow-500 opacity-80 cursor-not-allowed flex justify-center items-center gap-2">
                              <Clock size={16}/> Menunggu Verifikasi
                            </button>
                          );
                        } else if (submissionStatus === 'ditolak') {
                          return (
                            <button disabled className="flex-1 py-3 rounded-xl font-bold text-white bg-rose-600 opacity-80 cursor-not-allowed flex justify-center items-center gap-2">
                              <AlertCircle size={16}/> Pengajuan Ditolak
                            </button>
                          );
                        } else if (submissionStatus === 'disetujui') {
                          return (
                            <button type="button" onClick={() => window.location.hash = '#/penerima'} className="flex-1 py-3 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/30 transition flex justify-center items-center gap-2">
                              Terverifikasi & Lihat Status Bantuan <ArrowRight size={16}/>
                            </button>
                          );
                        } else {
                          return (
                            <button 
                              type="submit" 
                              disabled={!formData.programId || isSubmittingPengajuan}
                              className={`flex-1 py-3 rounded-xl font-bold text-white transition flex items-center justify-center gap-2 ${formData.programId ? "bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/30" : "bg-gray-300 cursor-not-allowed"}`}
                            >
                              {isSubmittingPengajuan ? (
                                <>
                                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Memproses...
                                </>
                              ) : (
                                <>Selesai & Ajukan <CheckCircle2 size={16}/></>
                              )}
                            </button>
                          );
                        }
                      })()}
                    </div>
                  </div>
                )}
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL GLOBAL ALERT DONATUR PAGE */}
      <AnimatePresence>
        {alertMsg && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden text-center">
              <div className="p-6">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                  ℹ️
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-2">Informasi</h3>
                <p className="text-gray-500 dark:text-slate-400 text-sm">{alertMsg}</p>
              </div>
              <button onClick={() => setAlertMsg(null)} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold transition">Tutup</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DonaturPage;
