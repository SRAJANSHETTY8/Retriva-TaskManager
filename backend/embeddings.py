import os
import numpy as np
import faiss
from pypdf import PdfReader
from sentence_transformers import SentenceTransformer

INDEX_FILE = "vector_store.index"

_model = None


def get_model():
    global _model
    if _model is None:
        _model = SentenceTransformer("all-MiniLM-L6-v2")
    return _model


EMBEDDING_DIM = get_model().get_sentence_embedding_dimension()


def extract_text(file_path: str, content_type: str) -> str:
    if content_type == "text/plain":
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            return f.read()

    if content_type == "application/pdf":
        reader = PdfReader(file_path)
        text = ""
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
        return text

    return ""


def chunk_text(text: str, chunk_size: int = 60) -> list[str]:
    paragraphs = [p.strip() for p in text.split("\n") if p.strip()]

    chunks = []

    for paragraph in paragraphs:
        words = paragraph.split()

        if len(words) <= chunk_size:
            chunks.append(paragraph)
        else:
            for i in range(0, len(words), chunk_size):
                chunk = " ".join(words[i:i + chunk_size]).strip()
                if chunk:
                    chunks.append(chunk)

    return chunks


def embed_text(text: str) -> np.ndarray:
    vector = get_model().encode(text)
    return np.array(vector, dtype="float32")


class VectorStore:
    def __init__(self):
        base_index = faiss.IndexFlatL2(EMBEDDING_DIM)
        self.index = faiss.IndexIDMap(base_index)

        if os.path.exists(INDEX_FILE):
            self.index = faiss.read_index(INDEX_FILE)

    def add(self, chunk_id: int, vector: np.ndarray):
        self.index.add_with_ids(
            np.array([vector], dtype="float32"),
            np.array([chunk_id], dtype="int64"),
        )
        self._save()

    def search(self, query_vector: np.ndarray, top_k: int = 5):
        if self.index.ntotal == 0:
            return []

        distances, ids = self.index.search(
            np.array([query_vector], dtype="float32"),
            top_k,
        )

        results = []

        for chunk_id, distance in zip(ids[0], distances[0]):
            if chunk_id != -1:
                results.append((int(chunk_id), float(distance)))

        return results

    def _save(self):
        faiss.write_index(self.index, INDEX_FILE)


vector_store = VectorStore()