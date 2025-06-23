// netlify/functions/chat/chat.js

// Import necessary modules
const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors'); // Required for Cross-Origin Resource Sharing

// Initialize the Express application
const app = express();

// --- Middleware Setup ---

// 1. CORS Middleware:
// Enable CORS for all origins. This is crucial for allowing your frontend
// (especially during local development or if deployed on a different subdomain)
// to make requests to this Netlify Function without encountering CORS errors.
// The technical plan explicitly highlights CORS as a common pain point.
app.use(cors());

// 2. JSON Body Parser Middleware:
// This middleware parses incoming request bodies with 'Content-Type: application/json'
// and makes the parsed data available on 'req.body'.
app.use(express.json());

// --- API Endpoint Definition ---

// Define the POST endpoint for chat interaction.
// When Netlify routes a request like '/.netlify/functions/chat' (which originates
// from a frontend call to '/api/chat' due to netlify.toml rewrite),
// this Express route handler for the root path '/' is invoked.
app.post('/', (req, res) => {
    // Detailed error handling and request validation as per the plan.
    try {
        // Log the incoming request body for debugging purposes.
        console.log('Received request body:', req.body);

        // Extract the 'message' field from the request body.
        const { message } = req.body;

        // --- Request Validation ---
        // Validate if the 'message' field is present and is a non-empty string.
        if (typeof message !== 'string' || message.trim() === '') {
            console.error("Validation Error: 'message' field is required and must be a non-empty string.");
            // Return a 400 Bad Request status with a descriptive JSON error.
            return res.status(400).json({
                error: "Invalid request format. 'message' field is required and must be a non-empty string.",
                details: "The request body must be a JSON object with a 'message' string field, e.g., { \"message\": \"Hello!\" }"
            });
        }

        // --- Backend Logic: Generate Response ---
        // For the EchoBot, the processing is simple: just echo the received message.
        const reply = `You said: "${message}" (Echoed from EchoBot backend!)`;

        // Log the successful interaction and the generated reply.
        console.log(`Successfully processed message: "${message}"`);
        console.log(`Sending reply: "${reply}"`);

        // --- Send Success Response ---
        // Send a 200 OK status with the generated reply in a JSON object.
        // The 'Content-Type: application/json' header is automatically set by res.json().
        res.status(200).json({ reply });

    } catch (error) {
        // --- General Error Handling ---
        // Catch any unexpected errors that occur during the request processing.
        console.error("Internal Server Error during chat processing:", error);

        // Return a 500 Internal Server Error status with a JSON error body.
        // Always returning a valid JSON response helps prevent frontend parsing failures.
        res.status(500).json({
            error: "An unexpected error occurred on the server.",
            details: error.message || "No specific error message available." // Provide error message if present
        });
    }
});

// --- Netlify Function Export ---

// Wrap the Express app with 'serverless-http'.
// This creates a 'handler' function that Netlify can invoke.
// It adapts the traditional Express request/response cycle to the serverless environment.
exports.handler = serverless(app);

// Optional: You can also define other routes or a default catch-all for unmatched paths if needed,
// though for a single endpoint, it's not strictly necessary.
// app.use((req, res) => {
//     res.status(404).json({ error: "Not Found", details: "The requested API endpoint does not exist." });
// });