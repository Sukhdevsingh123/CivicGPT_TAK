
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from langchain_openai import OpenAIEmbeddings
from langchain_pinecone import PineconeVectorStore
from pinecone import Pinecone, ServerlessSpec
from openai import AsyncOpenAI
import os
from dotenv import load_dotenv
from typing import Optional
import logging
import time

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Pinecone client
pinecone_api_key = os.getenv("PINECONE_API_KEY")
if not pinecone_api_key:
    logger.error("PINECONE_API_KEY is not set in .env")
    raise ValueError("PINECONE_API_KEY is required")
pc = Pinecone(api_key=pinecone_api_key)

# Pinecone index configuration
index_name = "civic-proposals"
dimension = 1536  # OpenAI embeddings dimension

# Check if index exists, create if not
try:
    indexes = pc.list_indexes().get("indexes", [])
    if not any(index["name"] == index_name for index in indexes):
        logger.info(f"Creating Pinecone index: {index_name}")
        pc.create_index(
            name=index_name,
            dimension=dimension,
            metric="euclidean",
            spec=ServerlessSpec(cloud="aws", region="us-east-1")
        )
        time.sleep(15)  # Wait for index readiness
        logger.info(f"Pinecone index {index_name} created")
except Exception as e:
    logger.error(f"Failed to create Pinecone index: {str(e)}")
    raise

# Initialize OpenAI embeddings
openai_api_key = os.getenv("OPENAI_API_KEY")
if not openai_api_key:
    logger.error("OPENAI_API_KEY is not set in .env")
    raise ValueError("OPENAI_API_KEY is required")
try:
    embeddings = OpenAIEmbeddings(api_key=openai_api_key)
except Exception as e:
    logger.error(f"Failed to initialize OpenAI embeddings: {str(e)}")
    raise

# Initialize OpenAI client for text generation
try:
    openai_client = AsyncOpenAI(api_key=openai_api_key)
except Exception as e:
    logger.error(f"Failed to initialize OpenAI client: {str(e)}")
    raise

# Initialize Pinecone vector store
try:
    vector_store = PineconeVectorStore(
        index_name=index_name,
        embedding=embeddings,
        pinecone_api_key=pinecone_api_key
    )
    logger.info("PineconeVectorStore initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize PineconeVectorStore: {str(e)}")
    raise

# Pydantic model for proposal input
class ProposalInput(BaseModel):
    id: int
    text: str
    summary: str
    category: str
    submitter: str
    timestamp: str
    likes: int
    dislikes: int
    hasVoted: Optional[bool] = None
    userVote: Optional[bool] = None

# Pydantic model for summary generation input
class SummaryInput(BaseModel):
    text: str

# Pydantic model for query input
class QueryInput(BaseModel):
    query: str

# Pydantic model for vote update input
class VoteUpdateInput(BaseModel):
    proposalId: int
    likes: int
    dislikes: int

@app.get("/api/hello")
async def hello():
    return {"message": "Hello from the backend!"}

@app.post("/api/store_proposal")
async def store_proposal(proposal: ProposalInput):
    try:
        logger.debug(f"Received proposal: {proposal.dict()}")
        if proposal.likes < 0 or proposal.dislikes < 0:
            logger.error(f"Invalid vote counts for proposal {proposal.id}: likes={proposal.likes}, dislikes={proposal.dislikes}")
            raise HTTPException(status_code=400, detail="Likes and dislikes must be non-negative")
        content = f"{proposal.text} {proposal.summary}"
        pinecone_id = f"proposal-{proposal.id}"  # Deterministic ID
        metadata = {
            "id": str(proposal.id),
            "pinecone_id": pinecone_id,
            "text": proposal.text,
            "summary": proposal.summary,
            "category": proposal.category,
            "submitter": proposal.submitter,
            "timestamp": proposal.timestamp,
            "likes": proposal.likes,
            "dislikes": proposal.dislikes,
            "hasVoted": bool(proposal.hasVoted) if proposal.hasVoted is not None else False,
            "userVote": bool(proposal.userVote) if proposal.userVote is not None else False
        }
        logger.debug(f"Adding to Pinecone with ID: {pinecone_id}, metadata: {metadata}")
        vector_store.add_texts(
            texts=[content],
            metadatas=[metadata],
            ids=[pinecone_id]
        )
        logger.info(f"Proposal {proposal.id} stored in Pinecone")
        return {"message": f"Proposal {proposal.id} stored in Pinecone successfully!"}
    except Exception as e:
        logger.error(f"Error storing proposal: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error storing proposal: {str(e)}")

@app.get("/api/search_proposals/{query}")
async def search_proposals(query: str):
    try:
        logger.debug(f"Searching proposals with query: {query}")
        results = vector_store.similarity_search(query, k=2)
        return {"results": [doc.metadata for doc in results]}
    except Exception as e:
        logger.error(f"Error searching proposals: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error searching proposals: {str(e)}")

