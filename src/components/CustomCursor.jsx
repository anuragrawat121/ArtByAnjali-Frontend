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
      {/* Central Paint Tip */}
      <motion.div
        className="fixed top-0 left-0 w-1.5 h-1.5 bg-white rounded-full pointer-events-none z-[9999] mix-blend-difference"
        style={{ willChange: "transform" }}
        animate={{ x: mousePos.x - 3, y: mousePos.y - 3 }}
        transition={{ type: "spring", damping: 30, stiffness: 400, mass: 0.1 }}
      />
      
      {/* Outer Atmospheric Aura */}
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 border border-white/30 rounded-full pointer-events-none z-[9998]"
        style={{ willChange: "transform" }}
        animate={{
          x: mousePos.x - 16,
          y: mousePos.y - 16,
          scale: isHovering ? 2.5 : 1,
          borderColor: isHovering ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.3)",
          backgroundColor: isHovering ? "rgba(255,255,255,0.05)" : "transparent",
        }}
        transition={{ type: "spring", damping: 25, stiffness: 200, mass: 0.5 }}
      />
    </>
  );
};

export default CustomCursor;
