import { useState, useEffect } from "react";
import axios from "axios";
import useDebounce from "../utils/useDebounce";
import { useWallet } from "../context/WalletContext";
import { useTheme } from "../context/ThemeContext";
import { useRef } from "react";

// Category options with icons and colors
const CATEGORY_OPTIONS = [
  {
    value: "Transportation",
    label: "Transportation",
    icon: "🚗",
    color: "from-blue-400 to-blue-600",
  },
  {
    value: "Public Safety",
    label: "Public Safety",
    icon: "🛡️",
    color: "from-red-400 to-red-600",
  },
  {
    value: "Environment",
    label: "Environment",
    icon: "🌱",
    color: "from-green-400 to-green-600",
  },
  {
    value: "Events & Culture",
    label: "Events & Culture",
    icon: "🎭",
    color: "from-purple-400 to-purple-600",
  },
  {
    value: "Governance",
    label: "Governance",
    icon: "🏛️",
    color: "from-gray-400 to-gray-600",
  },
  {
    value: "Health & Wellness",
    label: "Health & Wellness",
    icon: "💊",
    color: "from-pink-400 to-pink-600",
  },
  {
    value: "Education",
    label: "Education",
    icon: "📚",
    color: "from-yellow-400 to-yellow-600",
  },
  {
    value: "Technology",
    label: "Technology",
    icon: "💻",
    color: "from-indigo-400 to-indigo-600",
  },
  {
    value: "Infrastructure",
    label: "Infrastructure",
    icon: "🏗️",
    color: "from-gray-500 to-gray-700",
  },
  {
    value: "Arts & Design",
    label: "Arts & Design",
    icon: "🎨",
    color: "from-pink-300 to-purple-500",
  },
  {
    value: "Sports & Recreation",
    label: "Sports & Recreation",
    icon: "🏀",
    color: "from-orange-400 to-orange-600",
  },
  {
    value: "Business & Economy",
    label: "Business & Economy",
    icon: "💼",
    color: "from-green-700 to-yellow-500",
  },
  {
    value: "Housing",
    label: "Housing",
    icon: "🏠",
    color: "from-yellow-600 to-orange-400",
  },
  {
    value: "Tourism",
    label: "Tourism",
    icon: "🗺️",
    color: "from-blue-300 to-green-300",
  },
  {
    value: "Other",
    label: "Other",
    icon: "✨",
    color: "from-gray-300 to-gray-500",
  },
];

// Fun facts/tips for proposal writing
const TIPS = [
  "Be clear and concise. Focus on the impact of your idea!",
  "Add a catchy summary to grab attention.",
  "Choose the right category for better visibility.",
  "Share your proposal with friends to get more votes!",
  "Include real-world examples or data if possible.",
  "Keep your summary under 200 characters for best results.",
  "Use positive language to inspire the community.",
  "Check for similar proposals before submitting.",
];

const Confetti = ({ show }) =>
  show ? (
    <div className="fixed inset-0 pointer-events-none z-50">
      <div className="absolute inset-0 animate-confetti"></div>
    </div>
  ) : null;

const Tooltip = ({ text, children }) => (
  <span className="group relative cursor-pointer">
    {children}
    <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-max px-3 py-1 rounded bg-gray-900 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity z-20 whitespace-nowrap">
      {text}
    </span>
  </span>
);

