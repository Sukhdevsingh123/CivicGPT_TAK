import { useState, useEffect, createContext, useContext } from "react";
import { useWallet } from "../context/WalletContext";
import { ethers } from "ethers";
import CivicProposalABI from "../abis/CivicProposal.json";

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};

// Helper to dispatch notifications from anywhere
export const triggerAppNotification = (notification) => {
  window.dispatchEvent(
    new CustomEvent("app-notification", { detail: notification })
  );
};

export const NotificationProvider = ({ children }) => {
  const { contract, account } = useWallet();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [preferences, setPreferences] = useState({
    proposalSubmitted: true,
    proposalVoted: true,
    trendingProposals: true,
    systemUpdates: true,
  });

  useEffect(() => {
    if (contract) {
      console.log(
        "[NotificationSystem] Contract set, setting up event listeners",
        contract
      );
      setupEventListeners();
    } else {
      console.log("[NotificationSystem] No contract available");
    }
  }, [contract]);

  useEffect(() => {
    // Update unread count
    setUnreadCount(notifications.filter((n) => !n.read).length);
  }, [notifications]);

  const setupEventListeners = () => {
    if (!contract) return;

    // Listen for new proposal submissions
    contract.on(
      "ProposalSubmitted",
      (proposalId, text, summary, category, submitter, timestamp) => {
        if (preferences.proposalSubmitted) {
          addNotification({
            id: Date.now(),
            type: "proposal",
            title: "New Proposal Submitted",
            message: `"${summary}" has been submitted to the platform`,
            category,
            proposalId: Number(proposalId),
            timestamp: new Date(),
            read: false,
            action: `/proposals/${proposalId}`,
          });
        }
      }
    );

    // Listen for votes
    contract.on("Voted", (proposalId, voter, isLike, timestamp) => {
      if (preferences.proposalVoted && voter !== account) {
        addNotification({
          id: Date.now(),
          type: "vote",
          title: "New Vote Cast",
          message: `Someone ${isLike ? "liked" : "disliked"} a proposal`,
          proposalId: Number(proposalId),
          timestamp: new Date(),
          read: false,
          action: `/proposals/${proposalId}`,
        });
      }
    });
  };

  const addNotification = (notification) => {
    console.log("[NotificationSystem] Adding notification", notification);
    setNotifications((prev) => [notification, ...prev.slice(0, 49)]); // Keep last 50 notifications

    // Show toast notification
    showToast(notification);
  };

  const showToast = (notification) => {
    const toast = document.createElement("div");
    toast.className = `fixed top-4 right-4 z-50 max-w-sm w-full bg-white rounded-lg shadow-lg border border-gray-200 transform transition-all duration-300 translate-x-full`;
    toast.innerHTML = `
      <div class="p-4">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 rounded-full flex items-center justify-center ${
              notification.type === "proposal"
                ? "bg-blue-100"
                : notification.type === "vote"
                ? "bg-green-100"
                : "bg-purple-100"
            }">
              <span class="text-sm">${
                notification.type === "proposal"
                  ? "📋"
                  : notification.type === "vote"
                  ? "👍"
                  : "🔔"
              }</span>
            </div>
          </div>
          <div class="ml-3 flex-1">
            <p class="text-sm font-medium text-gray-900">${
              notification.title
            }</p>
            <p class="text-sm text-gray-500 mt-1">${notification.message}</p>
          </div>
          <div class="ml-4 flex-shrink-0">
            <button class="text-gray-400 hover:text-gray-600" onclick="this.parentElement.parentElement.parentElement.parentElement.remove()">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(toast);

    // Animate in
    setTimeout(() => {
      toast.classList.remove("translate-x-full");
    }, 100);

    // Auto remove after 5 seconds
    setTimeout(() => {
      toast.classList.add("translate-x-full");
      setTimeout(() => {
        if (toast.parentElement) {
          toast.parentElement.removeChild(toast);
        }
      }, 300);
    }, 5000);
  };

  const markAsRead = (notificationId) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const updatePreferences = (newPreferences) => {
    setPreferences(newPreferences);
  };

  const NotificationBell = () => (
    <div className="relative">
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
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
            strokeWidth={2}
            d="M15 17h5l-5 5v-5zM10.5 3.75a6 6 0 00-6 6v3.75a6 6 0 01-6 6h12a6 6 0 01-6-6V9.75a6 6 0 00-6-6z"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                Notifications
              </h3>
            </div>
            <button
              onClick={() => setShowNotifications(false)}
              className="ml-2 text-gray-400 hover:text-gray-600 p-1 rounded-full focus:outline-none"
              aria-label="Close notifications"
            >
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
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <svg
                  className="w-12 h-12 mx-auto mb-2 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-5 5v-5zM10.5 3.75a6 6 0 00-6 6v3.75a6 6 0 01-6 6h12a6 6 0 01-6-6V9.75a6 6 0 00-6-6z"
                  />
                </svg>
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notification.read ? "bg-blue-50" : ""
                  }`}
                  onClick={() => {
                    markAsRead(notification.id);
                    if (notification.action) {
                      window.location.href = notification.action;
                    }
                  }}
                >
                  <div className="flex items-start space-x-3">
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        notification.type === "proposal"
                          ? "bg-blue-100"
                          : notification.type === "vote"
                          ? "bg-green-100"
                          : "bg-purple-100"
                      }`}
                    >
                      <span className="text-sm">
                        {notification.type === "proposal"
                          ? "📋"
                          : notification.type === "vote"
                          ? "👍"
                          : "🔔"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {notification.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );

  const NotificationPreferences = () => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Notification Preferences
      </h3>
      <div className="space-y-4">
        {Object.entries(preferences).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 capitalize">
                {key.replace(/([A-Z])/g, " $1").trim()}
              </p>
              <p className="text-xs text-gray-500">
                {key === "proposalSubmitted" &&
                  "Get notified when new proposals are submitted"}
                {key === "proposalVoted" &&
                  "Get notified when proposals receive votes"}
                {key === "trendingProposals" &&
                  "Get notified about trending proposals"}
                {key === "systemUpdates" &&
                  "Get notified about platform updates"}
              </p>
            </div>
            <button
              onClick={() =>
                updatePreferences({ ...preferences, [key]: !value })
              }
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                value ? "bg-blue-600" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  value ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  // Listen for custom app notifications
  useEffect(() => {
    const handler = (e) => {
      addNotification({
        id: Date.now(),
        type: e.detail.type || "system",
        title: e.detail.title || "Notification",
        message: e.detail.message || "Something happened in the app.",
        timestamp: new Date(),
        read: false,
        ...e.detail,
      });
    };
    window.addEventListener("app-notification", handler);
    return () => window.removeEventListener("app-notification", handler);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        preferences,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotifications,
        updatePreferences,
        NotificationBell,
        NotificationPreferences,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
