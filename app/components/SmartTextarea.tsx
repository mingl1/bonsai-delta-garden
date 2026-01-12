"use client";

import React, { useRef, useEffect, useState } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface SmartTextareaProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function SmartTextarea({
  value,
  onChange,
  className,
}: SmartTextareaProps) {
  // Parsing logic: Split raw text into 3 sections based on prefixes
  // Format: "> [obj]\n+ [win]\n- [fric]"
  const parse = (raw: string) => {
    const lines = raw.split("\n");
    let objective = "";
    let win = "";
    let friction = "";

    lines.forEach((line) => {
      if (line.startsWith("> ")) objective = line.slice(2);
      else if (line.startsWith("+ ")) win = line.slice(2);
      else if (line.startsWith("- ")) friction = line.slice(2);
    });

    return { objective, win, friction };
  };

  const [sections, setSections] = useState(parse(value));

  const objRef = useRef<HTMLTextAreaElement>(null);
  const winRef = useRef<HTMLTextAreaElement>(null);
  const fricRef = useRef<HTMLTextAreaElement>(null);

  // Sync state to parent on any change
  useEffect(() => {
    const serialized = `> ${sections.objective}\n+ ${sections.win}\n- ${sections.friction}`;
    onChange(serialized);
  }, [sections]);

  // Auto-resize textareas
  const resize = (ref: React.RefObject<HTMLTextAreaElement | null>) => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = ref.current.scrollHeight + "px";
    }
  };

  useEffect(() => {
    resize(objRef);
    resize(winRef);
    resize(fricRef);
  }, [sections]);

  const handleKeyDown = (
    e: React.KeyboardEvent,
    current: "obj" | "win" | "fric"
  ) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (current === "obj") winRef.current?.focus();
      else if (current === "win") fricRef.current?.focus();
    }
    
    if (e.key === "Backspace" && (e.target as HTMLTextAreaElement).selectionStart === 0) {
        // Prevent backspacing into the previous section (prefixes are immutable labels now)
        if (current === "win") objRef.current?.focus();
        else if (current === "fric") winRef.current?.focus();
    }

    if (e.key === "ArrowUp" && (e.target as HTMLTextAreaElement).selectionStart === 0) {
        if (current === "win") objRef.current?.focus();
        else if (current === "fric") winRef.current?.focus();
    }

    if (e.key === "ArrowDown" && (e.target as HTMLTextAreaElement).selectionStart === (e.target as HTMLTextAreaElement).value.length) {
        if (current === "obj") winRef.current?.focus();
        else if (current === "win") fricRef.current?.focus();
    }
  };

  return (
    <div className={twMerge("w-full space-y-8 p-6 md:p-12 font-sans text-lg md:text-xl", className)}>
      
      {/* Objective Section */}
      <div className="flex items-start group">
        <span className="flex-none w-8 text-sky-400 font-bold select-none pt-1">{">"}</span>
        <textarea
          ref={objRef}
          value={sections.objective}
          onChange={(e) => setSections({ ...sections, objective: e.target.value })}
          onKeyDown={(e) => handleKeyDown(e, "obj")}
          placeholder="What is the focus today?"
          className="flex-1 bg-transparent text-neutral-200 outline-none resize-none leading-relaxed placeholder:text-neutral-800"
          rows={1}
          autoFocus
        />
      </div>

      {/* Win Section */}
      <div className="flex items-start group">
        <span className="flex-none w-8 text-emerald-400 font-bold select-none pt-1">{"+"}</span>
        <textarea
          ref={winRef}
          value={sections.win}
          onChange={(e) => setSections({ ...sections, win: e.target.value })}
          onKeyDown={(e) => handleKeyDown(e, "win")}
          placeholder="Small win or progress..."
          className="flex-1 bg-transparent text-neutral-200 outline-none resize-none leading-relaxed placeholder:text-neutral-800"
          rows={1}
        />
      </div>

      {/* Friction Section */}
      <div className="flex items-start group">
        <span className="flex-none w-8 text-red-400 font-bold select-none pt-1">{"-"}</span>
        <textarea
          ref={fricRef}
          value={sections.friction}
          onChange={(e) => setSections({ ...sections, friction: e.target.value })}
          onKeyDown={(e) => handleKeyDown(e, "fric")}
          placeholder="What caused friction?"
          className="flex-1 bg-transparent text-neutral-200 outline-none resize-none leading-relaxed placeholder:text-neutral-800"
          rows={1}
        />
      </div>

    </div>
  );
}
