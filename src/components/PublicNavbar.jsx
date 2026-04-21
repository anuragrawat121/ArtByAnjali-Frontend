import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Palette, Brush, Menu, X } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';

/**
 * NOIR PUBLIC NAVBAR (Responsive)
 * A cinematic, adaptive navigation component for the portfolio visitor.
 * Now features smart scroll behavior: Hides on scroll down, reveals on scroll up.
 */
const PublicNavbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const { scrollY } = useScroll();
    const [lastScrollY, setLastScrollY] = useState(0);

    // Smart Scroll Logic: Hide on scroll down, Show on scroll up
    useMotionValueEvent(scrollY, "change", (latest) => {
        const direction = latest > lastScrollY ? "down" : "up";
        
        // AUTO-CLOSE MOBILE MENU ON SCROLL
        if (isOpen && Math.abs(latest - lastScrollY) > 5) {
            setIsOpen(false);
        }

        // Only hide if we've scrolled a bit (ignore small bounces)
        if (latest > 150 && direction === "down" && isVisible) {
            setIsVisible(false);
        } else if (direction === "up" && !isVisible) {
            setIsVisible(true);
        }
        
        setLastScrollY(latest);
    });

    const navLinks = [
        { label: 'Exhibits', href: 'gallery' },
        { label: 'Atelier', href: 'about' },
        { label: 'Whispers', href: 'contact' }
    ];

    const scrollToSection = (e, id) => {
        e.preventDefault();
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setIsOpen(false);
        }
    };

    return (
        <motion.nav 
            initial={{ y: 0, opacity: 1 }}
            animate={{ 
                y: isVisible ? 0 : -150,
                opacity: isVisible ? 1 : 0 
            }}
            transition={{ 
                duration: 2, 
                ease: "easeInOut",
                delay: 0
            }}
            className="fixed top-0 left-0 w-full z-50 px-6 py-6 md:px-12 md:py-8"
        >
            <div className="max-w-7xl mx-auto flex justify-between items-center bg-white/5 backdrop-blur-md border border-white/10 px-8 py-4 rounded-full shadow-lg">
                {/* LOGO */}
                <div 
                    onClick={() => window.location.href = '/'} 
                    className="flex items-center gap-3 text-xl md:text-2xl font-['Mogra'] text-white group transition-all relative z-[100] cursor-pointer"
                >
                    <motion.div 
                        whileHover={{ rotate: 180 }}
                        className="w-8 h-8 rounded-lg bg-[#D4AF37] flex items-center justify-center text-[#1A1512] shadow-lg"
                    >
                        <Brush size={18} />
                    </motion.div>
                    <span className="tracking-tighter group-hover:tracking-normal transition-all duration-500">ArtByAnjali</span>
                </div>
                
                {/* DESKTOP NAV */}
                <div className="hidden md:flex items-center gap-10">
                    {navLinks.map((link) => (
                        <motion.a 
                            key={link.label}
                            href={`#${link.href}`} 
                            onClick={(e) => scrollToSection(e, link.href)}
                            whileHover={{ scale: 1.05 }}
                            className="text-[12px] font-normal hover:text-[#D4AF37] text-white/40 transition-all uppercase tracking-[0.1em] font-['Mogra']"
                        >
                            {link.label}
                        </motion.a>
                    ))}
                    <div className="w-[1px] h-3 bg-white/10" />
                    <Link to="/admin" className="text-[12px] font-normal text-white/20 hover:text-[#D4AF37] transition-all uppercase tracking-[0.1em] font-['Mogra']">Studio</Link>
                </div>

                {/* MOBILE TOGGLE */}
                <button 
                    onClick={() => setIsOpen(!isOpen)}
                    className="md:hidden relative z-[100] w-10 h-10 flex items-center justify-center bg-white/5 rounded-full border border-white/10 hover:bg-white/10 transition-all text-white"
                >
                    {isOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {/* MOBILE MENU OVERLAY */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        transition={{ type: "spring", stiffness: 100, damping: 20 }}
                        className="fixed inset-0 bg-[#1A1512] z-[90] flex flex-col items-center justify-center gap-12"
                    >
                        {/* MOBILE BACK ACTION */}
                        <motion.button 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="absolute top-10 left-10 flex items-center gap-2 text-[10px] uppercase tracking-widest text-[#D4AF37] font-normal"
                        >
                            <Brush size={14} className="rotate-[-45deg]" /> Back
                        </motion.button>

                        <div className="flex flex-col items-center gap-8">
                            {navLinks.map((link, idx) => (
                                <motion.a 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 + (idx * 0.1) }}
                                    key={link.label}
                                    href={`#${link.href}`}
                                    onClick={(e) => scrollToSection(e, link.href)}
                                    className="text-4xl font-['Mogra'] uppercase tracking-widest text-[#D4AF37] hover:text-black transition-all"
                                >
                                    {link.label}
                                </motion.a>
                            ))}
                            <motion.div 
                                initial={{ scale: 0 }} 
                                animate={{ scale: 1 }} 
                                transition={{ delay: 0.5 }}
                                className="w-12 h-[1px] bg-black/10 my-4" 
                            />
                            <Link 
                                to="/admin" 
                                onClick={() => setIsOpen(false)}
                                className="text-[14px] font-normal tracking-[0.1em] uppercase text-white/20 hover:text-[#D4AF37] transition-all font-['Mogra']"
                            >
                                Studio Portal
                            </Link>
                        </div>
                        
                        {/* Mobile Footer Deco */}
                        <div className="absolute bottom-12 text-center opacity-10">
                             <Palette size={48} className="mx-auto mb-4" />
                             <p className="text-[9px] uppercase tracking-[0.6em] font-black">ArtByAnjali Studio</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
};

export default PublicNavbar;

