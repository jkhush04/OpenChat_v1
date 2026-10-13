# Retrieval-Augmented Generation (RAG) in OpenChat

OpenChat uses a RAG pipeline to ground assistant answers in a custom
knowledge base instead of relying purely on the language model's
training data.

When a user sends a message, the backend embeds that message into a
vector, searches a Pinecone index for the most similar chunks of text
from the knowledge base, and passes those chunks to the Gemini model as
extra context before generating the final answer. This reduces
hallucinated answers on domain-specific questions, because the model is
answering from real, retrieved source text rather than guessing.

The knowledge base itself lives in the knowledge_base/ folder as plain
Markdown or text files. Running "npm run ingest" chunks those files,
embeds each chunk, and stores the vectors in Pinecone so they can be
searched later.
