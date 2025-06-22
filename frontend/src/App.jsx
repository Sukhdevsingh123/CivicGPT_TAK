import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { WalletProvider } from "./context/WalletContext";
import { ThemeProvider } from "./context/ThemeContext";
import { NotificationProvider } from "./components/NotificationSystem";
import NavBar from "./components/NavBar";
import Dashboard from "./components/Dashboard";
import ProposalList from "./components/ProposalList";
import SubmitProposal from "./components/SubmitProposal";
import SearchProposals from "./components/SearchProposals";
import QueryProposals from "./components/QueryProposals";
import UserProposals from "./components/UserProposals";
import Analytics from "./components/Analytics";
import "./App.css";

const App = () => {
  return (
    <ThemeProvider>
      <WalletProvider>
        <NotificationProvider>
          <Router
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 transition-all duration-500">
              <NavBar />
              <main className="pt-20">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/proposals" element={<ProposalList />} />
                  <Route path="/submit" element={<SubmitProposal />} />
                  <Route path="/search" element={<SearchProposals />} />
                  <Route path="/query" element={<QueryProposals />} />
                  <Route path="/my-proposals" element={<UserProposals />} />
                  <Route path="/analytics" element={<Analytics />} />
                </Routes>
              </main>
            </div>
          </Router>
        </NotificationProvider>
      </WalletProvider>
    </ThemeProvider>
  );
};

export default App;