const AnimatedHeader = () => (
  <div className="relative w-full mb-8">
    <div className="absolute inset-0 z-0 pointer-events-none">
      <svg
        width="100%"
        height="100"
        viewBox="0 0 1440 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill="url(#paint0_linear)"
          fillOpacity="0.2"
          d="M0,80 C360,120 1080,0 1440,80 L1440,0 L0,0 Z"
        />
        <defs>
          <linearGradient
            id="paint0_linear"
            x1="0"
            y1="0"
            x2="1440"
            y2="0"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#60a5fa" />
            <stop offset="1" stopColor="#34d399" />
          </linearGradient>
        </defs>
      </svg>
    </div>
    <div className="relative z-10 flex flex-col items-center justify-center py-8">
      <h2 className="text-5xl font-extrabold bg-gradient-to-r from-blue-500 via-green-400 to-blue-600 bg-clip-text text-transparent animate-gradient-x drop-shadow-lg mb-2">
        Submit a New Proposal
      </h2>
      <p className="text-lg text-gray-600 dark:text-gray-400 text-center max-w-2xl">
        Submit your idea — we'll auto-summarize, categorize, and link it with
        similar proposals. Open for public voting.
      </p>
    </div>
    <style>{`
      .animate-gradient-x {
        background-size: 200% 200%;
        animation: gradient-x 4s ease-in-out infinite;
      }
      @keyframes gradient-x {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
    `}</style>
  </div>
);

const TipCard = ({ tip, onShuffle }) => (
  <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-green-50 dark:from-gray-800 dark:to-blue-950 border border-blue-100 dark:border-blue-900/40 rounded-xl px-4 py-3 mb-8 shadow-sm animate-fade-in">
    <div className="flex items-center space-x-2">
      <svg
        className="w-6 h-6 text-blue-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z"
        />
      </svg>
      <span className="text-base text-gray-700 dark:text-gray-200 font-medium">
        {tip}
      </span>
    </div>
    <button
      type="button"
      onClick={onShuffle}
      className="ml-4 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
      aria-label="Shuffle tip"
    >
      Shuffle
    </button>
  </div>
);

const HelpModal = ({ open, onClose }) =>
  open ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fade-in">
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-2xl max-w-md w-full relative animate-bounce-in">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-blue-500"
          aria-label="Close help"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <h3 className="text-2xl font-bold mb-4 text-blue-600 dark:text-blue-300">
          Need Help?
        </h3>
        <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-200 mb-4">
          <li>Be clear and concise. Focus on the impact of your idea.</li>
          <li>Add a catchy summary to grab attention.</li>
          <li>Choose the right category for better visibility.</li>
          <li>Share your proposal with friends to get more votes!</li>
          <li>Check for similar proposals before submitting.</li>
        </ul>
        <a
          href="https://your-hackathon-docs-link.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-green-400 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-green-500 transition-colors"
        >
          Read Full Guidelines
        </a>
      </div>
    </div>
  ) : null;

const FloatingHelpButton = ({ onClick }) => (
  <button
    onClick={onClick}
    className="fixed bottom-8 right-8 z-40 bg-gradient-to-r from-blue-500 to-green-400 text-white p-4 rounded-full shadow-lg hover:scale-110 transition-transform animate-glow focus:outline-none"
    aria-label="Open help"
  >
    <svg
      className="w-7 h-7"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M8 10h.01M12 14v.01M12 10h.01M16 10h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"
      />
    </svg>
  </button>
);

const AnimatedBackground = () => (
  <div className="fixed inset-0 -z-10 pointer-events-none">
    <svg
      width="100%"
      height="100%"
      className="absolute inset-0 w-full h-full"
      style={{ opacity: 0.08 }}
    >
      <circle cx="20%" cy="30%" r="120" fill="#60a5fa" />
      <circle cx="80%" cy="70%" r="100" fill="#34d399" />
      <circle cx="50%" cy="80%" r="80" fill="#fbbf24" />
    </svg>
  </div>
);

// Toast notification
const Toast = ({ message, type = "success", onClose }) => (
  <div
    className={`fixed top-8 right-8 z-50 px-6 py-4 rounded-xl shadow-lg transition-all duration-300 animate-fade-in ${
      type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
    }`}
  >
    <div className="flex items-center space-x-2">
      {type === "success" ? (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M5 13l4 4L19 7"
          />
        </svg>
      ) : (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      )}
      <span className="font-semibold">{message}</span>
      <button
        onClick={onClose}
        className="ml-4 text-white/80 hover:text-white"
        aria-label="Close toast"
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
            strokeWidth="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  </div>
);

