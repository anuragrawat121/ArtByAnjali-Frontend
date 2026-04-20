import { motion } from 'framer-motion';
import { Palette } from 'lucide-react';

/**
 * ARIA NOIR LOADER
 * A high-end, cinematic prelude featuring the ArtByAnjali branding.
 */
const Loader = () => {
    return (
        <div className="fixed inset-0 z-[99999] bg-[#0c0c0e] flex flex-col items-center justify-center overflow-hidden">
            {/* AMBIENT BACKGROUND GLOW */}
            <motion.div 
                animate={{ 
                    scale: [1, 1.1, 1], // Reduced scale range
                    opacity: [0.08, 0.15, 0.08] // Lower opacity for better blending
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                style={{ willChange: "transform, opacity" }}
                className="absolute w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-[#d4af37]/10 rounded-full blur-[60px] md:blur-[120px] pointer-events-none"
            />

            <div className="relative z-10 flex flex-col items-center">
                {/* BREATHING LOGO ICON */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    style={{ willChange: "transform" }}
                    className="text-[#d4af37]/20 mb-12"
                >
                    <Palette size={64} strokeWidth={1} />
                </motion.div>

                {/* THE BRANDING: ARTBYANJALI */}
                <div className="flex overflow-hidden pb-4">
                    {"ArtBy".split("").map((letter, idx) => (
                        <motion.span
                            key={`artby-${idx}`}
                            initial={{ y: 200, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.8, delay: idx * 0.05, ease: [0.33, 1, 0.68, 1] }}
                            style={{ willChange: "transform, opacity" }}
                            className="text-5xl md:text-8xl font-['Mogra'] text-white/30 tracking-[0.1em] block"
                        >
                            {letter}
                        </motion.span>
                    ))}
                    {"Anjali".split("").map((letter, idx) => (
                        <motion.span
                            key={`anjali-${idx}`}
                            initial={{ y: 200, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.8, delay: (idx + 5) * 0.05, ease: [0.33, 1, 0.68, 1] }}
                            style={{ willChange: "transform, opacity" }}
                            className="text-5xl md:text-8xl font-['Mogra'] text-[#d4af37] tracking-[0.1em] block"
                        >
                            {letter}
                        </motion.span>
                    ))}
                </div>

                {/* THE SUBTITLE */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    transition={{ delay: 1, duration: 2 }}
                    className="mt-8 flex flex-col items-center gap-4 text-center"
                >
                    <div className="w-12 h-[1px] bg-white/20" />
                    <p className="text-[10px] md:text-[12px] uppercase tracking-[0.5em] md:tracking-[0.8em] font-light text-[#d4af37]/60 italic font-['Syne']">
                        Where Colors Tell Stories
                    </p>
                </motion.div>
            </div>

            {/* PROGRESS LINE */}
            <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 3, ease: "linear" }}
                className="absolute bottom-0 left-0 h-[2px] bg-[#d4af37]/40"
            />
        </div>
    );
};

export default Loader;
