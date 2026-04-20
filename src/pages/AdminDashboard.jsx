import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, User, MessageCircle, LogOut, ChevronDown, 
  Image as ImageIcon, CheckCircle, AlertCircle, Eye, EyeOff,
  MapPin, Mail, Sparkles, Palette, PlusCircle, Brush, X, Trash2, ExternalLink, ArrowLeft,
  Instagram
} from "lucide-react";
import CustomCursor from "../components/CustomCursor";
import {
  getArtworks, getProfile, getMessages, addArtwork, updateProfile, deleteArtwork,
} from "../api";
import Loader from "../components/Loader";

/* 
 * NOIR ATELIER COMPONENT 
 * A high-end gallery-themed admin dashboard for ArtByAnjali.
 * Features: Cinematic entry, custom cursor, touch-ready curation, and glassmorphic UI.
 */

/** --- PUSH NOTIFICATION SYSTEM (TOASTS) --- **/
const StatusNotification = ({ msg, type, clear }) => (
  <motion.div
    initial={{ y: -100, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    exit={{ y: -100, opacity: 0 }}
    className={`fixed top-10 left-1/2 -translate-x-1/2 z-[10000] px-8 py-4 rounded-[20px] backdrop-blur-2xl border flex items-center gap-4 shadow-2xl min-w-[300px] ${
      type === "success" ? "bg-white/10 border-white/20 text-white" : "bg-red-500/10 border-red-500/20 text-red-400"
    }`}
  >
    {type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
    <span className="text-[11px] font-bold uppercase tracking-widest">{msg}</span>
    <button onClick={clear} className="ml-auto opacity-40 hover:opacity-100 transition-opacity"><X size={14} /></button>
  </motion.div>
);

/** --- CURATION CONFIRMATION MODAL --- **/
const ConfirmModal = ({ onConfirm, onCancel }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[11000] flex items-center justify-center p-6 sm:p-0"
  >
    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onCancel} />
    <motion.div
      initial={{ scale: 0.9, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.9, opacity: 0, y: 20 }}
      className="relative bg-neutral-900 border border-white/10 p-10 rounded-[40px] max-w-sm w-full text-center shadow-2xl"
    >
      <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500"><Trash2 size={24} /></div>
      <h2 className="text-2xl font-['Mogra'] text-white mb-2">Remove Artwork?</h2>
      <p className="text-neutral-500 text-[10px] uppercase tracking-widest leading-relaxed mb-8">This masterpiece will be permanently deleted from your cloud studio.</p>
      <div className="flex flex-col gap-3">
        <button onClick={onConfirm} className="w-full bg-red-500 text-white font-black py-4 rounded-full text-[10px] uppercase tracking-widest hover:bg-red-600 transition-all">Confirm Delete</button>
        <button onClick={onCancel} className="w-full bg-white/5 text-neutral-400 font-bold py-4 rounded-full text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all">Keep it</button>
      </div>
    </motion.div>
  </motion.div>
);

const AdminDashboard = () => {
  /** --- STATE INITIALIZATION --- **/
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [secretKey, setSecretKey] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  
  // Feedback Systems
  const [status, setStatus] = useState({ show: false, msg: "", type: "success" });
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });
  const [bgIndex, setBgIndex] = useState(0);
  const [showKey, setShowKey] = useState(false);
  
  // Navigation
  const [activeTab, setActiveTab] = useState("artworks");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Data Repositories
  const [artworks, setArtworks] = useState([]);
  const [profile, setProfile] = useState({});
  const [messages, setMessages] = useState([]);
  const [readMessages, setReadMessages] = useState(() => {
    const saved = localStorage.getItem("read_messages");
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const [skillInput, setSkillInput] = useState("");

  // Persist read messages
  useEffect(() => {
    localStorage.setItem("read_messages", JSON.stringify([...readMessages]));
  }, [readMessages]);
  
  // Form Buffers
  const [newArtwork, setNewArtwork] = useState({ title: "", category: "Canvas painting", customCategory: "", description: "", price: "" });
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [artworkFile, setArtworkFile] = useState(null);
  const [profileFile, setProfileFile] = useState(null);

  const categories = ["custom", "Canvas painting", "Colour portrait", "Sketch", "Stone art", "Wall painting", "Wooden painting"];

  /** --- ATELIER LOGIC HANDLERS --- **/

  // Trigger themed toast notifications
  const showNotify = (msg, type = "success") => {
    setStatus({ show: true, msg, type });
    setTimeout(() => setStatus((prev) => ({ ...prev, show: false })), 4000);
  };

  // Memoized unread count for production efficiency
  const unreadCount = React.useMemo(() => 
    messages.filter(m => !readMessages.has(m._id)).length
  , [messages, readMessages]);

  // Synchronize dynamic studio data
  const fetchAllData = async (key) => {
    try {
      const [artRes, profRes, msgRes] = await Promise.all([
        getArtworks().catch(() => ({ data: { data: { artworks: [] } } })),
        getProfile().catch(() => ({ data: { data: {} } })),
        getMessages(key).catch(() => ({ data: { data: [] } }))
      ]);
      setArtworks(artRes.data?.data?.artworks || []);
      setProfile(profRes.data?.data || {});
      setMessages(msgRes.data?.data || []);
    } catch (e) {
      // Production-silent failure
    }
  };

  const markAllMessagesRead = () => {
    const allIds = messages.map(m => m._id);
    setReadMessages(new Set(allIds));
    showNotify("All whispers acknowledged");
  };

  // Living Canvas: Background Cycling
  useEffect(() => {
    if (artworks.length <= 1) return;
    const interval = setInterval(() => {
        setBgIndex((prev) => (prev + 1) % artworks.length);
    }, 12000); // 12 seconds in the studio for a calmer focus
    return () => clearInterval(interval);
  }, [artworks]);

  // Persistent Session Recovery
  useEffect(() => {
    const checkAuth = async () => {
      const minWait = new Promise(resolve => setTimeout(resolve, 3000));
      const savedKey = localStorage.getItem("admin_key");
      if (savedKey) {
        try {
          const cleanKey = savedKey.trim();
          await getMessages(cleanKey);
          setIsAuthorized(true);
          setSecretKey(cleanKey);
          await fetchAllData(cleanKey);
        } catch (e) { localStorage.removeItem("admin_key"); }
      }
      await minWait;
      setPageLoading(false);
    };
    checkAuth();
  }, []);

  // Unlock the Studio Gate
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const cleanKey = secretKey.trim();
    if (!cleanKey) return;
    setLoginLoading(true);
    try {
      await getMessages(cleanKey);
      localStorage.setItem("admin_key", cleanKey);
      setIsAuthorized(true);
      await fetchAllData(cleanKey);
      showNotify("Atelier Unlocked");
    } catch (err) { showNotify("Studio Key Invalid", "error"); } finally { setLoginLoading(false); }
  };

  // Publish Artwork to Cloud
  const handleArtworkUpload = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    const finalCategory = isCustomCategory ? newArtwork.customCategory || "Painting" : newArtwork.category;
    const formData = new FormData();
    formData.append("title", newArtwork.title || "Masterpiece");
    formData.append("category", finalCategory);
    formData.append("description", newArtwork.description || "");
    formData.append("price", newArtwork.price || "0");
    if (artworkFile) formData.append("image", artworkFile);

    try {
      await addArtwork(formData, secretKey);
      showNotify("Masterpiece Published");
      const artRes = await getArtworks();
      setArtworks(artRes.data?.data?.artworks || []);
      setNewArtwork({ title: "", category: "Canvas painting", customCategory: "", description: "", price: "" });
      setIsCustomCategory(false);
      setArtworkFile(null);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Check your image size (Max 80MB)";
      showNotify(errorMsg, "error");
    } finally { setLoginLoading(false); }
  };

  // Permanent Curation (Deletion)
  const handleDeleteArtwork = async () => {
    const id = deleteConfirm.id;
    if (!id) return;
    try {
      await deleteArtwork(id, secretKey);
      setArtworks(artworks.filter((a) => a._id !== id));
      showNotify("Artwork Removed");
    } catch (e) { showNotify("Deletion Failed", "error"); } finally { setDeleteConfirm({ show: false, id: null }); }
  };

  // Synchronize Creator Identity
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    const formData = new FormData();
    formData.append("bio", profile.bio || "");
    formData.append("location", profile.location || "");
    formData.append("email", profile.email || "");
    if (Array.isArray(profile.expertise)) {
      profile.expertise.forEach((skill) => formData.append("expertise", skill));
    }
    if (profile.socialLinks) {
      Object.entries(profile.socialLinks).forEach(([key, value]) => {
        formData.append(`socialLinks[${key}]`, value || "");
      });
    }
    if (profileFile) formData.append("image", profileFile);
    try {
      const res = await updateProfile(formData, secretKey);
      setProfile(res.data?.data);
      setProfileFile(null);
      showNotify("Atelier Updated");
    } catch (err) { showNotify("Update Failed", "error"); } finally { setLoginLoading(false); }
  };

  const addSkill = () => {
    if (skillInput.trim() && !profile.expertise?.includes(skillInput.trim())) {
      setProfile({ ...profile, expertise: [...(profile.expertise || []), skillInput.trim()] });
      setSkillInput("");
    }
  };

  /** --- MOTION ORCHESTRATION --- **/
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
    exit: { opacity: 0, transition: { duration: 0.2 } }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
  };

  const sectionVariants = {
    hidden: { opacity: 0, scale: 0.98, filter: "blur(4px)" },
    show: { opacity: 1, scale: 1, filter: "blur(0px)", transition: { duration: 0.6, ease: "easeOut" } }
  };

  // GLOBAL LOADING SCREEN
  if (pageLoading) return <Loader />;

  return (
    <div className="min-h-screen bg-[#231C18] text-[#E8D5C4] font-['Mogra'] relative flex flex-col selection:bg-[#D4AF37] selection:text-[#231C12]">
      {/* GLOBAL STYLES */}
      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
      
      
      {/* OVERLAY ELEMENTS */}
      <AnimatePresence>
        {status.show && <StatusNotification msg={status.msg} type={status.type} clear={() => setStatus((p) => ({ ...p, show: false }))} />}
        {deleteConfirm.show && <ConfirmModal onConfirm={handleDeleteArtwork} onCancel={() => setDeleteConfirm({ show: false, id: null })} />}
      </AnimatePresence>

      {/* CINEMATIC BACKGROUND */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <AnimatePresence>
          <motion.div
            key={bgIndex}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.5 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 4, ease: "easeInOut" }}
            className="absolute inset-0 z-0 w-full h-full"
          >
            <img 
               src={artworks[bgIndex]?.imageUrl || "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=2071&auto=format&fit=crop"} 
               className="w-full h-full object-cover grayscale"
            />
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-[#231C18]/60 backdrop-blur-[1px]" />
      </div>

      {/* GATEKEEPER VIEW */}
      {!isAuthorized ? (
        <div className="min-h-screen flex items-center justify-center p-6 relative z-10">
          <motion.div initial={{ opacity: 0, y: 40, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="bg-white/[0.03] border border-white/10 p-8 rounded-[30px] backdrop-blur-xl w-full max-w-sm text-center shadow-2xl">
            <h1 className="text-3xl font-['Mogra'] text-white mb-6">ArtByAnjali</h1>
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="relative">
                <input 
                  type={showKey ? "text" : "password"} 
                  required 
                  className="w-full bg-[#0f0f0f]/60 border border-white/10 rounded-full px-8 py-3 text-center focus:outline-none focus:border-white/30 text-sm text-white pr-14" 
                  placeholder="STUDIO KEY" 
                  value={secretKey} 
                  onChange={(e) => setSecretKey(e.target.value)} 
                />
                <button 
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                >
                  {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <button disabled={loginLoading} className="w-full bg-[#D4AF37] text-[#1A1512] font-bold py-3 rounded-full text-[10px] uppercase tracking-widest hover:bg-white transition-all shadow-[0_0_20px_rgba(212,175,55,0.2)]">
                {loginLoading ? "Unlocking Atelier..." : "Unlock Atelier"}
              </button>
            </form>
            <div className="mt-8 pt-8 border-t border-white/5">
               <a href="/" className="text-[9px] uppercase tracking-widest text-white/20 hover:text-white transition-all flex items-center justify-center gap-2 font-black">
                  <ArrowLeft size={10} /> Back to Exhibition
               </a>
            </div>
          </motion.div>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} className="flex flex-col min-h-screen">
          <CustomCursor />
          {/* NAVIGATION BAR */}
          <header className="relative z-50 border-b border-white/5 bg-[#0f0f0f]/40 backdrop-blur-xl px-4 md:px-12 py-6 md:py-10 flex flex-col lg:flex-row justify-between items-center gap-8">
            <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white text-black rounded-xl flex items-center justify-center shadow-2xl shadow-white/5"><Brush size={24} /></div>
              <h1 className="text-2xl md:text-3xl font-['Mogra'] text-white tracking-tighter">ArtByAnjali</h1>
            </motion.div>
            
            <nav className="flex bg-white/5 p-2 rounded-full border border-white/10 backdrop-blur-3xl">
              {[ 
                { id: "artworks", icon: ImageIcon, label: "Exhibits" }, 
                { id: "profile", icon: User, label: "Atelier" }, 
                { id: "messages", icon: MessageCircle, label: "Echoes", count: unreadCount } 
              ].map((tab, idx) => (
                <motion.button 
                  initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + (idx * 0.1) }}
                  key={tab.id} onClick={() => setActiveTab(tab.id)} 
                  className={`relative flex items-center gap-3 px-10 py-4 rounded-full text-[11px] md:text-[12px] uppercase tracking-widest transition-all ${activeTab === tab.id ? "text-[#1A1512] font-black" : "text-white/40 hover:text-white"}`}
                >
                  {activeTab === tab.id && <motion.div layoutId="nav-bg" className="absolute inset-0 bg-[#D4AF37] rounded-full z-0 shadow-[0_0_20px_rgba(212,175,55,0.3)]" />}
                  <span className="relative z-10 flex items-center gap-3">
                    <tab.icon size={16} />
                    <span className="hidden sm:inline">{tab.label}</span>
                    {tab.count > 0 && (
                      <motion.span 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-[#D4AF37] text-[#1A1512] text-[8px] flex items-center justify-center rounded-full font-bold shadow-lg"
                      >
                        {tab.count}
                      </motion.span>
                    )}
                  </span>
                </motion.button>
              ))}
            </nav>
            <div className="flex items-center gap-8 lg:gap-12">
               <a href="/" target="_blank" className="text-[10px] md:text-[11px] uppercase tracking-[0.2em] text-white/40 hover:text-white transition-all flex items-center gap-3 group font-bold">
                 <ExternalLink size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> View Exhibition
               </a>
               <motion.button initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} whileHover={{ opacity: 1 }} onClick={() => { localStorage.removeItem("admin_key"); window.location.reload(); }} className="text-[10px] md:text-[11px] uppercase tracking-[0.2em] transition-all font-bold">Sign Out</motion.button>
            </div>
          </header>

          <main className="relative z-10 flex-1 p-6 md:p-10 max-w-[1300px] mx-auto w-full">
            <AnimatePresence mode="wait">
              
              {/** --- EXHIBITS TAB --- **/}
              {activeTab === "artworks" && (
                <motion.div key="artworks" variants={containerVariants} initial="hidden" animate="show" exit="exit" className="space-y-12">
                  <motion.div variants={itemVariants} className="mb-8 text-center sm:text-left">
                     <h1 className="text-3xl font-['Mogra'] mb-1 text-[#D4AF37]">New Exhibition</h1>
                    <p className="text-white/20 text-[9px] uppercase tracking-[0.5em] pl-1">Capture inspiration</p>
                  </motion.div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                    {/* UPLOAD FORM */}
                    <motion.form variants={sectionVariants} onSubmit={handleArtworkUpload} className="lg:col-span-8 bg-white/[0.01] p-8 md:p-10 rounded-[30px] border border-white/5 backdrop-blur-2xl">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-6">
                           <div className="space-y-1"><label className="text-[9px] uppercase font-bold tracking-widest text-[#D4AF37] ml-4 opacity-70">Title</label><input type="text" className="w-full bg-white/5 border border-white/10 rounded-full px-6 py-3.5 focus:border-[#D4AF37]/30 focus:outline-none text-sm transition-all" value={newArtwork.title} onChange={(e) => setNewArtwork({ ...newArtwork, title: e.target.value })} /></div>
                           <div className="space-y-1 relative z-[60]"><label className="text-[9px] uppercase font-bold tracking-widest text-[#D4AF37] ml-4 opacity-70">Category</label>
                            <div onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="w-full bg-white/5 border border-white/10 rounded-full px-6 py-3.5 flex justify-between items-center cursor-pointer text-sm hover:border-white/20 transition-all"><span className="text-neutral-400">{isCustomCategory ? newArtwork.customCategory || "Custom..." : newArtwork.category}</span><ChevronDown size={14} className="text-white/20" /></div>
                            <AnimatePresence>{isDropdownOpen && (
                              <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute top-full left-0 w-full mt-2 bg-neutral-900 border border-white/10 rounded-[24px] p-2 z-[999] shadow-2xl backdrop-blur-3xl max-h-64 overflow-y-auto no-scrollbar">
                                {categories.map((cat) => (<button key={cat} type="button" onClick={() => { if (cat === "custom") setIsCustomCategory(true); else { setIsCustomCategory(false); setNewArtwork({ ...newArtwork, category: cat }); } setIsDropdownOpen(false); }} className={`w-full text-left px-5 py-3 rounded-xl text-[11px] transition-all ${cat === "custom" ? "text-white font-bold border-b border-white/5 mb-1" : "text-neutral-500 hover:text-white hover:bg-white/5"}`}>{cat === "custom" ? "+ New Folder" : cat}</button>))}
                              </motion.div>
                            )}</AnimatePresence>
                          </div>
                          {isCustomCategory && <motion.input initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} type="text" placeholder="Folder Name..." className="w-full bg-white/10 border border-white/20 rounded-full px-6 py-3.5 focus:outline-none text-sm" value={newArtwork.customCategory} onChange={(e) => setNewArtwork({ ...newArtwork, customCategory: e.target.value })} />}
                          <div className="space-y-1"><label className="text-[9px] uppercase font-bold tracking-widest text-[#D4AF37] ml-4 opacity-70">Artist Note</label><textarea className="w-full bg-white/5 border border-white/10 rounded-[24px] px-6 py-6 h-32 focus:border-[#D4AF37]/30 focus:outline-none resize-none font-['Mogra'] text-sm text-neutral-300 leading-tight transition-all" value={newArtwork.description} onChange={(e) => setNewArtwork({ ...newArtwork, description: e.target.value })} /></div>
                        </div>
                        <div className="flex flex-col gap-6">
                           <div className="flex-1 min-h-[200px] border-2 border-dashed border-white/5 rounded-[30px] flex items-center justify-center relative hover:border-white/10 transition-all overflow-hidden bg-white/5 group">
                            {artworkFile ? <motion.img initial={{ scale: 1.1, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} src={URL.createObjectURL(artworkFile)} className="absolute inset-0 w-full h-full object-cover" /> : <div className="text-center opacity-20 group-hover:opacity-40 transition-opacity"><Upload size={24} className="mx-auto mb-2" /><p className="text-[10px] font-['Mogra'] tracking-widest uppercase">Canvas</p></div>}
                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setArtworkFile(e.target.files[0])} />
                          </div>
                          <div className="relative"><span className="absolute left-8 top-1/2 -translate-y-1/2 text-[#D4AF37] font-bold">₹</span><input type="text" className="w-full bg-white/5 border border-white/10 rounded-full px-12 py-3.5 text-center font-bold text-white focus:outline-none transition-all" value={newArtwork.price} onChange={(e) => setNewArtwork({ ...newArtwork, price: e.target.value })} /></div>
                          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={loginLoading} className={`w-full font-bold py-4 rounded-full text-[11px] uppercase tracking-[0.3em] transition-all shadow-lg shadow-white/5 ${loginLoading ? "bg-white/10 text-white/40" : "bg-[#D4AF37] text-[#1A1512]"}`}>{loginLoading ? "Publishing..." : "Publish Masterpiece"}</motion.button>
                        </div>
                      </div>
                    </motion.form>
                    
                    {/* STUDIO STATS */}
                    <div className="lg:col-span-4 flex lg:flex-col gap-6">
                      <motion.div variants={sectionVariants} className="flex-1 bg-white/[0.01] p-8 rounded-[40px] border border-white/5 text-center flex flex-col items-center justify-center backdrop-blur-xl">
                        <motion.h4 initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }} className="text-5xl font-['Mogra'] text-[#D4AF37] leading-none">{artworks.length}</motion.h4>
                        <p className="text-[10px] uppercase tracking-widest text-[#E8D5C4] mt-1 font-bold">Exhibits</p>
                      </motion.div>
                      <motion.div variants={sectionVariants} className="hidden sm:flex flex-1 bg-white/5 border border-white/10 p-6 rounded-[40px] flex-col items-center justify-center text-center">
                        <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 4 }}><Sparkles size={20} className="text-[#D4AF37]/40 mb-2" /></motion.div>
                        <p className="text-[8px] font-['Mogra'] uppercase tracking-widest text-[#E8D5C4]/40">Studio Storage</p>
                      </motion.div>
                    </div>
                  </div>
                  
                  {/* LIVE GALLERY GRID */}
                  <motion.div variants={containerVariants} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5 mt-16 pb-20">
                    {artworks.map((art) => (
                      <motion.div variants={itemVariants} key={art._id} className="relative aspect-[3/4] rounded-[30px] overflow-hidden border border-white/5 bg-white/[0.01] group cursor-pointer hover:border-white/20 transition-all">
                        <img src={art.imageUrl} className="w-full h-full object-cover transition-all duration-700 grayscale-0 md:grayscale md:group-hover:grayscale-0 group-hover:scale-110" />
                        <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black via-black/80 to-transparent">
                          <p className="font-['Mogra'] text-[9px] text-[#D4AF37] truncate uppercase tracking-widest">{art.category}</p>
                          <h4 className="font-['Mogra'] text-[11px] text-[#E8D5C4] truncate uppercase tracking-tighter">{art.title}</h4>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ show: true, id: art._id }); }} className="absolute top-4 right-4 w-10 h-10 bg-black/60 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-red-500/20 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all cursor-pointer z-20"><Trash2 size={16} /></button>
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
              )}

              {/** --- ATELIER TAB --- **/}
              {activeTab === "profile" && (
                <motion.div key="profile" variants={containerVariants} initial="hidden" animate="show" exit="exit" className="max-w-4xl mx-auto">
                  <motion.div variants={itemVariants} className="mb-10 text-center"><h1 className="text-3xl font-['Mogra'] mb-1">Atelier Identity</h1><p className="text-neutral-600 text-[9px] uppercase tracking-[0.5em]">The soul behind user</p></motion.div>
                  <motion.form variants={sectionVariants} onSubmit={handleProfileUpdate} className="flex flex-col-reverse md:grid md:grid-cols-2 gap-10 bg-white/[0.01] p-8 md:p-10 rounded-[40px] border border-white/5 backdrop-blur-2xl">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[9px] uppercase tracking-widest text-[#D4AF37] ml-4 font-bold opacity-70">Expertise Palette</label>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <AnimatePresence>
                            {Array.isArray(profile.expertise) && profile.expertise.map((skill) => (
                              <motion.span initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} key={skill} className="px-4 py-1.5 bg-white/10 border border-white/5 text-white text-[9px] uppercase font-bold rounded-full flex items-center gap-2 group transition-all text-nowrap">{skill}<button type="button" onClick={() => setProfile({ ...profile, expertise: profile.expertise.filter((s) => s !== skill) })} className="opacity-40 group-hover:opacity-100">×</button></motion.span>
                            ))}
                          </AnimatePresence>
                        </div>
                        <div className="flex gap-2"><input type="text" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} className="flex-1 bg-white/5 border border-white/10 rounded-full px-6 py-3 text-sm focus:border-white/20 focus:outline-none transition-all" placeholder="Add Skill..." onKeyPress={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }} /><button type="button" onClick={addSkill} className="w-11 h-11 bg-white text-black rounded-full flex items-center justify-center font-bold text-lg hover:scale-105 transition-transform">+</button></div>
                      </div>
                      <div className="space-y-1"><label className="text-[9px] uppercase tracking-widest text-neutral-600 ml-4 font-bold">Bio</label><textarea className="w-full bg-white/5 border border-white/10 rounded-[24px] px-6 py-6 h-56 font-['Mogra'] text-sm text-neutral-400 focus:outline-none leading-tight resize-none transition-all" value={profile.bio || ""} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} /></div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input type="email" className="w-full bg-white/5 border border-white/10 rounded-full px-6 py-3 text-sm transition-all" value={profile.email || ""} onChange={(e) => setProfile({ ...profile, email: e.target.value })} placeholder="Email" />
                        <input type="text" className="w-full bg-white/5 border border-white/10 rounded-full px-6 py-3 text-sm transition-all" value={profile.location || ""} onChange={(e) => setProfile({ ...profile, location: e.target.value })} placeholder="Location" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="relative flex items-center">
                          <Instagram className="absolute left-6 text-white/20" size={14} />
                          <input type="text" className="w-full bg-white/5 border border-white/10 rounded-full pl-14 pr-6 py-3 text-[11px] transition-all" value={profile.socialLinks?.instagram || ""} onChange={(e) => setProfile({ ...profile, socialLinks: { ...profile.socialLinks, instagram: e.target.value } })} placeholder="Instagram URL" />
                        </div>
                        <div className="relative flex items-center">
                          <MessageCircle className="absolute left-6 text-white/20" size={14} />
                          <input type="text" className="w-full bg-white/5 border border-white/10 rounded-full pl-14 pr-6 py-3 text-[11px] transition-all" value={profile.socialLinks?.whatsapp || ""} onChange={(e) => setProfile({ ...profile, socialLinks: { ...profile.socialLinks, whatsapp: e.target.value } })} placeholder="WhatsApp Number" />
                        </div>
                        <div className="relative flex items-center">
                          <Palette className="absolute left-6 text-white/20" size={14} />
                          <input type="text" className="w-full bg-white/5 border border-white/10 rounded-full pl-14 pr-6 py-3 text-[11px] transition-all" value={profile.socialLinks?.behance || ""} onChange={(e) => setProfile({ ...profile, socialLinks: { ...profile.socialLinks, behance: e.target.value } })} placeholder="Behance URL" />
                        </div>
                        <div className="relative flex items-center">
                          <PlusCircle className="absolute left-6 text-white/20" size={14} />
                          <input type="text" className="w-full bg-white/5 border border-white/10 rounded-full pl-14 pr-6 py-3 text-[11px] transition-all" value={profile.socialLinks?.linkedin || ""} onChange={(e) => setProfile({ ...profile, socialLinks: { ...profile.socialLinks, linkedin: e.target.value } })} placeholder="LinkedIn URL" />
                        </div>
                      </div>
                      <motion.button whileHover={{ scale: 1.01 }} className="hidden md:block w-full bg-white text-black font-black py-4 rounded-full uppercase tracking-widest text-[11px] shadow-lg shadow-white/5">Save Atelier</motion.button>
                    </div>
                    <div className="flex flex-col items-center justify-center space-y-8">
                      <motion.div whileHover={{ rotate: 2 }} className="w-48 h-48 sm:w-60 sm:h-60 rounded-full border-4 border-dashed border-white/5 flex items-center justify-center relative overflow-hidden bg-white/5 group shadow-xl">
                        {profileFile || profile.profileImageUrl ? <motion.img initial={{ scale: 1.2 }} animate={{ scale: 1 }} src={profileFile ? URL.createObjectURL(profileFile) : profile.profileImageUrl} className="absolute inset-0 w-full h-full object-cover" style={{ objectPosition: profile.imagePosition || "center" }} /> : <Brush size={64} className="opacity-10" />}
                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setProfileFile(e.target.files[0])} />
                      </motion.div>
                      <div className="w-full text-center space-y-6">
                        <div className="flex justify-center gap-3">{["top", "center", "bottom"].map((pos) => (<button key={pos} type="button" onClick={() => setProfile({ ...profile, imagePosition: pos })} className={`relative px-6 py-2 rounded-full text-[9px] uppercase tracking-widest transition-all ${profile.imagePosition === pos ? "text-black font-black" : "text-neutral-600 hover:text-white"}`}>{profile.imagePosition === pos && <motion.div layoutId="pos-bg" className="absolute inset-0 bg-white rounded-full z-0" /> }<span className="relative z-10">{pos}</span></button>))}</div>
                      </div>
                      <motion.button whileHover={{ scale: 1.01 }} className="md:hidden w-full bg-white text-black font-black py-4 rounded-full uppercase tracking-widest text-[11px]">Save Atelier</motion.button>
                    </div>
                  </motion.form>
                </motion.div>
              )}

              {/** --- ECHOES TAB --- **/}
              {activeTab === "messages" && (
                <motion.div key="messages" variants={containerVariants} initial="hidden" animate="show" exit="exit" className="max-w-3xl mx-auto">
                  <motion.div variants={itemVariants} className="mb-8 flex flex-col sm:flex-row justify-between items-center sm:items-end gap-6">
                    <div className="text-center sm:text-left">
                      <h1 className="text-3xl font-['Mogra'] mb-1">Echoes</h1>
                      <p className="text-neutral-600 text-[9px] uppercase tracking-[0.5em]">Whispers</p>
                    </div>
                    {messages.length > 0 && (
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={markAllMessagesRead}
                        className="flex items-center gap-2 px-6 py-2.5 bg-white/5 border border-white/10 rounded-full text-[9px] uppercase tracking-widest text-neutral-400 hover:text-white hover:bg-white/10 transition-all font-black"
                      >
                        <CheckCircle size={12} /> Mark All as Read
                      </motion.button>
                    )}
                  </motion.div>
                  <div className="space-y-6">
                    {messages.length === 0 ? <motion.div variants={itemVariants} className="p-20 text-center text-neutral-800 border-2 border-dashed border-white/5 rounded-[40px]"><p className="text-[10px] uppercase tracking-widest">Studio is silent.</p></motion.div> : messages.map((m) => (
                      <motion.div variants={itemVariants} key={m._id} className="p-8 bg-white/[0.01] border border-white/5 rounded-[40px] group relative overflow-hidden backdrop-blur-sm">
                        {!readMessages.has(m._id) && (
                          <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.02] flex items-center justify-center rotate-45 translate-x-16 -translate-y-16 pointer-events-none">
                             <span className="text-[7px] font-black uppercase text-white/20 tracking-tighter -rotate-45 mt-16">New Echo</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center mb-6"><div className="flex items-center gap-4"><div className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center font-['Mogra'] text-xl">{m.name.charAt(0)}</div><div><span className="text-lg font-['Mogra'] text-white block truncate max-w-[150px]">{m.name}</span><span className="text-[9px] uppercase tracking-widest text-neutral-500 font-bold">{m.email}</span></div></div><span className="text-[9px] font-medium text-neutral-700">{new Date(m.createdAt).toLocaleDateString()}</span></div>
                        <p className="font-['Mogra'] text-lg text-neutral-300 leading-snug pl-6 border-l-2 border-white/10 group-hover:border-white/30 transition-colors">"{m.message}"</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
          
          {/* STUDIO FOOTER */}
          <footer className="relative z-50 py-12 text-center border-t border-white/5 mt-20">
            <h2 className="text-lg font-['Mogra'] text-[#D4AF37] tracking-[0.2em] uppercase">ArtByAnjali</h2>
            <p className="text-[8px] uppercase tracking-[0.4em] mt-2 text-white/20">Noir Atelier Console</p>
            <div className="mt-8 pt-8 border-t border-white/5 inline-block px-10">
              <a href="https://instagram.com/RWT._.ANURAG" target="_blank" rel="noreferrer" className="text-[7px] uppercase tracking-[0.4em] text-[#D4AF37]/60 hover:text-[#D4AF37] transition-all font-normal">made by the code Magician ANU₹AG</a>
            </div>
          </footer>
        </motion.div>
      )}
    </div>
  );
};

export default AdminDashboard;
