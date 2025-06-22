import { useState, useEffect } from "react";
import { useWallet } from "../context/WalletContext";
import { useTheme } from "../context/ThemeContext";
import { ethers } from "ethers";
import CivicProposalABI from "../abis/CivicProposal.json";

const Analytics = () => {
  const { contract } = useWallet();
  const { isDark } = useTheme();
  const [analytics, setAnalytics] = useState({
    totalProposals: 0,
    totalVotes: 0,
    averageApprovalRate: 0,
    categoryDistribution: {},
    votingTrends: [],
    topProposals: [],
    userEngagement: {},
    timeSeriesData: [],
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30d");

  useEffect(() => {
    if (contract) {
      fetchAnalytics();
    }
  }, [contract, timeRange]);

  const fetchAnalytics = async () => {
    if (!contract) return;

    try {
      setLoading(true);
      const totalProposals = await contract.getProposalCount();
      const allProposals = [];

      // Fetch all proposals
      for (let i = 0; i < Number(totalProposals); i++) {
        const proposal = await contract.getProposal(i);
        allProposals.push({
          id: i,
          text: proposal[0],
          summary: proposal[1],
          category: proposal[2],
          submitter: proposal[3],
          timestamp: new Date(Number(proposal[4]) * 1000),
          likes: Number(proposal[5]),
          dislikes: Number(proposal[6]),
        });
      }

      // Calculate analytics
      const totalVotes = allProposals.reduce(
        (sum, p) => sum + p.likes + p.dislikes,
        0
      );
      const averageApprovalRate =
        allProposals.length > 0
          ? allProposals.reduce((sum, p) => {
              const total = p.likes + p.dislikes;
              return sum + (total > 0 ? (p.likes / total) * 100 : 0);
            }, 0) / allProposals.length
          : 0;

      // Category distribution
      const categoryDistribution = allProposals.reduce((acc, proposal) => {
        acc[proposal.category] = (acc[proposal.category] || 0) + 1;
        return acc;
      }, {});

      // Top proposals by engagement
      const topProposals = [...allProposals]
        .sort((a, b) => b.likes + b.dislikes - (a.likes + a.dislikes))
        .slice(0, 5);

      // User engagement
      const userEngagement = allProposals.reduce((acc, proposal) => {
        if (!acc[proposal.submitter]) {
          acc[proposal.submitter] = { proposals: 0, totalVotes: 0 };
        }
        acc[proposal.submitter].proposals += 1;
        acc[proposal.submitter].totalVotes +=
          proposal.likes + proposal.dislikes;
        return acc;
      }, {});

      // Time series data (last 30 days)
      const now = new Date();
      const timeSeriesData = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dayProposals = allProposals.filter(
          (p) => p.timestamp.toDateString() === date.toDateString()
        );
        timeSeriesData.push({
          date: date.toISOString().split("T")[0],
          proposals: dayProposals.length,
          votes: dayProposals.reduce((sum, p) => sum + p.likes + p.dislikes, 0),
        });
      }

      setAnalytics({
        totalProposals: Number(totalProposals),
        totalVotes,
        averageApprovalRate: Math.round(averageApprovalRate),
        categoryDistribution,
        topProposals,
        userEngagement,
        timeSeriesData,
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, subtitle, icon, color, trend }) => (
    <div className="card-glass rounded-xl p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className={`text-2xl font-bold ${color} mt-1`}>{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {subtitle}
            </p>
          )}
          {trend && (
            <p
              className={`text-xs ${
                trend > 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              } mt-1`}
            >
              {trend > 0 ? "↗" : "↘"} {Math.abs(trend)}% from last period
            </p>
          )}
        </div>
        <div
          className={`p-3 rounded-full ${color
            .replace("text-", "bg-")
            .replace("-600", "-100")
            .replace("-400", "-900/30")}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );

  const CategoryChart = () => {
    const categories = Object.entries(analytics.categoryDistribution);
    const total = categories.reduce((sum, [, count]) => sum + count, 0);

    return (
      <div className="card-glass rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Proposals by Category
        </h3>
        <div className="space-y-4">
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
                      {count} ({percentage.toFixed(1)}%)
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

  const TimeSeriesChart = () => (
    <div className="card-glass rounded-xl p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Activity Over Time
      </h3>
      <div className="h-64 flex items-end space-x-1">
        {analytics.timeSeriesData.map((data, index) => {
          const maxVotes = Math.max(
            ...analytics.timeSeriesData.map((d) => d.votes)
          );
          const height = maxVotes > 0 ? (data.votes / maxVotes) * 100 : 0;
          return (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-gradient-to-t from-blue-500 to-purple-500 rounded-t transition-all duration-500"
                style={{ height: `${height}%` }}
              ></div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 transform -rotate-45 origin-left  ">
                {new Date(data.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-center space-x-4 mt-4 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-500 rounded mr-1"></div>
          Proposals
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-purple-500 rounded mr-1"></div>
          Votes
        </div>
      </div>
    </div>
  );

  const TopProposalsTable = () => (
    <div className="card-glass rounded-xl p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Top Proposals by Engagement
      </h3>
      <div className="space-y-3">
        {analytics.topProposals.map((proposal, index) => (
          <div
            key={proposal.id}
            className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
          >
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                index === 0
                  ? "bg-yellow-500"
                  : index === 1
                  ? "bg-gray-400"
                  : "bg-orange-500"
              }`}
            >
              {index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {proposal.summary}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {proposal.category} • {proposal.likes + proposal.dislikes} votes
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {Math.round(
                  (proposal.likes / (proposal.likes + proposal.dislikes)) * 100
                )}
                %
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                approval
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const UserEngagementChart = () => {
    const topUsers = Object.entries(analytics.userEngagement)
      .sort(([, a], [, b]) => b.proposals - a.proposals)
      .slice(0, 5);

    return (
      <div className="card-glass rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Top Contributors
        </h3>
        <div className="space-y-3">
          {topUsers.map(([address, data], index) => (
            <div key={address} className="flex items-center space-x-3">
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                  index === 0
                    ? "bg-yellow-500"
                    : index === 1
                    ? "bg-gray-400"
                    : "bg-orange-500"
                }`}
              >
                {index + 1}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {data.proposals} proposals • {data.totalVotes} total votes
                </p>
              </div>
            </div>
          ))}
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
            Loading analytics...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1
          className={`text-3xl font-bold mb-2 ${
            isDark ? "gradient-text-dark" : "gradient-text"
          }`}
        >
          Platform Analytics
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Real-time insights into community engagement and proposal activity
        </p>
      </div>

      {/* Time Range Selector */}
      <div className="mb-6">
        <div className="flex space-x-2">
          {["7d", "30d", "90d", "all"].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === range
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {range === "all" ? "All Time" : range}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Proposals"
          value={analytics.totalProposals}
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
          trend={15}
        />
        <StatCard
          title="Total Votes"
          value={analytics.totalVotes}
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
          title="Avg Approval Rate"
          value={`${analytics.averageApprovalRate}%`}
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
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          }
          color="text-green-600 dark:text-green-400"
          trend={5}
        />
        <StatCard
          title="Active Categories"
          value={Object.keys(analytics.categoryDistribution).length}
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

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <CategoryChart />
        <TimeSeriesChart />
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <TopProposalsTable />
        <UserEngagementChart />
      </div>
    </div>
  );
};

export default Analytics;
