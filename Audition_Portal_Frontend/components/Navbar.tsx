"use client";

import { useState, useEffect } from "react";
import { FaHome, FaUser, FaCog, FaBars, FaTimes } from "react-icons/fa";
import { toast } from "@/components/ui/use-toast";

export const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState({ username: "", email: "" });

  // Fetch user when navbar loads
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          throw new Error("No token found");
        }

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/verify`,
          {
            headers: {
              "Authorization": `Bearer ${token}`,
            },
            credentials: "include",
          }
        );
        const data = await res.json();
        setUser({ username: data.username, email: data.email });
      } catch (e) {
        toast({
          variant: "destructive",
          description: "Failed to load profile",
        });
      }
    };

    fetchUser();
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black bg-opacity-50 backdrop-blur-lg">
      <div className="container mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="text-white font-bold text-lg sm:text-xl">GLUG Auditions</div>

          {/* Hamburger Menu Button - Mobile Only */}
          <button
            className="md:hidden text-white text-2xl"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>

          {/* Desktop Menu */}
          <div className="hidden md:block relative">
            <div className="flex space-x-4">
              <a className="text-white hover:text-blue-400 transition cursor-pointer">
                <FaHome className="inline-block mr-1" /> Home
              </a>

              {/* PROFILE BUTTON → toggles dropdown */}
              <button
                onClick={() => setOpen(!open)}
                className="text-white hover:text-blue-400 transition"
              >
                <FaUser className="inline-block mr-1" /> Profile
              </button>

              <a className="text-white hover:text-blue-400 transition cursor-pointer">
                <FaCog className="inline-block mr-1" /> Settings
              </a>
            </div>

            {/* PROFILE DROPDOWN CARD - Desktop */}
            {open && (
              <div className="absolute right-0 mt-3 w-64 bg-white bg-opacity-20 backdrop-blur-xl border border-blue-400 border-opacity-40 rounded-xl p-4 shadow-lg text-white">
                <h2 className="text-xl font-semibold mb-2">Profile</h2>
                <div className="space-y-1">
                  <p>
                    <span className="font-bold">Username:</span>{" "}
                    {user.username || "Loading..."}
                  </p>
                  <p>
                    <span className="font-bold">Email:</span>{" "}
                    {user.email || "Loading..."}
                  </p>
                </div>

                <button
                  onClick={() => setOpen(false)}
                  className="w-full mt-4 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4">
            <div className="flex flex-col space-y-3">
              <a className="text-white hover:text-blue-400 transition cursor-pointer py-2 px-3 rounded hover:bg-white/10">
                <FaHome className="inline-block mr-2" /> Home
              </a>

              <button
                onClick={() => {
                  setOpen(!open);
                }}
                className="text-white hover:text-blue-400 transition text-left py-2 px-3 rounded hover:bg-white/10"
              >
                <FaUser className="inline-block mr-2" /> Profile
              </button>

              <a className="text-white hover:text-blue-400 transition cursor-pointer py-2 px-3 rounded hover:bg-white/10">
                <FaCog className="inline-block mr-2" /> Settings
              </a>

              {/* Mobile Profile Card - Shows when Profile is clicked */}
              {open && (
                <div className="bg-white bg-opacity-20 backdrop-blur-xl border border-blue-400 border-opacity-40 rounded-xl p-4 shadow-lg text-white mt-2">
                  <h2 className="text-lg font-semibold mb-2">Profile</h2>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-bold">Username:</span>{" "}
                      {user.username || "Loading..."}
                    </p>
                    <p>
                      <span className="font-bold">Email:</span>{" "}
                      {user.email || "Loading..."}
                    </p>
                  </div>

                  <button
                    onClick={() => setOpen(false)}
                    className="w-full mt-4 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 text-sm"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
