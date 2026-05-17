import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import './Loader.css';

const Loader = ({ onComplete }) => {
  const containerRef = useRef(null);
  const overlayRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    // Attempt to play audio
    if (audioRef.current) {
      audioRef.current.volume = 0.5;
      audioRef.current.play().catch(e => console.warn('Audio auto-play prevented:', e));
    }

    // Total reveal: 10 seconds
    // Strategy: we have the full fire image behind a dark overlay.
    // We animate a clip-path (polygon wipe) from left to right — letter by letter.
    // The image has 9 letters. We divide the reveal into 9 steps over 10 seconds.
    // Each letter roughly occupies 1/9 = ~11.11% of the width.
    // We wipe the reveal mask progressively from 0% to 100% width over 10s.

    const tl = gsap.timeline({
      onComplete: () => {
        // Hold fully revealed for 0.5s then fade out
        gsap.to(containerRef.current, {
          opacity: 0,
          duration: 1.0,
          delay: 0.5,
          ease: "power2.inOut",
          onComplete: () => {
            onComplete();
          }
        });
      }
    });

    // We animate a clip-path wipe from left to right, pausing slightly at each "letter"
    // This gives the feel of fire spreading letter by letter
    const letterCount = 9; // C-O-D-E-V-E-R-S-E
    const totalDuration = 9.5;
    const durationPerLetter = totalDuration / letterCount;

    for (let i = 0; i <= letterCount; i++) {
      const pct = (i / letterCount) * 100;
      tl.to(overlayRef.current, {
        clipPath: `polygon(${pct}% 0%, 100% 0%, 100% 100%, ${pct}% 100%)`,
        duration: i === 0 ? 0 : durationPerLetter,
        ease: "power1.inOut",
      });
    }

  }, [onComplete]);

  return (
    <div className="fire-loader-container" ref={containerRef}>
      <audio
        ref={audioRef}
        src="https://cdn.pixabay.com/audio/2022/03/10/audio_f89cd7268e.mp3"
        preload="auto"
      />

      {/* The full pre-rendered fire text image — the "burned" final state */}
      <img
        className="fire-text-img"
        src="/codeverse_fire.png"
        alt="CODEVERSE"
        draggable="false"
      />

      {/* Dark overlay that wipes away from left to right as letters "catch fire" */}
      <div className="fire-overlay" ref={overlayRef} />

      {/* CSS particle sparks for extra realism */}
      <div className="sparks-container">
        {[...Array(30)].map((_, i) => (
          <div key={i} className={`spark spark-${i % 20}`} />
        ))}
      </div>
    </div>
  );
};

export default Loader;
