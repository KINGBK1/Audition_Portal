"use client";

import { useState, useEffect } from "react";
import { FaHome, FaUser, FaCog } from "react-icons/fa";
import { toast } from "@/components/ui/use-toast";

export const Navbar = () => {
  const [open, setOpen] = useState(false);
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
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="text-white font-bold text-xl">GLUG Auditions</div>

          <div className="relative">
            <div className="flex space-x-4">
              <a className="text-white hover:text-blue-400 transition">
                <FaHome className="inline-block mr-1" /> Home
              </a>

              {/* PROFILE BUTTON → toggles dropdown */}
              <button
                onClick={() => setOpen(!open)}
                className="text-white hover:text-blue-400 transition"
              >
                <FaUser className="inline-block mr-1" /> Profile
              </button>

              <a className="text-white hover:text-blue-400 transition">
                <FaCog className="inline-block mr-1" /> Settings
              </a>
            </div>

            {/* PROFILE DROPDOWN CARD */}
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
      </div>
    </nav>
  );
};