const SubmitProposal = () => {
  const { contract, account, setMessage } = useWallet();
  const { isDark } = useTheme();
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");
  const [category, setCategory] = useState("");
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const previewRef = useRef(null);
  const [tipIndex, setTipIndex] = useState(() =>
    Math.floor(Math.random() * TIPS.length)
  );
  const [helpOpen, setHelpOpen] = useState(false);
  const shuffleTip = () => setTipIndex((prev) => (prev + 1) % TIPS.length);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [draftAvailable, setDraftAvailable] = useState(false);
  const [toast, setToast] = useState(null);

  const debouncedText = useDebounce(text, 500);

  // Suggestion examples
  const exampleTexts = [
    "Build more bike lanes downtown",
    "Organize a community recycling event",
    "Install more street lights in parks",
    "Host a local food festival",
    "Create a mobile app for city services",
  ];

  // Progress calculation
  const progress =
    ([text.trim(), summary.trim(), category].filter(Boolean).length / 3) * 100;

  useEffect(() => {
    setError("");
    setSuccess(null);
  }, [text, summary, category]);

  // Load draft from localStorage on mount
  useEffect(() => {
    const draft = localStorage.getItem("proposalDraft");
    if (draft) setDraftAvailable(true);
  }, []);

  // Save as draft
  const saveDraft = () => {
    localStorage.setItem(
      "proposalDraft",
      JSON.stringify({ text, summary, category, image })
    );
    setDraftAvailable(true);
    setError("");
    setSuccess({ message: "Draft saved!" });
  };

  // Load draft
  const loadDraft = () => {
    const draft = localStorage.getItem("proposalDraft");
    if (draft) {
      const {
        text: dText,
        summary: dSummary,
        category: dCategory,
        image: dImage,
      } = JSON.parse(draft);
      setText(dText || "");
      setSummary(dSummary || "");
      setCategory(dCategory || "");
      setImage(dImage || null);
      setImagePreview(dImage || null);
      setError("");
      setSuccess({ message: "Draft loaded!" });
    }
  };

  // Clear all
  const clearAll = () => {
    setText("");
    setSummary("");
    setCategory("");
    setImage(null);
    setImagePreview(null);
    setError("");
    setSuccess(null);
  };

  // Image upload handler
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Image must be less than 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result);
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Share preview (simulate)
  const sharePreview = () => {
    const fakeLink =
      window.location.origin +
      "/preview/" +
      Math.random().toString(36).slice(2, 10);
    navigator.clipboard.writeText(fakeLink);
    setSuccess({ message: "Shareable preview link copied!" });
  };

  // AI summary generation
  const handleGenerateSummary = async () => {
    if (!text.trim()) {
      setError("Please enter proposal text first.");
      return;
    }
    setIsGeneratingSummary(true);
    setMessage("Generating summary...");
    try {
      const response = await axios.post(
        "https://civicgpt.onrender.com/api/generate_summary",
        { text: text.trim() }
      );
      setSummary(response.data.summary);
      setMessage("Summary generated successfully!");
    } catch (error) {
      setError(
        `Error generating summary: ${
          error.response?.data?.detail || error.message
        }`
      );
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(null);
    if (!account) {
      setError("Please connect your wallet to submit a proposal.");
      return;
    }
    if (!text.trim() || !summary.trim() || !category) {
      setError("All fields are required.");
      return;
    }
    setIsSubmitting(true);
    setMessage("Submitting proposal...");
    try {
      const tx = await contract.submitProposal(
        text.trim(),
        summary.trim(),
        category
      );
      const receipt = await tx.wait();
      const event = receipt.logs
        .map((log) => {
          try {
            return contract.interface.parseLog(log);
          } catch {
            return null;
          }
        })
        .find((parsed) => parsed && parsed.name === "ProposalSubmitted");
      const proposalId = event ? Number(event.args.proposalId) : null;
      if (proposalId !== null) {
        const proposalData = {
          id: proposalId,
          text: text.trim(),
          summary: summary.trim(),
          category,
          submitter: account,
          timestamp: new Date().toLocaleString(),
          likes: 0,
          dislikes: 0,
          hasVoted: false,
          userVote: null,
        };
        try {
          await axios.post(
            "https://civicgpt.onrender.com/api/store_proposal",
            proposalData
          );
          setSuccess({
            message: "🎉 Proposal submitted and stored successfully!",
            proposalId,
          });
          setToast({
            message: "Proposal submitted successfully!",
            type: "success",
          });
          setText("");
          setSummary("");
          setCategory("");
        } catch (axiosError) {
          setError(
            `Backend error: ${
              axiosError.response?.data?.detail || axiosError.message
            }`
          );
        }
      } else {
        setError("Proposal submitted but failed to retrieve ID.");
      }
    } catch (error) {
      setError("Error submitting proposal: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Live preview card
  const selectedCategory = CATEGORY_OPTIONS.find((c) => c.value === category);

  // Show toast on success/error
  useEffect(() => {
    if (success && success.message) {
      setToast({ message: success.message, type: "success" });
      const timer = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(timer);
    }
    if (error) {
      setToast({ message: error, type: "error" });
      const timer = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  return (
    <div className="relative w-full min-h-screen">
      <AnimatedBackground />
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <AnimatedHeader />
      <TipCard tip={TIPS[tipIndex]} onShuffle={shuffleTip} />
      <FloatingHelpButton onClick={() => setHelpOpen(true)} />
      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
      <div className="w-full mb-12 p-4 sm:p-8 card-glass rounded-3xl shadow-2xl border border-blue-200 dark:border-blue-900/40 bg-gradient-to-br from-white/80 to-blue-50/80 dark:from-gray-900/80 dark:to-blue-950/80 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div>
            <h2
              className={`text-4xl font-extrabold mb-2 ${
                isDark ? "gradient-text-dark" : "gradient-text"
              }`}
            >
              Submit a New Proposal
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Share your idea to improve the community. Proposals are public and
              can be voted on by others.
            </p>
          </div>
          <div className="w-full md:w-64">
            <div className="h-3 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
              <div
                className="h-3 rounded-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="text-xs text-right text-gray-400 mt-1">
              {Math.round(progress)}% complete
            </div>
          </div>
        </div>
        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-center animate-shake">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-center animate-bounce-in">
            {success.message}{" "}
            {success.proposalId !== undefined && (
              <a
                href={`/proposals/${success.proposalId}`}
                className="underline text-blue-600 dark:text-blue-400 ml-2"
              >
                View Proposal
              </a>
            )}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Proposal Text */}
          <div>
            <div className="flex items-center mb-2">
              <label className="block text-base font-semibold text-gray-700 dark:text-gray-300 mr-2">
                Proposal Text *
              </label>
              <Tooltip text="Describe your idea in detail. Max 1000 characters.">
                <svg
                  className="w-4 h-4 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="12" r="10" strokeWidth="2" />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 16v-4m0-4h.01"
                  />
                </svg>
              </Tooltip>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              className="w-full px-5 py-4 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-200 resize-none text-lg shadow-sm"
              placeholder="Describe your proposal in detail. What problem does it solve? How will it benefit the community? What are the expected outcomes?"
              required
              maxLength={1000}
            />
            <div className="flex justify-between mt-2">
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {text.length}/1000
              </span>
              <div className="flex space-x-2">
                {exampleTexts.map((ex, i) => (
                  <button
                    key={i}
                    type="button"
                    className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    onClick={() => setText(ex)}
                  >
                    Example {i + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {/* Summary */}
          <div>
            <div className="flex items-center mb-2">
              <label className="block text-base font-semibold text-gray-700 dark:text-gray-300 mr-2">
                Summary *
              </label>
              <Tooltip text="A short, catchy title for your proposal. Max 200 characters.">
                <svg
                  className="w-4 h-4 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="12" r="10" strokeWidth="2" />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 16v-4m0-4h.01"
                  />
                </svg>
              </Tooltip>
              <button
                type="button"
                className="ml-4 px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors flex items-center"
                onClick={handleGenerateSummary}
                disabled={isGeneratingSummary || !text.trim()}
              >
                {isGeneratingSummary ? (
                  <span className="flex items-center">
                    <span className="spinner-glass mr-1"></span>Generating...
                  </span>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    Suggest
                  </>
                )}
              </button>
            </div>
            <input
              type="text"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full px-5 py-4 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-200 text-lg shadow-sm"
              placeholder="A brief summary of your proposal (AI-generated or manual)"
              required
              maxLength={200}
            />
            <div className="flex justify-between mt-2">
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {summary.length}/200
              </span>
            </div>
          </div>
          {/* Image Upload */}
          <div>
            <div className="flex items-center mb-2">
              <label className="block text-base font-semibold text-gray-700 dark:text-gray-300 mr-2">
                Image (optional)
              </label>
              <Tooltip text="Upload an image to make your proposal more engaging. Max 2MB.">
                <svg
                  className="w-4 h-4 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="12" r="10" strokeWidth="2" />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 16v-4m0-4h.01"
                  />
                </svg>
              </Tooltip>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {imagePreview && (
              <div className="mt-2 flex items-center space-x-4">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-20 w-20 object-cover rounded-xl border border-gray-200 dark:border-gray-700"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImage(null);
                    setImagePreview(null);
                  }}
                  className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
          {/* Category */}
          <div>
            <div className="flex items-center mb-2">
              <label className="block text-base font-semibold text-gray-700 dark:text-gray-300 mr-2">
                Category *
              </label>
              <Tooltip text="Choose the category that best fits your proposal.">
                <svg
                  className="w-4 h-4 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="12" r="10" strokeWidth="2" />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 16v-4m0-4h.01"
                  />
                </svg>
              </Tooltip>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {CATEGORY_OPTIONS.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  className={`flex items-center px-4 py-3 rounded-2xl border-2 transition-all w-full text-left space-x-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium text-lg
                    ${
                      category === cat.value
                        ? `bg-gradient-to-r ${cat.color} border-blue-500 text-white scale-105 shadow-lg`
                        : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }
                  `}
                  onClick={() => setCategory(cat.value)}
                  aria-pressed={category === cat.value}
                >
                  <span className="text-2xl">{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 justify-center mt-8">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center space-x-2 bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed animate-glow"
            >
              {isSubmitting && <span className="spinner-glass mr-2"></span>}
              <span>Submit Proposal</span>
            </button>
            <button
              type="button"
              onClick={saveDraft}
              className="px-6 py-3 rounded-2xl bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 font-semibold hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors"
            >
              Save as Draft
            </button>
            {draftAvailable && (
              <button
                type="button"
                onClick={loadDraft}
                className="px-6 py-3 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 font-semibold hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
              >
                Load Draft
              </button>
            )}
            <button
              type="button"
              onClick={clearAll}
              className="px-6 py-3 rounded-2xl bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 font-semibold hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
            >
              Clear All
            </button>
            <button
              type="button"
              onClick={sharePreview}
              className="px-6 py-3 rounded-2xl bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-semibold hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
            >
              Share Preview
            </button>
          </div>
        </form>
        {/* Live Preview Card */}
        <div className="mt-12">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            Live Preview
          </h3>
          <div
            ref={previewRef}
            className="card-glass rounded-2xl p-6 shadow-md bg-gradient-to-br from-white/90 to-blue-50/80 dark:from-gray-900/90 dark:to-blue-950/80 border border-blue-100 dark:border-blue-900/40 animate-fade-in"
          >
            <div className="flex items-center space-x-3 mb-2">
              {selectedCategory && (
                <span
                  className={`text-2xl p-2 rounded-full bg-gradient-to-r ${selectedCategory.color} text-white shadow-md`}
                >
                  {selectedCategory.icon}
                </span>
              )}
              <span className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                {summary || (
                  <span className="italic text-gray-400">
                    Proposal summary will appear here
                  </span>
                )}
              </span>
            </div>
            <div className="text-gray-600 dark:text-gray-400 mb-2 min-h-[48px]">
              {text || (
                <span className="italic text-gray-400">
                  Proposal details will appear here
                </span>
              )}
            </div>
            {imagePreview && (
              <div className="mb-2">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-h-40 rounded-xl border border-gray-200 dark:border-gray-700 mx-auto"
                />
              </div>
            )}
            <div className="flex items-center space-x-2 mt-2">
              {selectedCategory && (
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r ${selectedCategory.color} text-white`}
                >
                  {selectedCategory.label}
                </span>
              )}
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {account
                  ? `By ${account.slice(0, 6)}...${account.slice(-4)}`
                  : "Connect wallet to submit"}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-8 text-xs text-gray-400 dark:text-gray-500 text-center">
          Proposals are reviewed and visible to all users. Please avoid
          submitting duplicate or inappropriate content.
        </div>
      </div>
      {/* Confetti animation CSS */}
      <style>{`
        @keyframes confetti {
          0% { background-position: 0 0, 100% 0, 50% 0; }
          100% { background-position: 0 100vh, 100% 100vh, 50% 100vh; }
        }
        .animate-confetti {
          background-image:
            repeating-linear-gradient(120deg, #fbbf24 0 10px, transparent 10px 20px),
            repeating-linear-gradient(60deg, #34d399 0 10px, transparent 10px 20px),
            repeating-linear-gradient(90deg, #60a5fa 0 10px, transparent 10px 20px);
          background-size: 200vw 200vh;
          background-repeat: repeat;
          animation: confetti 3s linear forwards;
        }
        .animate-fade-in { animation: fadeIn 0.7s cubic-bezier(.4,0,.2,1) both; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(40px);} to { opacity: 1; transform: none; } }
        .animate-bounce-in { animation: bounceIn 0.7s cubic-bezier(.4,0,.2,1) both; }
        @keyframes bounceIn { 0% { opacity: 0; transform: scale(0.8);} 60% { opacity: 1; transform: scale(1.05);} 100% { transform: scale(1); } }
        .animate-shake { animation: shake 0.4s linear; }
        @keyframes shake { 10%, 90% { transform: translateX(-2px); } 20%, 80% { transform: translateX(4px); } 30%, 50%, 70% { transform: translateX(-8px); } 40%, 60% { transform: translateX(8px); } }
        .animate-glow { box-shadow: 0 0 16px 2px #60a5fa44, 0 0 4px 1px #34d39933; }
      `}</style>
    </div>
  );
};

export default SubmitProposal;
