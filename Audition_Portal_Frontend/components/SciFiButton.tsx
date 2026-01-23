"use client";

import { useState } from "react";

interface SciFiButtonProps {
  onClick?: () => void;
  text?: string;
}

export default function SciFiButton({
  onClick,
  text = "Join Us",
}: SciFiButtonProps) {
  const [ripples, setRipples] = useState<number[]>([]);

  const handleClick = () => {
    const id = Date.now();
    setRipples((r) => [...r, id]);
    setTimeout(() => {
      setRipples((r) => r.filter((x) => x !== id));
    }, 600);

    onClick?.();
  };

  return (
    <>
      <div className="sci-fi-button-container">

        <div className="button-box" onClick={handleClick}>
          <div className="box-line-top" />
          <div className="box-line-bottom" />

          <div className="box-corner corner-tl" />
          <div className="box-corner corner-tr" />
          <div className="box-corner corner-bl" />
          <div className="box-corner corner-br" />

          <div className="connection-dot dot-1" />
          <div className="connection-dot dot-2" />
          <div className="connection-dot dot-3" />

          <div className="decorative-line deco-1" />
          <div className="decorative-line deco-2" />

          {/* ✅ TEXT NOW DEFINES SIZE */}
          <div className="button-text">{text}</div>

          {ripples.map((id) => (
            <div key={id} className="ripple-effect" />
          ))}
        </div>
      </div>

      <style jsx>{`
        /* ================= CONTAINER ================= */
        .sci-fi-button-container {
          position: relative;
          display: inline-block;
        }



        /* ================= BUTTON BOX ================= */
        .button-box {
          position: relative;
          display: inline-block;
          padding: 32px 56px; /* 🔑 controls border size */
          cursor: pointer;
          transition: transform 0.3s ease;
        }

        .button-box:hover {
          transform: scale(1.05);
        }

        /* ================= BORDER LINES ================= */
        .box-line-top,
        .box-line-bottom {
          position: absolute;
          left: 16px;
          right: 16px;
          height: 2px;
          background: linear-gradient(
            to right,
            rgba(0, 255, 255, 0.6),
            rgba(0, 200, 255, 1),
            rgba(0, 255, 255, 0.6)
          );
          box-shadow: 0 0 10px rgba(0, 255, 255, 0.8);
        }

        .box-line-top {
          top: 0;
        }

        .box-line-bottom {
          bottom: 0;
        }

        /* ================= CORNERS ================= */
        .box-corner {
          position: absolute;
          width: 18px;
          height: 18px;
          border-color: rgba(0, 255, 255, 0.8);
        }

        .corner-tl {
          top: -2px;
          left: -2px;
          border-top: 2px solid;
          border-left: 2px solid;
        }

        .corner-tr {
          top: -2px;
          right: -2px;
          border-top: 2px solid;
          border-right: 2px solid;
        }

        .corner-bl {
          bottom: -2px;
          left: -2px;
          border-bottom: 2px solid;
          border-left: 2px solid;
        }

        .corner-br {
          bottom: -2px;
          right: -2px;
          border-bottom: 2px solid;
          border-right: 2px solid;
        }

        /* ================= TEXT ================= */
        .button-text {
          position: relative;
          color: rgba(0, 255, 255, 0.95);
          font-size: 18px;
          font-weight: 700;
          letter-spacing: 6px;
          text-transform: uppercase;
          text-align: center;
          text-shadow: 0 0 20px rgba(0, 255, 255, 0.8);
          white-space: nowrap; /* remove if you want wrapping */
        }

        .button-box:hover .button-text {
          color: #ffffff;
          text-shadow: 0 0 30px rgba(0, 255, 255, 1);
        }

        /* ================= CONNECTION DOTS ================= */
        .connection-dot {
          position: absolute;
          width: 8px;
          height: 8px;
          background: rgba(0, 255, 255, 0.9);
          border-radius: 50%;
          box-shadow: 0 0 12px rgba(0, 255, 255, 1);
        }

        .dot-1 {
          top: -4px;
          left: 50%;
          transform: translateX(-50%);
        }

        .dot-2 {
          bottom: -4px;
          right: 20%;
        }

        .dot-3 {
          top: 50%;
          right: -4px;
          transform: translateY(-50%);
        }

        /* ================= DECORATIVE LINES ================= */
        .decorative-line {
          position: absolute;
          height: 1px;
          background: linear-gradient(
            to right,
            transparent,
            rgba(0, 255, 255, 0.4),
            transparent
          );
        }

        .deco-1 {
          top: -26px;
          left: 10%;
          width: 80px;
        }

        .deco-2 {
          bottom: -26px;
          right: 10%;
          width: 100px;
        }

        /* ================= RIPPLE ================= */
        .ripple-effect {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 2px solid rgba(0, 255, 255, 0.6);
          animation: rippleEffect 0.6s ease-out;
        }

        @keyframes rippleEffect {
          to {
            transform: scale(2);
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
}