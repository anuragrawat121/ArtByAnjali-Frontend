import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getArtworks, getProfile, submitContact } from '../api';
import { 
    ImageIcon, Send, Instagram, Mail, 
    MapPin, Brush, ChevronDown, CheckCircle, 
    AlertCircle, X, Palette, ExternalLink,
    MessageCircle, PlusCircle, ArrowLeft
} from 'lucide-react';
import PublicNavbar from '../components/PublicNavbar';
import CustomCursor from '../components/CustomCursor';
import Loader from '../components/Loader';

/**
 * ARIA NOIR EXHIBITION HALL (Home)
 * Premium, breathable monochrome atmosphere for ArtByAnjali.
 */

/* --- PUBLIC NOTIFICATION SYSTEM --- */
const StatusNotification = ({ msg, type, clear }) => (
  <motion.div
    initial={{ y: -100, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    exit={{ y: -100, opacity: 0 }}
    className={`fixed top-24 left-1/2 -translate-x-1/2 z-[10000] px-8 py-4 rounded-full backdrop-blur-2xl border flex items-center gap-4 shadow-2xl min-w-[300px] ${
      type === "success" ? "bg-white/10 border-white/20 text-white" : "bg-red-500/10 border-red-500/20 text-red-400"
    }`}
  >
    {type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
    <span className="text-[11px] font-bold uppercase tracking-widest">{msg}</span>
    <button onClick={clear} className="ml-auto opacity-40 hover:opacity-100 transition-opacity"><X size={14} /></button>
  </motion.div>
);

const Home = () => {
    // Core Data State
    const [artworks, setArtworks] = useState([]);
    const [profile, setProfile] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedArtwork, setSelectedArtwork] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
        window.addEventListener('mousemove', handleMove);
        return () => window.removeEventListener('mousemove', handleMove);
    }, []);
    
    // UI State
    const [status, setStatus] = useState({ show: false, msg: "", type: "success" });
    const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
    const [sending, setSending] = useState(false);
    const [bgIndex, setBgIndex] = useState(0);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Initial Studio Sync
    useEffect(() => {
        const startTime = Date.now();
        const fetchData = async () => {
            try {
                const [artRes, profRes] = await Promise.all([getArtworks(), getProfile()]);
                setArtworks(artRes.data?.data?.artworks || []);
                setProfile(profRes.data?.data || {});
            } catch (err) {
                // Production-silent sync failure
            } finally {
                const endTime = Date.now();
                const elapsed = endTime - startTime;
                const remaining = Math.max(0, 3000 - elapsed);
                setTimeout(() => setLoading(false), remaining);
            }
        };
        fetchData();
    }, []);

    // Grouping Logic for "Exhibition Rooms" (Memoized for Production)
    const folders = useMemo(() => {
        const groups = artworks.reduce((acc, art) => {
            if (!acc[art.category]) {
                acc[art.category] = { name: art.category, cover: art.imageUrl, count: 0, artworks: [] };
            }
            acc[art.category].artworks.push(art);
            acc[art.category].count += 1;
            return acc;
        }, {});
        return Object.values(groups);
    }, [artworks]);

    const displayedArt = useMemo(() => 
        selectedCategory ? artworks.filter(a => a.category === selectedCategory) : []
    , [artworks, selectedCategory]);

    // The Living Canvas: Background Cycling (10s rhythm)
    useEffect(() => {
        if (artworks.length <= 1) return;
        const interval = setInterval(() => {
            setBgIndex((prev) => (prev + 1) % artworks.length);
        }, 10000);
        return () => clearInterval(interval);
    }, [artworks]);

    const showNotify = (msg, type = "success") => {
        setStatus({ show: true, msg, type });
        setTimeout(() => setStatus((prev) => ({ ...prev, show: false })), 4000);
    };

    const handleContactSubmit = async (e) => {
        e.preventDefault();
        setSending(true);
        try {
            await submitContact(contactForm);
            showNotify("Whisper Received. I'll reach out soon.");
            setContactForm({ name: '', email: '', message: '' });
        } catch (err) {
            showNotify("The echo failed. Try again.", "error");
        } finally {
            setSending(false);
        }
    };

    /** --- MOTION VARIANTS --- **/
    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.3 } }
    };
    const itemVariants = {
        hidden: { opacity: 0, y: 40 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 60, damping: 20 } }
    };
    const sectionVariants = {
        hidden: { opacity: 0, filter: "blur(10px)" },
        show: { opacity: 1, filter: "blur(0px)", transition: { duration: 1 } }
    };

    if (loading) return <Loader />;

    return (
        <div className="min-h-screen bg-[#0f0f0f] text-white selection:bg-white selection:text-black overflow-x-hidden relative">
            {/* GLOBAL ARCHIVAL GRAIN */}
            <div className="fixed inset-0 z-[1] pointer-events-none opacity-[0.03] mix-blend-overlay hidden md:block">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                    <filter id="noise">
                        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
                        <feColorMatrix type="saturate" values="0" />
                    </filter>
                    <rect width="100%" height="100%" filter="url(#noise)" />
                </svg>
            </div>

            {/* CURSOR AMBIENT LIGHT */}
            <motion.div 
                className="fixed w-[600px] h-[600px] rounded-full pointer-events-none z-0 opacity-10 bg-[radial-gradient(circle,rgba(255,255,255,0.15)_0%,transparent_70%)]"
                style={{ willChange: "transform" }}
                animate={{
                    x: mousePos.x - 300,
                    y: mousePos.y - 300
                }}
                transition={{ type: "tween", ease: "backOut", duration: 1.5 }} // Slightly faster for responsiveness
            />

            <AnimatePresence>
                {status.show && <StatusNotification msg={status.msg} type={status.type} clear={() => setStatus({ ...status, show: false })} />}
            </AnimatePresence>
            <PublicNavbar />
            <CustomCursor />

            {/* --- HERO: THE SPOTLIGHT --- */}
            <section className="relative h-screen flex items-center justify-center">
                <div className="absolute inset-0 z-0 overflow-hidden">
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
                                    src={artworks[bgIndex]?.imageUrl || "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?q=80&w=1972&auto=format&fit=crop"} 
                                    alt="Background Art" 
                                    className="w-full h-full object-cover max-md:grayscale md:grayscale md:scale-105"
                                />
                        </motion.div>
                    </AnimatePresence>
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0c0c0e]/80 to-[#0c0c0e]" />
                </div>

                <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.5 }} className="relative z-10 text-center px-6">
                    <div className="relative inline-block">
                        <h1 className="relative z-10 flex flex-wrap justify-center items-center text-6xl md:text-[9rem] font-['Mogra'] tracking-tighter leading-none">
                            {(profile?.fullName || "ArtByAnjali").split(" ").map((part, pIdx) => (
                                <span key={pIdx} className="flex">
                                    {part.split("").map((char, cIdx) => (
                                        <motion.span
                                            key={cIdx}
                                            initial={{ y: 20, opacity: 0, scale: 0.8 }}
                                            animate={{ y: 0, opacity: 1, scale: 1 }}
                                            whileHover={{ 
                                                color: pIdx === 0 ? "#ff6b6b" : "#4ecdc4", // Warm red for first part, cool teal for second
                                                scale: 1.2,
                                                y: -10,
                                                rotate: [0, 5, -5, 0],
                                                transition: { duration: 0.2 }
                                            }}
                                            transition={{ 
                                                duration: 0.8, 
                                                delay: 0.2 + (pIdx * 0.15) + (cIdx * 0.03),
                                                ease: [0.33, 1, 0.68, 1]
                                            }}
                                            className="text-white block cursor-default transition-colors duration-300"
                                            style={{ willChange: "transform, opacity" }}
                                        >
                                            {char}
                                        </motion.span>
                                    ))}
                                    {pIdx === 0 && <span className="w-8 md:w-12" />}
                                </span>
                            ))}
                        </h1>
                    </div>

                    {/* TAGLINE BELOW NAME */}
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 0.4 }} 
                        transition={{ delay: 2, duration: 1 }}
                        className="mt-6 mb-12"
                    >
                        <p className="text-[10px] uppercase tracking-[0.6em] font-black">Where Colors Tell Stories</p>
                    </motion.div>

                    <div className="max-w-xl mx-auto h-[1px] bg-white/10 mb-12 relative overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 2, delay: 1.5 }} className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                    </div>
                    <div className="flex flex-col sm:flex-row justify-center gap-6 items-center">
                        <a href="#gallery" className="group px-10 py-5 bg-white text-black font-black uppercase text-[10px] tracking-[0.3em] rounded-full hover:bg-neutral-200 transition-all flex items-center gap-3 shadow-2xl">
                            Enter Gallery <ChevronDown size={14} className="group-hover:translate-y-1 transition-transform" />
                        </a>
                        <a href="#contact" className="px-10 py-5 border border-white/10 hover:bg-white/5 transition-all uppercase text-[10px] tracking-[0.3em] font-black rounded-full backdrop-blur-sm">Begin Inquiry</a>
                    </div>
                </motion.div>
                <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-20">
                    <div className="w-[1px] h-20 bg-gradient-to-b from-white to-transparent" />
                </motion.div>
            </section>

            {/* --- GALLERY: THE EXHIBITS --- */}
            <section id="gallery" className="max-w-7xl mx-auto px-6 py-24 min-h-screen">
                <motion.div variants={sectionVariants} initial="hidden" whileInView="show" viewport={{ once: true }} className="flex flex-col items-center text-center">
                    <p className="text-[9px] uppercase tracking-[0.5em] text-white/30 font-black mb-2">
                        Curated Collection
                    </p>
                    <h2 className="text-5xl md:text-7xl font-['Mogra'] tracking-tighter capitalize mb-6">
                        The Masterpieces
                    </h2>
                    
                    {/* ATELIER PILL TOGGLE */}
                    <div className="flex bg-white/5 p-1.5 rounded-full border border-white/10 backdrop-blur-3xl mb-4 overflow-x-auto no-scrollbar max-w-full">
                        <button 
                            onClick={() => setSelectedCategory(null)}
                            className={`relative px-8 py-3 rounded-full text-[9px] uppercase tracking-widest transition-all ${!selectedCategory ? "text-black font-black" : "text-neutral-500 hover:text-white"}`}
                        >
                            {!selectedCategory && <motion.div layoutId="room-bg" className="absolute inset-0 bg-white rounded-full z-0" />}
                            <span className="relative z-10 flex items-center gap-2"><Palette size={12} /> All Collections</span>
                        </button>
                        {folders.map((folder) => (
                            <button 
                                key={folder.name}
                                onClick={() => setSelectedCategory(folder.name)}
                                className={`relative px-8 py-3 rounded-full text-[9px] uppercase tracking-widest transition-all whitespace-nowrap ${selectedCategory === folder.name ? "text-black font-black" : "text-neutral-500 hover:text-white"}`}
                            >
                                {selectedCategory === folder.name && <motion.div layoutId="room-bg" className="absolute inset-0 bg-white rounded-full z-0" />}
                                <span className="relative z-10">{folder.name}</span>
                            </button>
                        ))}
                    </div>
                </motion.div>
                
                <AnimatePresence mode="wait">
                    {!selectedCategory ? (
                        <motion.div key="folders" variants={containerVariants} initial="hidden" animate="show" exit={{ opacity: 0, scale: 0.95 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-14">
                            {folders.map((folder) => (
                                <motion.div key={folder.name} variants={itemVariants} whileHover={isMobile ? {} : { y: -10 }} onClick={() => setSelectedCategory(folder.name)} className="group cursor-none">
                                    <div className="relative aspect-[3/4] overflow-hidden bg-white/[0.01] rounded-[30px] mb-8 border border-white/5 shadow-2xl">
                                        <img src={folder.cover} className="w-full h-full object-cover md:grayscale group-hover:grayscale-0 transition-all duration-1000 ease-out" />
                                        <div className="absolute inset-0 bg-[#0c0c0e]/40 md:group-hover:bg-[#0f0f0f]/60 transition-all" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="text-center">
                                                <h3 className="text-3xl font-['Mogra'] tracking-wider uppercase mb-2">{folder.name}</h3>
                                                <p className="text-[10px] uppercase tracking-[0.4em] opacity-40 font-black">{folder.count} Artworks</p>
                                            </div>
                                        </div>
                                        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all translate-y-0 md:translate-y-4 md:group-hover:translate-y-0">
                                             <span className="px-8 py-3 bg-white text-black rounded-full text-[9px] uppercase font-black tracking-widest">Explore Exhibit</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div key="collection" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-20">
                            {/* THE CURATOR'S HEADER */}
                            <div className="flex flex-col md:flex-row justify-between items-end gap-10 pb-16 border-b border-white/5">
                                <motion.div initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="text-left w-full">
                                    <button 
                                        onClick={() => setSelectedCategory(null)} 
                                        className="group flex items-center gap-3 text-[9px] uppercase tracking-widest text-white/30 hover:text-white transition-all mb-8 font-black"
                                    >
                                        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Return to Collections
                                    </button>
                                    <h2 className="text-6xl md:text-[8rem] font-['Mogra'] tracking-tighter uppercase leading-[0.8]">{selectedCategory}</h2>
                                </motion.div>
                                
                                <motion.div 
                                    key={selectedCategory}
                                    initial={{ x: 50, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ duration: 0.8, delay: 0.2 }}
                                    className="max-w-md text-right hidden lg:block"
                                >
                                    <p className="font-['Caveat'] text-3xl md:text-4xl text-neutral-400 italic leading-tight">
                                        {selectedCategory === "Canvas painting" && "The weight of texture and the depth of the soul's stroke."}
                                        {selectedCategory === "Colour portrait" && "A vibrant echo of identity, captured in the dance of hues."}
                                        {selectedCategory === "Sketch" && "Raw thoughts transcribed to paper, where the pencil meets the void."}
                                        {selectedCategory === "Stone art" && "Ancient spirits awakened from the heart of the earth."}
                                        {selectedCategory === "Wall painting" && "Transforming architecture into an expansive dreamscape."}
                                        {selectedCategory === "Wooden painting" && "Organic grains serving as a canvas for natural wisdom."}
                                        {!["Canvas painting", "Colour portrait", "Sketch", "Stone art", "Wall painting", "Wooden painting"].includes(selectedCategory) && "A unique exploration of form and emotion, curated for the modern observer."}
                                    </p>
                                </motion.div>
                            </div>

                            <motion.div variants={containerVariants} initial="hidden" animate="show" exit={{ opacity: 0, x: -20 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-14">
                            {displayedArt.map((art) => (
                                <motion.div 
                                    key={art._id} 
                                    variants={itemVariants} 
                                    onClick={() => setSelectedArtwork(art)}
                                    className="group cursor-none active:scale-95 transition-transform"
                                >
                                    <div className="relative aspect-[3/4] overflow-hidden bg-white/[0.01] rounded-[30px] mb-8 border border-white/5 shadow-2xl">
                                        <img src={art.imageUrl} alt={art.title} className="w-full h-full object-cover md:grayscale group-hover:grayscale-0 md:group-hover:scale-110 transition-all duration-1000 ease-out" />
                                    </div>
                                    <div className="px-4">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <h3 className="text-2xl font-['Mogra'] tracking-tight group-hover:text-neutral-400 transition-colors uppercase leading-tight">{art.title}</h3>
                                                {art.description && (
                                                    <p className="font-['Caveat'] text-xl text-neutral-400 mt-2 line-clamp-2 italic leading-tight">
                                                        "{art.description}"
                                                    </p>
                                                )}
                                                <div className="text-[9px] text-white/20 uppercase font-black tracking-[0.3em] mt-3 flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 bg-white/20 rounded-full" /> {art.category}
                                                </div>
                                            </div>
                                            <span className="font-['Caveat'] text-2xl text-white/5 group-hover:text-white/40 transition-colors mt-1 italic">#{art._id.slice(-4)}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
                {artworks.length === 0 && (
                    <div className="py-40 text-center border-2 border-dashed border-white/5 rounded-[40px]">
                        <p className="text-[10px] uppercase tracking-[1em] text-white/10 font-black italic">Exhibits arriving soon.</p>
                    </div>
                )}
            </section>

            {/* --- ABOUT: THE ATELIER (The Museum Installation) --- */}
            <section id="about" className="pt-40 md:pt-60 pb-20 relative overflow-hidden text-white/90">
                {/* ATMOSPHERIC SPECTERS (PARALLAX DEPTH) */}
                <motion.div 
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ 
                        opacity: [0.02, 0.05, 0.02],
                        x: [-20, 30, -20]
                    }}
                    transition={{
                        opacity: { repeat: Infinity, duration: 10, ease: "easeInOut" },
                        x: { repeat: Infinity, duration: 15, ease: "easeInOut" }
                    }}
                    className="absolute top-10 left-10 text-[10rem] md:text-[20rem] font-['Mogra'] uppercase tracking-tighter leading-none select-none pointer-events-none italic whitespace-nowrap"
                >
                    A for Art
                </motion.div>
                <motion.div 
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ 
                        opacity: [0.02, 0.04, 0.02],
                        x: [20, -40, 20]
                    }}
                    transition={{
                        opacity: { repeat: Infinity, duration: 12, ease: "easeInOut" },
                        x: { repeat: Infinity, duration: 18, ease: "easeInOut" }
                    }}
                    className="absolute bottom-20 right-10 text-[10rem] md:text-[20rem] font-['Mogra'] uppercase tracking-tighter leading-none select-none pointer-events-none whitespace-nowrap"
                >
                    B for Brush
                </motion.div>
                <div className="max-w-6xl mx-auto px-10 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
                        
                        {/* THE MASTER'S FRAME (Circular Portrait) */}
                        <motion.div 
                            initial={{ opacity: 0, x: -50 }} 
                            whileInView={{ opacity: 1, x: 0 }} 
                            viewport={{ once: true }} 
                            transition={{ duration: 1.2, ease: [0.33, 1, 0.68, 1] }}
                            className="lg:col-span-5 flex justify-center lg:justify-start relative"
                        >
                            <div className="relative w-56 h-56 md:w-[360px] md:h-[360px] rounded-full overflow-hidden border border-white/10 shadow-2xl bg-white/5 group">
                                <motion.img 
                                    whileHover={isMobile ? {} : { scale: 1.05 }}
                                    src={profile?.profileImageUrl || "https://images.unsplash.com/photo-1544005313-94ddf0286df2"} 
                                    className="w-full h-full object-cover md:grayscale hover:grayscale-0 transition-all duration-[2s] ease-out"
                                    style={{ objectPosition: profile?.imagePosition || "center" }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f]/40 via-transparent to-transparent" />
                                
                                {/* Kinetic Mark */}
                                <motion.div 
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                                    className="absolute inset-0 border-[1px] border-dashed border-white/5 rounded-full pointer-events-none"
                                />
                            </div>

                            {/* Kinetic Brush Mark */}
                            <div className="absolute -top-4 -right-4 w-10 h-10 bg-white text-black rounded-full flex items-center justify-center shadow-2xl z-20">
                                <Brush size={16} />
                            </div>
                        </motion.div>

                        {/* THE SOUL'S MANUSCRIPT */}
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }} 
                            whileInView={{ opacity: 1, y: 0 }} 
                            viewport={{ once: true }} 
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="lg:col-span-7 flex flex-col justify-center text-center lg:text-left space-y-6"
                        >
                            <div className="space-y-1">
                                <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 0.3 }} className="text-[9px] uppercase tracking-[0.8em] font-black">Behind the Brush</motion.p>
                                <h2 className="text-6xl md:text-8xl font-['Mogra'] tracking-tighter uppercase leading-[0.9]">
                                    The <span className="text-white/20 italic">Atelier</span>
                                </h2>
                            </div>

                            <p className="font-['Caveat'] text-2xl md:text-4xl leading-[1.2] text-neutral-400 max-w-4xl mx-auto lg:mx-0">
                                {profile?.bio || "Every stroke is a secret whispered in the language of color, found in the heart of the Atelier."}
                            </p>

                            <div className="pt-8 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-1">
                                    <p className="text-[9px] uppercase tracking-widest text-white/20">Location</p>
                                    <div className="flex items-center justify-center lg:justify-start gap-3 text-white/60">
                                        <MapPin size={16} className="text-white/20" />
                                        <span className="text-xs font-bold tracking-[0.2em] uppercase">{profile?.location || "India"}</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[9px] uppercase tracking-widest text-white/20">Connection</p>
                                    <div className="flex items-center justify-center lg:justify-start gap-4 flex-wrap">
                                        <a href={`mailto:${profile?.email}`} title="Email" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-all border border-white/10 group">
                                            <Mail size={16} className="text-white/20 group-hover:text-black transition-colors" />
                                        </a>
                                        {profile?.socialLinks?.instagram && (
                                            <a href={profile.socialLinks.instagram} target="_blank" rel="noreferrer" title="Instagram" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-all border border-white/10 group">
                                                <Instagram size={16} className="text-white/20 group-hover:text-black transition-colors" />
                                            </a>
                                        )}
                                        {profile?.socialLinks?.whatsapp && (
                                            <a href={`https://wa.me/${profile.socialLinks.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" title="WhatsApp" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-all border border-white/10 group">
                                                <MessageCircle size={16} className="text-white/20 group-hover:text-black transition-colors" />
                                            </a>
                                        )}
                                        {profile?.socialLinks?.behance && (
                                            <a href={profile.socialLinks.behance} target="_blank" rel="noreferrer" title="Behance" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-all border border-white/10 group">
                                                <Palette size={16} className="text-white/20 group-hover:text-black transition-colors" />
                                            </a>
                                        )}
                                        {profile?.socialLinks?.linkedin && (
                                            <a href={profile.socialLinks.linkedin} target="_blank" rel="noreferrer" title="LinkedIn" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-all border border-white/10 group">
                                                <PlusCircle size={16} className="text-white/20 group-hover:text-black transition-colors" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* THE KINETIC EXPERTISE SLIDER */}
                <div className="mt-20 w-full overflow-hidden border-y border-white/5 bg-white/[0.01] backdrop-blur-sm relative group cursor-none">
                    <div className="flex whitespace-nowrap py-8">
                        {/* THE MARQUEE TRACK */}
                        <motion.div 
                            animate={{ x: [0, -1000] }}
                            transition={{ 
                                repeat: Infinity, 
                                duration: 35, 
                                ease: "linear" 
                            }}
                            className="flex gap-12 px-6 items-center"
                        >
                            {[...(profile?.expertise || []), ...(profile?.expertise || []), ...(profile?.expertise || [])].map((skill, idx) => (
                                <div key={idx} className="flex items-center gap-12 group/skill">
                                    <span className="text-2xl md:text-4xl font-['Mogra'] tracking-tighter text-white opacity-10 group-hover/skill:opacity-100 transition-all duration-700 uppercase italic">
                                        {skill}
                                    </span>
                                    <div className="w-2 h-2 bg-white/20 rounded-full group-hover/skill:bg-white transition-colors" />
                                </div>
                            ))}
                        </motion.div>
                    </div>
                    <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#0f0f0f] to-transparent z-10 pointer-events-none" />
                    <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[#0f0f0f] to-transparent z-10 pointer-events-none" />
                </div>
            </section>

            {/* --- CONTACT: WHISPERS --- */}
            <section id="contact" className="py-40 relative max-w-2xl mx-auto px-6 text-center">
                {/* THE BREATHING VOID */}
                <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.03, 0.08, 0.03] }}
                    transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
                    className="absolute inset-0 z-0 bg-[radial-gradient(circle,white_0%,transparent_70%)] rounded-full blur-3xl pointer-events-none"
                />

                <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="relative z-10">
                    <p className="text-[9px] uppercase tracking-[1em] text-white/20 font-black mb-6 italic">Inquire</p>
                    <h2 className="text-6xl font-['Mogra'] mb-4 tracking-tighter uppercase">Whispers</h2>
                    <p className="text-neutral-500 mb-12 text-sm uppercase tracking-[0.3em] font-light">Collaborate or commission a unique vision.</p>
                </motion.div>
                <motion.form 
                    initial={{ opacity: 0, scale: 0.95 }} 
                    whileInView={{ opacity: 1, scale: 1 }} 
                    viewport={{ once: true }} 
                    transition={{ duration: 0.8 }} 
                    onSubmit={handleContactSubmit} 
                    className="space-y-8 text-left bg-white/[0.03] border border-white/5 p-8 md:p-12 rounded-[40px] backdrop-blur-3xl shadow-2xl"
                >
                    <div className="space-y-6">
                        <div className="space-y-2">
                             <label className="text-[9px] uppercase tracking-widest text-neutral-600 ml-6 font-black">Full Name</label>
                             <input type="text" placeholder="John Doe" required className="w-full bg-[#0c0c0e]/40 border border-white/10 rounded-full px-8 py-4 focus:outline-none focus:border-white/30 transition-all text-sm" value={contactForm.name} onChange={(e) => setContactForm({...contactForm, name: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                             <label className="text-[9px] uppercase tracking-widest text-neutral-600 ml-6 font-black">Email Address</label>
                             <input type="email" placeholder="john@example.com" required className="w-full bg-[#0c0c0e]/40 border border-white/10 rounded-full px-8 py-4 focus:outline-none focus:border-white/30 transition-all text-sm" value={contactForm.email} onChange={(e) => setContactForm({...contactForm, email: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                             <label className="text-[9px] uppercase tracking-widest text-neutral-600 ml-6 font-black">Message</label>
                             <textarea placeholder="Describe your vision..." required className="w-full bg-[#0c0c0e]/40 border border-white/10 rounded-[30px] px-8 py-6 h-32 focus:outline-none focus:border-white/30 transition-all resize-none text-lg font-['Caveat'] text-neutral-300" value={contactForm.message} onChange={(e) => setContactForm({...contactForm, message: e.target.value})} />
                        </div>
                    </div>
                    <motion.button whileHover={isMobile ? {} : { scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={sending} className="w-full bg-[#d4af37] text-[#0c0c0e] py-5 rounded-full font-black uppercase tracking-[0.4em] text-[10px] flex items-center justify-center gap-4 hover:bg-[#c49f27] transition-all shadow-xl shadow-[#d4af37]/5">
                        {sending ? "Sending..." : <><Send size={14} /> Send Whisper</>}
                    </motion.button>
                </motion.form>
            </section>

            {/* --- FINAL FOOTER --- */}
            <footer className="py-24 border-t border-white/5 text-center relative">
                <motion.div animate={{ opacity: [0.1, 0.4, 0.1] }} transition={{ repeat: Infinity, duration: 4 }} className="mb-6"><Brush size={24} className="mx-auto" /></motion.div>
                <div className="text-xl font-['Mogra'] tracking-widest text-white mb-2">ArtByAnjali</div>
                <p className="text-[8px] uppercase tracking-[0.5em] text-neutral-600">&copy; 2026 Noir Exhibitionhall. All Rights Reserved.</p>
                <div className="mt-8 flex justify-center">
                    <a href="https://instagram.com/RWT._.ANURAG" target="_blank" rel="noreferrer" className="group flex items-center gap-2">
                        <span className="text-[7px] uppercase tracking-[0.4em] text-white/20">/</span>
                        <motion.div 
                            initial="hidden" 
                            whileInView="show" 
                            viewport={{ once: true }}
                            className="flex overflow-hidden"
                        >
                            {"made by the code magicien ANU₹AG".split("").map((char, idx) => (
                                <motion.span
                                    key={idx}
                                    variants={{
                                        hidden: { opacity: 0, x: -5 },
                                        show: { opacity: 1, x: 0 }
                                    }}
                                    transition={{ 
                                        delay: idx * 0.05,
                                        duration: 0.1,
                                        ease: "linear"
                                    }}
                                    className="text-[7px] uppercase tracking-[0.4em] text-white/30 group-hover:text-white transition-colors block whitespace-pre"
                                >
                                    {char}
                                </motion.span>
                            ))}
                        </motion.div>
                        <motion.span 
                            animate={{ opacity: [1, 0] }} 
                            transition={{ repeat: Infinity, duration: 0.6 }} 
                            className="w-1 h-3 bg-white/40" 
                        />
                    </a>
                </div>
            </footer>
            {/* --- LIGHTBOX MODAL --- */}
            <AnimatePresence>
                {selectedArtwork && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-12"
                    >
                        {/* Backdrop of Silence */}
                        <div className="absolute inset-0 bg-black/95 backdrop-blur-3xl" onClick={() => setSelectedArtwork(null)} />
                        
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative max-w-6xl w-full max-h-screen flex flex-col items-center justify-center pointer-events-none"
                        >
                            {/* The Masterpiece Focus */}
                            <div className="relative group pointer-events-auto">
                                <img 
                                    src={selectedArtwork.imageUrl} 
                                    className="max-w-full max-h-[70vh] object-contain shadow-2xl scale-100 hover:scale-[1.02] transition-transform duration-700 cursor-zoom-out" 
                                    onClick={() => setSelectedArtwork(null)}
                                />
                                <div className="absolute inset-0 border border-white/10 pointer-events-none" />
                            </div>
                            
                            {/* Manuscript Context */}
                            <div className="mt-10 text-center max-w-3xl px-6">
                                <h2 className="text-4xl md:text-6xl font-['Mogra'] mb-4 uppercase tracking-tighter leading-tight">{selectedArtwork.title}</h2>
                                <p className="font-['Caveat'] text-2xl md:text-3xl text-neutral-400 italic">"{selectedArtwork.description || "The soul's silent echo."}"</p>
                                <div className="mt-8 flex items-center justify-center gap-4">
                                    <div className="h-[1px] w-12 bg-white/10" />
                                    <div className="text-[10px] uppercase tracking-[0.6em] text-white/20 font-black">
                                         {selectedArtwork.category}
                                    </div>
                                    <div className="h-[1px] w-12 bg-white/10" />
                                </div>
                            </div>

                            {/* Exit Portal */}
                            <button 
                                onClick={() => setSelectedArtwork(null)}
                                className="absolute -top-10 right-0 md:top-0 md:-right-10 p-4 text-white/20 hover:text-white transition-all pointer-events-auto group"
                            >
                                <X size={40} className="group-hover:rotate-90 transition-transform duration-500" />
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Home;
