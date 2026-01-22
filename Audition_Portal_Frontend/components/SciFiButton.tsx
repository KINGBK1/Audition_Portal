"use client";

import { useState } from "react";

interface SciFiButtonProps {
  onClick?: () => void;
  text?: string;
}

export default function SciFiButton({ onClick, text = "JOIN US" }: SciFiButtonProps) {
  const [ripples, setRipples] = useState<number[]>([]);

  const handleClick = () => {
    const newRipple = Date.now();
    setRipples([...ripples, newRipple]);
    
    setTimeout(() => {
      setRipples(prev => prev.filter(id => id !== newRipple));
    }, 600);

    onClick?.();
  };

  return (
    <>
      <div className="sci-fi-button-container">
        <div className="pointer-line"></div>
        <div className="pointer-dot"></div>
        
        <div className="button-box pointer-events-auto" onClick={handleClick}>
          <div className="box-line-top"></div>
          <div className="box-line-bottom"></div>
          
          <div className="box-corner corner-tl"></div>
          <div className="box-corner corner-tr"></div>
          <div className="box-corner corner-bl"></div>
          <div className="box-corner corner-br"></div>
          
          <div className="connection-dot dot-1"></div>
          <div className="connection-dot dot-2"></div>
          <div className="connection-dot dot-3"></div>
          
          <div className="decorative-line deco-1"></div>
          <div className="decorative-line deco-2"></div>
          
          <div className="button-text">{text}</div>

          {ripples.map((id) => (
            <div key={id} className="ripple-effect" />
          ))}
        </div>
      </div>

      <style jsx>{`
        .sci-fi-button-container {
          position: relative;
          width: 600px;
          height: 300px;
          display: flex;
          justify-content: flex-end;
          align-items: center;
          transform: translateX(-80px);
        }

        @media (max-width: 768px) {
          .sci-fi-button-container {
            width: 300px;
            height: 200px;
            transform: translateX(-40px);
          }
        }

        .pointer-line {
          position: absolute;
          bottom: 5px;
          left: 20px;
          width: 0;
          height: 2px;
          background: linear-gradient(to right, rgba(0, 255, 255, 0.8), rgba(0, 200, 255, 1));
          transform-origin: left center;
          transform: rotate(-45deg);
          box-shadow: 0 0 10px rgba(0, 255, 255, 0.8);
          animation: drawPointerLine 1s ease-out forwards;
        }

        .pointer-dot {
          position: absolute;
          bottom: 5px;
          left: 20px;
          width: 10px;
          height: 10px;
          background: rgba(0, 255, 255, 0.9);
          border-radius: 50%;
          box-shadow: 0 0 15px rgba(0, 255, 255, 1);
          opacity: 0;
          animation: fadeInDot 0.3s ease-out 1s forwards;
        }

        @keyframes drawPointerLine {
          from {
            width: 0;
          }
          to {
            width: 200px;
          }
        }

        @media (max-width: 768px) {
          @keyframes drawPointerLine {
            to {
              width: 120px;
            }
          }
        }

        @keyframes fadeInDot {
          to {
            opacity: 1;
          }
        }

        .button-box {
          position: relative;
          width: 400px;
          height: 150px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        @media (max-width: 768px) {
          .button-box {
            width: 250px;
            height: 100px;
          }
        }

        .box-line-top,
        .box-line-bottom {
          position: absolute;
          left: 50%;
          height: 2px;
          background: linear-gradient(to right, rgba(0, 255, 255, 0.6), rgba(0, 200, 255, 1), rgba(0, 255, 255, 0.6));
          box-shadow: 0 0 10px rgba(0, 255, 255, 0.8);
          transform: translateX(-50%);
        }

        .box-line-top {
          top: 0;
          width: 0;
          animation: expandLineFromCenter 0.8s ease-out 1.2s forwards;
        }

        .box-line-bottom {
          bottom: 0;
          width: 0;
          animation: expandLineFromCenter 0.8s ease-out 1.2s forwards;
        }

        @keyframes expandLineFromCenter {
          to {
            width: 100%;
          }
        }

        .box-corner {
          position: absolute;
          width: 30px;
          height: 30px;
          opacity: 0;
          animation: fadeInCorners 0.3s ease-out 2s forwards;
        }

        @media (max-width: 768px) {
          .box-corner {
            width: 20px;
            height: 20px;
          }
        }

        .corner-tl {
          top: -2px;
          left: -2px;
          border-top: 2px solid rgba(0, 255, 255, 0.8);
          border-left: 2px solid rgba(0, 255, 255, 0.8);
          box-shadow: -2px -2px 8px rgba(0, 255, 255, 0.4);
        }

        .corner-tr {
          top: -2px;
          right: -2px;
          border-top: 2px solid rgba(0, 255, 255, 0.8);
          border-right: 2px solid rgba(0, 255, 255, 0.8);
          box-shadow: 2px -2px 8px rgba(0, 255, 255, 0.4);
        }

        .corner-bl {
          bottom: -2px;
          left: -2px;
          border-bottom: 2px solid rgba(0, 255, 255, 0.8);
          border-left: 2px solid rgba(0, 255, 255, 0.8);
          box-shadow: -2px 2px 8px rgba(0, 255, 255, 0.4);
        }

        .corner-br {
          bottom: -2px;
          right: -2px;
          border-bottom: 2px solid rgba(0, 255, 255, 0.8);
          border-right: 2px solid rgba(0, 255, 255, 0.8);
          box-shadow: 2px 2px 8px rgba(0, 255, 255, 0.4);
        }

        @keyframes fadeInCorners {
          to {
            opacity: 1;
          }
        }

        .button-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: rgba(0, 255, 255, 0.9);
          font-size: 32px;
          font-weight: bold;
          letter-spacing: 8px;
          text-transform: uppercase;
          opacity: 0;
          text-shadow: 0 0 20px rgba(0, 255, 255, 0.8);
          animation: fadeInText 0.6s ease-out 2.3s forwards;
        }

        @media (max-width: 768px) {
          .button-text {
            font-size: 20px;
            letter-spacing: 4px;
          }
        }

        @keyframes fadeInText {
          from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.8);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }

        .button-box:hover {
          transform: scale(1.05);
        }

        .button-box:hover .button-text {
          color: rgba(255, 255, 255, 1);
          text-shadow: 0 0 30px rgba(0, 255, 255, 1);
        }

        .button-box:hover .box-line-top,
        .button-box:hover .box-line-bottom {
          box-shadow: 0 0 20px rgba(0, 255, 255, 1);
        }

        .connection-dot {
          position: absolute;
          width: 8px;
          height: 8px;
          background: rgba(0, 255, 255, 0.9);
          border-radius: 50%;
          box-shadow: 0 0 12px rgba(0, 255, 255, 1);
          opacity: 0;
          animation: fadeInDot 0.3s ease-out 2s forwards;
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

        .decorative-line {
          position: absolute;
          height: 1px;
          background: linear-gradient(to right, transparent, rgba(0, 255, 255, 0.4), transparent);
          opacity: 0;
          animation: fadeInLine 0.5s ease-out 2.5s forwards;
        }

        .deco-1 {
          top: -30px;
          left: 10%;
          width: 80px;
        }

        .deco-2 {
          bottom: -30px;
          right: 10%;
          width: 100px;
        }

        @keyframes fadeInLine {
          to {
            opacity: 1;
          }
        }

        .ripple-effect {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          border: 2px solid rgba(0, 255, 255, 0.6);
          transform: translate(-50%, -50%);
          pointer-events: none;
          animation: rippleEffect 0.6s ease-out;
        }

        @keyframes rippleEffect {
          to {
            width: 400px;
            height: 400px;
            opacity: 0;
          }
        }

        @media (max-width: 768px) {
          @keyframes rippleEffect {
            to {
              width: 250px;
              height: 250px;
              opacity: 0;
            }
          }
        }
      `}</style>
    </>
  );
}
