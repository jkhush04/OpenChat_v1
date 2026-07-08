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


    const getOpenAIAPIResponse = async (message) => {
    // 1. Change the URL to Google's OpenAI-compatible endpoint
    //const url = "https://googleapis.com";
    
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
                content: message
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