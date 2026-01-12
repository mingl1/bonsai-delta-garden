"use client";

import React, { useMemo } from "react";
import { format } from "date-fns";

class SeededRandom {
  seed: number;
  constructor(seed: number) {
    this.seed = seed;
  }
  next() {
    this.seed = (this.seed * 16807) % 2147483647;
    return (this.seed - 1) / 2147483646;
  }
}

export default function Bonsai({ seed: externalSeed }: { seed?: number }) {
  const treeStr = useMemo(() => {
    let seed = externalSeed;
    
    if (seed === undefined) {
      const dateStr = format(new Date(), "yyyy-MM-dd");
      seed = 0;
      for (let i = 0; i < dateStr.length; i++) {
        seed += dateStr.charCodeAt(i);
      }
    }
    
    const rng = new SeededRandom(seed);

    const width = 80;
    const height = 18;
    const grid: string[][] = Array.from({ length: height }, () => 
      Array.from({ length: width }, () => " ")
    );

    const draw = (x: number, y: number, char: string) => {
      const rx = Math.floor(x);
      const ry = Math.floor(y);
      if (ry >= 0 && ry < height && rx >= 0 && rx < width) {
        grid[ry][rx] = char;
      }
    };

    /**
     * Grows a branch (or trunk) segment by segment.
     */
    const grow = (
      startX: number,
      startY: number,
      angle: number,
      length: number,
      depth: number,
      type: "trunk" | "branch"
    ) => {
      if (depth <= 0 || length < 1) return;

      let x = startX;
      let y = startY;
      let currentAngle = angle;

      // Draw the segment
      for (let i = 0; i < length; i++) {
        // Wobble
        currentAngle += (rng.next() - 0.5) * (type === "trunk" ? 0.2 : 0.5);
        
        const nextX = x + Math.cos(currentAngle);
        const nextY = y - Math.sin(currentAngle);

        const dx = nextX - x;
        const dy = nextY - y;
        let char = "|";
        if (Math.abs(dx) > Math.abs(dy) * 1.2) char = "_";
        else if (dx > 0.3 && dy < -0.3) char = "\\";
        else if (dx < -0.3 && dy < -0.3) char = "/";
        else if (dx > 0.3 && dy > 0.3) char = "/";
        else if (dx < -0.3 && dy > 0.3) char = "\\";

        draw(x, y, char);

        x = nextX;
        y = nextY;

        // Trunk has a higher chance to branch out early
        if (type === "trunk" && i > 2 && rng.next() < 0.3) {
          const side = rng.next() > 0.5 ? 1 : -1;
          const bAngle = currentAngle + (side * Math.PI / 3) + (rng.next() - 0.5) * 0.5;
          grow(x, y, bAngle, length * 0.7, depth - 1, "branch");
        }
      }

      // Branching at the tip
      if (depth > 1) {
        const numBranches = type === "trunk" ? 2 : 1 + Math.floor(rng.next() * 2);
        for (let b = 0; b < numBranches; b++) {
          const nextAngle = currentAngle + (rng.next() - 0.5) * 1.2;
          grow(x, y, nextAngle, length * 0.8, depth - 1, "branch");
        }
      } else {
        // Spawn leaves at the very tips
        const leafChars = ["&", "%", "*", "o"];
        const leaf = leafChars[Math.floor(rng.next() * leafChars.length)];
        for (let j = 0; j < 12; j++) {
          const lx = x + (rng.next() - 0.5) * 6;
          const ly = y + (rng.next() - 0.5) * 3;
          draw(lx, ly, leaf);
        }
      }
    };

    const centerX = width / 2;
    const baseY = height - 3;
    
    // Simple Base
    draw(centerX, baseY + 1, "|");
    draw(centerX - 1, baseY + 1, "_");
    draw(centerX + 1, baseY + 1, "_");
    
    // Initial growth: Trunk
    // grow(x, y, angle, length, depth, type)
    grow(centerX, baseY, Math.PI / 2, 5, 4, "trunk");

    return grid.map(row => row.join("")).join("\n");
  }, [externalSeed]);

  return (
    <div className="w-full flex justify-center py-4 select-none opacity-50">
      <pre className="font-mono text-[9px] sm:text-[10px] leading-[1.1] text-emerald-500/90 whitespace-pre pointer-events-none">
        {treeStr}
      </pre>
    </div>
  );
}
