import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useWallet } from "../context/WalletContext";
import { useTheme } from "../context/ThemeContext";
import { useNotifications } from "./NotificationSystem";

const NavBar = () => {
  const { account, connectWallet, disconnectWallet } = useWallet();
  const { isDark, toggleTheme } = useTheme();
  const { NotificationBell } = useNotifications();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    {
      name: "Dashboard",
      path: "/",
      icon: "🏠",
      color: "from-blue-500 to-cyan-500",
    },
    {
      name: "Proposals",
      path: "/proposals",
      icon: "📋",
      color: "from-green-500 to-emerald-500",
    },
    {
      name: "Submit",
      path: "/submit",
      icon: "✏️",
      color: "from-purple-500 to-pink-500",
    },
    {
      name: "Search",
      path: "/search",
      icon: "🔍",
      color: "from-orange-500 to-red-500",
    },
    {
      name: "Agent",
      path: "/query",
      icon: "❓",
      color: "from-indigo-500 to-blue-500",
    },
    {
      name: "Analytics",
      path: "/analytics",
      icon: "📊",
      color: "from-teal-500 to-green-500",
    },
    {
      name: "My Proposals",
      path: "/my-proposals",
      icon: "👤",
      color: "from-violet-500 to-purple-500",
    },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Floating Particles Background */}
      <div className="fixed top-0 left-0 w-full h-20 pointer-events-none z-40 overflow-hidden">
        <div className="absolute top-4 left-1/4 w-2 h-2 bg-blue-400 rounded-full animate-float-1 opacity-60"></div>
        <div className="absolute top-6 right-1/3 w-1 h-1 bg-purple-400 rounded-full animate-float-2 opacity-40"></div>
        <div className="absolute top-8 left-1/2 w-1.5 h-1.5 bg-green-400 rounded-full animate-float-3 opacity-50"></div>
        <div className="absolute top-3 right-1/4 w-1 h-1 bg-orange-400 rounded-full animate-float-4 opacity-30"></div>
        <div className="absolute top-10 left-1/3 w-1 h-1 bg-pink-400 rounded-full animate-float-5 opacity-40"></div>
      </div>

      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
          isScrolled
            ? "bg-white/85 dark:bg-gray-900/85 backdrop-blur-2xl border-b border-gray-200/60 dark:border-gray-700/60 shadow-2xl dark:shadow-2xl"
            : "bg-gradient-to-r from-blue-600/95 via-purple-600/95 to-indigo-600/95 dark:from-gray-900/95 dark:via-indigo-900/95 dark:to-purple-900/95 backdrop-blur-xl"
        }`}
      >
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-indigo-600/20 dark:from-blue-500/10 dark:via-purple-500/10 dark:to-indigo-500/10 animate-gradient-x"></div>

        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 relative">
          <div className="flex items-center justify-between h-20">
            {/* Enhanced Logo */}
            <Link
              to="/"
              className="flex items-center space-x-2 sm:space-x-4 group flex-shrink-0"
            >
              <div className="relative">
                <div className="w-8 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-400 dark:to-purple-500 rounded-2xl flex items-center justify-center text-white font-bold text-lg sm:text-xl group-hover:scale-110 transition-all duration-500 animate-pulse-glow shadow-neon">
                  <span className="relative z-10">CP</span>
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-spin-slow"></div>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-400 rounded-full animate-ping"></div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-white to-blue-100 dark:from-gray-100 dark:to-blue-200 bg-clip-text text-transparent group-hover:from-blue-200 group-hover:to-purple-200 transition-all duration-500">
                  CivicGPT
                </h1>
              </div>
            </Link>

            {/* Enhanced Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1 xl:space-x-2">
              {navItems.map((item, index) => (
                <div key={item.path} className="relative group">
                  <Link
                    to={item.path}
                    onMouseEnter={() => setHoveredItem(item.path)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className={`px-2 xl:px-4 py-2 xl:py-3 rounded-xl text-xs xl:text-sm font-semibold transition-all duration-500 flex items-center space-x-1 xl:space-x-2 hover:scale-105 relative overflow-hidden ${
                      isActive(item.path)
                        ? "bg-white/25 dark:bg-gray-800/25 text-white dark:text-gray-100 shadow-neon"
                        : "text-white/90 dark:text-gray-300 hover:text-white dark:hover:text-gray-100 hover:bg-white/15 dark:hover:bg-gray-800/15"
                    }`}
                    style={{
                      animationDelay: `${index * 100}ms`,
                    }}
                  >
                    {/* Animated Background */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-xl`}
                    ></div>

                    {/* Icon with Animation */}
                    <span className="text-base xl:text-lg group-hover:scale-125 group-hover:rotate-12 transition-all duration-500">
                      {item.icon}
                    </span>
                    <span className="relative z-10 hidden xl:block">
                      {item.name}
                    </span>

                    {/* Hover Effect */}
                    {hoveredItem === item.path && (
                      <div className="absolute inset-0 bg-white/10 rounded-xl animate-pulse"></div>
                    )}
                  </Link>

                  {/* Floating Indicator */}
                  {isActive(item.path) && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-bounce"></div>
                  )}
                </div>
              ))}
            </div>

            {/* Enhanced Right Side Controls */}
            <div className="hidden lg:flex items-center space-x-2 xl:space-x-4 flex-shrink-0">
              {/* Enhanced Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="relative p-2 xl:p-3 rounded-xl bg-white/15 dark:bg-gray-800/15 text-white dark:text-gray-300 hover:bg-white/25 dark:hover:bg-gray-800/25 transition-all duration-500 hover:scale-110 group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                {isDark ? (
                  <svg
                    className="w-5 h-5 xl:w-6 xl:h-6 relative z-10 group-hover:rotate-180 transition-transform duration-700"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5 xl:w-6 xl:h-6 relative z-10 group-hover:rotate-180 transition-transform duration-700"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    />
                  </svg>
                )}
              </button>

              {/* Enhanced Notification Bell */}
              <div className="relative">
                <NotificationBell />
                <div className="absolute -top-1 -right-1 w-2 h-2 xl:w-3 xl:h-3 bg-red-500 rounded-full animate-ping"></div>
              </div>

              {/* Enhanced Wallet Status */}
              {account ? (
                <div className="flex items-center flex-wrap gap-1 xl:gap-2 bg-white/15 dark:bg-gray-800/15 rounded-xl px-2 py-2 xl:px-3 xl:py-2 min-w-0 backdrop-blur-sm border border-white/20 dark:border-gray-700/20">
                  <div className="flex items-center space-x-1 xl:space-x-2 min-w-0">
                    <div className="w-2 h-2 xl:w-3 xl:h-3 bg-green-400 rounded-full animate-pulse shadow-neon"></div>
                    <span className="text-xs font-medium text-white dark:text-gray-300 truncate max-w-[50px] xl:max-w-[80px]">
                      {account.slice(0, 3)}...{account.slice(-2)}
                    </span>
                  </div>
                  <button
                    onClick={disconnectWallet}
                    className="px-2 py-1 text-xs bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-lg transition-all duration-300 hover:scale-105 font-semibold shadow-lg"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={connectWallet}
                  className="relative h-10 min-w-[140px] px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-500 hover:scale-105 animate-pulse-glow shadow-neon group overflow-hidden text-sm border border-white/20 backdrop-blur-sm"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <span className="relative z-10 flex items-center justify-center space-x-2 h-full">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    <span className="hidden sm:block">Connect Wallet</span>
                    <span className="sm:hidden">Connect</span>
                  </span>
                </button>
              )}
            </div>

            {/* Enhanced Mobile Controls */}
            <div className="lg:hidden flex items-center space-x-2 flex-shrink-0">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl bg-white/15 dark:bg-gray-800/15 text-white dark:text-gray-300 hover:bg-white/25 dark:hover:bg-gray-800/25 transition-all duration-300"
              >
                {isDark ? (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    />
                  </svg>
                )}
              </button>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-xl text-white dark:text-gray-300 hover:bg-white/15 dark:hover:bg-gray-800/15 transition-all duration-300 group"
              >
                <div className="w-5 h-5 flex flex-col justify-center items-center">
                  <span
                    className={`block w-4 h-0.5 bg-current transition-all duration-300 ${
                      isMobileMenuOpen
                        ? "rotate-45 translate-y-1"
                        : "-translate-y-1"
                    }`}
                  ></span>
                  <span
                    className={`block w-4 h-0.5 bg-current transition-all duration-300 ${
                      isMobileMenuOpen ? "opacity-0" : "opacity-100"
                    }`}
                  ></span>
                  <span
                    className={`block w-4 h-0.5 bg-current transition-all duration-300 ${
                      isMobileMenuOpen
                        ? "-rotate-45 -translate-y-1"
                        : "translate-y-1"
                    }`}
                  ></span>
                </div>
              </button>
            </div>
          </div>

          {/* Enhanced Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="lg:hidden animate-fade-in-down">
              <div className="px-4 pt-4 pb-6 space-y-2 bg-white/15 dark:bg-gray-800/15 backdrop-blur-2xl rounded-2xl mt-4 border border-white/25 dark:border-gray-700/25 shadow-2xl">
                {navItems.map((item, index) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-4 py-3 rounded-xl text-base font-semibold transition-all duration-300 hover:scale-105 relative overflow-hidden ${
                      isActive(item.path)
                        ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white dark:text-gray-100 shadow-neon"
                        : "text-white/90 dark:text-gray-300 hover:text-white dark:hover:text-gray-100 hover:bg-white/10 dark:hover:bg-gray-700/10"
                    }`}
                    style={{
                      animationDelay: `${index * 50}ms`,
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{item.icon}</span>
                      <span>{item.name}</span>
                    </div>
                  </Link>
                ))}

                {/* Mobile Wallet Status */}
                <div className="px-2 py-2 border-t border-white/25 dark:border-gray-700/25 mt-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 w-full">
                    <NotificationBell />
                    {account ? (
                      <div className="flex items-center flex-wrap gap-2 bg-white/15 dark:bg-gray-800/15 rounded-xl px-2 py-1 min-w-0 border border-white/20 dark:border-gray-700/20 w-full sm:w-auto">
                        <div className="flex items-center space-x-2 min-w-0">
                          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                          <span className="text-xs font-medium text-white dark:text-gray-300 truncate max-w-[80px]">
                            {account.slice(0, 6)}...{account.slice(-4)}
                          </span>
                        </div>
                        <button
                          onClick={disconnectWallet}
                          className="px-2 py-1 text-xs bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg transition-all duration-300 font-semibold w-full sm:w-auto mt-1 sm:mt-0"
                        >
                          Disconnect
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={connectWallet}
                        className="w-full h-12 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 text-sm border border-white/20 backdrop-blur-sm flex items-center justify-center space-x-2"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                          />
                        </svg>
                        <span>Connect Wallet</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default NavBar;
