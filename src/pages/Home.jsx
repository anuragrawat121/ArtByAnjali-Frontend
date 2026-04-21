import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import {
  Instagram,
  Palette,
  MessageCircle,
  MapPin,
  Send,
  X,
  ChevronRight,
  ChevronLeft,
  Search,
  Brush,
  Wind,
  Sparkles,
} from "lucide-react";
import { getArtworks, getProfile, addMessage } from "../api";
import PublicNavbar from "../components/PublicNavbar";
import Loader from "../components/Loader";

const Home = () => {
  const [artworks, setArtworks] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [bgIndex, setBgIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [sending, setSending] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  // Mouse tracking (Desktop only)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isMobile) return;
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isMobile]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [artRes, profRes] = await Promise.all([
          getArtworks(),
          getProfile(),
        ]);
        setArtworks(artRes.data?.data?.artworks || []);
        setProfile(profRes.data?.data || null);
      } catch (err) {
        console.error("The Atelier is temporarily closed:", err);
      } finally {
        // Minimum 3s loader as requested
        setTimeout(() => setLoading(false), 3000);
      }
    };
    fetchData();
  }, []);

  // Back button support for modals
  useEffect(() => {
    if (selectedArtwork) {
      window.history.pushState({ modalOpen: true }, "");
    }
    const handlePopState = () => {
      if (selectedArtwork) setSelectedArtwork(null);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [selectedArtwork]);

  // Background cycling (Limit to 5 images for performance)
  useEffect(() => {
    if (artworks.length === 0) return;
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % Math.min(artworks.length, 5));
    }, 8000);
    return () => clearInterval(interval);
  }, [artworks]);

  const folders = useMemo(() => {
    const cats = ["All", ...new Set(artworks.map((art) => art.category))];
    return cats.map((cat) => ({
      name: cat,
      count: cat === "All" ? artworks.length : artworks.filter((a) => a.category === cat).length,
      image: artworks.find((a) => cat === "All" ? true : a.category === cat)?.imageUrl,
    }));
  }, [artworks]);

  const displayedArt = useMemo(() => {
    return selectedCategory === "All"
      ? artworks
      : artworks.filter((art) => art.category === selectedCategory);
  }, [artworks, selectedCategory]);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await addMessage(contactForm);
      setSubmitStatus("Vision Received");
      setContactForm({ name: "", email: "", message: "" });
      setTimeout(() => setSubmitStatus(null), 5000);
    } catch (err) {
      setSubmitStatus("Echo Lost. Try Again.");
    } finally {
      setSending(false);
    }
  };

  const { scrollYProgress } = useScroll();
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white selection:bg-[#D4AF37] selection:text-black overflow-x-hidden no-scrollbar">
      <PublicNavbar />

      {/* --- HERO: THE VESTIBULE --- */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <motion.div
          style={{ y: backgroundY }}
          className="absolute inset-0 z-0"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={bgIndex}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 0.4, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 2, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <img
                src={artworks[bgIndex]?.imageUrl}
                alt="Background Exhibit"
                className="w-full h-full object-cover grayscale brightness-50"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[#0f0f0f] via-transparent to-[#0f0f0f]" />
            </motion.div>
          </AnimatePresence>
        </motion.div>

        <div className="relative z-10 text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="space-y-4"
          >
            <p className="text-[10px] md:text-sm uppercase tracking-[1em] md:tracking-[1.5em] text-[#D4AF37] font-black italic opacity-60">
              {profile?.tagline || "PAHARI SOUL ARTISTIC HEART"}
            </p>
            <h1 className="text-7xl md:text-[14rem] font-['Mogra'] tracking-tighter leading-[0.8] uppercase pointer-events-none mix-blend-difference">
              ArtBy<span className="text-[#D4AF37]">Anjali</span>
            </h1>
            <div className="flex items-center justify-center gap-4 mt-8">
              <div className="h-[1px] w-12 bg-white/20" />
              <p className="text-[10px] uppercase tracking-[0.5em] text-neutral-400 font-light">
                The Noir Collection
              </p>
              <div className="h-[1px] w-12 bg-white/20" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 2 }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
          >
            <div className="w-[1px] h-16 bg-gradient-to-b from-[#D4AF37] to-transparent animate-pulse" />
            <span className="text-[8px] uppercase tracking-[0.4em] text-white/20">
              Scroll to Enter
            </span>
          </motion.div>
        </div>

        {/* Cinematic Particles (Desktop) */}
        {!isMobile && (
          <div className="absolute inset-0 pointer-events-none z-20">
            <motion.div
              animate={{
                x: mousePos.x * 0.05,
                y: mousePos.y * 0.05,
              }}
              className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-[120px]"
            />
            <motion.div
              animate={{
                x: -mousePos.x * 0.03,
                y: -mousePos.y * 0.03,
              }}
              className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-white/5 rounded-full blur-[150px]"
            />
          </div>
        )}
      </section>

      {/* --- EXHIBITION: THE GALLERIES --- */}
      <section id="exhibition" className="relative z-10 py-24 md:py-32 px-6 md:px-12 bg-[#0f0f0f]">
        <div className="max-w-7xl mx-auto mb-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
            <div className="space-y-2">
              <p className="text-[9px] uppercase tracking-[0.8em] text-[#D4AF37] font-black italic opacity-40">
                Curated
              </p>
              <h2 className="text-6xl md:text-8xl font-['Mogra'] tracking-tighter uppercase leading-none">
                Masterpieces
              </h2>
            </div>
            <div className="flex items-center gap-6">
              <div className="hidden md:block text-right">
                <p className="text-[9px] uppercase tracking-[0.4em] text-white/30">
                  Total Exhibits
                </p>
                <p className="text-2xl font-['Mogra'] text-[#D4AF37]">
                  {artworks.length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full border border-white/5 flex items-center justify-center group cursor-pointer hover:border-[#D4AF37]/40 transition-all">
                <Search size={18} className="text-white/20 group-hover:text-[#D4AF37] transition-all" />
              </div>
            </div>
          </div>

          {/* Folder Navigation */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {folders.map((folder, idx) => (
                <motion.div
                  key={folder.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.8, delay: idx * 0.1 }}
                  whileHover={isMobile ? {} : { y: -10 }}
                  onClick={() => setSelectedCategory(folder.name)}
                  className={`group relative aspect-square rounded-[35px] overflow-hidden cursor-pointer border transition-all duration-500 ${
                    selectedCategory === folder.name
                      ? "border-[#D4AF37] shadow-[0_0_40px_rgba(212,175,55,0.15)]"
                      : "border-white/5 grayscale md:hover:grayscale-0 hover:border-white/20"
                  }`}
                >
                  <img
                    src={folder.image}
                    alt={folder.name}
                    className={`w-full h-full object-cover transition-transform duration-1000 ${
                      selectedCategory === folder.name ? "scale-110" : "md:group-hover:scale-110"
                    }`}
                  />
                  <div className="absolute inset-0 bg-black/40 md:group-hover:bg-black/10 transition-colors" />
                  <div className="absolute inset-0 p-6 flex flex-col justify-end">
                    <p className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-black">
                      {String(folder.count).padStart(2, "0")}
                    </p>
                    <h3 className="text-lg md:text-xl font-['Mogra'] leading-tight uppercase">
                      {folder.name}
                    </h3>
                  </div>
                </motion.div>
              ))}
          </div>
        </div>

        {/* Artwork Grid */}
        <AnimatePresence mode="wait">
          {displayedArt.length > 0 && (
            <motion.div
              key={selectedCategory}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-20">
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
                        onLoad={(e) => e.target.classList.remove("opacity-0")}
                        className="w-full h-full object-cover md:group-hover:scale-110 transition-all duration-1000 ease-out opacity-0"
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
                  onLoad={(e) => e.target.classList.remove("opacity-0")}
                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-[2s] ease-out opacity-0"
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
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- INQUIRY: THE WHISPERS --- */}
      <section
        id="contact"
        className="py-32 md:py-48 px-6 max-w-4xl mx-auto text-center relative"
      >
        <div className="relative mb-20">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.05, 0.1, 0.05],
            }}
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
          {submitStatus && <p className="text-center text-[10px] uppercase tracking-widest text-[#D4AF37] mt-4 font-black">{submitStatus}</p>}
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
              className="relative z-[1050] max-w-6xl w-full max-h-[90vh] bg-[#231C18] border border-white/10 rounded-[40px] overflow-hidden shadow-2xl overflow-y-auto no-scrollbar shadow-[0_0_100px_rgba(0,0,0,0.8)]"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="relative aspect-square lg:aspect-auto lg:h-[80vh] overflow-hidden group/modal">
                  <img
                    src={selectedArtwork.imageUrl}
                    alt={selectedArtwork.title}
                    loading="lazy"
                    onLoad={(e) => e.target.classList.remove("opacity-0")}
                    className="w-full h-full object-contain bg-black/40 p-4 transition-all duration-1000 opacity-0"
                  />
                  <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.4)] pointer-events-none" />
                </div>
                <div className="p-8 md:p-16 flex flex-col justify-center space-y-10">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="h-[1px] w-8 bg-[#D4AF37]" />
                      <p className="text-[10px] uppercase tracking-[0.5em] text-[#D4AF37] font-black">
                        #{selectedArtwork._id.slice(-6)}
                      </p>
                    </div>
                    <h2 className="text-5xl md:text-7xl font-['Mogra'] tracking-tighter uppercase leading-none">
                      {selectedArtwork.title}
                    </h2>
                  </div>

                  <p className="font-['Mogra'] text-lg md:text-xl text-neutral-400 leading-relaxed italic">
                    "{selectedArtwork.description || "The silence speaks louder than the brush."}"
                  </p>

                  <div className="pt-10 border-t border-white/5 flex flex-col sm:flex-row items-center gap-8 translate-y-2">
                    <div className="text-center sm:text-left">
                      <p className="text-[9px] uppercase tracking-widest text-white/20 mb-1">
                        Acquisition
                      </p>
                      <p className="text-3xl font-['Mogra'] text-[#D4AF37]">
                        ₹{selectedArtwork.price}
                      </p>
                    </div>
                    <div className="flex-1 w-full">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-white text-black font-black py-4 rounded-full uppercase tracking-[0.4em] text-[10px] shadow-2xl hover:bg-[#D4AF37] transition-all"
                        onClick={() => {
                          const msg = `Hello Anjali, I am captivated by '${selectedArtwork.title}' and wish to bring it to my collection.`;
                          window.open(
                            `https://wa.me/917409277026?text=${encodeURIComponent(msg)}`,
                            "_blank"
                          );
                        }}
                      >
                        Claim Masterpiece
                      </motion.button>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-[9px] uppercase tracking-widest text-white/10 font-bold">
                    <div className="h-[1px] w-12 bg-white/10" />
                    {selectedArtwork.category}
                    <div className="h-[1px] w-12 bg-white/10" />
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ARCHIVAL FOOTER */}
      <motion.footer 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
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
