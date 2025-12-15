'use client';

import { useEffect, useState } from "react";

type Point = { x: number; y: number };

export function PixelCursor() {
  const [pos, setPos] = useState<Point>({ x: -100, y: -100 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      if (!visible) setVisible(true);
    };
    const handleLeave = () => setVisible(false);

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseleave", handleLeave);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseleave", handleLeave);
    };
  }, [visible]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed z-[9999] hidden md:block"
      style={{
        transform: `translate(${pos.x - 9}px, ${pos.y - 4}px)`,
        opacity: visible ? 1 : 0,
        transition: "opacity 120ms ease-out",
      }}
    >
      <svg
        width="32"
        height="48"
        viewBox="0 0 32 48"
        className="[image-rendering:pixelated]"
        style={{ filter: "drop-shadow(2px 2px 0 rgba(0,0,0,0.35))" }}
      >
        <path
          d="M4 4 L4 42 L11 34 L15 44 L21 42 L16 30 L26 30 Z"
          fill="#ffffff"
          stroke="#0a0a0a"
          strokeWidth="3"
          strokeLinejoin="miter"
        />
      </svg>
    </div>
  );
}

