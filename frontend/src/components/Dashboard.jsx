import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useWallet } from "../context/WalletContext";
import { useTheme } from "../context/ThemeContext";
import { ethers } from "ethers";
import CivicProposalABI from "../abis/CivicProposal.json";

const AnimatedDashboardHeader = () => (
  <div className="relative w-full mb-12">
    {/* Animated SVG background */}
    <div className="absolute inset-0 z-0 pointer-events-none">
      <svg
        width="100%"
        height="180"
        viewBox="0 0 1440 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill="url(#dashwave)"
          fillOpacity="0.18"
          d="M0,120 C360,200 1080,40 1440,120 L1440,0 L0,0 Z"
        />
        <defs>
          <linearGradient
            id="dashwave"
            x1="0"
            y1="0"
            x2="1440"
            y2="0"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#60a5fa" />
            <stop offset="0.5" stopColor="#a78bfa" />
            <stop offset="1" stopColor="#34d399" />
          </linearGradient>
        </defs>
      </svg>
    </div>
    <div className="relative z-10 flex flex-col items-center justify-center py-12">
      <h1 className="text-5xl md:text-6xl font-extrabold drop-shadow-xl text-center tracking-tight mb-4 animate-glow animate-float vibrant-waterflow-text">
        CivicGPT: AI-Powered Participatory Planning Assistant
      </h1>
      <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 text-center max-w-3xl animate-fade-in">
        A decentralized platform where citizens submit ideas for improving their
        city.
        <br />
        <span className="font-semibold text-blue-500 dark:text-blue-300">
          CivicGPT
        </span>{" "}
        uses AI to turn raw ideas into structured proposals and auto-categorizes
        them.
      </p>
    </div>
    <style>{`
      .animate-gradient-x {
        background-size: 200% 200%;
        animation: gradient-x 5s ease-in-out infinite;
      }
      @keyframes gradient-x {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      .animate-glow {
        text-shadow: 0 0 16px #60a5fa88, 0 0 8px #a78bfa66, 0 0 2px #34d39944;
      }
      .animate-fade-in { animation: fadeIn 1.2s cubic-bezier(.4,0,.2,1) both; }
      @keyframes fadeIn { from { opacity: 0; transform: translateY(40px);} to { opacity: 1; transform: none; } }
      .animate-float {
        animation: floatTitle 6s ease-in-out infinite;
      }
      @keyframes floatTitle {
        0%   { transform: translate(0, 0); }
        15%  { transform: translate(20px, -10px); }
        30%  { transform: translate(40px, 10px); }
        45%  { transform: translate(20px, 20px); }
        60%  { transform: translate(-20px, 10px); }
        75%  { transform: translate(-40px, -10px); }
        90%  { transform: translate(-20px, -20px); }
        100% { transform: translate(0, 0); }
      }
      .vibrant-waterflow-text {
        background: linear-gradient(270deg, #60a5fa, #38bdf8, #a78bfa, #34d399, #06b6d4, #60a5fa);
        background-size: 1200% 1200%;
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
        animation: waterflow-move 8s linear infinite;
      }
      @keyframes waterflow-move {
        0% { background-position: 0% 50%; }
        25% { background-position: 50% 100%; }
        50% { background-position: 100% 50%; }
        75% { background-position: 50% 0%; }
        100% { background-position: 0% 50%; }
      }
    `}</style>
  </div>
);

const Dashboard = () => {
  const { account, contract } = useWallet();
  const { isDark } = useTheme();
  const [stats, setStats] = useState({
    totalProposals: 0,
    userProposals: 0,
    totalVotes: 0,
    recentProposals: [],
    trendingProposals: [],
    categoryStats: {},
  });
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState("7d"); // 7d, 30d, all

  const contractAddress = "0xD2Ab659a7BEd110b1e35d80D83380Cad64C505ec";

  useEffect(() => {
    fetchDashboardStats();
    // Dashboard will only load once when component mounts
  }, []); // Empty dependency array - no automatic reloading

  const fetchDashboardStats = async () => {
    if (!contract) {
      // If no contract, show default stats
      setStats({
        totalProposals: 0,
        userProposals: 0,
        totalVotes: 0,
        recentProposals: [],
        trendingProposals: [],
        categoryStats: {},
      });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const totalProposals = await contract.getProposalCount();
      const userProposals = account
        ? await contract.getUserProposals(account)
        : [];

      // Fetch all proposals for analysis
      const allProposals = [];
      const count = Number(totalProposals);

      for (let i = 0; i < count; i++) {
        const proposal = await contract.getProposal(i);
        const proposalData = {
          id: i,
          text: proposal[0],
          summary: proposal[1],
          category: proposal[2],
          submitter: proposal[3],
          timestamp: new Date(Number(proposal[4]) * 1000),
          likes: Number(proposal[5]),
          dislikes: Number(proposal[6]),
        };
        allProposals.push(proposalData);
      }

      // Calculate category statistics
      const categoryStats = allProposals.reduce((acc, proposal) => {
        acc[proposal.category] = (acc[proposal.category] || 0) + 1;
        return acc;
      }, {});

      // Get trending proposals (highest engagement)
      const trendingProposals = [...allProposals]
        .sort((a, b) => b.likes + b.dislikes - (a.likes + a.dislikes))
        .slice(0, 3);

      // Get recent proposals
      const recentProposals = [...allProposals]
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 5);

      // Calculate total votes
      const totalVotes = allProposals.reduce(
        (sum, p) => sum + p.likes + p.dislikes,
        0
      );

      setStats({
        totalProposals: count,
        userProposals: userProposals.length,
        totalVotes,
        recentProposals,
        trendingProposals,
        categoryStats,
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      // Set default stats on error
      setStats({
        totalProposals: 0,
        userProposals: 0,
        totalVotes: 0,
        recentProposals: [],
        trendingProposals: [],
        categoryStats: {},
      });
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color, link, trend }) => (
    <div
      className={`card-glass p-6 transition-all duration-300 hover:scale-105 ${
        link ? "cursor-pointer" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
          {trend && (
            <p
              className={`text-sm ${
                trend > 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {trend > 0 ? "+" : ""}
              {trend}% from last week
            </p>
          )}
        </div>
        <div
          className={`p-3 rounded-full ${color
            .replace("text-", "bg-")
            .replace("-600", "-100")
            .replace("-400", "-100")} dark:bg-opacity-20`}
        >
          {icon}
        </div>
      </div>
    </div>
  );

  const QuickActionCard = ({ title, description, icon, link, color }) => (
    <Link to={link} className="block">
      <div className="card-glass p-6 group hover:scale-105 transition-all duration-300">
        <div
          className={`p-3 rounded-full ${color} w-fit mb-4 group-hover:scale-110 transition-transform animate-bounce-gentle`}
        >
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          {description}
        </p>
        <div className="mt-4 flex items-center text-blue-600 dark:text-blue-400 font-medium text-sm group-hover:text-blue-700 dark:group-hover:text-blue-300">
          Get Started
          <svg
            className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>
    </Link>
  );

  const TrendingProposalCard = ({ proposal, rank }) => (
    <div className="card-glass p-4 hover:scale-105 transition-all duration-300">
      <div className="flex items-start space-x-3">
        <div
          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
            rank === 1
              ? "bg-yellow-500 shadow-neon"
              : rank === 2
              ? "bg-gray-400"
              : "bg-orange-500"
          }`}
        >
          {rank}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 line-clamp-2">
            {proposal.summary}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {proposal.text}
          </p>
          <div className="flex items-center justify-between mt-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
              {proposal.category}
            </span>
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <span>👍 {proposal.likes}</span>
              <span>👎 {proposal.dislikes}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const CategoryChart = () => {
    const categories = Object.entries(stats.categoryStats);
    const total = categories.reduce((sum, [, count]) => sum + count, 0);

    return (
      <div className="card-glass p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Proposals by Category
        </h3>
        <div className="space-y-3">
          {categories.map(([category, count]) => {
            const percentage = total > 0 ? (count / total) * 100 : 0;
            return (
              <div key={category} className="flex items-center space-x-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {category}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {count}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-1000 animate-pulse-glow"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner-glass mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-blue-950">
      <AnimatedDashboardHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12 animate-fade-in-up">
          {!account && (
            <div className="mt-8">
              <div className="inline-flex items-center px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded-full text-sm font-medium animate-bounce-gentle">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Connect your wallet to participate
              </div>
            </div>
          )}
        </div>

        {/* Project Summary Section */}
        <div
          className="mb-12 animate-fade-in-up"
          style={{ animationDelay: "0.2s" }}
        >
          <div className="card-glass rounded-2xl p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* Left Column - What is CivicGPT */}
              <div>
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-4">
                    <span className="text-2xl">🧠</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    What is CivicGPT?
                  </h2>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                  CivicGPT is a revolutionary decentralized platform that
                  empowers citizens to actively participate in shaping their
                  communities. It transforms the way cities plan and implement
                  improvements by combining blockchain technology with advanced
                  AI capabilities.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg
                        className="w-4 h-4 text-green-600 dark:text-green-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                        Decentralized Governance
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Transparent, tamper-proof proposal system built on
                        blockchain
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg
                        className="w-4 h-4 text-blue-600 dark:text-blue-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                        AI-Powered Processing
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Intelligent categorization and summary generation
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg
                        className="w-4 h-4 text-purple-600 dark:text-purple-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                        Community-Driven
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Direct citizen participation in urban planning decisions
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - How it Works */}
              <div>
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mr-4">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    How It Works
                  </h2>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      1
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                        Submit Ideas
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Citizens submit raw ideas for city improvements (e.g.,
                        new parks, safer roads, digital services)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      2
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                        AI Processing
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        CivicGPT automatically categorizes proposals and
                        generates structured summaries
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      3
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                        Community Voting
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Residents vote on proposals and provide feedback through
                        the decentralized platform
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      4
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                        Implementation
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Top-voted proposals are presented to city officials for
                        consideration and implementation
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Features Section */}
            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
                Key Features
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🤖</span>
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    AI-Powered Analysis
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Intelligent processing of citizen ideas with automatic
                    categorization and context suggestions
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🔗</span>
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Blockchain Security
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Immutable, transparent record of all proposals and votes on
                    the blockchain
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🌐</span>
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Smart Search
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Natural language search to find similar past projects and
                    relevant proposals
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Proposals"
            value={stats.totalProposals}
            icon={
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            }
            color="text-blue-600 dark:text-blue-400"
            trend={12}
          />
          <StatCard
            title="Your Proposals"
            value={stats.userProposals}
            icon={
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            }
            color="text-green-600 dark:text-green-400"
          />
          <StatCard
            title="Total Votes"
            value={stats.totalVotes}
            icon={
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            }
            color="text-purple-600 dark:text-purple-400"
            trend={8}
          />
          <StatCard
            title="Active Categories"
            value={Object.keys(stats.categoryStats).length}
            icon={
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
            }
            color="text-orange-600 dark:text-orange-400"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              Quick Actions
            </h2>
            <div className="space-y-4">
              <QuickActionCard
                title="Submit Proposal"
                description="Share your ideas for improving the community"
                icon={
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                }
                link="/submit"
                color="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
              />
              <QuickActionCard
                title="Browse Proposals"
                description="View and vote on community proposals"
                icon={
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                }
                link="/proposals"
                color="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
              />
              <QuickActionCard
                title="AI Search"
                description="Find proposals using natural language"
                icon={
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                }
                link="/search"
                color="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
              />
            </div>
          </div>

          {/* Trending Proposals */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              Trending Proposals
            </h2>
            <div className="space-y-4">
              {stats.trendingProposals.length > 0 ? (
                stats.trendingProposals.map((proposal, index) => (
                  <TrendingProposalCard
                    key={proposal.id}
                    proposal={proposal}
                    rank={index + 1}
                  />
                ))
              ) : (
                <div className="card-glass p-8 text-center">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    No proposals yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Be the first to submit a proposal!
                  </p>
                  <Link
                    to="/submit"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Submit Proposal
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Category Chart */}
        <div className="mb-8">
          <CategoryChart />
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Recent Activity
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stats.recentProposals.slice(0, 6).map((proposal) => (
              <div
                key={proposal.id}
                className="card-glass p-4 hover:scale-105 transition-all duration-300"
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {proposal.category.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 line-clamp-2">
                      {proposal.summary}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {proposal.timestamp.toLocaleDateString()}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                        {proposal.category}
                      </span>
                      <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>👍 {proposal.likes}</span>
                        <span>👎 {proposal.dislikes}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
