import { useState, useEffect } from "react";
import { useWallet } from "../context/WalletContext";
import { useTheme } from "../context/ThemeContext";
import ProposalCard from "./ProposalCard";

const UserProposals = () => {
  const { contract, account } = useWallet();
  const { isDark } = useTheme();
  const [userProposals, setUserProposals] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUserProposals = async () => {
    if (contract && account) {
      try {
        setLoading(true);
        const userProposalIds = await contract.getUserProposals(account);
        const userProposalList = [];
        for (const id of userProposalIds) {
          const proposal = await contract.getProposal(Number(id));
          userProposalList.push({
            id: Number(id),
            text: proposal[0],
            summary: proposal[1],
            category: proposal[2],
            submitter: proposal[3],
            timestamp: new Date(Number(proposal[4]) * 1000).toLocaleString(),
            likes: Number(proposal[5]),
            dislikes: Number(proposal[6]),
          });
        }
        setUserProposals(userProposalList);
      } catch (error) {
        console.error("Error fetching user proposals:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchUserProposals();
    if (contract) {
      contract.on("ProposalSubmitted", fetchUserProposals);
      return () => {
        contract.off("ProposalSubmitted");
      };
    }
  }, [contract, account]);

  if (!account) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            My Proposals
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Please connect your wallet to view your proposals.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1
          className={`text-3xl font-bold mb-2 ${
            isDark ? "gradient-text-dark" : "gradient-text"
          }`}
        >
          My Proposals
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          View and manage all proposals you've submitted ({userProposals.length}{" "}
          total)
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="spinner-glass"></div>
        </div>
      ) : userProposals.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
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
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No proposals yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You haven't submitted any proposals yet.
          </p>
          <a
            href="/submit"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Submit Your First Proposal
          </a>
        </div>
      ) : (
        <div className="grid gap-6">
          {userProposals.map((proposal) => (
            <ProposalCard
              key={proposal.id}
              proposal={proposal}
              showVoteButtons={false}
              refreshProposals={fetchUserProposals}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default UserProposals;
