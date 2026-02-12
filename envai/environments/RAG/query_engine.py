from openai import OpenAI
import numpy as np
import json
import os
from dotenv import load_dotenv
from pathlib import Path
import voyageai
import voyageai.client
from pypdf import PdfReader
import fitz


path_to_rag_files = Path(__file__).resolve().parent / "ragFiles" ### here after would come /courseCode/ EITHER EMBEDDINGS OR chunks.json

class Query_engine:
    def __init__(self):
        load_dotenv()
        self.OpenAIclient = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.rerankerClient = voyageai.Client(api_key=os.getenv("RERANKER_API_KEY")
)
        
    
    
    
    def get_context(self, course_code, user_prompt):
        ### start by rewriting users prompt, removes ambiguity
        rewritten = self.rewrite_prompt(user_prompt)


        ### embeddings of text book
        embedded_matrix = np.load(path_to_rag_files / course_code / "embeddings.npy")
        user_embedded_list = self.embed_question(rewritten)
        user_embedded_array = np.array(user_embedded_list).reshape(-1, 1)


        user_vec = user_embedded_array.squeeze()  # (3072,)
        transform_vector = embedded_matrix @ user_embedded_array
        transform_vector = transform_vector.squeeze()

        top_k = 25

        ### gets the indicies of the 25 best chunks
        indices = np.argpartition(transform_vector, -top_k)[-top_k:]
        
        ### get best 25 chunks indicies those are the texts we exract from the json file and send to reranker voyager ai
        with open(path_to_rag_files / course_code / "embeddings.json", 'r') as f:
            chunks = json.load(f)
            
        ### currently we have all indicies of best k chunks next we need to get a list of the text feilds of those chunks
        
        text_chunk_list = [chunks[str(i)]["text"] for i in indices]
            
        
        reranked_results = self.rerank_chunks(text_chunk_list, user_prompt, top_k)
        
        context_list = []
        
        page_numbers = set()
        for i, r in enumerate(reranked_results):
            chunk_idx = str(indices[i])
            if (r.relevance_score < 0.67):
                continue ### this chunk is not relevant enough
            
            context_list.append(r.document)
            page_start = chunks[chunk_idx]['start']
            page_end = chunks[chunk_idx]['end']
            
            for i in range(page_start, page_end + 1):
                page_numbers.add(i)
        
        ### now for each page ask a cheap LLM model which pages are actually worth returning to user
        page_list = self.validate_pages(rewritten, list(page_numbers))


    def embed_question(self, text: str) -> list[float]:
        resp = self.OpenAIclient.embeddings.create(
            model="text-embedding-3-large",
            input=text,
        )
        return resp.data[0].embedding

    def rerank_chunks(self, list_of_chunks, user_question, k):
        reranked = self.rerankerClient.rerank(
            user_question,
            list_of_chunks,
            model="rerank-2.5",
            top_k=6
        )
        
        return reranked.results

    def rewrite_prompt(self, user_prompt: str) -> str:
        """
        Rewrites the user prompt to optimize it for retrieval (RAG phase).
        If the prompt is unreadable, meaningless, or too ambiguous,
        returns it unchanged.
        """

        system_prompt = """
            You are a query rewriter for a Retrieval-Augmented Generation (RAG) system.
            
            Rewrite the user's query to optimize document retrieval.
            
            Rules:
            - Preserve the user's meaning exactly. Do not answer the question.
            - Remove conversational fluff.
            - Make implicit technical context explicit using widely-used technical keywords.
            - If the query is ambiguous, include the main plausible interpretations as keywords joined by OR.
              (Do not ask questions; do not choose one interpretation.)
            - Do NOT add new facts, examples, or constraints not implied by the query.
            - Output a single line only. No quotes, no bullet points, no extra commentary.
            
            If the user's text is unreadable or nonsensical, return it exactly unchanged.
            Return ONLY the rewritten query.

        """

        response = self.OpenAIclient.chat.completions.create(
            model="gpt-4o-mini",  # cheap + good enough for rewriting
            temperature=0.0,  # deterministic
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
        )

        rewritten = response.choices[0].message.content.strip()

        # Extra safety fallback: if model returns empty string
        if not rewritten:
            return user_prompt

        return rewritten

    def validate_pages(self, user_prompt, page_list):
    ### currently fixed to reiknrit book will be changed later
        reader = PdfReader(path_to_rag_files / "T-301-REIR" / "alg4.pdf")

        pages_dict = {}
        for page_num in page_list:
            if 0 <= page_num < len(reader.pages):
                text = reader.pages[page_num].extract_text() or ""
                pages_dict[page_num] = text

        context = "\n\n".join(
            [f"Page {num}:\n{txt}" for num, txt in pages_dict.items()]
        )

        response = self.OpenAIclient.chat.completions.create(
            model="gpt-4o-mini",
            temperature=0,
            response_format={"type": "json_object"},
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are selecting textbook pages to show to a student.\n\n"
                        "Return a JSON object with a single key 'pages' containing a list "
                        "of page numbers.\n\n"
                        "Rules:\n"
                        "- You may select AT MOST 3 pages.\n"
                        "- Only select pages that DIRECTLY answer the user's question.\n"
                        "- The page must contain explanations, definitions, proofs, or examples "
                        "that help answer the question.\n"
                        "- Do NOT select pages that only mention the topic historically "
                        "or discuss performance unless the question is about performance.\n"
                        "- If no page directly answers the question, return an empty list.\n\n"
                        "Be some what strict. Relevance must be there for you to return the page, think of does this page makes sense to look at based on the question he asked?."
                    ),
                },
                {
                    "role": "user",
                    "content": f"User question:\n{user_prompt}\n\nCandidate pages:\n{context}",
                },
            ],
        )


        data = json.loads(response.choices[0].message.content)
        self.save_pdf_page_image(data.get("pages", []), 2.0, "png")
        return data.get("pages", [])

    def save_pdf_page_image(self, pages: list, zoom: float = 2.0, fmt: str = "webp"):
        doc = fitz.open(path_to_rag_files / "T-301-REIR" / "alg4.pdf")

        for page_index in pages:
            page_index = int(page_index)

            page = doc.load_page(page_index)  # 0-based
            pix = page.get_pixmap(matrix=fitz.Matrix(zoom, zoom), alpha=False)

            filename = f"page_{page_index + 1:04d}.{fmt}"
            out_path = path_to_rag_files / "T-301-REIR" / filename

            pix.save(out_path)

        doc.close()