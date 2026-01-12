"use client";

import React, { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import SmartTextarea from "./components/SmartTextarea";
import Bonsai from "./components/Bonsai";

// Keys
const STORAGE_KEY = "delta-canvas-data";
const SEED_KEY = "delta-canvas-seed";

export default function Home() {
  const [content, setContent] = useState<string>("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [treeSeed, setTreeSeed] = useState<number | undefined>(undefined);
  
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Load Initial Data
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const savedSeed = localStorage.getItem(SEED_KEY);
    
    if (saved) {
      setContent(saved);
    } else {
      // Default Template
      setContent(
`> 
+ 
- `
      );
    }

    if (savedSeed) {
      setTreeSeed(parseInt(savedSeed, 10));
    }

    setLoaded(true);
  }, []);

  // 2. Debounced Save
  const handleContentChange = (newVal: string) => {
    setContent(newVal);
    setIsSyncing(true);

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, newVal);
      // Simulate network request duration for "Syncing..." feel
      setTimeout(() => {
        setIsSyncing(false);
      }, 600); 
    }, 1000); // 1 second debounce
  };

  const randomizeTree = () => {
    const newSeed = Math.floor(Math.random() * 1000000);
    setTreeSeed(newSeed);
    localStorage.setItem(SEED_KEY, newSeed.toString());
  };

  if (!loaded) return null; // Prevent hydration mismatch

  return (
    <main className="relative flex flex-col h-[100dvh] bg-black text-neutral-200 overflow-hidden">
      
      {/* Date Header & Bonsai */}
      <header className="flex-none pt-4 pb-2 text-center z-20 select-none group relative">
        <div className="relative inline-block">
          <Bonsai seed={treeSeed} />
          <button 
            onClick={randomizeTree}
            className="absolute top-0 -right-12 p-2 opacity-20 group-hover:opacity-60 hover:!opacity-100 transition-all text-neutral-500 hover:text-emerald-500 text-lg rounded-full hover:bg-neutral-900"
            title="Grow a new tree"
          >
            ↺
          </button>
        </div>
        <h1 className="text-neutral-500 text-sm font-medium tracking-wide">
          {format(new Date(), "EEEE, MMM d")}
        </h1>
      </header>

      {/* Editor Area */}
      <section className="flex-1 relative w-full max-w-3xl mx-auto">
        <SmartTextarea 
          value={content} 
          onChange={handleContentChange} 
          className="h-full"
        />
      </section>

      {/* Footer / Status */}
      <footer className="fixed bottom-4 right-6 pointer-events-none select-none">
        <span 
          className={`text-xs font-mono text-neutral-600 transition-opacity duration-500 ${
            isSyncing ? "opacity-100" : "opacity-0"
          }`}
        >
          Syncing...
        </span>
      </footer>
      
      {/* Auth Placeholder (Bottom Right) */}
      <div className="fixed bottom-4 left-6 pointer-events-auto opacity-20 hover:opacity-100 transition-opacity">
        <button className="text-xs text-neutral-500">Sign In</button>
      </div>

    </main>
  );
}
