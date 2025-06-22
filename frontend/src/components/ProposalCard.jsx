import { useState } from "react";
import { useWallet } from "../context/WalletContext";
import { useTheme } from "../context/ThemeContext";
import { ethers } from "ethers";
import CivicProposalABI from "../abis/CivicProposal.json";
import axios from "axios";

const ProposalCard = ({
  proposal,
  onVoteUpdate,
  refreshProposals,
  setMessage,
}) => {
  const { account, contract } = useWallet();
  const { isDark } = useTheme();
  const [isVoting, setIsVoting] = useState(false);
  const [showFullText, setShowFullText] = useState(false);
  const [voteAnimation, setVoteAnimation] = useState(null);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const handleVote = async (isLike) => {
    if (!contract) {
      if (setMessage) setMessage("Please connect wallet.");
      else alert("Please connect wallet.");
      return;
    }
    if (setMessage)
      setMessage(`Submitting ${isLike ? "like" : "dislike"} vote...`);
    setIsVoting(true);
    setVoteAnimation(isLike ? "like" : "dislike");
    try {
      const tx = await contract.voteProposal(proposal.id, isLike);
      await tx.wait();
      const updatedProposal = await contract.getProposal(proposal.id);
      const likes = Number(updatedProposal[5]);
      const dislikes = Number(updatedProposal[6]);
      try {
        await axios.post("http://localhost:8000/api/update_vote", {
          proposalId: proposal.id,
          likes,
          dislikes,
        });
        if (setMessage)
          setMessage(
            `Vote (${
              isLike ? "Like" : "Dislike"
            }) submitted and synced successfully!`
          );
      } catch (axiosError) {
        if (setMessage)
          setMessage(
            `Vote submitted but failed to sync: ${
              axiosError.response?.data?.detail || axiosError.message
            }`
          );
      }
      if (refreshProposals) refreshProposals();
      // Update the proposal data for UI
      const hasVoted = account
        ? await contract.hasUserVoted(proposal.id, account)
        : false;
      const userVote = hasVoted
        ? await contract.getUserVote(proposal.id, account)
        : null;
      const updatedData = {
        ...proposal,
        likes,
        dislikes,
        hasVoted,
        userVote,
      };
      onVoteUpdate && onVoteUpdate(updatedData);
      setTimeout(() => setVoteAnimation("success"), 500);
      setTimeout(() => setVoteAnimation(null), 1500);
    } catch (error) {
      if (setMessage) setMessage(`Error submitting vote: ${error.message}`);
      setVoteAnimation("error");
      setTimeout(() => setVoteAnimation(null), 1500);
    } finally {
      setIsVoting(false);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      Transportation:
        "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300",
      "Public Safety":
        "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300",
      Environment:
        "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
      "Events & Culture":
        "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300",
      Governance:
        "bg-gray-100 dark:bg-gray-800/30 text-gray-800 dark:text-gray-300",
    };
    return (
      colors[category] ||
      "bg-gray-100 dark:bg-gray-800/30 text-gray-800 dark:text-gray-300"
    );
  };

  const getCategoryIcon = (category) => {
    const icons = {
      Transportation: "🚗",
      "Public Safety": "🛡️",
      Environment: "🌱",
      "Events & Culture": "🎭",
      Governance: "🏛️",
    };
    return icons[category] || "📋";
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const proposalDate = new Date(timestamp);
    const diffInSeconds = Math.floor((now - proposalDate) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000)
      return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return proposalDate.toLocaleDateString();
  };

  const getProposalStatus = () => {
    const totalVotes = proposal.likes + proposal.dislikes;
    const approvalRate =
      totalVotes > 0 ? (proposal.likes / totalVotes) * 100 : 0;

    if (totalVotes === 0)
      return {
        status: "New",
        color:
          "bg-gray-100 dark:bg-gray-800/30 text-gray-800 dark:text-gray-300",
      };
    if (approvalRate >= 80)
      return {
        status: "Popular",
        color:
          "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
      };
    if (approvalRate >= 60)
      return {
        status: "Trending",
        color:
          "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300",
      };
    if (approvalRate >= 40)
      return {
        status: "Controversial",
        color:
          "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300",
      };
    return {
      status: "Unpopular",
      color: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300",
    };
  };

  const shareProposal = async (platform) => {
    const url = `${window.location.origin}/proposals/${proposal.id}`;
    const text = `Check out this civic proposal: ${proposal.summary}`;

    const shareData = {
      title: "Civic Proposal",
      text: text,
      url: url,
    };

    try {
      if (platform === "native" && navigator.share) {
        await navigator.share(shareData);
      } else if (platform === "twitter") {
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(
            text
          )}&url=${encodeURIComponent(url)}`
        );
      } else if (platform === "linkedin") {
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
            url
          )}`
        );
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
    setShowShareMenu(false);
  };

  const totalVotes = proposal.likes + proposal.dislikes;
  const approvalRate =
    totalVotes > 0 ? Math.round((proposal.likes / totalVotes) * 100) : 0;
  const proposalStatus = getProposalStatus();

  return (
    <div
      className={`card-glass rounded-2xl overflow-hidden relative transition-all duration-300 hover:scale-[1.02] ${
        voteAnimation === "success" ? "success-pulse" : ""
      }`}
    >
      {/* Status Badge */}
      <div className="absolute top-4 right-4 z-10">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${proposalStatus.color}`}
        >
          {proposalStatus.status}
        </span>
      </div>

      {/* Header */}
      <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          #{proposal.id}
        </div>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">
              {getCategoryIcon(proposal.category)}
            </span>
            <div>
              <h6 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                {proposal.summary}
              </h6>
              <div className="flex items-center space-x-2">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(
                    proposal.category
                  )}`}
                >
                  {proposal.category}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatTimeAgo(proposal.timestamp)}
                </span>
              </div>
            </div>
          </div>
          {/* <div className="text-right"> */}
          {/* <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              #{proposal.id}
            </div> */}

          {/* </div> */}
        </div>

        {/* Proposal Text */}
        <div className="mb-4">
          <p
            className={`text-gray-700 dark:text-gray-300 leading-relaxed ${
              !showFullText && proposal.text.length > 200 ? "line-clamp-3" : ""
            }`}
          >
            {proposal.text}
          </p>
          {proposal.text.length > 200 && (
            <button
              onClick={() => setShowFullText(!showFullText)}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium mt-2"
            >
              {showFullText ? "Show less" : "Read more"}
            </button>
          )}
        </div>

        {/* Submitter Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
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
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span>
              Submitted by {proposal.submitter.slice(0, 6)}...
              {proposal.submitter.slice(-4)}
            </span>
          </div>

          {/* Share Button */}
          <div className="relative">
            <button
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
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
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                />
              </svg>
            </button>

            {showShareMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20">
                <div className="py-1">
                  <button
                    onClick={() => shareProposal("native")}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                    </svg>
                    Share
                  </button>
                  <button
                    onClick={() => shareProposal("twitter")}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                    </svg>
                    Twitter
                  </button>
                  <button
                    onClick={() => shareProposal("linkedin")}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                    LinkedIn
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Voting Section */}
      <div className="p-6">
        {/* Vote Stats */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <svg
                className="w-4 h-4 text-green-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-semibold text-green-600 dark:text-green-400">
                {proposal.likes}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <svg
                className="w-4 h-4 text-red-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-semibold text-red-600 dark:text-red-400">
                {proposal.dislikes}
              </span>
            </div>
          </div>

          <div className="text-right">
            <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {approvalRate}%
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Approval Rate
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
          <div
            className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-1000 animate-pulse-glow"
            style={{ width: `${approvalRate}%` }}
          ></div>
        </div>

        {/* Voting Buttons */}
        {account && (
          <div className="flex space-x-3">
            <button
              onClick={() => handleVote(true)}
              disabled={isVoting || proposal.hasVoted}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                proposal.hasVoted && proposal.userVote === true
                  ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-2 border-green-300 dark:border-green-600"
                  : proposal.hasVoted
                  ? "bg-gray-100 dark:bg-gray-800/30 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                  : "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/30 border-2 border-green-200 dark:border-green-700 hover:border-green-300 dark:hover:border-green-600"
              } ${voteAnimation === "like" ? "animate-pulse" : ""}`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Like</span>
            </button>

            <button
              onClick={() => handleVote(false)}
              disabled={isVoting || proposal.hasVoted}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                proposal.hasVoted && proposal.userVote === false
                  ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-2 border-red-300 dark:border-red-600"
                  : proposal.hasVoted
                  ? "bg-gray-100 dark:bg-gray-800/30 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                  : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30 border-2 border-red-200 dark:border-red-700 hover:border-red-300 dark:hover:border-red-600"
              } ${voteAnimation === "dislike" ? "animate-pulse" : ""}`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Dislike</span>
            </button>
          </div>
        )}

        {!account && (
          <div className="text-center py-4">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Connect your wallet to vote on this proposal
            </p>
          </div>
        )}

        {/* Vote Animation */}
        {voteAnimation && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              className={`text-6xl ${
                voteAnimation === "success"
                  ? "text-green-500 animate-bounce"
                  : voteAnimation === "error"
                  ? "text-red-500 animate-bounce"
                  : voteAnimation === "like"
                  ? "text-green-500 animate-pulse"
                  : "text-red-500 animate-pulse"
              }`}
            >
              {voteAnimation === "success" && "✅"}
              {voteAnimation === "error" && "❌"}
              {voteAnimation === "like" && "👍"}
              {voteAnimation === "dislike" && "👎"}
            </div>
          </div>
        )}
      </div>

      {/* Success/Error Animation Overlay */}
      {voteAnimation === "success" && (
        <div className="absolute inset-0 bg-green-500 bg-opacity-10 flex items-center justify-center">
          <div className="bg-white rounded-full p-4 shadow-lg">
            <svg
              className="w-8 h-8 text-green-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      )}

      {voteAnimation === "error" && (
        <div className="absolute inset-0 bg-red-500 bg-opacity-10 flex items-center justify-center">
          <div className="bg-white rounded-full p-4 shadow-lg">
            <svg
              className="w-8 h-8 text-red-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProposalCard;
