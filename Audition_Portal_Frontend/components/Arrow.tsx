"use client";

export default function Arrow() {
  return (
    <>
      <div className="arrow-container">
        <div className="glass-tab">
          <div className="glass-tab-inner">
            <span className="tab-text">JOIN US</span>
          </div>
        </div>
        <div className="arrow"></div>
      </div>
      
      <style jsx>{`
        .arrow-container {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          margin-top: -80px;
        }

        .glass-tab {
          width: 131px;
          height: 51px;
          border-radius: 30px;
          cursor: pointer;
          transition: 0.3s ease;
          background-color: rgba(0, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
          border: 1px solid rgba(128, 128, 128, 0.3);
        }

        .glass-tab:hover {
          background-color: rgba(0, 255, 255, 0.5);
          box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
        }

        .glass-tab-inner {
          width: 127px;
          height: 47px;
          border-radius: 28px;
          background-color: rgba(26, 26, 26, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        .glass-tab-inner::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 8px;
          background: linear-gradient(
            to top,
            rgba(255, 255, 255, 0.2) 0%,
            transparent 100%
          );
          border-radius: 0 0 28px 28px;
          pointer-events: none;
        }

        .tab-text {
          position: relative;
          z-index: 2;
          color: rgba(160, 160, 160, 0.9);
          font-size: 16px;
          font-weight: 600;
          letter-spacing: 3px;
          text-transform: uppercase;
          text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
        }

        .arrow {
          position: relative;
          width: 40px;
          height: 40px;
          transform: rotate(45deg);
          border-left: none;
          border-top: none;
          border-right: 2px #fff solid;
          border-bottom: 2px #fff solid;
        }

        .arrow:before {
          content: '';
          position: absolute;
          width: 20px;
          height: 20px;
          top: 50%;
          left: 50%;
          margin: -10px 0 0 -10px;
          border-left: none;
          border-top: none;
          border-right: 1px #fff solid;
          border-bottom: 1px #fff solid;
          animation-duration: 2s;
          animation-iteration-count: infinite;
          animation-name: arrow;
        }

        @keyframes arrow {
          0% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translate(-10px, -10px);
          }
        }
      `}</style>
    </>
  );
}
