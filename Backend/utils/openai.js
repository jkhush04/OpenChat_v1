import "dotenv/config";

/* const getOpenAIAPIResponse = async(message) => {
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [{
                role: "user",
                content: message
            }]
        })
    }; */


    // `context` is optional retrieved text from the RAG pipeline (see utils/rag.js).
    // When it's present we wrap the user's message with instructions + the
    // retrieved passages so the model prefers grounded facts over guessing.
    // When it's null (RAG not configured, or nothing relevant found), the
    // function behaves exactly as before — plain message in, plain reply out.
    const getOpenAIAPIResponse = async (message, context = null) => {
    // 1. Change the URL to Google's OpenAI-compatible endpoint
    //const url = "https://googleapis.com";

    const promptContent = context
        ? `You are a helpful assistant. Use the following context from the knowledge base to answer the user's question. If the context doesn't contain the answer, say so and answer from your own knowledge instead.\n\nContext:\n${context}\n\nQuestion: ${message}`
        : message;

    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            // 2. Pass your Gemini API Key here (from Google AI Studio)
            "Authorization": `Bearer ${process.env.GEMINI_API_KEY}`
        },
        body: JSON.stringify({
            // 3. Swap the model name to a Gemini model (e.g., gemini-2.5-flash)
            model: "gemini-2.5-flash",
            messages: [{
                role: "user",
                content: promptContent
            }]
        })
    };


    try {
       // const response = await fetch("https://api.openai.com/v1/chat/completions", options);
        const response = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", options);
        const data = await response.json();
        return data.choices[0].message.content; //reply
    } catch(err) {
        console.log(err);
    }
}

export default getOpenAIAPIResponse;