@app.post("/api/generate_summary")
async def generate_summary(input_data: SummaryInput):
    try:
        logger.debug(f"Generating summary for text: {input_data.text}")
        prompt = f"""
        Summarize the following proposal text in 1-2 concise sentences, capturing the main idea:
        "{input_data.text}"
        """
        response = await openai_client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are an AI assistant that generates concise summaries for civic proposals, framing them as part of a decentralized platform where citizens submit ideas for improving their city (e.g. new parks, safer roads, digital services)."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=60,
            temperature=0.7
        )
        summary = response.choices[0].message.content.strip()
        logger.debug(f"Generated summary: {summary}")
        return {"summary": summary}
    except Exception as e:
        logger.error(f"Error generating summary: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating summary: {str(e)}")

@app.post("/api/ask_proposal")
async def ask_proposal(input_data: QueryInput):
    try:
        logger.debug(f"Received query: {input_data.query}")
        results = vector_store.similarity_search(input_data.query, k=3)
        proposals = [doc.metadata for doc in results]
        logger.debug(f"Retrieved {len(proposals)} proposals: {proposals}")

        if not proposals:
            context = "No relevant proposals found in the database."
        else:
            context = "The following proposals were found in the database:\n"
            for i, proposal in enumerate(proposals, 1):
                context += (
                    f"Proposal {i}:\n"
                    f"- Text: {proposal.get('text', 'N/A')}\n"
                    f"- Summary: {proposal.get('summary', 'N/A')}\n"
                    f"- Category: {proposal.get('category', 'N/A')}\n"
                    f"- Submitter: {proposal.get('submitter', 'N/A')}\n"
                    f"- Timestamp: {proposal.get('timestamp', 'N/A')}\n"
                    f"- Likes: {proposal.get('likes', 0)}\n"
                    f"- Dislikes: {proposal.get('dislikes', 0)}\n\n"
                )

        prompt = f"""
        You are an AI assistant that answers questions about civic proposals stored in a database.
        Based on the following context, provide a concise answer (2-3 sentences) to the user's query: "{input_data.query}"
        If no relevant proposals are found, state that clearly.
        Context:
        {context}
        """
        
        response = await openai_client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are an AI assistant that provides concise and accurate answers about civic proposals."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=100,
            temperature=0.7
        )
        answer = response.choices[0].message.content.strip()
        logger.debug(f"Generated answer: {answer}")
        return {"answer": answer}
    except Exception as e:
        logger.error(f"Error processing query: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing query: {str(e)}")

@app.post("/api/update_vote")
async def update_vote(input_data: VoteUpdateInput):
    try:
        proposal_id = input_data.proposalId
        likes = input_data.likes
        dislikes = input_data.dislikes
        if likes < 0 or dislikes < 0:
            logger.error(f"Invalid vote counts for proposal {proposal_id}: likes={likes}, dislikes={dislikes}")
            raise HTTPException(status_code=400, detail="Likes and dislikes must be non-negative")
        logger.debug(f"Updating votes for proposal {proposal_id}: likes={likes}, dislikes={dislikes}")
        pinecone_id = f"proposal-{proposal_id}"
        
        # Fetch proposal from Pinecone
        index = pc.Index(index_name)
        result = index.fetch(ids=[pinecone_id])
        proposal = result.vectors.get(pinecone_id) if result.vectors else None
        if not proposal:
            logger.error(f"Proposal {proposal_id} not found in Pinecone")
            raise HTTPException(status_code=404, detail=f"Proposal {proposal_id} not found")

        # Update vote counts in Pinecone
        metadata = proposal.metadata
        metadata["likes"] = likes
        metadata["dislikes"] = dislikes
        index.upsert(
            vectors=[
                {
                    "id": pinecone_id,
                    "values": proposal.values,
                    "metadata": metadata
                }
            ]
        )
        logger.info(f"Updated votes for proposal {proposal_id}: likes={likes}, dislikes={dislikes}")
        return {"message": f"Updated votes for proposal {proposal_id}"}
    except Exception as e:
        logger.error(f"Error updating vote for proposal {proposal_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error updating vote: {str(e)}")

@app.get("/api/get_proposal/{proposal_id}")
async def get_proposal(proposal_id: int):
    try:
        logger.debug(f"Fetching proposal {proposal_id}")
        pinecone_id = f"proposal-{proposal_id}"
        index = pc.Index(index_name)
        result = index.fetch(ids=[pinecone_id])
        proposal = result.vectors.get(pinecone_id) if result.vectors else None
        if not proposal:
            logger.error(f"Proposal {proposal_id} not found in Pinecone")
            raise HTTPException(status_code=404, detail=f"Proposal {proposal_id} not found")
        logger.info(f"Retrieved proposal {proposal_id}")
        return {"proposal": proposal.metadata}
    except Exception as e:
        logger.error(f"Error fetching proposal {proposal_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching proposal: {str(e)}")

