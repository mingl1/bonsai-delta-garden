"use client";

import React, { useState, useEffect, useRef } from "react";
import { format, addDays, subDays } from "date-fns";
import SmartTextarea from "./components/SmartTextarea";
import Bonsai from "./components/Bonsai";

// Keys
const getStorageKey = (date: Date) => `delta-canvas-data-${format(date, "yyyy-MM-dd")}`;
const getSeedKey = (date: Date) => `delta-canvas-seed-${format(date, "yyyy-MM-dd")}`;

export default function Home() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [content, setContent] = useState<string>("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [treeSeed, setTreeSeed] = useState<number | undefined>(undefined);
  
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartRef = useRef<number | null>(null);

  // 1. Load Data for the selected date
  useEffect(() => {
    const sKey = getStorageKey(currentDate);
    const seedKey = getSeedKey(currentDate);
    
    const saved = localStorage.getItem(sKey);
    const savedSeed = localStorage.getItem(seedKey);
    
    if (saved !== null) {
      setContent(saved);
    } else {
      setContent(`> \n+ \n- `);
    }

    if (savedSeed) {
      setTreeSeed(parseInt(savedSeed, 10));
    } else {
      setTreeSeed(undefined); // Fallback to daily default in component
    }

    setLoaded(true);
  }, [currentDate]);

  // 2. Debounced Save
  const handleContentChange = (newVal: string) => {
    setContent(newVal);
    setIsSyncing(true);

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      localStorage.setItem(getStorageKey(currentDate), newVal);
      setTimeout(() => setIsSyncing(false), 600); 
    }, 1000);
  };

  const randomizeTree = () => {
    const newSeed = Math.floor(Math.random() * 1000000);
    setTreeSeed(newSeed);
    localStorage.setItem(getSeedKey(currentDate), newSeed.toString());
  };

  // 3. Navigation
  const goToPreviousDay = () => setCurrentDate((prev) => subDays(prev, 1));
  const goToNextDay = () => {
    // Optional: prevent going into future? 
    setCurrentDate((prev) => addDays(prev, 1));
  };

  // 4. Swipe Detection
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartRef.current === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const distance = touchEnd - touchStartRef.current;
    
    // Threshold of 50px for swipe
    if (distance > 70) goToPreviousDay();
    if (distance < -70) goToNextDay();
    
    touchStartRef.current = null;
  };

  // 5. Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only navigate if we're not focused in an input/textarea
      if (document.activeElement?.tagName === "TEXTAREA") return;
      
      if (e.key === "ArrowLeft") goToPreviousDay();
      if (e.key === "ArrowRight") goToNextDay();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!loaded) return null;

  return (
    <main 
      className="relative flex flex-col h-[100dvh] bg-black text-neutral-200 overflow-hidden touch-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Desktop Navigation Handles */}
      <nav className="fixed inset-y-0 left-0 w-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity z-30 group/nav">
        <button 
          onClick={goToPreviousDay}
          className="p-4 text-neutral-700 hover:text-neutral-400 text-3xl transition-transform active:scale-90 group-hover/nav:translate-x-2"
          title="Previous Day"
        >
          ‹
        </button>
      </nav>
      <nav className="fixed inset-y-0 right-0 w-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity z-30 group/nav">
        <button 
          onClick={goToNextDay}
          className="p-4 text-neutral-700 hover:text-neutral-400 text-3xl transition-transform active:scale-90 group-hover/nav:-translate-x-2"
          title="Next Day"
        >
          ›
        </button>
      </nav>
      
      {/* Date Header & Bonsai */}
      <header className="flex-none pt-4 pb-2 text-center z-20 select-none group relative">
        <div 
          className="relative inline-block cursor-pointer active:scale-95 transition-transform"
          onClick={randomizeTree}
        >
          <Bonsai seed={treeSeed} />
          <button 
            className="absolute top-0 -right-12 p-2 opacity-20 group-hover:opacity-60 hover:!opacity-100 transition-all text-neutral-500 hover:text-emerald-500 text-lg rounded-full"
            title="Grow a new tree"
          >
            ↺
          </button>
        </div>
        <h1 className="text-neutral-500 text-sm font-medium tracking-wide">
          {format(currentDate, "EEEE, MMM d")}
        </h1>
      </header>

      {/* Editor Area */}
      <section className="flex-1 relative w-full max-w-3xl mx-auto">
        <SmartTextarea 
          key={format(currentDate, "yyyy-MM-dd")} // Reset component state on date change
          value={content} 
          onChange={handleContentChange} 
          className="h-full"
        />
      </section>

      {/* Footer / Status */}
      <footer className="fixed bottom-4 right-6 pointer-events-none select-none">
        <span className={`text-xs font-mono text-neutral-600 transition-opacity duration-500 ${isSyncing ? "opacity-100" : "opacity-0"}`}>
          Syncing...
        </span>
      </footer>
      
      <div className="fixed bottom-4 left-6 pointer-events-auto opacity-20 hover:opacity-100 transition-opacity">
        <button className="text-xs text-neutral-500">Sign In</button>
      </div>
    </main>
  );
}
