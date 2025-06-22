# ![CivicGPT](frontend/src/assets/civicgpt-banner.png)

# CivicGPT: AI-Powered Participatory Planning Assistant 🚀

> **A decentralized platform where citizens submit ideas for improving their city. CivicGPT uses AI to turn raw ideas into structured proposals, auto-categorizes them, and enables transparent, community-driven decision making.**

---

## 🌟 Features
- **AI-Powered Proposal Submission:** Instantly summarize, categorize, and enhance ideas with OpenAI.
- **Decentralized Voting:** Every vote and proposal is recorded on-chain for transparency.
- **Real-Time Notifications:** Stay updated on new proposals, votes, and trending topics.
- **Semantic Search:** Find proposals using natural language, powered by vector search (Pinecone).
- **Live Analytics:** Visualize trends, top proposals, and category stats.
- **Modern, Animated UI:** Beautiful, responsive, and accessible—complete with animated headers, water-flow text, and toasts.
- **Drafts, Image Uploads, and More:** Save drafts, add images, and share proposals easily.

---

## 🛠️ Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/CivicGPT_TAK.git
cd CivicGPT_TAK
```

### 2. Backend Setup (FastAPI + OpenAI + Pinecone)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

#### Create a `.env` file in the `backend/` directory with:
```
OPENAI_API_KEY=your-openai-key
PINECONE_API_KEY=your-pinecone-key
```

#### Start the backend server:
```bash
uvicorn main:app --reload
```

The backend will run at [http://localhost:8000](http://localhost:8000)

---

### 3. Frontend Setup (React + Vite)

```bash
cd ../frontend
npm install
npm run dev
```

The frontend will run at [http://localhost:5173](http://localhost:5173)

---

## ✨ How It Works

1. **Connect your wallet** to participate.
2. **Submit a proposal**: Describe your idea, let the AI generate a summary and category, and optionally upload an image.
3. **Browse and vote**: Explore proposals, filter by category, and vote (like/dislike) with on-chain transparency.
4. **Get notified**: Real-time notifications for new proposals, votes, and more.
5. **Ask the AI**: Use the AI assistant to get insights and answers about proposals and trends.
6. **See analytics**: Visual dashboards show trends, top proposals, and engagement.

---

## 🤖 Tech Stack
- **Frontend:** React, Vite, TailwindCSS, ethers.js
- **Backend:** FastAPI, OpenAI, Pinecone, LangChain
- **Blockchain:** Ethereum-compatible smart contract (Proposal.sol)
- **Notifications:** Real-time, in-app, and toast notifications
- **AI:** OpenAI GPT for summarization and Q&A

---

## 🏆 Why CivicGPT?
- **Empowers every citizen** to shape their city’s future
- **AI supercharges participation**—no more lost or messy ideas
- **Transparent, decentralized, and open**
- **Beautiful, modern, and fun to use**

---

## 📸 Demo Flow
1. Connect your wallet
2. Submit a proposal (see AI in action!)
3. Browse, search, and vote on proposals
4. Get real-time notifications
5. Explore analytics and ask the AI

---

## 💡 Join Us!
Ready to build better communities? **Fork, star, and contribute!**

> Made with ❤️ for [Your Hackathon Name] 2024

---

**Update the project image path if needed. For any issues, open an issue or PR!**
