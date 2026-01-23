"use client";

export default function Arrow() {
  return (
    <>
      <div className="arrow-container">
        <div className="new-button">
          <span className="button-overlay">
            <span className="button-gradient"></span>
          </span>
          <div className="button-content">
            Join Us
          </div>
          <span className="button-underline"></span>
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

        .new-button {
          position: relative;
          border-radius: 9999px;
          padding: 1px;
          font-size: 14px;
          line-height: 1.5;
          color: rgb(228, 228, 231);
          box-shadow: 0 0 20px rgba(56, 189, 248, 0.5);
        }

        .button-overlay {
          position: absolute;
          inset: 0;
          overflow: hidden;
          border-radius: 9999px;
        }

        .button-gradient {
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          background-image: radial-gradient(75% 100% at 50% 0%, rgba(56, 189, 248, 0.6) 0%, rgba(56, 189, 248, 0) 75%);
          opacity: 1;
        }

        .button-content {
          position: relative;
          z-index: 10;
          border-radius: 9999px;
          background-color: rgb(9, 9, 11);
          padding: 6px 32px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          white-space: nowrap;
        }

        .button-underline {
          position: absolute;
          bottom: 0;
          left: 1.125rem;
          height: 1px;
          width: calc(100% - 2.25rem);
          background: linear-gradient(to right, rgba(34, 211, 238, 0) 0%, rgba(34, 211, 238, 0.9) 50%, rgba(34, 211, 238, 0) 100%);
          opacity: 0.4;
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