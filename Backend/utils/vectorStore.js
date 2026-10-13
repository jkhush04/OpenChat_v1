import "dotenv/config";
import { Pinecone } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

// Embedding model: converts text -> a vector of numbers that captures its meaning.
// We reuse the existing GEMINI_API_KEY so no extra key/service is required.
const embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GEMINI_API_KEY,
    model: "gemini-embedding-001",
});

// Pinecone client: talks to your Pinecone project (the vector database).
const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
});

// Cache the store so we don't reconnect to Pinecone on every single chat request.
let vectorStoreInstance = null;

// Returns a ready-to-query LangChain vector store wrapping your Pinecone index.
const getVectorStore = async () => {
    if (vectorStoreInstance) return vectorStoreInstance;

    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);

    vectorStoreInstance = await PineconeStore.fromExistingIndex(embeddings, {
        pineconeIndex,
    });

    return vectorStoreInstance;
};

// Lets the rest of the app check "is RAG set up?" before trying to use it.
// This is how we make sure existing chat behavior keeps working even if
// someone hasn't configured Pinecone yet.
const isRagConfigured = () => {
    return Boolean(process.env.PINECONE_API_KEY && process.env.PINECONE_INDEX_NAME);
};

export { embeddings, pinecone, getVectorStore, isRagConfigured };
