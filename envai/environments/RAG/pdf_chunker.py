from pypdf import PdfReader
from openai import OpenAI
import numpy as np
import tiktoken
import json
import os
from dotenv import load_dotenv
from pathlib import Path




path_to_rag_files = Path(__file__).resolve().parent / "ragFiles" ### here after would come /courseCode/ EITHER EMBEDDINGS OR chunks.json

### this will probably be upgraded later where we use some external service that can strucutre the pdf
class Chunker:
    def __init__(self):
        load_dotenv()
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        
    
    
    def chunk(self, file_name, course_code):
        course_path = path_to_rag_files / course_code
        
        reader = PdfReader(course_path / f"{file_name}.pdf")
        
        chunk_size = 400
        overflow_size = 45
        
        embedding_list = [] ### keeps track of the strings, each entry is a string that will be embedded
        current_chunks = []

        overflow_string = "" ### 50 token overflow on each chunk
        current_string = ""
        start_page = 0
        chunk_id = 0
        chunks_dict = {} ### keps track of chunk content (text), page start - page end, each entry is chunk_id -> {text: ..., start: n, end: m}
        enc = tiktoken.encoding_for_model("text-embedding-3-large") ### counts how many tokens

        
        for i, page in enumerate(reader.pages): ### i is the page numner
            text = page.extract_text()
            
            text_list = text.split(" ")
            for word in text_list:
                word = f"{word} " ### add space in front
                current_string += word
                
                num_tokens = len(enc.encode(current_string))

                
                if (num_tokens >= chunk_size - overflow_size):
                    overflow_string += word
                    
                if (num_tokens >= chunk_size): ### current chunk is large enough
                    chunks_dict[chunk_id] = {"text": current_string, "start": start_page, "end": i}
                    chunk_id += 1
                    current_chunks.append(current_string)
                    current_string = overflow_string
                    overflow_string = ""
                    start_page = i
                    if (len(current_chunks) >= 700): ### if we are at 700 chunks then get their embeddings
                        self.append_embeddings(current_chunks, embedding_list)
                        
                        current_chunks = []
                        
        
        
        ### embedd remaining chunks
        if current_chunks:
            self.append_embeddings(current_chunks, embedding_list)
        
                        
                        
        
        
        #### at this stage the embedding list should store all the embeddings needed need to turn it intoa numpy matrix and save into th
        embedding_matrix = np.array(embedding_list)
        np.save(course_path / "embeddings.npy", embedding_matrix)  ### store the embedding matrix at this path    
        
        ### also create a json file to store the dictionary
        with open(course_path / "embeddings.json", 'w') as f:
            json.dump(chunks_dict, f)

                    
                    
    
    
    
    
    def append_embeddings(self, string_list: list, embedding_list: list):
        response = self.client.embeddings.create(
            input=string_list,
            model="text-embedding-3-large"
        )

        embedding_list.extend(
            item.embedding for item in response.data
        )

        
        
                    
                    
        
                    
                    
                    
if __name__ == "__main__":
    chunk = Chunker()
    chunk.chunk("alg4", 'T-301-REIR')
    
            
