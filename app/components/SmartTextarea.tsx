"use client";

import React, { useRef, useEffect } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface SmartTextareaProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  onSave?: () => void;
}

export default function SmartTextarea({
  value,
  onChange,
  className,
  onSave,
}: SmartTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Sync scroll between textarea and overlay
  const handleScroll = () => {
    if (textareaRef.current && overlayRef.current) {
      overlayRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  // Auto-save on stop typing (debounce handled by parent usually, but we can trigger immediate visual feedback if needed)
  // For now, simpler is better.

  const highlight = (text: string) => {
    return text.split("\n").map((line, i) => {
      let colorClass = "text-neutral-300"; // default #e5e5e5 equivalentish
      
      const trimmed = line.trimStart();
      if (trimmed.startsWith("+ ")) colorClass = "text-emerald-400";
      else if (trimmed.startsWith("- ")) colorClass = "text-red-400"; // Coral/Red
      else if (trimmed.startsWith("> ")) colorClass = "text-sky-400";

      return (
        <div key={i} className={clsx(colorClass, "min-h-[1.5em] whitespace-pre-wrap break-words")}>
          {line || "\u200B"} 
        </div>
      );
    });
  };

  return (
    <div className={twMerge("relative w-full h-full font-sans text-lg md:text-xl", className)}>
      {/* 
        Overlay Layout:
        It must match the textarea EXACTLY in font-size, line-height, padding, and width.
        - pointer-events-none: clicks pass through to textarea
        - whitespace-pre-wrap: preserves spaces/newlines
        - break-words: matches textarea wrapping
      */}
      <div
        ref={overlayRef}
        aria-hidden="true"
        className="absolute inset-0 p-6 md:p-12 overflow-hidden pointer-events-none leading-relaxed"
      >
        {highlight(value)}
      </div>

      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={handleScroll}
        onKeyUp={onSave}
        spellCheck={false}
        className="absolute inset-0 w-full h-full p-6 md:p-12 bg-transparent text-transparent caret-white 
                   outline-none resize-none leading-relaxed font-sans placeholder:text-neutral-800"
        placeholder="> "
      />
    </div>
  );
}
