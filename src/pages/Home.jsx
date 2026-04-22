import { useEffect, useState, useMemo } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import { getArtworks, getProfile, submitContact } from "../api";
import {
  ImageIcon,
  Send,
  Instagram,
  Mail,
  MapPin,
  Brush,
  ChevronDown,
  CheckCircle,
  AlertCircle,
  X,
  Palette,
  ExternalLink,
  MessageCircle,
  PlusCircle,
  ArrowLeft,
} from "lucide-react";
import PublicNavbar from "../components/PublicNavbar";
import Loader from "../components/Loader";
import CustomCursor from "../components/CustomCursor";

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
      type === "success"
        ? "bg-white/10 border-white/20 text-white"
        : "bg-red-500/10 border-red-500/20 text-red-400"
    }`}
  >
    {type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
    <span className="text-[11px] font-bold uppercase tracking-widest">
      {msg}
    </span>
    <button
      onClick={clear}
      className="ml-auto opacity-40 hover:opacity-100 transition-opacity"
    >
      <X size={14} />
    </button>
  </motion.div>
);

const Home = () => {
  const { scrollY } = useScroll();
  const skillsX = useTransform(scrollY, [0, 1000], [0, -500]);
  const skillsXReverse = useTransform(scrollY, [0, 1000], [-500, 0]);

  // Core Data State
  const [artworks, setArtworks] = useState([]);

  const scrollToSection = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };
  const [profile, setProfile] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Mobile Detection
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) return;
    const handleMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [isMobile]);

  // UI State
  const [status, setStatus] = useState({
    show: false,
    msg: "",
    type: "success",
  });
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [sending, setSending] = useState(false);
  const [bgIndex, setBgIndex] = useState(0);

  // Initial Studio Sync with Cold-Start Recovery
  useEffect(() => {
    const startTime = Date.now();
    const fetchData = async (retries = 1) => {
      try {
        const [artRes, profRes] = await Promise.all([
          getArtworks(),
          getProfile(),
        ]);

        const arts = artRes.data?.data?.artworks || [];
        const prof = profRes.data?.data || {};

        // If we got nothing, maybe server is still waking up
        if (arts.length === 0 && retries > 0) {
          await new Promise((r) => setTimeout(r, 1500));
          return fetchData(retries - 1);
        }

        setArtworks(arts);
        setProfile(prof);
      } catch (err) {
        if (retries > 0) {
          await new Promise((r) => setTimeout(r, 1500));
          return fetchData(retries - 1);
        }
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
      // Normalize: Trim and Ensure First Letter Capital (e.g. "wall painting" -> "Wall painting")
      const rawCat = art.category?.trim();
      const catName = rawCat ? rawCat.charAt(0).toUpperCase() + rawCat.slice(1) : "Uncategorized";
      
      if (!acc[catName]) {
        acc[catName] = {
          name: catName,
          cover: art.imageUrl,
          count: 0,
          artworks: [],
        };
      }
      acc[catName].artworks.push(art);
      acc[catName].count += 1;
      return acc;
    }, {});
    return Object.values(groups);
  }, [artworks]);

  const displayedArt = useMemo(() => {
    if (!selectedCategory) return [];
    return artworks.filter((a) => {
      const raw = a.category?.trim();
      const norm = raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : "Uncategorized";
      return norm === selectedCategory;
    });
  }, [artworks, selectedCategory]);

  const activeFolder = useMemo(() => 
    folders.find(f => f.name === selectedCategory),
    [folders, selectedCategory]
  );

  // PRE-SELECT HERO BACKGROUNDS: Only use first 5 high-res masterpieces to save bandwidth
  const heroArtworks = useMemo(() => artworks.slice(0, 5), [artworks]);

  // --- BROWSER BACK BUTTON INTEGRATION ---
  useEffect(() => {
    // When a modal or room is open, push a state
    if (selectedArtwork || selectedCategory) {
      window.history.pushState({ modalOpen: true }, "");
    }

    const handlePopState = () => {
      if (selectedArtwork) {
        setSelectedArtwork(null);
      } else if (selectedCategory) {
        setSelectedCategory(null);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [selectedArtwork, selectedCategory]);

  // --- ROOM ENTRY NAVIGATION ---
  useEffect(() => {
    if (selectedCategory) {
      const element = document.getElementById("gallery");
      if (element) {
        // Precise alignment for the room title
        const offset = 80; // Account for fixed navbar
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = element.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    }
  }, [selectedCategory]);

  // The Living Canvas: Background Cycling (10s rhythm) - Limited to top 5 assets
  useEffect(() => {
    if (heroArtworks.length <= 1) return;
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % heroArtworks.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [heroArtworks]);

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
      setContactForm({ name: "", email: "", message: "" });
    } catch (err) {
      showNotify("The echo failed. Try again.", "error");
    } finally {
      setSending(false);
    }
  };

  /** --- MOTION VARIANTS --- **/
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.3 },
    },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9, rotateX: 15 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      rotateX: 0,
      transition: {
        type: "spring",
        stiffness: 40,
        damping: 18,
        mass: 1.2,
      },
    },
  };
  const sectionVariants = {
    hidden: { opacity: 0, filter: "blur(10px)" },
    show: { opacity: 1, filter: "blur(0px)", transition: { duration: 1 } },
  };
  // SCROLL LOCK
  useEffect(() => {
    if (selectedArtwork) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden"; // Ensure both are locked
    } else {
      document.body.style.overflow = "unset";
      document.documentElement.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      document.documentElement.style.overflow = "unset";
    };
  }, [selectedArtwork]);

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-[#231C18] text-[#E8D5C4] selection:bg-[#D4AF37] selection:text-[#231C18] overflow-x-hidden relative">
      {/* GLOBAL ARCHIVAL GRAIN */}
      <div className="fixed inset-0 z-[1] pointer-events-none opacity-[0.03] mix-blend-overlay hidden md:block">
        <svg
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <filter id="noise">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.65"
              numOctaves="3"
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noise)" />
        </svg>
      </div>

      {/* CURSOR AMBIENT LIGHT - Optimized for performance */}
      <div
        className="fixed w-[600px] h-[600px] rounded-full pointer-events-none z-0 opacity-10 bg-[radial-gradient(circle,rgba(212,175,55,0.15)_0%,transparent_70%)] transition-transform duration-300 ease-out"
        style={{
          willChange: "transform",
          transform: `translate(${mousePos.x - 300}px, ${mousePos.y - 300}px)`,
        }}
      />

      <AnimatePresence>
        {status.show && (
          <StatusNotification
            msg={status.msg}
            type={status.type}
            clear={() => setStatus({ ...status, show: false })}
          />
        )}
      </AnimatePresence>
      <CustomCursor />
      <PublicNavbar />

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
                src={heroArtworks[bgIndex]?.imageUrl || ""}
                alt="Background Art"
                loading="lazy"
                onLoad={(e) => e.target.classList.remove("opacity-0")}
                className="w-full h-full object-cover md:scale-105 opacity-0 transition-opacity duration-1000"
              />
            </motion.div>
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#231C18]/50 to-[#231C18]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="relative z-10 text-center px-6 pt-24"
        >
          <div className="relative inline-block">
            <h1 className="relative z-10 flex flex-wrap justify-center items-center text-6xl md:text-[9rem] font-['Mogra'] tracking-tighter leading-none">
              {(profile?.fullName || "ArtByAnjali")
                .split(" ")
                .map((part, pIdx) => (
                  <span key={pIdx} className="flex">
                    {part.split("").map((char, cIdx) => (
                      <motion.span
                        key={cIdx}
                        initial={{ y: 20, opacity: 0, scale: 0.8 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        whileHover={{
                          color: [
                            "#D4AF37",
                            "#FF6B6B",
                            "#4ECDC4",
                            "#9B59B6",
                            "#feca57",
                            "#D4AF37",
                          ], // Vibrant chromatic transition
                          scale: 1.2,
                          y: -10,
                          rotate: [0, 5, -5, 0],
                          transition: { duration: 0.4, repeat: Infinity },
                        }}
                        transition={{
                          duration: 0.8,
                          delay: 0.2 + pIdx * 0.15 + cIdx * 0.03,
                          ease: [0.33, 1, 0.68, 1],
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

          {/* TAGLINE RESTORED */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ delay: 2, duration: 1 }}
            className="mt-4 mb-4"
          >
            <p className="text-[12px] uppercase tracking-[0.4em] font-normal text-[#D4AF37]">
              PAHARI SOUL ARTISTIC HEART
            </p>
          </motion.div>

          {/* SKILLS SLIDING STRIPES - Dual Direction Kinetic Experience */}
          <div className="relative w-screen left-1/2 -translate-x-1/2 flex flex-col gap-0 my-12 pointer-events-none select-none">
            {/* Upper Strip: Move Left */}
            <div
              className="relative overflow-hidden py-4 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent border-y border-white/5"
              style={{
                maskImage:
                  "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
              }}
            >
              <motion.div
                style={{ x: skillsX, willChange: "transform" }}
                className="flex whitespace-nowrap gap-12"
              >
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-12">
                    {(
                      profile?.expertise || [
                        "Canvas painting",
                        "Portrait",
                        "Sketch",
                        "Stone art",
                        "Wall painting",
                      ]
                    ).map((skill) => (
                      <div
                        key={`${i}-${skill}`}
                        className="flex items-center gap-12 group pointer-events-auto"
                      >
                        <span className="text-[10px] md:text-[16px] uppercase tracking-[0.4em] font-['Mogra'] text-white/30 group-hover:text-[#D4AF37] transition-all duration-500 group-hover:scale-110 cursor-default">
                          {skill}
                        </span>
                        <div className="w-1 h-1 rounded-full bg-white/10 group-hover:bg-[#D4AF37]/40 transition-colors" />
                      </div>
                    ))}
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Lower Strip: Move Right */}
            <div
              className="relative overflow-hidden py-6 bg-gradient-to-r from-transparent via-white/[0.01] to-transparent border-b border-white/5 -mt-[1px]"
              style={{
                maskImage:
                  "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
              }}
            >
              <motion.div
                style={{ x: skillsXReverse, willChange: "transform" }}
                className="flex whitespace-nowrap gap-12"
              >
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-12">
                    {(
                      profile?.expertise || [
                        "Stone Art",
                        "Oil Painting",
                        "Custom Portrait",
                        "Wall Decor",
                        "Charcoal Sketch",
                      ]
                    )
                      .reverse()
                      .map((skill) => (
                        <div
                          key={`${i}-${skill}`}
                          className="flex items-center gap-12 group pointer-events-auto"
                        >
                          <span className="text-[9px] md:text-[13px] uppercase tracking-[0.6em] font-light text-white/10 group-hover:text-[#D4AF37] transition-all duration-700 italic cursor-default">
                            {skill}
                          </span>
                          <Brush
                            size={12}
                            className="text-white/5 group-hover:text-[#D4AF37]/20 transition-colors rotate-[-45deg]"
                          />
                        </div>
                      ))}
                  </div>
                ))}
              </motion.div>
            </div>
          </div>

          <div className="max-w-xl mx-auto h-[1px] bg-black/10 mb-8 relative overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 2, delay: 1.5 }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-black/20 to-transparent"
            />
          </div>
          <div className="flex flex-col sm:flex-row justify-center gap-6 items-center">
            <a
              href="#gallery"
              onClick={(e) => scrollToSection(e, "gallery")}
              className="group px-10 py-5 bg-[#D4AF37] text-[#1A1512] font-normal uppercase text-[12px] tracking-[0.1em] rounded-full hover:bg-white transition-all flex items-center gap-3 shadow-2xl font-['Mogra']"
            >
              Enter Gallery{" "}
              <ChevronDown
                size={14}
                className="group-hover:translate-y-1 transition-transform"
              />
            </a>
            <a
              href="#contact"
              onClick={(e) => scrollToSection(e, "contact")}
              className="px-10 py-5 border border-white/10 hover:bg-white/5 transition-all uppercase text-[12px] tracking-[0.1em] font-normal rounded-full backdrop-blur-sm font-['Mogra'] text-white"
            >
              Begin Inquiry
            </a>
          </div>
        </motion.div>
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-20"
        >
          <div className="w-[1px] h-20 bg-gradient-to-b from-white to-transparent" />
        </motion.div>
      </section>

      {/* --- GALLERY: THE EXHIBITS --- */}
      <section
        id="gallery"
        className="max-w-7xl mx-auto px-6 py-16 min-h-screen"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="flex flex-col items-center text-center"
        >
          <p className="text-[9px] uppercase tracking-[0.5em] text-white/30 font-black mb-2">
            Curated Collection
          </p>
          <h2 className="text-5xl md:text-7xl font-['Mogra'] tracking-tighter capitalize mb-6">
            The Masterpieces
          </h2>

          <div className="flex bg-[#1A1A1A] p-1.5 rounded-full border border-white/10 mb-4 overflow-x-auto no-scrollbar max-w-full">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`relative px-8 py-3 rounded-full text-[11px] uppercase tracking-widest transition-all ${!selectedCategory ? "text-white font-black" : "text-neutral-500 hover:text-black"}`}
            >
              {!selectedCategory && (
                <motion.div
                  layoutId="room-bg"
                  className="absolute inset-0 bg-[#1A1A1A] rounded-full z-0"
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <Palette size={12} /> All Collections
              </span>
            </button>
            {folders.map((folder) => (
              <button
                key={folder.name}
                onClick={() => setSelectedCategory(folder.name)}
                className={`relative px-8 py-3 rounded-full text-[11px] uppercase tracking-widest transition-all whitespace-nowrap ${selectedCategory === folder.name ? "text-black font-black" : "text-neutral-500 hover:text-white"}`}
              >
                {selectedCategory === folder.name && (
                  <motion.div
                    layoutId="room-bg"
                    className="absolute inset-0 bg-white rounded-full z-0"
                  />
                )}
                <span className="relative z-10">{folder.name}</span>
              </button>
            ))}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {!selectedCategory ? (
            <motion.div
              key="folders"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-14"
            >
              {folders.map((folder, idx) => (
                <motion.div
                  key={folder.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.8, delay: idx * 0.1 }}
                  whileHover={isMobile ? {} : { y: -10 }}
                  onClick={() => setSelectedCategory(folder.name)}
                  className="group cursor-none"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-black/[0.1] shadow-2xl shimmer-container">
                    <img
                      src={folder.cover || "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=2071&auto=format&fit=crop"}
                      loading="lazy"
                      onLoad={(e) => e.target.classList.remove("opacity-0")}
                      onError={(e) => e.target.classList.remove("opacity-0")}
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-1000 ease-out opacity-0"
                    />
                    <div className="absolute inset-0 bg-black/10 transition-all" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <h3 className="text-3xl font-['Mogra'] tracking-wider uppercase mb-2 text-white">
                          {folder.name}
                        </h3>
                        <p className="text-[10px] uppercase tracking-[0.4em] text-white/80 font-normal">
                          {folder.count} Artworks
                        </p>
                      </div>
                    </div>
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all translate-y-0 md:translate-y-4 md:group-hover:translate-y-0">
                      <span className="px-8 py-3 bg-[#1A1A1A] text-white rounded-full text-[9px] uppercase font-black tracking-widest">
                        Explore Exhibit
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="collection"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-12"
            >
              {/* THE CURATOR'S HEADER */}
              <div className="flex flex-col md:flex-row justify-between items-end gap-10 pb-10 border-b border-white/5">
                <motion.div
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="text-left w-full"
                >
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="group flex items-center gap-3 text-[10px] uppercase tracking-widest text-[#D4AF37] hover:text-white transition-all mb-8 font-normal"
                  >
                    <ArrowLeft
                      size={14}
                      className="group-hover:-translate-x-1 transition-transform"
                    />{" "}
                    Return to Collections
                  </button>
                  <h2 className="text-6xl md:text-[9rem] font-['Mogra'] tracking-tighter uppercase leading-[0.8] text-[#D4AF37] relative z-10 pt-4">
                    {selectedCategory}
                  </h2>
                </motion.div>

                <motion.div
                  key={selectedCategory}
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="max-w-md text-right hidden lg:block"
                >
                  <p className="font-['Mogra'] text-lg md:text-xl text-neutral-400 capitalize leading-relaxed">
                    {selectedCategory === "Canvas painting" &&
                      "The weight of texture and the depth of the soul's stroke."}
                    {selectedCategory === "Colour portrait" &&
                      "A vibrant echo of identity, captured in the dance of hues."}
                    {selectedCategory === "Sketch" &&
                      "Raw thoughts transcribed to paper, where the pencil meets the void."}
                    {selectedCategory === "Stone art" &&
                      "Ancient spirits awakened from the heart of the earth."}
                    {selectedCategory === "Wall painting" &&
                      "Transforming architecture into an expansive dreamscape."}
                    {selectedCategory === "Wooden painting" &&
                      "Organic grains serving as a canvas for natural wisdom."}
                    {![
                      "Canvas painting",
                      "Colour portrait",
                      "Sketch",
                      "Stone art",
                      "Wall painting",
                      "Wooden painting",
                    ].includes(selectedCategory) &&
                      "A unique exploration of form and emotion, curated for the modern observer."}
                  </p>
                </motion.div>
              </div>

              <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-14">
                {displayedArt.map((art, idx) => (
                  <motion.div
                    key={art._id}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.1 }}
                    transition={{ duration: 0.7, delay: idx * 0.05 }}
                    onClick={() => setSelectedArtwork(art)}
                    className="group cursor-none active:scale-95 transition-transform"
                  >
                    <div className="relative aspect-[3/4] overflow-hidden bg-black/[0.02] rounded-[30px] mb-8 border border-black/5 shadow-2xl shimmer-container">
                      <img
                        src={art.imageUrl}
                        alt={art.title}
                        loading="lazy"
                        onLoad={(e) => e.target.classList.remove("opacity-0", "blur-xl", "scale-110")}
                        onError={(e) => e.target.classList.remove("opacity-0", "blur-xl", "scale-110")}
                        className="w-full h-full object-cover md:group-hover:scale-110 transition-all duration-[1.5s] ease-out opacity-0 blur-xl scale-110"
                      />
                    </div>
                    <div className="px-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-2xl font-['Mogra'] tracking-tight group-hover:text-neutral-400 transition-colors uppercase leading-tight">
                            {art.title}
                          </h3>
                          {art.description && (
                            <p className="font-['Mogra'] text-sm text-neutral-400 mt-2 line-clamp-2 leading-relaxed">
                              "{art.description}"
                            </p>
                          )}
                          <div className="text-[9px] text-[#D4AF37] uppercase font-normal tracking-[0.3em] mt-3 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-[#D4AF37]/40 rounded-full" />{" "}
                            {art.category}
                          </div>
                        </div>
                        <span className="font-['Mogra'] text-sm text-[#D4AF37]/30 group-hover:text-white/40 transition-colors mt-1 uppercase tracking-widest">
                          #{art._id.slice(-4)}
                        </span>
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
            <p className="text-[10px] uppercase tracking-[1em] text-white/10 font-black italic">
              Exhibits arriving soon.
            </p>
          </div>
        )}
      </section>

      {/* --- ABOUT: THE ATELIER (The Museum Installation) --- */}
      <section
        id="about"
        className="pt-24 md:pt-32 pb-12 relative overflow-hidden text-white/90"
      >
        {/* ATMOSPHERIC SPECTERS (PARALLAX DEPTH) - Hidden on mobile for performance */}
        {!isMobile && (
          <>
            <>
              <div className="absolute top-10 left-10 text-[10rem] md:text-[20rem] font-['Mogra'] uppercase tracking-tighter leading-none select-none pointer-events-none italic whitespace-nowrap opacity-[0.02]">
                A for Art
              </div>
              <div className="absolute bottom-20 right-10 text-[10rem] md:text-[20rem] font-['Mogra'] uppercase tracking-tighter leading-none select-none pointer-events-none whitespace-nowrap opacity-[0.02]">
                B for Brush
              </div>
            </>
          </>
        )}
        <div className="max-w-6xl mx-auto px-10 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            {/* THE MASTER'S FRAME (Circular Portrait) */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 1 }}
              className="lg:col-span-5 flex justify-center lg:justify-start relative"
            >
              <div className="relative w-56 h-56 md:w-[360px] md:h-[360px] rounded-full overflow-hidden border border-black/10 shadow-2xl bg-black/5 group">
                <motion.img
                  whileHover={isMobile ? {} : { scale: 1.05 }}
                  src={profile?.profileImageUrl || ""}
                  loading="lazy"
                  onLoad={(e) => e.target.classList.remove("opacity-0", "blur-xl")}
                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-[2s] ease-out opacity-0 blur-xl"
                  style={{ objectPosition: profile?.imagePosition || "center" }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f]/40 via-transparent to-transparent" />

                {/* Kinetic Mark */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    repeat: Infinity,
                    duration: 20,
                    ease: "linear",
                  }}
                  className="absolute inset-0 border-[1px] border-dashed border-white/5 rounded-full pointer-events-none"
                />
                {/* Floating Instagram Link */}
                <motion.a
                  href="https://www.instagram.com/i_anjalibisht?igsh=MTI4MzIydHoyMW0yMQ=="
                  target="_blank"
                  rel="noreferrer"
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute top-4 right-4 w-12 h-12 bg-[#D4AF37] text-[#1A1512] rounded-full flex items-center justify-center shadow-2xl z-20 cursor-pointer"
                  title="Follow the Vision on Instagram"
                >
                  <Instagram size={20} />
                </motion.a>
              </div>
            </motion.div>

            {/* THE SOUL'S MANUSCRIPT */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="lg:col-span-7 flex flex-col justify-center text-center lg:text-left space-y-6"
            >
              <div className="space-y-1">
                <motion.p
                  initial={{ opacity: 0.3 }}
                  className="text-[9px] uppercase tracking-[0.8em] font-black"
                >
                  Behind the Brush
                </motion.p>
                <h2 className="text-6xl md:text-8xl font-['Mogra'] tracking-tighter uppercase leading-[0.9]">
                  The <span className="text-white/20 italic">Atelier</span>
                </h2>
              </div>

              <p className="font-['Mogra'] text-lg md:text-xl leading-relaxed text-neutral-400 max-w-4xl mx-auto lg:mx-0">
                {profile?.bio ||
                  "Every stroke is a secret whispered in the language of color, found in the heart of the Atelier."}
              </p>

              <div className="pt-8 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-1">
                  <p className="text-[9px] uppercase tracking-widest text-white/20">
                    Location
                  </p>
                  <div className="flex items-center justify-center lg:justify-start gap-3 text-white/60">
                    <MapPin size={16} className="text-white/20" />
                    <span className="text-xs font-bold tracking-[0.2em] uppercase">
                      {profile?.location || "Kotdwar Pauri Garhwal Uttarakhand"}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] uppercase tracking-widest text-white/20">
                    Connection
                  </p>
                  <div className="flex items-center justify-center lg:justify-start gap-4 flex-wrap">
                    <a
                      href={`mailto:${profile?.email}`}
                      title="Email"
                      className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-all border border-white/10 group"
                    >
                      <Mail
                        size={16}
                        className="text-white/20 group-hover:text-black transition-colors"
                      />
                    </a>
                    <a
                      href={
                        profile?.socialLinks?.instagram ||
                        "https://www.instagram.com/i_anjalibisht?igsh=MTI4MzIydHoyMW0yMQ=="
                      }
                      target="_blank"
                      rel="noreferrer"
                      title="Instagram"
                      className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-all border border-white/10 group"
                    >
                      <Instagram
                        size={16}
                        className="text-white/20 group-hover:text-black transition-colors"
                      />
                    </a>
                    {profile?.socialLinks?.whatsapp && (
                      <a
                        href={`https://wa.me/${profile.socialLinks.whatsapp.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        title="WhatsApp"
                        className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-all border border-white/10 group"
                      >
                        <MessageCircle
                          size={16}
                          className="text-white/20 group-hover:text-black transition-colors"
                        />
                      </a>
                    )}
                    {profile?.socialLinks?.behance && (
                      <a
                        href={profile.socialLinks.behance}
                        target="_blank"
                        rel="noreferrer"
                        title="Behance"
                        className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-all border border-white/10 group"
                      >
                        <Palette
                          size={16}
                          className="text-white/20 group-hover:text-black transition-colors"
                        />
                      </a>
                    )}
                    {profile?.socialLinks?.linkedin && (
                      <a
                        href={profile.socialLinks.linkedin}
                        target="_blank"
                        rel="noreferrer"
                        title="LinkedIn"
                        className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-all border border-white/10 group"
                      >
                        <PlusCircle
                          size={16}
                          className="text-white/20 group-hover:text-black transition-colors"
                        />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- CONTACT: WHISPERS --- */}
      <section
        id="contact"
        className="py-12 relative max-w-xl mx-auto px-6 text-center"
      >
        {/* THE BREATHING VOID */}
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.03, 0.05, 0.03] }}
          transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
          className="absolute inset-0 z-0 bg-[radial-gradient(circle,white_0%,transparent_70%)] rounded-full pointer-events-none opacity-5 md:blur-3xl"
        />

        {/* Header with floating text effect */}
        <div className="relative z-10 overflow-hidden mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <p className="text-[9px] uppercase tracking-[0.8em] text-[#D4AF37] font-black mb-3 italic opacity-40">
              Inquire
            </p>
            <h2 className="text-5xl md:text-6xl font-['Mogra'] mb-3 tracking-tighter uppercase leading-none">
              Whispers
            </h2>
            <div className="w-10 h-[1px] bg-[#D4AF37]/30 mx-auto mb-4" />
            <p className="text-neutral-500 text-xs uppercase tracking-[0.2em] font-light max-w-sm mx-auto leading-relaxed">
              Collaborate or commission a unique vision.
            </p>
          </motion.div>
        </div>

        {/* Form Container with Glassmorphism */}
        <motion.form
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          onSubmit={handleContactSubmit}
          className="group space-y-6 text-left bg-white/[0.02] backdrop-blur-md lg:backdrop-blur-xl border border-white/5 p-8 md:p-10 rounded-[40px] shadow-2xl hover:border-white/10 transition-all duration-700"
        >
          <div className="space-y-5">
            {[
              {
                id: "name",
                label: "Identity",
                type: "text",
                placeholder: "The seeker's name...",
                value: contactForm.name,
              },
              {
                id: "email",
                label: "Echo Path",
                type: "email",
                placeholder: "your@email.com",
                value: contactForm.email,
              },
            ].map((field, idx) => (
              <motion.div
                key={field.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="space-y-2"
              >
                <label className="text-[9px] uppercase tracking-[0.3em] text-[#D4AF37]/50 ml-6 font-bold">
                  {field.label}
                </label>
                <div className="relative group/input">
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    required
                    className="w-full bg-white/[0.03] border border-white/5 rounded-full px-8 py-3.5 focus:outline-none focus:border-[#D4AF37]/30 focus:bg-white/[0.05] transition-all text-sm text-white placeholder:text-white/10 font-['Mogra']"
                    value={field.value}
                    onChange={(e) =>
                      setContactForm({
                        ...contactForm,
                        [field.id]: e.target.value,
                      })
                    }
                  />
                  <div className="absolute inset-x-8 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/0 to-transparent group-focus-within/input:via-[#D4AF37]/20 transition-all duration-700" />
                </div>
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="space-y-2"
            >
              <label className="text-[9px] uppercase tracking-[0.3em] text-[#D4AF37]/50 ml-6 font-bold">
                The Whisper
              </label>
              <div className="relative group/input">
                <textarea
                  placeholder="Speak your vision into the void..."
                  required
                  className="w-full bg-white/[0.03] border border-white/5 rounded-[30px] px-8 py-5 h-28 focus:outline-none focus:border-[#D4AF37]/30 focus:bg-white/[0.05] transition-all resize-none text-sm font-['Mogra'] text-white placeholder:text-white/10"
                  value={contactForm.message}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, message: e.target.value })
                  }
                />
                <div className="absolute inset-x-8 bottom-3 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/0 to-transparent group-focus-within/input:via-[#D4AF37]/20 transition-all duration-700" />
              </div>
            </motion.div>
          </div>

          <motion.button
            whileHover={{
              scale: 1.01,
              backgroundColor: "#D4AF37",
              color: "#1A1512",
            }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={sending}
            className="w-full bg-white/5 border border-white/10 py-4 rounded-full font-black uppercase tracking-[0.4em] text-[10px] flex items-center justify-center gap-4 transition-all duration-500 shadow-2xl relative overflow-hidden group/btn"
          >
            <div className="absolute inset-0 bg-[#D4AF37] translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500 ease-[0.16, 1, 0.3, 1] z-0" />
            <span className="relative z-10 flex items-center gap-4">
              {sending ? (
                "Transcribing..."
              ) : (
                <>
                  <Send
                    size={15}
                    className="group-hover/btn:rotate-12 transition-transform"
                  />{" "}
                  Send Whisper
                </>
              )}
            </span>
          </motion.button>
        </motion.form>
      </section>

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
            <div
              className="absolute inset-0 bg-black/95 backdrop-blur-lg cursor-pointer"
              onClick={() => setSelectedArtwork(null)}
            />

            {/* CLOSE BUTTON */}
            <motion.button
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ rotate: 90, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSelectedArtwork(null)}
              className="absolute top-8 right-8 z-[1100] w-14 h-14 bg-[#D4AF37] text-[#231C18] rounded-full flex items-center justify-center shadow-2xl transition-all"
            >
              <X size={24} />
            </motion.button>

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative max-w-6xl w-full max-h-screen flex flex-col items-center justify-center pointer-events-none px-4"
            >
              {/* The Masterpiece Focus */}
              <div className="relative group pointer-events-auto flex items-center justify-center w-full">
                <img
                  src={selectedArtwork.imageUrl}
                  loading="lazy"
                  onLoad={(e) => e.target.classList.remove("opacity-0", "blur-xl", "scale-110")}
                  className="max-w-full max-h-[60vh] md:max-h-[70vh] object-contain shadow-2xl scale-110 opacity-0 blur-xl hover:scale-[1.01] transition-all duration-[1.5s] cursor-zoom-out"
                  onClick={() => setSelectedArtwork(null)}
                />
                <div className="absolute inset-0 border border-white/10 pointer-events-none" />
              </div>

              {/* Manuscript Context */}
              <div className="mt-6 text-center max-w-3xl px-6 pointer-events-auto overflow-y-auto no-scrollbar pb-12">
                <h2 className="text-3xl md:text-5xl font-['Mogra'] mb-2 uppercase tracking-tighter leading-tight">
                  {selectedArtwork.title}
                </h2>

                {selectedArtwork.price && (
                  <p className="text-[#D4AF37] font-['Mogra'] text-xl md:text-2xl mb-4 tracking-widest italic">
                    ₹{selectedArtwork.price.toLocaleString()}
                  </p>
                )}

                <p className="font-['Mogra'] text-base md:text-lg text-neutral-400 mb-6 italic leading-relaxed">
                  "{selectedArtwork.description || "The soul's silent echo."}"
                </p>

                {selectedArtwork.details && (
                  <div className="mb-8 p-4 bg-white/5 border border-white/10 rounded-2xl">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-2 font-black">
                      Medium & Dimensions
                    </p>
                    <p className="font-['Mogra'] text-sm md:text-base text-neutral-300">
                      {selectedArtwork.details}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-center gap-4">
                  <div className="h-[1px] w-12 bg-white/10" />
                  <div className="text-[10px] uppercase tracking-[0.6em] text-white/20 font-black">
                    {selectedArtwork.category}
                  </div>
                  <div className="h-[1px] w-12 bg-white/10" />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ARCHIVAL FOOTER */}
      <motion.footer
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2 }}
        className="relative z-10 py-20 border-t border-white/5 text-center mt-20"
      >
        <h2 className="text-2xl font-['Mogra'] text-[#D4AF37] tracking-[0.3em] mb-4">
          ArtByAnjali
        </h2>
        <div className="flex justify-center gap-8 mb-8">
          {[
            {
              icon: Instagram,
              href: "https://www.instagram.com/i_anjalibisht?igsh=MTI4MzIydHoyMW0yMQ==",
            },
            { icon: Palette, href: "#" },
            { icon: MessageCircle, href: "#" },
          ].map((social, idx) => (
            <motion.a
              key={idx}
              href={social.href}
              target="_blank"
              whileHover={{ y: -5, color: "#D4AF37" }}
              className="text-white/40 transition-colors"
            >
              <social.icon size={20} />
            </motion.a>
          ))}
        </div>
        <p className="text-[9px] uppercase tracking-[0.5em] text-white/20 mb-4 px-6 leading-relaxed">
          Sculpting Light & Shadow • All Rights Reserved 2026
        </p>
        <div className="mt-8 pt-8 border-t border-white/5 inline-block">
          <a
            href="https://instagram.com/RWT._.ANURAG"
            target="_blank"
            rel="noreferrer"
            className="text-[8px] uppercase tracking-[0.4em] text-[#D4AF37]/60 hover:text-[#D4AF37] transition-all font-normal"
          >
            made by the code Magician ANU₹AG
          </a>
        </div>
      </motion.footer>
    </div>
  );
};

export default Home;
