import React, { useState } from "react";
import type { MeDto } from "../types";
import { Button } from "./ui/button";

interface NavigationProps {
  currentPath?: string;
  user?: MeDto | null;
}

export const Navigation: React.FC<NavigationProps> = ({ currentPath = "/", user = null }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
    },
    {
      name: "Leaderboard",
      path: "/leaderboard",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
    },
    {
      name: "History",
      path: "/history",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  ];

  const isActive = (path: string) => {
    return currentPath === path || currentPath.startsWith(path);
  };

  return (
    <>
      {/* Desktop Navigation - Top Bar */}
      <nav className="hidden md:block border-b border-white/10 bg-black/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <a href="/dashboard" className="flex items-center space-x-2">
                <svg
                  className="w-8 h-8 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
                <span className="text-xl font-bold text-white">BetBuddy</span>
              </a>
            </div>

            {/* Center Navigation Links */}
            <div className="flex space-x-1">
              {navItems.map((item) => (
                <a
                  key={item.path}
                  href={item.path}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                    isActive(item.path)
                      ? "bg-primary text-primary-foreground scale-105"
                      : "text-gray-300 hover:bg-white/10 hover:text-white hover:scale-105"
                  }`}
                  aria-current={isActive(item.path) ? "page" : undefined}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </a>
              ))}
            </div>

            {/* Right Side - User Menu */}
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 text-gray-300 hover:text-white transition-all duration-200 hover:scale-105"
                    aria-label="User menu"
                    aria-expanded={showUserMenu}
                  >
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-sm font-medium">{user.nickname}</span>
                  </button>

                  {showUserMenu && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} aria-hidden="true" />
                      <div className="absolute right-0 mt-2 w-48 bg-card border rounded-lg shadow-lg z-20 py-1">
                        {user.isAdmin && (
                          <a
                            href="/admin"
                            className="block px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                          >
                            Admin Panel
                          </a>
                        )}
                        <button
                          onClick={async () => {
                            try {
                              const response = await fetch("/api/auth/logout", {
                                method: "POST",
                              });
                              if (response.ok) {
                                window.location.href = "/dashboard";
                              }
                            } catch (error) {
                              console.error("Logout error:", error);
                            }
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          Sign out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Button asChild variant="default" size="sm">
                  <a href="/auth/login">Sign in</a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation - Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-black/80 border-t border-white/10 z-50 backdrop-blur-md">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => (
            <a
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 ${
                isActive(item.path) ? "text-primary" : "text-gray-400"
              }`}
              aria-current={isActive(item.path) ? "page" : undefined}
            >
              <div className={`${isActive(item.path) ? "scale-110" : ""} transition-transform duration-200`}>
                {item.icon}
              </div>
              <span className="text-xs mt-1 font-medium">{item.name}</span>
            </a>
          ))}

          {/* Mobile User Menu */}
          {user ? (
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 text-gray-400"
              aria-label="User menu"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-xs mt-1 font-medium">Profile</span>
            </button>
          ) : (
            <a
              href="/auth/login"
              className="flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 text-gray-400"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                />
              </svg>
              <span className="text-xs mt-1 font-medium">Login</span>
            </a>
          )}
        </div>

        {/* Mobile User Menu Dropdown */}
        {showUserMenu && user && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} aria-hidden="true" />
            <div className="absolute bottom-full right-0 left-0 mb-2 mx-4 bg-card border rounded-lg shadow-lg z-20 py-2">
              <div className="px-4 py-2 border-b">
                <p className="text-sm font-medium">{user.nickname}</p>
              </div>
              {user.isAdmin && (
                <a href="/admin" className="block px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors">
                  Admin Panel
                </a>
              )}
              <button
                onClick={async () => {
                  try {
                    const response = await fetch("/api/auth/logout", {
                      method: "POST",
                    });
                    if (response.ok) {
                      window.location.href = "/dashboard";
                    }
                  } catch (error) {
                    console.error("Logout error:", error);
                  }
                }}
                className="block w-full text-left px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
              >
                Sign out
              </button>
            </div>
          </>
        )}
      </nav>

      {/* Mobile Bottom Padding - to prevent content from being hidden behind bottom nav */}
      <div className="md:hidden h-16" aria-hidden="true"></div>
    </>
  );
};
