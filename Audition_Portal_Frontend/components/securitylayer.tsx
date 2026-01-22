"use client";

import { useEffect } from "react";

/**
 * Additional security layer to prevent DevTools and console manipulation
 * This component should be used alongside DisableDevTools
 */
export default function SecurityLayer() {
  useEffect(() => {
    // Override console methods to prevent manipulation
    const noop = () => {};
    
    // Disable console in production
    if (process.env.NODE_ENV === "production") {
      (window as any).console = {
        log: noop,
        warn: noop,
        error: noop,
        info: noop,
        debug: noop,
        trace: noop,
        dir: noop,
        dirxml: noop,
        table: noop,
        group: noop,
        groupCollapsed: noop,
        groupEnd: noop,
        clear: noop,
        count: noop,
        countReset: noop,
        assert: noop,
        profile: noop,
        profileEnd: noop,
        time: noop,
        timeLog: noop,
        timeEnd: noop,
        timeStamp: noop,
      };
    }

    // Detect if debugger is open
    let checkStatus = false;
    const element = new Image();
    
    Object.defineProperty(element, "id", {
      get: function () {
        checkStatus = true;
        throw new Error("DevTools detected!");
      },
    });

    // Check for DevTools at intervals
    const detectDevTools = setInterval(() => {
      checkStatus = false;
      console.log(element);
      console.clear();
      
      if (checkStatus) {
        // DevTools detected - redirect or show message
        document.body.innerHTML = `
          <div style="
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background: #000;
            color: #ef4444;
            font-family: monospace;
            font-size: 24px;
            text-align: center;
            flex-direction: column;
            gap: 20px;
          ">
            <div style="font-size: 48px;">⚠️</div>
            <div>DEVELOPER TOOLS DETECTED</div>
            <div style="font-size: 16px; color: #94a3b8;">
              Please close developer tools to continue
            </div>
          </div>
        `;
      }
    }, 1000);

    // Disable print screen
    document.addEventListener("keyup", (e) => {
      if (e.key === "PrintScreen") {
        navigator.clipboard.writeText("");
        alert("Screenshots are disabled!");
      }
    });

    // Detect focus loss (might indicate DevTools opened in separate window)
    let lastFocusTime = Date.now();
    
    const handleBlur = () => {
      lastFocusTime = Date.now();
    };

    const handleFocus = () => {
      const focusLostTime = Date.now() - lastFocusTime;
      // If focus was lost for more than 100ms, might indicate DevTools
      if (focusLostTime > 100) {
        console.clear();
      }
    };

    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);

    // Cleanup
    return () => {
      clearInterval(detectDevTools);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  return null;
}