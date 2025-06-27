import { useState } from "react";
import { useWallet } from "../context/WalletContext";
import { useTheme } from "../context/ThemeContext";
import axios from "axios";
import ProposalCard from "./ProposalCard";

const SearchProposals = () => {
  const { account } = useWallet();
  const { isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!searchQuery.trim()) {
      setError("Please enter a search query");
      return;
    }

    setIsSearching(true);
    setError("");
    setHasSearched(true);

    try {
      const response = await axios.get(
        `https://civicgpt.onrender.com/api/search_proposals/${encodeURIComponent(
          searchQuery
        )}`
      );
      setSearchResults(response.data.results || []);
    } catch (error) {
      console.error("Search error:", error);
      setError("Failed to search proposals. Please try again.");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleVoteUpdate = (updatedProposal) => {
    setSearchResults((prev) =>
      prev.map((p) => (p.id === updatedProposal.id ? updatedProposal : p))
    );
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setHasSearched(false);
    setError("");
  };

  const searchSuggestions = [
    "public transportation improvements",
    "safety measures for parks",
    "environmental initiatives",
    "community events",
    "governance reforms",
    "road maintenance",
    "recycling programs",
    "cultural festivals",
  ];

  // Defensive parse for proposals
  const safeProposals = Array.isArray(searchResults)
    ? searchResults.map((p, idx) => {
        let id = p.id;
        if (typeof id === "string" && /^\d+$/.test(id)) id = Number(id);
        if (typeof id !== "number") id = idx; // fallback
        return {
          id,
          text: p.text || "No text provided.",
          summary: p.summary || "No summary provided.",
          category: p.category || "Other",
          submitter: p.submitter || "Unknown",
          timestamp: p.timestamp || new Date().toLocaleString(),
          likes: typeof p.likes === "number" ? p.likes : 0,
          dislikes: typeof p.dislikes === "number" ? p.dislikes : 0,
          hasVoted: typeof p.hasVoted === "boolean" ? p.hasVoted : false,
          userVote: typeof p.userVote === "boolean" ? p.userVote : null,
        };
      })
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1
          className={`text-4xl font-bold mb-4 ${
            isDark ? "gradient-text-dark" : "gradient-text"
          }`}
        >
          Search Proposals
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Find specific proposals using AI-powered semantic search
        </p>
      </div>

      {/* Search Form */}
      <div className="max-w-3xl mx-auto mb-8">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for proposals (e.g., 'public transport', 'safety improvements', 'environmental projects')..."
              className="w-full pl-12 pr-4 py-4 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-lg transition-all duration-200"
            />
            <svg
              className="absolute left-4 top-4 w-6 h-6 text-gray-400 dark:text-gray-500"
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

          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={isSearching || !searchQuery.trim()}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSearching ? (
                <>
                  <div className="spinner-glass"></div>
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
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
                  <span>Search Proposals</span>
                </>
              )}
            </button>

            {hasSearched && (
              <button
                type="button"
                onClick={clearSearch}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                Clear Search
              </button>
            )}
          </div>
        </form>

        {/* Search Suggestions */}
        {!hasSearched && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Popular searches:
            </h3>
            <div className="flex flex-wrap gap-2">
              {searchSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => setSearchQuery(suggestion)}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-3xl mx-auto mb-8">
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-800 dark:text-red-200 px-4 py-3 rounded-xl">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-medium">{error}</span>
            </div>
          </div>
        </div>
      )}

      {/* Search Results */}
      {hasSearched && (
        <div>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Search Results
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {isSearching
                ? "Searching for proposals..."
                : safeProposals.length > 0
                ? `Found ${safeProposals.length} matching proposal${
                    safeProposals.length !== 1 ? "s" : ""
                  }`
                : "No matching proposals found"}
            </p>
          </div>

          {safeProposals.length === 0 && !isSearching ? (
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
                Try different keywords or browse all proposals
              </p>
              <div className="space-x-4">
                <button
                  onClick={() => (window.location.href = "/proposals")}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                >
                  Browse All Proposals
                </button>
                <button
                  onClick={clearSearch}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  Try New Search
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {safeProposals.map((proposal, index) => {
                try {
                  return (
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
                  );
                } catch (err) {
                  return (
                    <div
                      key={index}
                      className="bg-red-100 text-red-700 p-4 rounded-xl"
                    >
                      Could not display this proposal due to a data error.
                    </div>
                  );
                }
              })}
            </div>
          )}
        </div>
      )}

      {/* Features Section */}
      {!hasSearched && (
        <div className="mt-16 card-glass rounded-3xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
            AI-Powered Search Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Semantic Search
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Find proposals using natural language, not just exact keywords
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 dark:bg-green-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Fast Results
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Get instant results powered by advanced vector search technology
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 dark:bg-purple-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-purple-600 dark:text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Smart Matching
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                AI understands context and finds the most relevant proposals
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchProposals;
