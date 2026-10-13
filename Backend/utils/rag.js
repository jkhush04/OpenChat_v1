import { getVectorStore, isRagConfigured } from "./vectorStore.js";

// How many chunks of the knowledge base to pull back per question.
// Higher = more context (but more tokens sent to the LLM, and more noise).
const TOP_K = 4;

// Given the user's message, find the most relevant chunks from the
// knowledge base in Pinecone and return them as one context string.
// Returns null if RAG isn't configured or nothing relevant was found,
// so the caller can just fall back to a normal (non-RAG) reply.
const retrieveContext = async (query) => {
    if (!isRagConfigured()) {
        return null;
    }

    try {
        const vectorStore = await getVectorStore();

        // similaritySearch embeds `query` and finds the closest vectors in Pinecone.
        const results = await vectorStore.similaritySearch(query, TOP_K);

        if (!results || results.length === 0) {
            return null;
        }

        // Stitch the retrieved chunks into one block of text, tagging each
        // with its source file so the model (and we, for debugging) can see
        // where it came from.
        const context = results
            .map((doc, i) => `[Source ${i + 1}: ${doc.metadata?.source || "knowledge base"}]\n${doc.pageContent}`)
            .join("\n\n");

        return context;
    } catch (err) {
        // If Pinecone is misconfigured or down, don't break the chat feature —
        // just log it and let the caller fall back to a plain LLM answer.
        console.log("RAG retrieval failed, continuing without context:", err.message);
        return null;
    }
};

export default retrieveContext;
