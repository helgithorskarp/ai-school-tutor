# AI School Tutor

**Status:** Currently being implemented

---

## Overview

The goal of this project is to build a **course-specific AI chatbot** that allows students to ask questions about course material and receive accurate, grounded responses.

The system is designed to:
- Help students learn more effectively  
- Reduce repetitive question workload for instructors  
- Provide context-aware answers using course content  

---

## Architecture

The system is built using a multi-service architecture:

React Frontend → Node.js WebSocket Server → Django RAG Backend

---

## Frontend

Located in the `frontend/` folder.

- React application
- Displays a chatbot based on URL format:

```
/chat/COURSE-CODE
```

Example:
```
/chat/T-301-REIR
```

- Sends user questions to the Node.js server via **WebSockets** for real-time streaming responses.

---

## Node.js Server located at ws/server.js 

Acts as the **real-time communication layer**.

Responsibilities:
- Receives questions from React frontend  
- Streams responses back to the client  
- Forwards requests to the Django backend  
- Returns final responses (text + images) to frontend  

---

## Django Backend (RAG Server) located at /envai

Handles all **Retrieval-Augmented Generation (RAG)** functionality.

Responsibilities:
- Processes student questions  
- Retrieves relevant course content  
- Selects relevant images  
- Returns structured context + images  

More details on RAG design flow can be found at envai/environments/rag_implementation.md
---

## Data Flow

1. Student asks question in React chatbot  
2. Question sent to Node.js via WebSocket  
3. Node.js forwards request to Django RAG server  
4. RAG server retrieves:
   - Relevant text context  
   - Relevant images  
5. Response streamed back to frontend via Node.js  

---

## Vision

Create a scalable system where each course can have its own AI tutor instance while maintaining centralized infrastructure. Allowing students to learn more effectivly

