import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

/**
 * NOIR CUSTOM CURSOR
 * A premium interaction component created by Antigravity for ArtByAnjali.
 * Highlights interactable elements and provides smooth motion trail.
 */
const CustomCursor = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Hidden by default to prevent jumpy initial positioning
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseOver = (e) => {
      // Intelligent detection for interactive zones
      const target = e.target;
      const isInteractable = 
        target.tagName === "BUTTON" || 
        target.tagName === "A" || 
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.closest(".group") ||
        target.closest("nav");
      
      setIsHovering(!!isInteractable);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseover", handleMouseOver);
    
    // Hide native cursor for a total immersive experience on desktop
    document.body.style.cursor = "none";
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseover", handleMouseOver);
      document.body.style.cursor = "auto";
    };
  }, [isVisible]);

  // Disable on mobile/touch devices for accessibility
  if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) return null;
  if (!isVisible) return null;

  return (
    <>
      {/* STATIC MINIMAL CURSOR (HIGH VISIBILITY) */}
      <motion.div
        className="fixed top-0 left-0 w-4 h-4 border border-[#D4AF37]/50 rounded-full pointer-events-none z-[100000] flex items-center justify-center mix-blend-screen"
        animate={{
          scale: isHovering ? 2.5 : 1,
          borderColor: isHovering ? "rgba(212, 175, 55, 1)" : "rgba(212, 175, 55, 0.5)",
          backgroundColor: isHovering ? "rgba(212, 175, 55, 0.1)" : "rgba(212, 175, 55, 0)"
        }}
        style={{ 
            willChange: "transform",
            left: mousePos.x - 8,
            top: mousePos.y - 8
        }}
      >
        <motion.div 
            animate={{ scale: isHovering ? 0.5 : 1 }}
            className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full shadow-[0_0_10px_rgba(212,175,55,0.5)]" 
        />
      </motion.div>
    </>
  );
};

export default CustomCursor;
