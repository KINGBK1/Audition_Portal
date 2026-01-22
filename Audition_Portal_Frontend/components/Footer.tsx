"use client";

import { useEffect } from "react";

export default function DisableDevTools() {
  useEffect(() => {
    // Disable right-click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12
      if (e.key === "F12") {
        e.preventDefault();
        return false;
      }
      // Ctrl+Shift+I (Inspect)
      if (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "i")) {
        e.preventDefault();
        return false;
      }
      // Ctrl+Shift+J (Console)
      if (e.ctrlKey && e.shiftKey && (e.key === "J" || e.key === "j")) {
        e.preventDefault();
        return false;
      }
      // Ctrl+Shift+C (Inspect Element)
      if (e.ctrlKey && e.shiftKey && (e.key === "C" || e.key === "c")) {
        e.preventDefault();
        return false;
      }
      // Ctrl+U (View Source)
      if (e.ctrlKey && (e.key === "u" || e.key === "U")) {
        e.preventDefault();
        return false;
      }
      // Ctrl+S (Save Page)
      if (e.ctrlKey && (e.key === "s" || e.key === "S")) {
        e.preventDefault();
        return false;
      }
      // Cmd+Option+I (Mac Inspect)
      if (e.metaKey && e.altKey && (e.key === "i" || e.key === "I")) {
        e.preventDefault();
        return false;
      }
      // Cmd+Option+J (Mac Console)
      if (e.metaKey && e.altKey && (e.key === "j" || e.key === "J")) {
        e.preventDefault();
        return false;
      }
      // Cmd+Option+C (Mac Inspect Element)
      if (e.metaKey && e.altKey && (e.key === "c" || e.key === "C")) {
        e.preventDefault();
        return false;
      }
      // Cmd+U (Mac View Source)
      if (e.metaKey && (e.key === "u" || e.key === "U")) {
        e.preventDefault();
        return false;
      }
      // Cmd+S (Mac Save)
      if (e.metaKey && (e.key === "s" || e.key === "S")) {
        e.preventDefault();
        return false;
      }
    };

    // Disable text selection and copy
    const handleSelectStart = (e: Event) => {
      e.preventDefault();
      return false;
    };

    // Disable copy
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      return false;
    };

    // Disable cut
    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault();
      return false;
    };

    // Disable paste (optional, but for consistency)
    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      return false;
    };

    // Detect DevTools opening (basic detection)
    const detectDevTools = () => {
      const threshold = 160;
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;
      
      if (widthThreshold || heightThreshold) {
        // DevTools might be open - you could redirect or show a warning
        document.body.innerHTML = "<h1 style='color: red; text-align: center; margin-top: 50vh;'>Developer tools are not allowed!</h1>";
      }
    };

    // Check periodically for devtools
    const devToolsInterval = setInterval(detectDevTools, 1000);

    // Add event listeners
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("selectstart", handleSelectStart);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("cut", handleCut);
    document.addEventListener("paste", handlePaste);

    // Disable drag and drop
    document.addEventListener("dragstart", (e) => e.preventDefault());
    document.addEventListener("drop", (e) => e.preventDefault());

    // Clear console periodically (aggressive approach)
    const consoleClearInterval = setInterval(() => {
      console.clear();
    }, 100);

    // Cleanup
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("selectstart", handleSelectStart);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("cut", handleCut);
      document.removeEventListener("paste", handlePaste);
      clearInterval(devToolsInterval);
      clearInterval(consoleClearInterval);
    };
  }, []);

  return null;
}