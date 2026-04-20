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
      {/* MINIMAL MICRO-DOT CURSOR */}
      <motion.div
        className="fixed top-0 left-0 w-4 h-4 border border-white/40 rounded-full pointer-events-none z-[9999] flex items-center justify-center backdrop-blur-[1px]"
        style={{ willChange: "transform" }}
        animate={{
          x: mousePos.x - 8,
          y: mousePos.y - 8,
          scale: isHovering ? 1.5 : 1,
          borderColor: isHovering ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.4)",
          backgroundColor: isHovering ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.05)",
        }}
        transition={{ type: "spring", damping: 30, stiffness: 300, mass: 0.2 }}
      >
        <motion.div 
            animate={{ scale: isHovering ? 0.5 : 1 }}
            className="w-1 h-1 bg-white rounded-full" 
        />
      </motion.div>
      
      {/* SOFT GLOW TRAIL */}
      <motion.div
        className="fixed top-0 left-0 w-12 h-12 bg-white/5 rounded-full blur-xl pointer-events-none z-[9998]"
        style={{ willChange: "transform" }}
        animate={{
          x: mousePos.x - 24,
          y: mousePos.y - 24,
          scale: isHovering ? 2 : 1,
        }}
        transition={{ type: "spring", damping: 40, stiffness: 150, mass: 1 }}
      />
    </>
  );
};

export default CustomCursor;
