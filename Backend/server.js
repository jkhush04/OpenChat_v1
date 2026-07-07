import express from "express";
import "dotenv/config"; 
import cors from "cors";
import mongoose from "mongoose";
import dns from "dns";
/* import chatRoutes from "./routes/chat.js"; */


const app = express();
const PORT = 8080;

 // Force using reliable DNS servers for SRV lookups (fixes DNS queryRefused in some networks)
dns.setServers(["8.8.8.8", "8.8.4.4"]); 

app.use(express.json());
app.use(cors());

/* app.use("/api", chatRoutes); */

app.listen(PORT, () => {
    console.log(`server running on ${PORT}`);
     connectDB();
});

const connectDB = async() => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected with Database!");
    } catch(err) {
        console.log("Failed to connect with Db", err);
    }
}