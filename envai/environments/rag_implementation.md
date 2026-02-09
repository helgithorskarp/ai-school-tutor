# 1. Base Flow

This question is directed from a React client to a Node.js WebSocket server, which sends the question + chat window to a Django server.  
The Django server detects what course info is being asked for, retrieves context through the RAG system, and returns both context for the LLM and images for the UI response.

Node then sends the question (with context) to the LLM and finally returns the response to the React client, together with the images produced by the RAG system.

This architecture is intentionally separated:
- React handles the UI and sends/receives messages via WebSockets.
- Node.js handles the WebSocket connection, streaming/transport, and the final LLM call (OpenAI / Gemini / etc.).
- Django handles RAG (retrieval + metadata) and image retrieval/selection for the UI.

---

# 2. RAG System Flow

There are two types of files: **Slides** and **Textbooks**.  
Slides usually contain fewer words per page, so they are handled differently.

## Textbooks

- Each chunk is **450 tokens**
- Each chunk overlaps by **50 tokens**
- Each chunk is mapped to the pages it corresponds to and stores metadata

Example:

~~~json
{
  "id": "book_001_chunk_104",
  "text": "CHAPTER: Metabolism | SECTION: 4.2 The Citric Acid Cycle | TEXT: The cycle begins when acetyl-CoA combines with a four-carbon acceptor molecule, oxaloacetate, to form a six-carbon molecule called citrate. Through a series of steps, citrate is oxidized... releasing two carbon dioxide molecules and producing ATP, NADH, and FADH2 in the process.",
  "metadata": {
    "source_file": "biology_textbook_v3.pdf",
    "document_type": "textbook",
    "chapter_name": "Metabolism",
    "section_title": "4.2 The Citric Acid Cycle",
    "page_start": 142,
    "page_end": 143,
    "chunk_index": 104,
    "total_chunks_in_doc": 1250,
    "token_count": 450
  },
  "embedding": [0.012, -0.034, 0.215, "... (1536 dimensions)"]
}
~~~

## Slides

- Each chunk corresponds to **one slide**
- This may change depending on performance, but for now we keep it this way

---

# 3. Processing Steps

1. **Query Prep**  
   The user question is sent to the server with chat history.  
   An LLM rewrites the question to remove ambiguity and summarizes relevant chat context.

   **NOTE:** Rewriting LLM calls are **heavily restricted**. Other than resolving ambiguity and summarizing relevant chat context, the rewriting step should not change wording or meaning, and should preserve the user’s original terms as much as possible. This applies both to rewriting the user prompt and to any rewriting/pruning decisions related to context returned from the RAG system.

2. **Retrieval**  
   The refined query is embedded and used to retrieve the top 20-30 chunks from:
   - Textbooks (450-token chunks)
   - Course slides
   A reranked (e.x. Voyager AI is used to rank chunks on relevance, top 4+ will be used depending on relevance)

3. **Context Pruning**  
   An LLM removes text that does not apply to the user’s question.  
   It does not rewrite content — it only strips unnecessary tokens. (POSSIBLY not needed if reranker does a good job)

   **NOTE:** This LLM step is also **heavily restricted**. It should not change wording or meaning. It only removes irrelevant parts while keeping the original text intact.

4. **Image Verification**  
   - Each chunk is mapped to its corresponding page/slide images.  
   - Images from the 2 best chunks are sent to a Vision LLM.  
   - The Vision LLM selects which pages/slides are suitable to show the user.

5. **Final Response**  
   The pruned context + selected images are sent to the final model (OpenAI / Gemini / etc.).  
   The model returns:
   - The final answer
   - The specific images from textbooks and slides

Node.js then returns the final answer + selected images back to the React client over WebSockets.