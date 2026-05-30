# Fluxy AI

Fluxy AI is an advanced AI Research Copilot built using LangGraph, LangChain, RAG pipelines, and hybrid retrieval systems. It combines real-time web search with document-based contextual retrieval to deliver grounded, reliable, and production-ready AI responses.

The system intelligently routes user queries between vector search and live internet search, merges contextual information, generates answers, critiques its own responses, and retries low-quality outputs automatically.

## ✨ Features

* 🔐 Authentication & session management
* 💬 Real-time AI chat with streaming responses
* 📄 PDF upload and document understanding
* 🧠 RAG (Retrieval-Augmented Generation)
* 🌐 Tavily-powered live web search
* 🔀 Hybrid retrieval (Web + Vector DB)
* 🤖 LangGraph-based agent workflows
* 🧾 Source citations & grounded answers
* ♻️ Self-critique and retry loop for hallucination reduction
* 🧠 Conversational memory support
* 📊 Workflow observability using LangSmith
* 🐳 Docker-ready scalable architecture

## 🏗️ Tech Stack

### Backend

* Node.js
* Express.js
* LangChain
* LangGraph
* OpenAI / Groq
* Pinecone / ChromaDB
* Tavily API

### Frontend

* React
* Tailwind CSS
* TanStack Query
* Markdown Rendering
* Streaming UI

## 🧠 Architecture Overview

User Query
↓
LangGraph Workflow
↓
Router Node → decides between:

* Web Search
* Vector Search
* Hybrid Retrieval

↓
Context Merge
↓
LLM Generation
↓
Critic Node
↓
Retry Loop (if needed)
↓
Final Grounded Response

## 🎯 Goals of the Project

Fluxy AI is designed to demonstrate:

* AI system design
* Agent orchestration
* Stateful workflows
* Retrieval quality optimization
* Hallucination reduction
* Production-level backend architecture
* Scalable AI application development

## 🚀 Future Improvements

* Multi-agent collaboration
* Voice interaction
* Advanced memory systems
* Workspace/project-based knowledge bases
* Team collaboration
* Code execution sandbox
* Fine-grained observability dashboard

## 📌 Why Fluxy AI?

Most AI projects stop at “chat with PDF.”
Fluxy AI focuses on building a complete AI engineering system with:

* Hybrid retrieval
* Conditional workflows
* Self-evaluation
* Reliability pipelines
* Scalable architecture

This project reflects real-world AI infrastructure and production thinking.
