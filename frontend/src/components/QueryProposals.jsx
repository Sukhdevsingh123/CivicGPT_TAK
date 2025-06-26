import { useState } from "react";
import { useWallet } from "../context/WalletContext";
import { useTheme } from "../context/ThemeContext";
import axios from "axios";

const QueryProposals = () => {
  const { account } = useWallet();
  const { isDark } = useTheme();
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [isQuerying, setIsQuerying] = useState(false);
  const [hasQueried, setHasQueried] = useState(false);
  const [error, setError] = useState("");

  const handleQuery = async (e) => {
    e.preventDefault();

    if (!query.trim()) {
      setError("Please enter a question");
      return;
    }

    setIsQuerying(true);
    setError("");
    setHasQueried(true);

    try {
      const response = await axios.post(
        "https://civicgpt-tak.onrender.com/api/ask_proposal",
        {
          query: query.trim(),
        }
      );
      setAnswer(response.data.answer);
    } catch (error) {
      console.error("Query error:", error);
      setError("Failed to get answer. Please try again.");
      setAnswer("");
    } finally {
      setIsQuerying(false);
    }
  };

  const clearQuery = () => {
    setQuery("");
    setAnswer("");
    setHasQueried(false);
    setError("");
  };

  const exampleQueries = [
    "What are the most popular transportation proposals?",
    "Which proposals focus on environmental improvements?",
    "What safety measures have been proposed?",
    "How many proposals are there in each category?",
    "What are the most controversial proposals?",
    "Which proposals have the highest approval rates?",
    "What community events have been suggested?",
    "Are there any proposals about recycling programs?",
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1
          className={`text-4xl font-bold mb-4 ${
            isDark ? "gradient-text-dark" : "gradient-text"
          }`}
        >
          Ask About Proposals
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Get intelligent answers about community proposals using AI
        </p>
      </div>

      {/* Query Form */}
      <div className="max-w-4xl mx-auto mb-8">
        <form onSubmit={handleQuery} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Ask a Question About Proposals
            </label>
            <div className="relative">
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask anything about the proposals... (e.g., 'What are the most popular transportation proposals?', 'Which proposals focus on environmental improvements?')"
                rows={4}
                className="w-full pl-4 pr-4 py-4 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent resize-none transition-all duration-200 text-lg"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={isQuerying || !query.trim()}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isQuerying ? (
                <>
                  <div className="spinner-glass"></div>
                  <span>Getting Answer...</span>
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
                      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>Ask Question</span>
                </>
              )}
            </button>

            {hasQueried && (
              <button
                type="button"
                onClick={clearQuery}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </form>

        {/* Example Queries */}
        {!hasQueried && (
          <div className="mt-8">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Example questions:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {exampleQueries.map((example, index) => (
                <button
                  key={index}
                  onClick={() => setQuery(example)}
                  className="text-left p-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm transition-colors border border-gray-200 dark:border-gray-600"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-4xl mx-auto mb-8">
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

      {/* Answer Display */}
      {hasQueried && (
        <div className="max-w-4xl mx-auto">
          <div className="card-glass rounded-2xl overflow-hidden">
            {/* Question */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 p-6 border-b border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    Your Question
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">{query}</p>
                </div>
              </div>
            </div>

            {/* Answer */}
            <div className="p-6">
              {isQuerying ? (
                <div className="flex items-center space-x-3">
                  <div className="spinner-glass"></div>
                  <span className="text-gray-600 dark:text-gray-400">
                    AI is analyzing the proposals...
                  </span>
                </div>
              ) : answer ? (
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-4 h-4 text-white"
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
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      AI Answer
                    </h3>
                    <div className="prose prose-gray max-w-none">
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {answer}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-gray-400 dark:text-gray-500"
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
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    No answer available
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Try asking a different question or check if there are
                    proposals available.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Features Section */}
      {!hasQueried && (
        <div className="mt-16 card-glass rounded-3xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
            AI-Powered Question Answering
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
                Natural Language
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Ask questions in plain English, just like talking to a human
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
                Instant Insights
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Get immediate answers about trends, patterns, and proposal
                details
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
                Smart Analysis
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                AI analyzes all proposals to provide comprehensive answers
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tips Section */}
      {!hasQueried && (
        <div className="mt-8 card-glass rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            💡 Tips for Better Questions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 dark:text-blue-400 text-sm font-bold">
                  1
                </span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                  Be Specific
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Ask about specific categories, time periods, or proposal types
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-purple-600 dark:text-purple-400 text-sm font-bold">
                  2
                </span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                  Ask for Trends
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Inquire about popular topics, voting patterns, or community
                  interests
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-green-600 dark:text-green-400 text-sm font-bold">
                  3
                </span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                  Compare Proposals
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Ask about differences between categories or proposal types
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-orange-600 dark:text-orange-400 text-sm font-bold">
                  4
                </span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                  Seek Insights
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Ask for analysis of community preferences and engagement
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QueryProposals;
