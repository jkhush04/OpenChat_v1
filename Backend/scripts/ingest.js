// One-off / re-runnable script that builds your knowledge base in Pinecone.
// Run it with: npm run ingest
//
// It reads every .md/.txt file from Backend/knowledge_base/, splits each
// file into small overlapping chunks, turns each chunk into an embedding
// vector, and upserts (writes) those vectors into your Pinecone index.
// The chat route (routes/chat.js) then searches this same index at
// request time via utils/rag.js.

import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";
import { PineconeStore } from "@langchain/pinecone";
import { pinecone, embeddings } from "../utils/vectorStore.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const KB_DIR = path.join(__dirname, "..", "knowledge_base");

// Read every .md/.txt file in knowledge_base/ into a LangChain Document.
// `metadata.source` records the filename so answers can be traced back
// to where they came from.
const loadDocuments = () => {
    const files = fs
        .readdirSync(KB_DIR)
        .filter((f) => f.endsWith(".md") || f.endsWith(".txt"));

    return files.map((file) => {
        const content = fs.readFileSync(path.join(KB_DIR, file), "utf-8");
        return new Document({ pageContent: content, metadata: { source: file } });
    });
};

const run = async () => {
    if (!process.env.PINECONE_API_KEY || !process.env.PINECONE_INDEX_NAME) {
        console.log(
            "Missing PINECONE_API_KEY / PINECONE_INDEX_NAME in your .env file — aborting."
        );
        process.exit(1);
    }

    console.log("Loading documents from knowledge_base/ ...");
    const rawDocs = loadDocuments();
    console.log(`Loaded ${rawDocs.length} file(s).`);

    if (rawDocs.length === 0) {
        console.log("No .md/.txt files found in knowledge_base/. Add some and re-run.");
        process.exit(0);
    }

    // Sanity-check the embedding model BEFORE we touch Pinecone at all.
    // If this returns a 0-length vector (or throws), the problem is in the
    // Gemini/embedding side, not in Pinecone — this tells us which.
    console.log("Testing embedding call...");
    const testVector = await embeddings.embedQuery("connection test");
    console.log(`Embedding test returned a vector of length: ${testVector.length}`);
    if (!testVector || testVector.length === 0) {
        console.log(
            "The embedding model returned an empty vector. This means the problem is on " +
            "the Gemini/embeddings side, not Pinecone. Double check GEMINI_API_KEY is a valid " +
            "Google AI Studio key (starts with 'AIzaSy...') with the Generative Language API " +
            "enabled, generated at https://aistudio.google.com/apikey"
        );
        process.exit(1);
    }
   /*  if (testVector.length !== 768) {
        console.log(
            `Warning: embedding length is ${testVector.length}, but your Pinecone index expects 768. ` +
            "Either recreate the Pinecone index with dimension " + testVector.length +
            ", or make sure the embedding model is one that outputs 768 dimensions."
        );
        process.exit(1);
    } */


    // Large documents are split into ~500-character chunks (with 50 characters
    // of overlap between chunks) because: (1) embedding models work better on
    // short, focused passages than on huge documents, and (2) at answer time
    // we only want to feed the LLM the specific paragraphs that matter, not
    // entire files.
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 500,
        chunkOverlap: 50,
    });

    const chunks = await splitter.splitDocuments(rawDocs);
    console.log(`Split into ${chunks.length} chunk(s).`);

    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);

    // Embeds every chunk and writes the resulting vectors + original text
    // into your Pinecone index in one batch operation.
    await PineconeStore.fromDocuments(chunks, embeddings, { pineconeIndex });

    console.log("Ingestion complete — your knowledge base is now searchable in Pinecone.");
    process.exit(0);
};

run().catch((err) => {
    console.error("Ingestion failed:", err);
    process.exit(1);
});
