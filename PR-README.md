# Pull Request: Modular AI Repositories & Asynchronous Email Queue Integration

This document serves as the readme/documentation for the Pull Request branch `review-message-queue`. It details the architecture, file modifications, configuration steps, and verification procedures for the new features.

---

## 📖 Table of Contents
1. [Overview](#-overview)
2. [Architecture Changes](#%EF%B8%8F-architecture-changes)
    - [Multi-Provider AI Repositories (LangGraph)](#multi-provider-ai-repositories-langgraph)
    - [Asynchronous Background Tasks (BullMQ + Redis)](#asynchronous-background-tasks-bullmq--redis)
3. [Key File Modifications](#-key-file-modifications)
4. [Environment Configuration](#%EF%B8%8F-environment-configuration)
5. [Local Setup & Running Guide](#-local-setup--running-guide)
6. [Verification & Testing](#-verification--testing)

---

## 📝 Overview
This PR implements two major upgrades to the Fluxy AI backend:
* **Decoupled Email Processing**: Traditional email sending during user registration caused request-blocking delays. We migrated the email service to run asynchronously using a background job queue powered by **BullMQ** and **Redis**.
* **Unified AI Repository Interface**: Refactored the AI service to support multiple models (**OpenAI**, **Gemini**, and **Mistral**) using a clean **Repository Pattern** integrated with **LangGraph** state machines.

---

## 🏗️ Architecture Changes

### Multi-Provider AI Repositories (LangGraph)
Each AI provider is abstracted behind a repository interface (`IAIRepository`), leveraging a unified LangGraph flow (`StateGraph`) to stream tokens via SSE and generate chat titles.

```
                  ┌──────────────────────┐
                  │  MessageController   │
                  └──────────┬───────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │    MessageService    │
                  └──────────┬───────────┘
                             │
            ┌────────────────┼────────────────┐
            ▼                ▼                ▼
     ┌─────────────┐  ┌─────────────┐  ┌──────────────┐
     │   OpenAI    │  │   Gemini    │  │   Mistral    │
     │ Repository  │  │ Repository  │  │  Repository  │
     └─────────────┘  └─────────────┘  └──────────────┘
```

### Asynchronous Background Tasks (BullMQ + Redis)
To maximize throughput and prevent HTTP request timeouts, the auth flow now delegates email dispatch to a queue.

```
  ┌───────────────────────┐
  │ Registration Request  │
  └──────────┬────────────┘
             │
             ▼
  ┌───────────────────────┐      ┌───────────────┐
  │     AuthService       ├─────►│  Email Queue  │ (Redis)
  └───────────────────────┘      └───────┬───────┘
                                         │
                                         ▼
  ┌───────────────────────┐      ┌───────────────┐
  │     Brevo SMTP        │◄─────┤ Email Worker  │ (BullMQ)
  └───────────────────────┘      └───────────────┘
```

---

## 📂 Key File Modifications

### 1. AI Integration Layer
* **`src/repositories/contracts/IAIRepository.js`**: Defines the interface contract (`streamResponse`, `createTitle`).
* **`src/repositories/implementations/OpenAIRepository.js`**: Instantiates ChatGPT `gpt-4o-mini` and compiles the LangGraph StateGraph.
* **`src/repositories/implementations/GeminiRepository.js`**: Instantiates Gemini (`gemini-2.5-flash` / `gemini-1.5-flash`) and compiles the LangGraph StateGraph.
* **`src/repositories/implementations/MistralRepository.js`**: Refactored Mistral model streaming and normalized callback signatures.
* **`src/controllers/message.controller.js`**: Adds structured error catch block for `RATE_LIMIT` and `MODEL_RATE_LIMIT`.

### 2. BullMQ Email Worker Queue
* **`src/config/redis.js`**: Configures Connection parameters for Redis.
* **`src/queues/email.queue.js`**: Initializes the BullMQ queue `emailQueue` and exports `addEmailToQueue()`.
* **`src/workers/email.worker.js`**: Initializes the BullMQ worker to consume jobs and execute `MailService.sendVerificationEmail()`.
* **`src/services/mail.service.js`**: Integrates `@getbrevo/brevo` to handle SMTP transactional emails.

### 3. Server Initialization
* **`server.js`**: Initializes `email.worker.js` on startup to start listening for jobs.
* **`src/config/environment.js`**: Validates required variables like `REDIS_URL`, `OPENAI_API_KEY`, `GEMINI_API_KEY`, etc.

---

## ⚙️ Environment Configuration
Add the following keys to your `.env` file:

```env
# Redis Configuration
REDIS_URL=redis://127.0.0.1:6379

# Brevo Mail API Key
BREVO_API_KEY=your_brevo_api_key
SENDER_EMAIL=your_sender_email@domain.com

# AI API Keys
MISTRAL_API_KEY=your_mistral_key
OPENAI_API_KEY=your_openai_key
GEMINI_API_KEY=your_gemini_key
```

---

## 🏃 Local Setup & Running Guide

### Step 1: Install Dependencies
Navigate to the `FluxyAI-server` directory and install the packages:
```bash
npm install
```

### Step 2: Start Redis
Make sure you have Redis running locally or via Docker:
```bash
docker run -d -p 6379:6379 redis
```

### Step 3: Run the Server
Start the development server (runs with nodemon):
```bash
npm run dev
```

---

## 🧪 Verification & Testing

### Test Gemini Integration
Run the standalone test file:
```bash
node test-gemini.js
```
*Expected Output*: Compile logs followed by successfully streamed response chunks and generated title.

### Test Email Registration Queue
Run the standalone user registration test:
```bash
node test-register.js
```
*Expected Output*: Verifies database connection, adds user, enqueues the verification mail to Redis, and processes it via the worker.
