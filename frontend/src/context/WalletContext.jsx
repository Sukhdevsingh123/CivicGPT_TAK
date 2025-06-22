import { createContext, useContext, useState, useEffect } from "react";
import { ethers } from "ethers";

const WalletContext = createContext();

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};

export const WalletProvider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [message, setMessage] = useState("");

  // Contract configuration
  const contractAddress = "0x94aA64E4f6DbE62c8910BeC0e088CE89FdA89B55";
  const contractABI = [
    "function submitProposal(string _text, string _summary, string _category) external",
    "function voteProposal(uint256 _proposalId, bool _isLike) external",
    "function getProposal(uint256 _proposalId) external view returns (string, string, string, address, uint256, uint256, uint256)",
    "function getUserProposals(address _user) external view returns (uint256[])",
    "function getProposalCount() external view returns (uint256)",
    "function hasUserVoted(uint256 _proposalId, address _user) external view returns (bool)",
    "function getUserVote(uint256 _proposalId, address _user) external view returns (bool)",
    "event ProposalSubmitted(uint256 indexed proposalId, string text, string summary, string category, address submitter, uint256 timestamp)",
    "event Voted(uint256 indexed proposalId, address indexed voter, bool isLike, uint256 timestamp)",
  ];

  const connectWallet = async () => {
    if (typeof window.ethereum === "undefined") {
      alert("Please install MetaMask to use this application!");
      return;
    }

    setIsConnecting(true);
    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length > 0) {
        const account = accounts[0];
        setAccount(account);

        // Create provider and contract instance
        const provider = new ethers.BrowserProvider(window.ethereum);
        setProvider(provider);

        const signer = await provider.getSigner();
        const contractInstance = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        setContract(contractInstance);

        // Listen for account changes
        window.ethereum.on("accountsChanged", (accounts) => {
          if (accounts.length > 0) {
            setAccount(accounts[0]);
          } else {
            setAccount(null);
            setProvider(null);
            setContract(null);
          }
        });

        // Listen for chain changes
        window.ethereum.on("chainChanged", () => {
          window.location.reload();
        });
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      alert("Failed to connect wallet. Please try again.");
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setProvider(null);
    setContract(null);
  };

  // Check if wallet is already connected on component mount
  useEffect(() => {
    const checkWalletConnection = async () => {
      if (typeof window.ethereum !== "undefined") {
        try {
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          });
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            const provider = new ethers.BrowserProvider(window.ethereum);
            setProvider(provider);
            const signer = await provider.getSigner();
            const contractInstance = new ethers.Contract(
              contractAddress,
              contractABI,
              signer
            );
            setContract(contractInstance);
          }
        } catch (error) {
          console.error("Error checking wallet connection:", error);
        }
      }
    };

    checkWalletConnection();
  }, []);

  const value = {
    account,
    provider,
    contract,
    isConnecting,
    connectWallet,
    disconnectWallet,
    message,
    setMessage,
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
};
