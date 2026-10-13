# OpenChat Platform Overview

OpenChat is a full-stack AI chat application. The frontend is built with
React 18 and Vite. The backend is a containerized Node.js/Express API that
talks to MongoDB Atlas for chat history and to the Google Gemini API for
generating assistant replies.

Chat history is stored per-thread in MongoDB. Each thread has a threadId,
a title, and an ordered list of messages, where each message has a role
("user" or "assistant") and content.

The whole stack is containerized with Docker and orchestrated locally with
docker-compose, which starts three services: backend, frontend, and mongo.
