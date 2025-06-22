import { useState, useEffect } from "react";
import { useWallet } from "../context/WalletContext";
import { useTheme } from "../context/ThemeContext";
import ProposalCard from "./ProposalCard";

const ProposalList = () => {
  const { contract, account } = useWallet();
  const { isDark } = useTheme();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    { value: "all", label: "All Categories", icon: "📋" },
    { value: "Transportation", label: "Transportation", icon: "🚗" },
    { value: "Public Safety", label: "Public Safety", icon: "🛡️" },
    { value: "Environment", label: "Environment", icon: "🌱" },
    { value: "Events & Culture", label: "Events & Culture", icon: "🎭" },
    { value: "Governance", label: "Governance", icon: "🏛️" },
  ];

  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "most-liked", label: "Most Liked" },
    { value: "most-voted", label: "Most Voted" },
    { value: "approval-rate", label: "Highest Approval" },
  ];

  useEffect(() => {
    fetchProposals();
  }, [contract, account]);

  const fetchProposals = async () => {
    if (!contract) return;

    try {
      setLoading(true);
      const count = await contract.getProposalCount();
      const proposalList = [];

      for (let i = 0; i < count; i++) {
        const proposal = await contract.getProposal(i);
        const hasVoted = account
          ? await contract.hasUserVoted(i, account)
          : false;
        const userVote = hasVoted
          ? await contract.getUserVote(i, account)
          : null;

        proposalList.push({
          id: i,
          text: proposal[0],
          summary: proposal[1],
          category: proposal[2],
          submitter: proposal[3],
          timestamp: new Date(Number(proposal[4]) * 1000),
          likes: Number(proposal[5]),
          dislikes: Number(proposal[6]),
          hasVoted,
          userVote,
        });
      }

      setProposals(proposalList);
    } catch (error) {
      console.error("Error fetching proposals:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVoteUpdate = (updatedProposal) => {
    setProposals((prev) =>
      prev.map((p) => (p.id === updatedProposal.id ? updatedProposal : p))
    );
  };

  const filteredAndSortedProposals = proposals
    .filter((proposal) => {
      const matchesCategory = filter === "all" || proposal.category === filter;
      const matchesSearch =
        proposal.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        proposal.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        proposal.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return b.timestamp - a.timestamp;
        case "oldest":
          return a.timestamp - b.timestamp;
        case "most-liked":
          return b.likes - a.likes;
        case "most-voted":
          return b.likes + b.dislikes - (a.likes + a.dislikes);
        case "approval-rate":
          const aRate =
            a.likes + a.dislikes > 0 ? a.likes / (a.likes + a.dislikes) : 0;
          const bRate =
            b.likes + b.dislikes > 0 ? b.likes / (b.likes + b.dislikes) : 0;
          return bRate - aRate;
        default:
          return 0;
      }
    });

  const stats = {
    total: proposals.length,
    filtered: filteredAndSortedProposals.length,
    totalVotes: proposals.reduce((sum, p) => sum + p.likes + p.dislikes, 0),
    totalLikes: proposals.reduce((sum, p) => sum + p.likes, 0),
    totalDislikes: proposals.reduce((sum, p) => sum + p.dislikes, 0),
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="spinner-glass mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading proposals...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1
          className={`text-4xl font-bold mb-4 ${
            isDark ? "gradient-text-dark" : "gradient-text"
          }`}
        >
          Community Proposals
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Discover and vote on proposals that will shape the future of your
          community
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="card-glass rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {stats.total}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Total Proposals
          </div>
        </div>
        <div className="card-glass rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {stats.totalLikes}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Total Likes
          </div>
        </div>
        <div className="card-glass rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {stats.totalDislikes}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Total Dislikes
          </div>
        </div>
        <div className="card-glass rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {stats.totalVotes}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Total Votes
          </div>
        </div>
        <div className="card-glass rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {stats.filtered}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card-glass rounded-2xl p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Proposals
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, content, or category..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
              />
              <svg
                className="absolute left-3 top-2.5 w-5 h-5 text-gray-400 dark:text-gray-500"
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
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filter by Category
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
            >
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.icon} {category.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Proposals Grid */}
      {filteredAndSortedProposals.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-12 h-12 text-gray-400 dark:text-gray-500"
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
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No proposals found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchQuery || filter !== "all"
              ? "Try adjusting your search or filter criteria"
              : "Be the first to submit a proposal!"}
          </p>
          {!searchQuery && filter === "all" && (
            <button
              onClick={() => (window.location.href = "/submit")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
            >
              Submit First Proposal
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredAndSortedProposals.map((proposal, index) => (
            <div
              key={proposal.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <ProposalCard
                proposal={proposal}
                onVoteUpdate={handleVoteUpdate}
              />
            </div>
          ))}
        </div>
      )}

      {/* Load More Button (if needed) */}
      {filteredAndSortedProposals.length > 0 && (
        <div className="text-center mt-8">
          <p className="text-gray-600 dark:text-gray-400">
            Showing {filteredAndSortedProposals.length} of {stats.total}{" "}
            proposals
          </p>
        </div>
      )}
    </div>
  );
};

export default ProposalList;
